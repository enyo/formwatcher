/*  © Matthias Loitsch   */
Formwatcher.validators.push(new (Class.create(Formwatcher.Validator, {
  name: 'Integer',
  description: 'Makes sure a value is an integer',
  nodeNames: ['SELECT', 'INPUT'],
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