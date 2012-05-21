###
Formwatcher Version 2.0.0-dev
More infos at http://www.formwatcher.org

Copyright (c) 2012, Matias Meno
Graphics by Tjandra Mayerhold

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
###

$.fn.uid = ->
  id = @attr("id")
  unless id
    id = "generatedUID" + (Formwatcher.uidCounter++)
    @attr "id", id
  id

$.fn.outerClick = (handler, namespace) ->
  namespaceString = "." + @uid() + (if namespace then +"-" + namespace else "")
  $("body").bind "click" + namespaceString, _.bind((event) ->
    handler()  unless $(event.target).closest(this).length
  , this)
  this

$.fn.unbindOuterClick = (namespace) ->
  $("body").unbind "click." + @uid() + (if namespace then +"-" + namespace else "")
  this

$.fn.hideOnOuterClick = ->
  self = this
  namespace = "hideOnOuterClick"
  _.defer ->
    self.outerClick (->
      self.hide()
      self.unbindOuterClick namespace
    ), namespace

  this

$.fn.fwData = (name, value) ->
  @data "_formwatcher", {}  unless @data("_formwatcher")
  return this  if name is `undefined`
  formwatcherAttributes = @data("_formwatcher")
  if value is `undefined`
    formwatcherAttributes[name]
  else
    formwatcherAttributes[name] = value
    @data "_formwatcher", formwatcherAttributes
    this

class Formwatcher
  version: "2.0.0-dev"
  debugging: false
  uidCounter: 0
  require: (libraryName) ->
    $("body").append "<script type=\"text/javascript\" src=\"" + libraryName + "\"></script>"

  debug: ->
    console.debug.apply console, arguments  if @debugging and typeof console isnt "undefined" and typeof console.debug isnt "undefined"

  getErrorsElement: (elements, createIfNotFound) ->
    input = elements.input
    errors = undefined
    errors = $("#" + input.attr("name") + "-errors")  if input.attr("name")
    errors = $("#" + input.attr("id") + "-errors")  if not errors or not errors.length and input.attr("id")
    if not errors or not errors.length
      errors = $(document.createElement("span"))
      errors.attr "id", input.attr("name") + "-errors"  if input.attr("name")
      input.after errors
    errors.hide().addClass("errors").addClass "fw-errors"
    errors

  getLabel: (elements, automatchLabel) ->
    input = elements.input
    label = undefined
    if input.attr("id")
      label = $("label[for=" + input.attr("id") + "]")
      label = `undefined`  unless label.length
    if not label and automatchLabel
      label = input.prev()
      label = `undefined`  if not label.length or label.get(0).nodeName isnt "LABEL" or label.attr("for")
    label

  changed: (elements, watcher) ->
    input = elements.input
    return  if not input.fwData("forceValidationOnChange") and (input.attr("type") is "checkbox" and input.fwData("previouslyChecked") is input.is(":checked")) or (input.fwData("previousValue") is input.val())
    input.fwData "forceValidationOnChange", false
    @setPreviousValueToCurrentValue elements
    if (input.attr("type") is "checkbox") and (input.fwData("initialyChecked") isnt input.is(":checked")) or (input.attr("type") isnt "checkbox") and (input.fwData("initialValue") isnt input.val())
      Formwatcher.setChanged elements, watcher
    else
      Formwatcher.unsetChanged elements, watcher
    watcher.validateElements elements  if watcher.options.validate

  setChanged: (elements, watcher) ->
    input = elements.input
    return  if input.fwData("changed")
    $.each elements, (index, element) ->
      element.addClass "changed"

    input.fwData "changed", true
    Formwatcher.restoreName elements  unless watcher.options.submitUnchanged
    watcher.submitForm()  if watcher.options.submitOnChange and watcher.options.ajax

  unsetChanged: (elements, watcher) ->
    input = elements.input
    return  unless input.fwData("changed")
    $.each elements, (index, element) ->
      element.removeClass "changed"

    input.fwData "changed", false
    Formwatcher.removeName elements  unless watcher.options.submitUnchanged

  storeInitialValue: (elements) ->
    input = elements.input
    if input.attr("type") is "checkbox"
      input.fwData "initialyChecked", input.is(":checked")
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
      input.fwData "previouslyChecked", input.is(":checked")
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

  Decorators: []
  decorate: (watcher, input) ->
    decorator = _.detect(watcher.decorators, (decorator) ->
      true  if decorator.accepts(input)
    )
    if decorator
      Formwatcher.debug "Decorator \"" + decorator.name + "\" found for input field \"" + input.attr("name") + "\"."
      decorator.decorate input
    else
      input: input

  Validators: []
  currentWatcherId: 0
  watchers: []
  add: (watcher) ->
    @watchers[watcher.id] = watcher

  get: (id) ->
    @watchers[id]

  getAll: ->
    @watchers

  scanDocument: ->
    handleForm = (form) ->
      form = $(form)
      return  if form.fwData("watcher")
      formId = form.attr("id")
      options = {}
      options = Formwatcher.options[formId]  if Formwatcher.options[formId]  if formId
      domOptions = form.data("fw")
      options = _.extend(options, domOptions)  if domOptions
      new Watcher(form, options)

    $("form[data-fw], form[data-fw=\"\"]").each ->
      handleForm this

    _.each Formwatcher.options, (options, formId) ->
      handleForm $("#" + formId)

  watch: (form, options) ->
    $("document").ready ->
      new Watcher(form, options)

initializing = false
fnTest = (if /xyz/.test(->
  xyz
) then /\b_super\b/ else /.*/)
Formwatcher.Class = ->

Formwatcher.Class.extend = (prop) ->
  Class = ->
    @init.apply this, arguments  if not initializing and @init
  _super = @::
  initializing = true
  prototype = new this()
  initializing = false
  for name of prop
    prototype[name] = (if typeof prop[name] is "function" and typeof _super[name] is "function" and fnTest.test(prop[name]) then ((name, fn) ->
      ->
        tmp = @_super
        @_super = _super[name]
        ret = fn.apply(this, arguments)
        @_super = tmp
        ret
    )(name, prop[name]) else prop[name])
  Class:: = prototype
  Class::constructor = Class
  Class.extend = arguments.callee
  Class

@Formwatcher._ElementWatcher = Formwatcher.Class.extend(
  name: "No name"
  description: "No description"
  nodeNames: null
  classNames: []
  defaultOptions: {}
  options: null
  init: (watcher) ->
    @watcher = watcher
    @options = $.extend(true, {}, @defaultOptions, watcher.options[@name] or {})

  accepts: (input) ->
    return false  if @watcher.options[@name] isnt `undefined` and not @watcher.options[@name]
    _.any(@nodeNames, (nodeName) ->
      input.get(0).nodeName is nodeName
    ) and _.all(@classNames, (className) ->
      input.hasClass className
    )
)
@Formwatcher.Decorator = @Formwatcher._ElementWatcher.extend(decorate: (watcher, input) ->
  input: input
)
@Formwatcher.Validator = @Formwatcher._ElementWatcher.extend(
  nodeNames: [ "INPUT", "TEXTAREA", "SELECT" ]
  validate: (sanitizedValue, input) ->
    true

  sanitize: (value) ->
    value
)
$(document).ready ->
  Formwatcher.load()

@Formwatcher.defaultOptions =
  ajax: false
  validate: true
  submitOnChange: false
  submitUnchanged: true
  submitFormIfAllUnchanged: false
  resetFormAfterSubmit: false
  automatchLabel: true
  responseCheck: (data) ->
    not data

  onSubmit: ->

  onSuccess: (data) ->

  onError: (data) ->
    alert data

@Formwatcher.options = {}
@Watcher = Formwatcher.Class.extend(
  init: (form, options) ->
    @form = (if typeof form is "string" then $("#" + form) else $(form))
    if @form.length < 1
      throw ("Form element not found.")
    else if @form.length > 1
      throw ("The jQuery contained more than 1 element.")
    else throw ("The element was not a form.")  if @form.get(0).nodeName isnt "FORM"
    @allElements = []
    @id = Formwatcher.currentWatcherId++
    Formwatcher.add this
    @observers = {}
    self = this
    @form.fwData "watcher", this
    @form.fwData("originalAction", @form.attr("action") or "").attr "action", "javascript:undefined;"
    @options = $.extend(true, {}, Formwatcher.defaultOptions, options or {})
    @decorators = []
    @validators = []
    _.each Formwatcher.Decorators, (Decorator) ->
      self.decorators.push new Decorator(self)

    _.each Formwatcher.Validators, (Validator) ->
      self.validators.push new Validator(self)

    @observe "submit", @options.onSubmit
    @observe "success", @options.onSuccess
    @observe "error", @options.onError
    $.each $(":input", @form), (i) ->
      input = $(this)
      unless input.fwData("initialized")
        if input.attr("type") is "hidden"
          input.fwData "forceSubmission", true
        else
          elements = Formwatcher.decorate(self, input)
          if elements.input.get() isnt input.get()
            elements.input.attr "class", input.attr("class")
            input = elements.input
          unless elements.label
            label = Formwatcher.getLabel(elements, self.options.automatchLabel)
            elements.label = label  if label
          unless elements.errors
            errorsElement = Formwatcher.getErrorsElement(elements, true)
            elements.errors = errorsElement
          self.allElements.push elements
          input.fwData "validators", []
          _.each self.validators, (validator) ->
            if validator.accepts(input, self)
              Formwatcher.debug "Validator \"" + validator.name + "\" found for input field \"" + input.attr("name") + "\"."
              input.fwData("validators").push validator

          Formwatcher.storeInitialValue elements
          if input.val() is null or not input.val()
            $.each elements, ->
              @addClass "empty"
          Formwatcher.removeName elements  unless self.options.submitUnchanged
          onchangeFunction = _.bind(Formwatcher.changed, Formwatcher, elements, self)
          validateElementsFunction = _.bind(self.validateElements, self, elements, true)
          $.each elements, ->
            @focus _.bind(->
              @addClass "focus"
            , this)
            @blur _.bind(->
              @removeClass "focus"
            , this)
            @change onchangeFunction
            @blur onchangeFunction
            @keyup validateElementsFunction

    submitButtons = $(":submit", @form)
    hiddenSubmitButtonElement = $("<input type=\"hidden\" name=\"\" value=\"\" />")
    self.form.append hiddenSubmitButtonElement
    $.each submitButtons, (i) ->
      element = $(this)
      element.click (e) ->
        hiddenSubmitButtonElement.attr("name", element.attr("name") or "").attr "value", element.attr("value") or ""
        self.submitForm()
        e.stopPropagation()

  callObservers: (eventName) ->
    args = _.toArray(arguments)
    args.shift()
    self = this
    _.each @observers[eventName], (observer) ->
      observer.apply self, args

  observe: (eventName, func) ->
    @observers[eventName] = []  if @observers[eventName] is `undefined`
    @observers[eventName].push func
    this

  stopObserving: (eventName, func) ->
    @observers[eventName] = _.select(@observers[eventName], ->
      this isnt func
    )
    this

  enableForm: ->
    $(":input", @form).prop "disabled", false

  disableForm: ->
    $(":input", @form).prop "disabled", true

  submitForm: (e) ->
    if not @options.validate or @validateForm()
      @callObservers "submit"
      if @options.ajax
        @disableForm()
        @submitAjax()
      else
        @form.attr "action", @form.fwData("originalAction")
        _.defer _.bind(->
          @form.submit()
          @disableForm()
        , this)
        false
    else

  validateForm: ->
    validated = true
    _.each @allElements, ((elements) ->
      validated = false  unless @validateElements(elements)
    ), this
    validated

  validateElements: (elements, inlineValidating) ->
    input = elements.input
    validated = true
    if input.fwData("validators").length
      if not inlineValidating or not input.fwData("lastValidatedValue") or input.fwData("lastValidatedValue") isnt input.val()
        input.fwData "lastValidatedValue", input.val()
        Formwatcher.debug "Validating input " + input.attr("name")
        input.fwData "validationErrors", []
        validated = _.all(input.fwData("validators"), (validator) ->
          if input.val() is "" and validator.name isnt "Required"
            Formwatcher.debug "Validating " + validator.name + ". Field was empty so continuing."
            return true
          Formwatcher.debug "Validating " + validator.name
          validationOutput = validator.validate(validator.sanitize(input.val()), input)
          if validationOutput isnt true
            validated = false
            input.fwData("validationErrors").push validationOutput
            return false
          true
        )
        unless validated
          _.each elements, (element) ->
            element.removeClass "validated"

          unless inlineValidating
            elements.errors.html(input.fwData("validationErrors").join("<br />")).show()
            _.each elements, (element) ->
              element.addClass "error"
        else
          elements.errors.html("").hide()
          _.each elements, (element) ->
            element.addClass "validated"
            element.removeClass "error"

          elements.input.fwData "forceValidationOnChange", true  if inlineValidating
      if not inlineValidating and validated
        sanitizedValue = input.fwData("lastValidatedValue")
        _.each input.fwData("validators"), (validator) ->
          sanitizedValue = validator.sanitize(sanitizedValue)

        input.val sanitizedValue
    else
      _.each elements, (element) ->
        element.addClass "validated"
    validated

  submitAjax: ->
    Formwatcher.debug "Submitting form via AJAX."
    fields = {}
    i = 0
    self = this
    $.each $(":input", @form), (i, input) ->
      input = $(input)
      fields[(if input.attr("name") then input.attr("name") else "unnamedInput_" + (i++))] = input.val()  if input.attr("type") isnt "checkbox" or input.is(":checked")  if input.fwData("forceSubmission") or input.attr("type") is "checkbox" or input.fwData("changed") or self.options.submitUnchanged

    if _.size(fields) is 0 and not @options.submitFormIfAllUnchanged
      _.defer _.bind(->
        @enableForm()
        @ajaxSuccess()
      , this)
    else
      $.ajax
        url: @form.fwData("originalAction")
        type: "POST"
        data: fields
        context: this
        success: (data) ->
          @enableForm()
          unless @options.responseCheck(data)
            @callObservers "error", data
          else
            @callObservers "success", data
            @ajaxSuccess()
    `undefined`

  ajaxSuccess: ->
    _.each @allElements, _.bind((elements) ->
      Formwatcher.unsetChanged elements, this
      if @options.resetFormAfterSubmit
        Formwatcher.restoreInitialValue elements
      else
        Formwatcher.storeInitialValue elements
      isEmpty = (elements.input.val() is null or not elements.input.val())
      $.each elements, ->
        if isEmpty
          @addClass "empty"
        else
          @removeClass "empty"
    , this)
)
$(document).ready Formwatcher.scanDocument
