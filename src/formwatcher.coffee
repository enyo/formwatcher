# Formwatcher Version 2.1.10-dev
#
# More infos at http://www.formwatcher.org
#
# Copyright (c) 2012, Matias Meno
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.


# Using ender
$ = ender

# Returns and stores attributes only for formwatcher.
# Be careful when you get data because it does return the actual object, not
# a copy of it. So if you manipulate an array, you don't have to store it again.
$.ender
  fwData: (name, value) ->
    # Create an empty formwatcher object if there isn't one yet.
    @data "_formwatcher", { } unless @data("_formwatcher")?
    
    return @ unless name?
    formwatcherAttributes = @data("_formwatcher")
    if value?
      formwatcherAttributes[name] = value
      @data "_formwatcher", formwatcherAttributes
      return @
    else
      return formwatcherAttributes[name]
  , true



# The selector for all input types
inputSelector = "input, textarea, select, button"


# ## Formwatcher, the global namespace
Formwatcher =
  version: "2.1.10-dev"
  debugging: false

  # A wrapper for console.debug that only forwards if `Formwatcher.debugging == true`
  debug: -> console.debug.apply console, arguments if @debugging and console?.debug?

  # Tries to find an existing errors element, and creates one if there isn't.
  getErrorsElement: (elements, createIfNotFound) ->
    input = elements.input

    # First try to see if there is a NAME-errors element, then if there is an ID-errors.
    errors = $("##{input.attr('name')}-errors") if input.attr("name")
    errors = $("##{input.attr('id')}-errors") unless errors?.length or !input.attr("id")

    if not errors or not errors.length
      errors = $.create "<small />"
      errors.attr "id", input.attr("name") + "-errors" if input.attr("name")
      errors.insertAfter input
      # input.after errors
    errors
      .hide()
      .addClass("errors")
      .addClass("fw-errors")


  # Helper function to deep extend objects
  deepExtend: (object, extenders...) ->
    return { } unless object?
    for other in extenders
      for own key, val of other
        unless object[key]? and typeof val is "object"
          object[key] = val
        else
          object[key] = @deepExtend object[key], val
    object


  getLabel: (elements, automatchLabel) ->
    input = elements.input

    if input.attr("id")
      label = $ "label[for=" + input.attr("id") + "]"
      label = `undefined`  unless label.length
    if not label and automatchLabel
      parent = input.parent()
      if parent.get(0).nodeName == "LABEL"
        # The input is embedded inside a label, so take the first span element.
        label = $("span", parent).first()
        label = undefined if label.length == 0
      else
        label = input.previous()
        label = undefined if !label.length or label.get(0).nodeName isnt "LABEL" or label.attr("for")?

    label

  changed: (elements, watcher) ->
    input = elements.input
    return  if not input.fwData("forceValidationOnChange") and (input.attr("type") is "checkbox" and input.fwData("previouslyChecked") is !!input[0].checked) or (input.fwData("previousValue") is input.val())
    input.fwData "forceValidationOnChange", false
    @setPreviousValueToCurrentValue elements
    if (input.attr("type") is "checkbox") and (input.fwData("initialyChecked") isnt !!input[0].checked) or (input.attr("type") isnt "checkbox") and (input.fwData("initialValue") isnt input.val())
      Formwatcher.setChanged elements, watcher
    else
      Formwatcher.unsetChanged elements, watcher
    watcher.validateElements elements  if watcher.options.validate

  setChanged: (elements, watcher) ->
    input = elements.input
    return if input.fwData("changed")

    element.addClass "changed" for own i, element of elements

    input.fwData "changed", true
    Formwatcher.restoreName elements  unless watcher.options.submitUnchanged
    watcher.submitForm()  if watcher.options.submitOnChange and watcher.options.ajax

  unsetChanged: (elements, watcher) ->
    input = elements.input
    return  unless input.fwData("changed")

    element.removeClass "changed" for own i, element of elements

    input.fwData "changed", false
    Formwatcher.removeName elements unless watcher.options.submitUnchanged

  storeInitialValue: (elements) ->
    input = elements.input
    if input.attr("type") is "checkbox"
      input.fwData "initialyChecked", !!input[0].checked
    else
      input.fwData "initialValue", input.val()

    @setPreviousValueToInitialValue elements

  restoreInitialValue: (elements) ->
    input = elements.input
    if input.attr("type") is "checkbox"
      input.attr "checked", input.fwData("initialyChecked")
    else
      input.val input.fwData("initialValue")
    @setPreviousValueToInitialValue elements

  setPreviousValueToInitialValue: (elements) ->
    input = elements.input
    if input.attr("type") is "checkbox"
      input.fwData "previouslyChecked", input.fwData("initialyChecked")
    else
      input.fwData "previousValue", input.fwData("initialValue")

  setPreviousValueToCurrentValue: (elements) ->
    input = elements.input
    if input.attr("type") is "checkbox"
      input.fwData "previouslyChecked", !!input[0].checked
    else
      input.fwData "previousValue", input.val()

  removeName: (elements) ->
    input = elements.input
    return  if input.attr("type") is "checkbox"
    input.fwData "name", input.attr("name") or ""  unless input.fwData("name")
    input.attr "name", ""

  restoreName: (elements) ->
    input = elements.input
    return  if input.attr("type") is "checkbox"
    input.attr "name", input.fwData("name")

  decorators: []
  # `decorate()` only uses the first decorator found. You can't use multiple decorators on the same input.
  # If you want to have two decorators applied, you have to create a new decorator joining them.
  decorate: (watcher, input) ->
    decorator = null

    # Like `_.detect()`
    for dec in watcher.decorators
      if dec.accepts input
        decorator = dec
        break

    if decorator
      Formwatcher.debug "Decorator \"" + decorator.name + "\" found for input field \"" + input.attr("name") + "\"."
      decorator.decorate input
    else
      input: input

  validators: []
  currentWatcherId: 0
  watchers: []
  add: (watcher) ->
    @watchers[watcher.id] = watcher

  get: (id) ->
    @watchers[id]

  getAll: ->
    @watchers

  # Searches all forms with a data-fw attribute and watches them
  scanDocument: ->
    handleForm = (form) =>
      form = $(form)

      # A form can only be watched once!
      return if form.fwData("watcher")

      formId = form.attr("id")

      # Check if options have been set for it.
      options = if formId? and Formwatcher.options[formId]? then Formwatcher.options[formId] else { }

      domOptions = form.data "fw"

      # domOptions always overwrite the normal options.
      options = @deepExtend options, JSON.parse domOptions if domOptions

      new Watcher(form, options)

    $("form[data-fw]").each (form) -> handleForm form

    handleForm $ "##{formId}" for formId of Formwatcher.options

  watch: (form, options) ->
    $.domReady -> new Watcher form, options


# ## The ElementWatcher root class
# 
# This is the base class for decorators and validators.
class Formwatcher._ElementWatcher
  name: "No name"
  description: "No description"
  nodeNames: null # eg: `[ "SELECT" ]`
  classNames: [] # eg: `[ "font" ]`
  defaultOptions: { } #  Overwrite this with your default options. Those options can be overridden in the watcher config.
  options: null # On initialization this gets filled with the actual options so they don't have to be calculated every time.

  # Stores the watcher, and creates a valid options object.
  constructor: (@watcher) ->
    @options = Formwatcher.deepExtend { }, @defaultOptions, watcher.options[@name] ? { }

  # Overwrite this function if your logic to which elements your decorator applies
  # is more complicated than a simple nodeName/className comparison.
  accepts: (input) ->
    # If the config for a ElementWatcher is just false, it's disabled for the watcher.
    return false if @watcher.options[@name]? and @watcher.options[@name] == false

    correctNodeName = false
    inputNodeName = input.get(0).nodeName

    for nodeName in @nodeNames
      if inputNodeName is nodeName
        correctNodeName = true
        break

    return false unless correctNodeName

    correctClassNames = true

    for className in @classNames
      unless input.hasClass className
        correctClassNames = false
        break

    return correctClassNames


# ## Decorator class
#
# Decorators are used to improve the visuals and user interaction of form elements.
#
# Implement it to create a new decorator.
class Formwatcher.Decorator extends Formwatcher._ElementWatcher

  # This function does all the magic.
  # It creates additional elements if necessary, and could instantiate an object
  # that will be in charge of handling this input.
  #
  # This function has to return a hash of all fields that you want to get updated
  # with .focus and .changed classes. Typically this is just { input: THE_INPUT }
  #
  # `input` has to be the actual form element to transmit the data.
  # `label` is reserved for the actual label.
  decorate: (watcher, input) -> input: input


# ## Validator class
#
# Instances of this class are meant to validate input fields
class Formwatcher.Validator extends Formwatcher._ElementWatcher
  # Typically most validators work on every input field
  nodeNames: [ "INPUT", "TEXTAREA", "SELECT" ]

  # Return true if the validation passed, or an error message if not.
  validate: (sanitizedValue, input) -> true

  # If your value can be sanitized (eg: integers should not have leading or trailing spaces)
  # this function should return the sanitized value.
  #
  # When the user leaves the input field, the value will be updated with this value in the field.
  sanitize: (value) -> value





# ## Default options
# Those are the default options a new watcher uses if nothing is provided.
# Overwrite any of these when instantiating a watcher (or put it in `data-fw=''`)
Formwatcher.defaultOptions =
  # Whether to convert the form to an AJAX form.
  ajax: false
  # You can set this to force a specific method (eg.: `post`). If null, the method of the
  # form attribute `method` is taken.
  ajaxMethod: null
  # Whether or not the form should validate on submission. This will invoke
  # every validator attached to your input fields.
  validate: true
  # If ajax and submitOnChange are true, then the form will be submitted every
  # time an input field is changed. This removes the need of a submit button.
  submitOnChange: false
  # If the form is submitted via AJAX, the formwatcher uses changed values.
  # Otherwise formwatcher removes the name parameter of the input fields so they
  # are not submitted.
  # Remember: checkboxes are ALWAYS submitted if checked, and never if unchecked.
  submitUnchanged: true
  # If you have `submitUnchanged = false` and the user did not change anything and
  # hit submit, there would not actually be anything submitted to the server.
  # To avoid that, formwatcher does not actually send the request. But if you want
  # that behaviour you can set this to true.
  submitFormIfAllUnchanged: false
  # When the form is submitted with AJAX, this tells the formwatcher how to
  # leave the form afterwards. Eg: For guestbook posts this should probably be yes.
  resetFormAfterSubmit: false
  # Creating ids for input fields, and setting the `for` attribute on the labels
  # is the right way to go, but can be a tedious task. If automatchLabel is true,
  # Formwatcher will automatically match the closest previous label without a `for`
  # attribute as the correct label.
  automatchLabel: true
  # Checks the ajax transport if everything was ok. If this function returns
  # false formwatcher assumes that the form submission resulted in an error.
  # So, if this function returns true `onSuccess` will be called. If false,
  # `onError` is called.
  responseCheck: (data) -> not data
  # This function gets called before submitting the form. You could hide the form
  # or show a spinner here.
  onSubmit: ->
  # If the responseCheck function returns true, this function gets called.
  onSuccess: (data) ->
  # If the responseCheck function returns false, this function gets called.
  onError: (data) -> alert data
  # In any case onComplete() is called when the request has been done.
  onComplete: (data) ->




# This is a map of options for your different forms. You can simply overwrite it
# to specify your form configurations, if it is too complex to be put in the
# form data-fw='' field.
#
# **CAREFUL**: When you set options here, they will be overwritten by the DOM options.
#
# Example:
#
#     Formwatcher.options.myFormId = { ajax: true };
Formwatcher.options = { }


# ## The Watcher class
#
# This is the class that gets instantiated for each form.
class Watcher
  constructor: (form, options) ->
    @form = if typeof form is "string" then $("##{form}") else $ form

    if @form.length < 1
      throw "Form element not found."
    else if @form.length > 1
      throw "More than one form was found."
    else if @form.get(0).nodeName isnt "FORM"
      throw "The element was not a form."

    @allElements = [ ]
    @id = Formwatcher.currentWatcherId++
    Formwatcher.add @
    @observers = { }

    # Putting the watcher object in the form element.
    @form.fwData "watcher", @
    @form.fwData("originalAction", @form.attr("action") or "").attr "action", "javascript:undefined;"
    @options = Formwatcher.deepExtend { }, Formwatcher.defaultOptions, options or { }
    @decorators = [ ]
    @validators = [ ]

    @decorators.push new Decorator @ for Decorator in Formwatcher.decorators
    @validators.push new Validator @ for Validator in Formwatcher.validators


    @options.ajaxMethod = @form.attr("method")?.toLowerCase() if @options.ajaxMethod == null

    switch @options.ajaxMethod
      when "post", "put", "delete"
        # Everything fine
      else
        # I'm using get as the default since it's the default for forms.
        @options.ajaxMethod = "get"

    @observe "submit", @options.onSubmit
    @observe "success", @options.onSuccess
    @observe "error", @options.onError
    @observe "complete", @options.onComplete

    $(inputSelector, @form).each (input) =>
      input = $ input
      unless input.fwData("initialized")
        if input.attr("type") is "hidden"
          input.fwData "forceSubmission", true
        else
          elements = Formwatcher.decorate @, input
          if elements.input.get() isnt input.get()
            elements.input.attr "class", input.attr("class")
            input = elements.input
          unless elements.label
            label = Formwatcher.getLabel(elements, @options.automatchLabel)
            elements.label = label  if label
          unless elements.errors
            errorsElement = Formwatcher.getErrorsElement elements, true
            elements.errors = errorsElement
          @allElements.push elements
          input.fwData "validators", []
          for validator in @validators
            if validator.accepts input, @
              Formwatcher.debug "Validator \"" + validator.name + "\" found for input field \"" + input.attr("name") + "\"."
              input.fwData("validators").push validator

          Formwatcher.storeInitialValue elements
          if input.val() is null or not input.val()
            element.addClass "empty" for i, element of elements

          Formwatcher.removeName elements unless @options.submitUnchanged

          onchangeFunction = => Formwatcher.changed elements, @
          validateElementsFunction = => @validateElements elements, true

          for i, element of elements
            ((element) ->
              element.on "focus", => element.addClass "focus"
              element.on "blur", => element.removeClass "focus"
              element.on "change", onchangeFunction
              element.on "blur", onchangeFunction
              element.on "keyup", validateElementsFunction
            )(element)

    submitButtons = $ "input[type=submit], button[type=''], button[type='submit'], button:not([type])", @form
    hiddenSubmitButtonElement = $.create '<input type="hidden" name="" value="" />'
    @form.append hiddenSubmitButtonElement
    submitButtons.each (element) =>
      element = $ element
      element.click (e) =>
        if element[0].tagName == "BUTTON"
          # That's a IE7 bugfix: The `value` attribute of buttons in IE7 is always the content if a content is present.
          tmpElementText = element.text()
          element.text ""
          elementValue = element.val() ? ""
          element.text tmpElementText
        else
          elementValue = element.val() ? ""

        # The submit buttons click events are always triggered if a user presses ENTER inside an input field.
        hiddenSubmitButtonElement.attr("name", element.attr("name") or "").val elementValue
        @submitForm()
        e.stopPropagation()

  callObservers: (eventName, args...) ->
    observer.apply @, args for observer in @observers[eventName]

  observe: (eventName, func) ->
    @observers[eventName] = []  if @observers[eventName] is `undefined`
    @observers[eventName].push func
    @

  stopObserving: (eventName, func) ->
    @observers[eventName] = (observer for observer in @observers[eventName] when observer isnt func)
    @

  enableForm: -> $(inputSelector, @form).removeAttr "disabled"

  disableForm: -> $(inputSelector, @form).attr "disabled", "disabled"

  submitForm: (e) ->
    if not @options.validate or @validateForm()
      @callObservers "submit"


      # Do submit
      @form.addClass "submitting"
      if @options.ajax
        @disableForm()
        @submitAjax()
      else
        @form.attr "action", @form.fwData("originalAction")
        setTimeout =>
          @form.submit()
          @disableForm()
        , 1
        false

  validateForm: ->
    validated = true

    # Not using _.detect() here, because I want every element to be inspected, even
    # if the first one fails.
    for elements in @allElements
      validated = false unless @validateElements(elements)

    validated


  # `inlineValidating` specifies whether the user is still in the element, typing.
  validateElements: (elements, inlineValidating) ->
    input = elements.input
    validated = true
    if input.fwData("validators").length
      # Only revalidated if the value has changed
      if not inlineValidating or not input.fwData("lastValidatedValue") or input.fwData("lastValidatedValue") isnt input.val()
        input.fwData "lastValidatedValue", input.val()
        Formwatcher.debug "Validating input " + input.attr("name")
        input.fwData "validationErrors", []

        for validator in input.fwData "validators"

          if input.val() is "" and validator.name isnt "Required"
            Formwatcher.debug "Validating " + validator.name + ". Field was empty so continuing."
            continue

          Formwatcher.debug "Validating " + validator.name
          validationOutput = validator.validate(validator.sanitize(input.val()), input)
          if validationOutput isnt true
            validated = false
            input.fwData("validationErrors").push validationOutput
            break

        if validated
          elements.errors.html("").hide()
          for own i, element of elements
            element.addClass "validated"
            element.removeClass "error"

          # When we remove an error during inline editing, the error has to
          # be shown again when the user leaves the input field, even if
          # the actual value has not changed.
          elements.input.fwData "forceValidationOnChange", true  if inlineValidating

        else

          element.removeClass "validated" for own i, element of elements

          unless inlineValidating
            elements.errors.html(input.fwData("validationErrors").join("<br />")).show()
            element.addClass "error" for own i, element of elements

      if not inlineValidating and validated
        sanitizedValue = input.fwData("lastValidatedValue")
        for validator in input.fwData("validators")
          sanitizedValue = validator.sanitize(sanitizedValue)

        input.val sanitizedValue
    else
      element.addClass "validated" for own i, element of elements

    validated

  submitAjax: ->
    Formwatcher.debug "Submitting form via AJAX."
    fields = { }
    fieldCount = 0
    i = 0

    $(inputSelector, @form).each (input, i) =>
      input = $ input

      # Buttons are only submitted when pressed. If a submit button triggers the submission
      # of the form then it creates a hidden input field to transmit it.
      if input[0].nodeName == "BUTTON" or (input[0].nodeName == "INPUT" and (input.attr("type").toLowerCase() == "submit" or input.attr("type").toLowerCase() == "button"))
        return

      # In previous versions I checked if the input field was hidden, and forced the submission
      # then. But if a decorator transforms any input field in a hidden field, and puts
      # a JS selector on top of it, the actual input field will always be hidden, thus submitted.
      # So now the check if the field is hidden and should be submitted takes place
      # in the constructor, and sets `forceSubmission` on the input field.
      if input.fwData("forceSubmission") || (input.attr("type") && input.attr("type").toLowerCase() == "checkbox") || input.fwData('changed') || @options.submitUnchanged
        if input.attr("type") != "checkbox" || input.get(0).checked
          fieldCount++
          attributeName = input.attr("name") ? "unnamedInput_#{i}"
          fields[attributeName] = input.val()

    if fieldCount is 0 and not @options.submitFormIfAllUnchanged
      setTimeout =>
        @enableForm()
        @ajaxSuccess()
      , 1
    else
      $.ajax
        url: @form.fwData("originalAction")
        method: @options.ajaxMethod
        data: fields
        type: "text"
        error: (request) =>
          @callObservers "error", request.response
        success: (request) =>
          @enableForm()
          unless @options.responseCheck request.response
            @callObservers "error", request.response
          else
            @callObservers "success", request.response
            @ajaxSuccess()
        complete: (request) =>
          @form.removeClass "submitting"
          @callObservers "complete", request.response

  ajaxSuccess: ->
    for elements in @allElements
      Formwatcher.unsetChanged elements, @
      if @options.resetFormAfterSubmit
        Formwatcher.restoreInitialValue elements
      else
        Formwatcher.storeInitialValue elements
      isEmpty = (elements.input.val() is null or not elements.input.val())
      for i, element of elements
        if isEmpty
          element.addClass "empty"
        else
          element.removeClass "empty"



if window?
  window.Formwatcher = Formwatcher
  window.Watcher = Watcher

$.domReady -> Formwatcher.scanDocument()
