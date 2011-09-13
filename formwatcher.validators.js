/*  © Matias Meno   */
Formwatcher.validators.push(new (Class.create(Formwatcher.Validator, {
  name: 'Integer',
  description: 'Makes sure a value is an integer',
  classNames: ['validate-integer'],
  validate: function(input) {
    var parsedInt = parseInt(input.getValue());
    if (isNaN(parsedInt) || input.getValue() !== '' + parsedInt) {
      return 'Has to be a number.';
    }
    return true;
  }
})));

Formwatcher.validators.push(new (Class.create(Formwatcher.Validator, {
  name: 'Required', 
  description: 'Makes sure the value is not blank (nothing or spaces).',
  classNames: ['required'],
  validate: function(input) {
    if (input.getValue().trim().empty()) {
      return 'Can not be blank.';
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

Formwatcher.validators.push(new (Class.create(Formwatcher.Validator, {
  name: 'Email',
  description: 'Makes sure the value is an email.',
  classNames: ['validate-email'],
  validate: function(input) {
    var email = input.getValue();
    var emailRegEx = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (!email.match(emailRegEx)) {
      return 'Must be a valid email address.';
    }

    return true;
  }
})));