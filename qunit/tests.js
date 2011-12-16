
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



  }

})(jQuery);