/*  © Matias Meno   */
(function( $ ){

  Formwatcher.Decorators.push(Formwatcher.Decorator.extend({
    name: 'Hint',
    description: 'Displays a hint in an input field.',
    nodeNames: ['INPUT', 'TEXTAREA'],
    defaultOptions: {
      auto: true, // This automatically makes labels into hints.
      removeTrailingColon: true // Removes the trailing ' : ' from labels.
    },
    accepts: function(input) {
      if (this._super(input)) {
        if ((input.data('hint') !== undefined) ||
          (this.options.auto && this.watcher.getLabel({
            input: input
          }))) { // If autoHint is on, and there IS a label.
          return true;
        }
      } 

      return false;
    },
    decorate: function(input) {
      var elements = {
        input: input
      };

      var hint = input.data('hint');

      if (hint === undefined || hint == '') {
        var label = this.watcher.getLabel(elements);
        if (!label) throw "The hint was empty, but there was no label.";
        elements.label = label;
        label.hide();
        hint = label.html();
        
        if (this.options.removeTrailingColon) hint = hint.replace(/\s*\:\s*$/, ''); // Remove any trailing ' : '
      }

      Formwatcher.debug('Using hint: ' + hint);

      var container = $('<div />', {
        style: 'display: inline-block; position: relative;'
      }).insertAfter(input);

      input.appendTo(container);

      var leftPosition = parseInt(input.css('paddingLeft')) + parseInt(input.css('marginLeft')) + parseInt(input.css('borderLeftWidth')) + 3 + 'px'; // + 3 so the cursor is not over the text
      var rightPosition = parseInt(input.css('paddingRight')) + parseInt(input.css('marginRight')) + parseInt(input.css('borderRightWidth')) + 'px';


      var hintElement = $('<span>' + hint + '</span>').css({
        position: 'absolute',
        display: 'none',
        top: parseInt(input.css('paddingTop')) + parseInt(input.css('marginTop')) + parseInt(input.css('borderTopWidth')) + 'px',
        left: leftPosition,
        fontSize: input.css('fontSize'),
        fontFamily: input.css('fontFamily'),
        color: 'grey'
      }).click(function() {
        input.focus();
      }).insertAfter(input);

      var fadeLength = 100;

      input.focus(function() {
        if (input.val() == '') hintElement.fadeTo(fadeLength, 0.4);
//        else hintElement.fadeOut(fadeLength);
      });
      input.blur(function() {
        if (input.val() == '') hintElement.fadeTo(fadeLength, 1);
//        else hintElement.fadeOut(fadeLength);
      });
      
      var changeFunction = function() {
        if (input.val() == '') hintElement.show();
        else hintElement.hide();
      };
      
      input.keyup(changeFunction);
      input.keypress(function() { _.defer(changeFunction); });
      input.keydown(function() { _.defer(changeFunction); });
//      input.keyup(function() { _.defer(changeFunction); });
//      input.keydown(function() { _.defer(changeFunction); });
//      input.keypress(function() { _.defer(changeFunction); });
      input.change(changeFunction);

      changeFunction();

      return elements;
    }
  }));
  
})( jQuery );
