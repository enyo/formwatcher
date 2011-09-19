/*  © Matias Meno   */
(function( $ ){

  Formwatcher.decorators.push(new (Formwatcher.Decorator.extend({
    name: 'FontSelector',
    description: 'Updates every option of a select element to display the font of its value.',
    nodeNames: ['SELECT'],
    classNames: ['font'],
    activate: function(watcher, input) {
      this.updateInputFont(input);

      $('option', input).each(function() {
        $(this).css('fontFamily', $(this).val());
      });

      input.change(_.bind(this.updateInputFont, this, input));
    },
    updateInputFont: function(input) {
      if (input.val()) {
        input.css('fontFamily', input.val());
      }
    }
  })));
  
})( jQuery );
