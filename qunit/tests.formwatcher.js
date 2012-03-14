
(function($) {

  Formwatcher.tests = function() {


    /**
     * I add test TODOs here when I don't have time to implement them right away.
     *
     * - TODO: Test when form.action is not defined
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

      this.form = $('<form action="javascript:undefined;"><button name="buttonA" value="valueA">buttonA</button><button name="buttonB" value="valueB">buttonB</button></form>');
      this.buttonA = $('button[name=buttonA]', this.form);
      this.buttonB = $('button[name=buttonB]', this.form);

      tmpDiv.append(this.form);

      new Watcher(this.form, {
        ajax: false
      });
      this.x = 4;

      this.buttonA.click();
      var hidden = $('input[type=hidden][name=buttonA]', this.form);
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

      tmpDiv.append(form1);
      tmpDiv.append(form2);
      tmpDiv.append(form3);

      Formwatcher.scanDocument();

      ok(form1.fwData('watcher'), 'data-fw="" should be handled by formwatcher.')
      ok(form2.fwData('watcher'), 'data-fw="{ [...] }" should be handled by formwatcher.')
      equal(form3.fwData('watcher'), null, 'Without data-fw attribute this form should be ignored.')
    });



  }

})(jQuery);