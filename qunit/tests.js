
(function($) {

  Formwatcher.tests = function() {


    /**
     * I add test TODOs here when I don't have time to implement them right away.
     *
     * - TODO: Test when form.action is not defined
     *
     */





    /************** * * * * * * * **************/
    /************** * * * * * * * **************/
    /************** * * * * * * * **************/

    module("Get label", {
      setup: function() {
        tmpDiv.empty();
      },
      teardown: function() {
        tmpDiv.empty();
      }
    });

    test("automatch", function() {
      // TODO
      });

    test("label with for", function() {
      // TODO
      });

    test("there is no element before the input", function() {
      var elements = {
        input: $('<input></input>')
      };
      tmpDiv.append(elements.input);
      equal(Formwatcher.getLabel(elements, true), undefined, 'autoMatch: true; Should return null and not error, since there is no element before.');
      equal(Formwatcher.getLabel(elements, false), undefined, 'autoMatch: false; Should return null and not error, since there is no element before.');
    });




    /************** * * * * * * * **************/
    /************** * * * * * * * **************/
    /************** * * * * * * * **************/

    module("Form submission", {
      setup: function() {
        this.form = $('<form action="javascript:undefined;"><button name="buttonA" value="1">buttonA</button><button name="buttonB" value="1">buttonB</button></form>');
        this.buttonA = $('button[name=buttonA]', this.form);
        this.buttonB = $('button[name=buttonB]', this.form);

        tmpDiv.append(this.form);

        new Watcher(this.form, {
          ajax: false
        });
        this.x = 4;
      },
      teardown: function() {
        this.form.remove();
        tmpDiv.empty();
      }
    });


    /**
     *  When a button is clicked, the value should be submitted. To ensure
     *  that, formwatcher has to create a hidden element with the name.
     */
    test("Click on button A", function() {
      this.buttonA.click();
      var hidden = $('input[type=hidden][name=buttonA]', this.form);
      equal(hidden.length, 1, 'Should have created a hidden input field');
    });

    test("Click on button B", function() {
      this.buttonB.click();
      var hidden = $('input[type=hidden][name=buttonB]', this.form);
      equal(hidden.length, 1, 'Should have created a hidden input field');
    });



  }

})(jQuery);