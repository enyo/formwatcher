
(function($) {

  Formwatcher.tests = function() {


    /**
     * I add test TODOs here when I don't have time to implement them right away.
     *
     * - TODO: Test when form.action is not defined
     * - TODO: Test all validators
     *
     */


    module("Formwatcher", {
      setup: function() {
        tmpDiv.empty();
      },
      teardown: function() {
        tmpDiv.empty();
      }
    });




    /************** * * * * * * * **************/
    /************** * * * * * * * **************/
    /************** * * * * * * * **************/


    test("new Watcher()", function() {
      var form = $('<form id="testform" action="javascript:undefined;"></form>');
      var form2 = $('<form id="testform2" action="javascript:undefined;"></form>');
      tmpDiv.append(form, form2, $('<div id="testtest"></div>'));
      
      strictEqual(form.fwData('watcher'), undefined, "Initially there shouldn't be a watcher attached.");
      new Watcher($('#testform'));
      ok(form.fwData('watcher'), "The formwatcher should be attached to form when jQuery object is passed.");
      strictEqual(form2.fwData('watcher'), undefined, "Initially there shouldn't be a watcher attached.");
      new Watcher('testform2');
      ok(form2.fwData('watcher'), "The formwatcher should be attached to form when the id as string is passed.");
      
      raises(function() { new Watcher('blabla'); }, 'If the form is not found it throws an exception.');
      raises(function() { new Watcher('##sdf'); }, 'If the form id is not formatted correctly it throws an exception');
      raises(function() { new Watcher($('span')); }, 'If a faulty jQuery object is passed it throws an exception');
      raises(function() { new Watcher($('testtest')); }, 'If the jQuery element is not a form it throws an exception');
      raises(function() { new Watcher('testtest'); }, 'If the element id is not a form it throws an exception');
      
    });



    test("Formwatcher.watch()", function() {
      var form = $('<form id="testform" action="javascript:undefined;"></form>');
      tmpDiv.append(form);

      strictEqual(form.fwData('watcher'), undefined, "Initially there shouldn't be a watcher attached.");
      Formwatcher.watch('testform');
      ok(form.fwData('watcher'), "The formwatcher should be attached to form because document was already loaded");
    });


    test("getLabel()", function() {
      var label, elements;

      this.label1 = $('<label id="test-label1-id"></label>');
      this.label2 = $('<label id="test-label2-id"></label>');
      this.input = $('<input id="test-input-id"></input>');
      tmpDiv.append(this.label1, this.label2, this.input);

      elements = {
        input: this.input
      };
      label = Formwatcher.getLabel(elements, true);
      equal(label.attr('id'), this.label2.attr('id'), "Should have returned the label right before the input because of automatch.");

      label = Formwatcher.getLabel(elements, false);
      strictEqual(label, undefined, "getLabel() should return undefined without automatch.");

      // Adding a for attribute to the label
      this.label1.attr('for', this.input.attr('id'));

      var label = Formwatcher.getLabel(elements, false);
      equal(label.attr('id'), this.label1.attr('id'), "Should return the first label because it has the for attribute (without automatch).");
      var label = Formwatcher.getLabel(elements, true);
      equal(label.attr('id'), this.label1.attr('id'), "Should return the first label because it has the for attribute even with automatch.");


      tmpDiv.empty();
      var elements = {
        input: $('<input></input>')
      };
      tmpDiv.append(elements.input);
      equal(Formwatcher.getLabel(elements, true), undefined, 'autoMatch: true; Should return undefined when there no element before the input.');
      equal(Formwatcher.getLabel(elements, false), undefined, 'autoMatch: false;  Should return undefined when there no element before the input.');

    });




    /**
     *  When a button is clicked, the value should be submitted. To ensure
     *  that, formwatcher has to create a hidden element with the name.
     */
    test("Multiple submit buttons", function() {

      this.form = $('<form action="javascript:undefined;"><button type="submit" name="buttonA" value="valueA">buttonA</button><button type="submit" name="buttonB" value="valueB">buttonB</button></form>');
      this.buttonA = $('button[name=buttonA]', this.form);
      this.buttonB = $('button[name=buttonB]', this.form);

      tmpDiv.append(this.form);

      new Watcher(this.form, {
        ajax: false
      });
      this.x = 4;

      this.buttonA.click();
      var hidden = $('input[type="hidden"][name="buttonA"]', this.form);
      equal(hidden.length, 1, 'Click on button A should create a hidden input field with the same name as the button');
      equal(hidden.attr('value'), 'valueA', '...and should set the value of the button');
      
      this.buttonB.click();
      var hidden = $('input[type=hidden][name=buttonB]', this.form);
      equal(hidden.length, 1, 'Click on button A should create a hidden input field with the same name as the button');
      equal(hidden.attr('value'), 'valueB', '...and should set the value of the button');

    });



    test("scanDocument", function() {

      var form1 = $('<form action="javascript:undefined;" data-fw=""></form>');
      var form2 = $('<form action="javascript:undefined;" data-fw=\'{ "ajax": true }\'></form>');
      var form3 = $('<form action="javascript:undefined;"></form>');

      // tmpDiv.get(0).innerHTML = '<form action="javascript:undefined;" data-fw=""></form>';

      // var form4 = $('form', tmpDiv);

      tmpDiv.append(form1);
      tmpDiv.append(form2);
      tmpDiv.append(form3);

      Formwatcher.scanDocument();

      ok(form1.fwData('watcher'), 'data-fw="" should be handled by formwatcher.')
      // ok(form4.fwData('watcher'), 'data-fw="" should be handled by formwatcher.')
      ok(form2.fwData('watcher'), 'data-fw="{ [...] }" should be handled by formwatcher.')
      equal(form3.fwData('watcher'), undefined, 'Without data-fw attribute this form should be ignored.')
    });



    module("Formwatcher validators", {
      setup: function() {
        tmpDiv.empty();
      },
      teardown: function() {
        tmpDiv.empty();
      }
    });

    test("Required", function() {
      tmpDiv.append($('<form action="javascript:undefined;"><input type="text" class="required" /></form>'));
      
      var form = tmpDiv.find('form')
        , input = form.find('input');

      var watcher = new Watcher(form, { validate: true});

      ok(!watcher.validateForm(), 'It should not validate because the input is required');

      input.val('some value');
      ok(watcher.validateForm(), "Now it is filled in so validation doesn't fail.");

    });
    test("Email", function() {
      tmpDiv.append($('<form action="javascript:undefined;"><input type="text" class="validate-email" /></form>'));
      
      var form = tmpDiv.find('form')
        , input = form.find('input');

      var watcher = new Watcher(form, { validate: true});

      ok(watcher.validateForm(), 'It should validate if empty because it is not required');

      // mostly taken from wikipedia
      var validEmails = [ 'm@tias.me', 'niceandsimple@example.com', 'simplewith+symbol@example.com', 'less.common@example.com', 'a.little.more.unusual@dept.example.com', "'@[10.10.10.10]" ];

      _.each(validEmails, function(email) {
        input.val(email);
        ok(watcher.validateForm(), email + ' is a valid address');
      });

    });



    module("Formwatcher decorators", {
      setup: function() {
        tmpDiv.empty();
      },
      teardown: function() {
        tmpDiv.empty();
      }
    });

    test("Hint", function() {

      tmpDiv.append($('<form action="javascript:undefined;"><input id="i1" type="text" data-hint="Test1" /><input id="i2" type="text" value="prefilled" data-hint="Test2" /><input id="i3" type="text" data-hint="Test3" /></form>'))

      var form = $('form', tmpDiv);
      var input1 = $('#i1', form);
      var input2 = $('#i2', form);
      var input3 = $('#i3', form);

      new Watcher(form);

      var hint1 = input1.parent().find('.hint');
      var hint2 = input2.parent().find('.hint');
      var hint3 = input3.parent().find('.hint');

      ok(hint1, 'Input1 should have a hint element.')
      equal(hint1.html(), 'Test1', 'The hint should be taken from data-hint')
      ok(hint2, 'Input2 should have a hint element.')
      equal(hint2.html(), 'Test2', 'The hint should be taken from data-hint')
      ok(hint1.is(':visible'), 'Hint1 should be visible')
      ok(!hint2.is(':visible'), 'Hint2 should be hidden because it is prefilled')
      ok(hint3.is(':visible'), 'Hint3 should also be visible because it is initially empty')

      stop();

      _.delay(function() {
        input3.val('Somevalue');
        _.delay(function() {
          ok(!hint3.is(':visible'), 'Hint3 should now be invisible since the browser autofilled it.')
          start();
        }, 100);
      }, 2);

    });


  }

})(jQuery);