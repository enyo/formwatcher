/*  © Matias Meno   */
(function( $ ){

  Formwatcher.Decorators.push(Formwatcher.Decorator.extend({
    name: 'Hint',
    description: 'Displays a hint in an input field.',
    nodeNames: ['INPUT', 'TEXTAREA'],
    accepts: function(input) {
      if (this._super(input) && input.data('hint') !== undefined) return true;
      else return false;
    },
    decorate: function(input) {
      var elements = {
        input: input
      };

      var hint = input.data('hint');

      if (hint === '') {
        var label = Formwatcher.getLabel(elements);
        if (!label) throw "The hint was empty, but there was no label.";
        elements.label = label;
        label.hide();
        hint = label.html();
      }

      Formwatcher.debug('Using hint: ' + hint);

      var container = $('<div />', {
        style: 'display: inline-block; position: relative;'
      }).insertAfter(input);

      input.appendTo(container);

      var leftPosition = parseInt(input.css('paddingLeft')) + parseInt(input.css('marginLeft')) + parseInt(input.css('borderLeftWidth')) + 'px';
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

      input.focus(function() {
        hintElement.css({
          left: 'auto', 
          right: rightPosition
        });
      });
      input.blur(function() {
        hintElement.css({
          right: 'auto', 
          left: leftPosition
        });
      });
      
      var changeFunction = function() {
        if (input.val() == '') {
          hintElement.fadeIn(100);
        }
        else {
          hintElement.fadeOut(100);
        }
      };
      
      input.keyup(changeFunction);
      input.change(changeFunction);

      changeFunction();

      return elements;
    }
  }));
  
})( jQuery );
