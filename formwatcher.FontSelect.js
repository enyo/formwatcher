/*  © Matthias Loitsch   */
Formwatcher.decorators.push(new (Class.create(Formwatcher.Decorator, {
  name: 'FontSelector',
  description: 'Updates every option of a select element to display the font of its value.',
  nodeName: 'SELECT',
  classNames: ['font'],
  activate: function(watcher, input) {
    this.updateInputFont(input);

    $A(input.options).each(function(option) {
      $(option).setStyle({ fontFamily: option.value });
    });

    input.observe('change', this.updateInputFont.bind(this, input));
  },
  updateInputFont: function(input) {
    if (input.getValue()) {
      input.setStyle({fontFamily: input.getValue() });
    }
  }
})));