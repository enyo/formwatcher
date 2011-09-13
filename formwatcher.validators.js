/*  © Matthias Loitsch   */
Formwatcher.validators.push(new (Class.create(Formwatcher.Validator, {
  name: 'Integer',
  description: 'Makes sure a value is an integer',
  classNames: ['integer'],
  validate: function(input) {
    if (isNaN(parseInt(input.getValue()))) {
      return 'Has to be a number.';
    }
    input.setValue(parseInt(input.getValue()));
    return true;
  }
})));

Formwatcher.validators.push(new (Class.create(Formwatcher.Validator, {
  name: 'NotEmpty',
  description: 'Makes sure the value is not empty (nothing or spaces).',
  classNames: ['not-empty'],
  validate: function(input) {
    if (input.getValue().trim().empty()) {
      return 'Can not be empty.';
    }
    return true;
  }
})));


Formwatcher.validators.push(new (Class.create(Formwatcher.Validator, {
  name: 'NotZero',
  description: 'Makes sure the value is not 0.',
  classNames: ['not-zero'],
  validate: function(input) {
    var intValue = parseInt(input.getValue());
    if (!isNaN(intValue) && intValue == 0) {
      return 'Can not be 0.';
    }
    return true;
  }
})));