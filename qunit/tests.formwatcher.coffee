Formwatcher.tests = ->

  # I add test TODOs here when I don't have time to implement them right away.
  #
  # - TODO: Test when form.action is not defined
  # - TODO: Test all validators

  module "Formwatcher",
    setup: -> tmpDiv.empty()
    teardown: -> tmpDiv.empty()



  # ################################################### #
  # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
  # ################################################### #


  test "new Watcher()", ->
    form = $("<form id=\"testform\" action=\"javascript:undefined;\"></form>")
    form2 = $("<form id=\"testform2\" action=\"javascript:undefined;\"></form>")
    tmpDiv.append(form).append(form2).append $("<div id=\"testtest\"></div>")
    strictEqual form.fwData("watcher"), `undefined`, "Initially there shouldn't be a watcher attached."
    new Watcher($("#testform"))
    ok form.fwData("watcher"), "The formwatcher should be attached to form when jQuery object is passed."
    strictEqual form2.fwData("watcher"), `undefined`, "Initially there shouldn't be a watcher attached."
    new Watcher("testform2")
    ok form2.fwData("watcher"), "The formwatcher should be attached to form when the id as string is passed."
    raises ->
      new Watcher("blabla")
    , "If the form is not found it throws an exception."
    raises ->
      new Watcher("##sdf")
    , "If the form id is not formatted correctly it throws an exception"
    raises ->
      new Watcher($("span"))
    , "If a faulty jQuery object is passed it throws an exception"
    raises ->
      new Watcher($("testtest"))
    , "If the jQuery element is not a form it throws an exception"
    raises ->
      new Watcher("testtest")
    , "If the element id is not a form it throws an exception"

  test "Formwatcher.watch()", ->
    form = $("<form id=\"testform\" action=\"javascript:undefined;\"></form>")
    tmpDiv.append form
    strictEqual form.fwData("watcher"), `undefined`, "Initially there shouldn't be a watcher attached."
    Formwatcher.watch "testform"
    ok form.fwData("watcher"), "The formwatcher should be attached to form because document was already loaded"

  test "getLabel()", ->
    label = undefined
    elements = undefined
    @label1 = $.create("<label id=\"test-label1-id\"></label>")
    @label2 = $.create("<label id=\"test-label2-id\"></label>")
    @input = $.create("<input id=\"test-input-id\"></input>")
    tmpDiv.append(@label1).append(@label2).append @input
    elements = input: @input
    label = Formwatcher.getLabel(elements, true)
    equal label.attr("id"), @label2.attr("id"), "Should have returned the label right before the input because of automatch."
    label = Formwatcher.getLabel(elements, false)
    strictEqual label, `undefined`, "getLabel() should return undefined without automatch."
    @label1.attr "for", @input.attr("id")
    label = Formwatcher.getLabel(elements, false)
    equal label.attr("id"), @label1.attr("id"), "Should return the first label because it has the for attribute (without automatch)."
    label = Formwatcher.getLabel(elements, true)
    equal label.attr("id"), @label1.attr("id"), "Should return the first label because it has the for attribute even with automatch."
    tmpDiv.empty()
    elements = input: $("<input></input>")
    tmpDiv.append elements.input
    equal Formwatcher.getLabel(elements, true), undefined, "autoMatch: true; Should return undefined when there no element before the input."
    equal Formwatcher.getLabel(elements, false), undefined, "autoMatch: false;  Should return undefined when there no element before the input."

    tmpDiv.append $.create '<label><span>Label text</span><input id="embedded-input" /></label>'
    elements = input: $("#embedded-input", tmpDiv)
    equal Formwatcher.getLabel(elements, true).html(), "Label text", "spans should be interpreted as labels when inside label."    

  # When a button is clicked, the value should be submitted. To ensure
  # that, formwatcher has to create a hidden element with the name.
  test "Multiple submit buttons", ->
    @form = $.create('<form action="javascript:undefined;"><input type="submit" name="buttonA" value="valueA" /><button type="submit" name="buttonB" value="valueB">Button B</button></form>')
    @buttonA = $("input[name=buttonA]", @form)
    @buttonB = $("button[name=buttonB]", @form)
    tmpDiv.append @form
    new Watcher @form, ajax: false

    @x = 4
    @buttonA.click()
    allHidden = $ 'input[type="hidden"]', @form
    equal allHidden.length, 1, "There should only be one hidden field for the right button"
    hidden = $("input[type=\"hidden\"][name=\"buttonA\"]", @form)
    equal hidden.length, 1, "Click on button A should create a hidden input field with the same name as the button"
    equal hidden.attr("value"), "valueA", "...and should set the value of the button"
    @buttonB.click()
    allHidden = $ 'input[type="hidden"]', @form
    equal allHidden.length, 1, "There should only be one hidden field for the right button"
    hidden = $("input[type=hidden][name=buttonB]", @form)
    equal hidden.length, 1, "Click on button A should create a hidden input field with the same name as the button"
    equal hidden.attr("value"), "valueB", "...and even IE7 should set the value of the button"

  test "scanDocument", ->
    form1 = $('<form id="f1" action="javascript:undefined;" data-fw=""></form>')
    form2 = $('<form id="f2" action="javascript:undefined;" data-fw=\'{ "ajax": true, "submitUnchanged": false }\'></form>')
    form3 = $('<form id="f3" action="javascript:undefined;"></form>')
    tmpDiv.append form1
    tmpDiv.append form2
    tmpDiv.append form3
    Formwatcher.scanDocument()
    ok form1.fwData("watcher"), "data-fw=\"\" should be handled by formwatcher."
    ok form2.fwData("watcher"), "data-fw=\"{ [...] }\" should be handled by formwatcher."
    equal form3.fwData("watcher"), `undefined`, "Without data-fw attribute this form should be ignored."
    equal form2.fwData("watcher").options.ajax, true, "The config should have been properly parsed"
    equal form2.fwData("watcher").options.submitUnchanged, false, "The config should have been properly parsed"

  test "method is taken from form method", ->
    form1 = $("<form action=\"javascript:undefined;\" method='post'></form>")
    form2 = $("<form action=\"javascript:undefined;\" method='put'></form>")
    form3 = $("<form action=\"javascript:undefined;\" method=''></form>")
    form4 = $("<form action=\"javascript:undefined;\"></form>")

    watcher = new Watcher(form1);
    equal watcher.options.ajaxMethod, "post", "The method should have been taken from the form."

    watcher = new Watcher(form2);
    equal watcher.options.ajaxMethod, "put", "The method should have been taken from the form."

    watcher = new Watcher(form3);
    equal watcher.options.ajaxMethod, "get", "Form had an empty method so the default get should have been used"

    watcher = new Watcher(form4);
    equal watcher.options.ajaxMethod, "get", "Form had an empty method so the default get should have been used"

    watcher = new Watcher(form2, { ajaxMethod: "get" });
    equal watcher.options.ajaxMethod, "get", "The options should have overwritten the form method"

    watcher = new Watcher(form2, { ajaxMethod: "postbla" });
    equal watcher.options.ajaxMethod, "get", "Invalid methods should be converted to get."


  module "Formwatcher AJAX",
    setup: ->
      tmpDiv.empty()

    teardown: ->
      tmpDiv.empty()

  asyncTest "the right observers are called", ->
    tmpDiv.append $("""<form id="f1" action="./index.html"><input type="text" name="test-field" /></form><form id="f2" action="./index.html"><input type="text" name="test-field" /></form>""")
    form = tmpDiv.find("form#f1")
    form2 = tmpDiv.find("form#f2")

    submitCalled1 = false
    successCalled1 = false
    errorCalled1 = false
    submitCalled2 = false
    successCalled2 = false
    errorCalled2 = false

    completed1 = false
    completed2 = false

    watcher = new Watcher(form,
      ajax: true,
      validate: false
      responseCheck: -> false
      onSubmit: -> submitCalled1 = true
      onSuccess: -> successCalled1 = true
      onError: -> errorCalled1 = true
      onComplete: ->
        ok submitCalled1, "Should have called onSubmit before."
        ok errorCalled1, "Should have called onError before."
        ok not successCalled1, "Shouldn't have called onSuccess before."
        completed1 = yes
        if completed2 then start()
    )

    watcher2 = new Watcher(form2,
      ajax: true,
      validate: false
      responseCheck: -> true
      onSubmit: -> submitCalled2 = true
      onSuccess: -> successCalled2 = true
      onError: -> errorCalled2 = true
      onComplete: ->
        ok submitCalled2, "Should have called onSubmit before."
        ok successCalled2, "Should have called onSuccess before."
        ok not errorCalled2, "Shouldn't have called onError before."
        completed2 = yes
        if completed1 then start()
    )
 
    watcher.submitForm()
    watcher2.submitForm()




  module "Formwatcher validators",
    setup: ->
      tmpDiv.empty()

    teardown: ->
      tmpDiv.empty()

  test "Required", ->
    tmpDiv.append $("<form action=\"javascript:undefined;\"><input type=\"text\" class=\"required\" /></form>")
    form = tmpDiv.find("form")
    input = form.find("input")
    watcher = new Watcher(form,
      validate: true
    )
    ok not watcher.validateForm(), "It should not validate because the input is required"
    input.val "some value"
    ok watcher.validateForm(), "Now it is filled in so validation doesn't fail."

  test "Email", ->
    tmpDiv.append $("<form action=\"javascript:undefined;\"><input type=\"text\" class=\"validate-email\" /></form>")
    form = tmpDiv.find("form")
    input = form.find("input")
    watcher = new Watcher(form,
      validate: true
    )
    ok watcher.validateForm(), "It should validate if empty because it is not required"
    validEmails = [ "m@tias.me", "niceandsimple@example.com", "simplewith+symbol@example.com", "less.common@example.com", "a.little.more.unusual@dept.example.com", "'@[10.10.10.10]" ]
    i = 0

    while i < validEmails.length
      email = validEmails[i]
      input.val email
      ok watcher.validateForm(), email + " is a valid address"
      i++

  module "Formwatcher decorators",
    setup: ->
      tmpDiv.empty()

    teardown: ->
      tmpDiv.empty()

  test "Hint", ->
    tmpDiv.append $("<form action=\"javascript:undefined;\"><input id=\"i1\" type=\"text\" data-hint=\"Test1\" /><input id=\"i2\" type=\"text\" value=\"prefilled\" data-hint=\"Test2\" /><input id=\"i3\" type=\"text\" data-hint=\"Test3\" /></form>")
    form = $("form", tmpDiv)
    input1 = $("#i1", form)
    input2 = $("#i2", form)
    input3 = $("#i3", form)
    new Watcher(form)
    stop()
    setTimeout (->
      hint1 = input1.parent().find(".hint")
      hint2 = input2.parent().find(".hint")
      hint3 = input3.parent().find(".hint")
      ok hint1.length, "Input1 should have a hint element."
      equal hint1.html(), "Test1", "The hint should be taken from data-hint"
      ok hint2.length, "Input2 should have a hint element."
      equal hint2.html(), "Test2", "The hint should be taken from data-hint"
      ok hint1.css("display") isnt "none", "Hint1 should be visible"
      ok hint2.css("display") is "none", "Hint2 should be hidden because it is prefilled"
      ok hint3.css("display") isnt "none", "Hint3 should also be visible because it is initially empty"
      setTimeout (->
        input3.val "Somevalue"
        setTimeout (->
          ok hint3.css("display") is "none", "Hint3 should now be invisible since the browser autofilled it."
          start()
        ), 100
      ), 2
    ), 1