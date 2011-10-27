
(function( $ ){

  Formwatcher.Validators.push(Formwatcher.Validator.extend({
    name: 'Integer',
    description: 'Makes sure a value is an integer',
    classNames: ['validate-integer'],
    validate: function(value) {
      if (value.replace(/\d*/, '') != '') {
        return 'Has to be a number.';
      }
      return true;
    },
    sanitize: function(value) {
      return $.trim(value);
    }
  }));

  Formwatcher.Validators.push(Formwatcher.Validator.extend({
    name: 'Required', 
    description: 'Makes sure the value is not blank (nothing or spaces).',
    classNames: ['required'],
    validate: function(value, input) {
      if ((input.attr('type') === 'checkbox' && !input.is(':checked')) || !$.trim(value)) {
        return 'Can not be blank.';
      }
      return true;
    }
  }));

  Formwatcher.Validators.push(Formwatcher.Validator.extend({
    name: 'NotZero',
    description: 'Makes sure the value is not 0.',
    classNames: ['not-zero'],
    validate: function(value) {
      var intValue = parseInt(value);
      if (!isNaN(intValue) && intValue == 0) {
        return 'Can not be 0.';
      }
      return true;
    }
  }));

  Formwatcher.Validators.push(Formwatcher.Validator.extend({
    name: 'Email',
    description: 'Makes sure the value is an email.',
    classNames: ['validate-email'],
    validate: function(value) {
      var emailRegEx = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (!value.match(emailRegEx)) {
        return 'Must be a valid email address.';
      }

      return true;
    },
    sanitize: function(value) {
      return $.trim(value);
    }
  }));

  Formwatcher.Validators.push(Formwatcher.Validator.extend({
    name: 'Float',
    description: 'Makes sure a value is a float',
    classNames: ['validate-float'],
    defaultOptions: { decimalMark: ',' },
    validate: function(value) {
      Formwatcher.debug('/\\d+(\\' + this.options.decimalMark + '\\d+)?/', 'g');
//      var regex = new RegExp('/\\d+(\\' + this.options.decimalMark + '\\d+)?/');
      var regex = new RegExp('\\d+(\\' + this.options.decimalMark + '\\d+)?');
      if (value.replace(regex, '') != '') {
        return 'Has to be a number.';
      }
      return true;
    },
    sanitize: function(value) {
      if (value.indexOf(".") >= 0 && value.indexOf(",") >= 0) {
        if (value.lastIndexOf(',') > value.lastIndexOf('.')) {
          // Apparently , is the separator
          value = value.replace(/\./g, '');
        }
        else {
          value = value.replace(/\,/g, '');
        }
      }

      if (value.indexOf(",") >= 0) {
        value = value.replace(/\,/g, '.');
      }

      // Now make sure the right decimal mark is used:
      value = value.replace(/\./g, this.options.decimalMark);

      if (value.indexOf(".") != value.lastIndexOf(".")) {
        // Apparently they have only been used for thousands separators.
        value = value.replace(/\./g, '');
      }

      return $.trim(value);
    }
  }));

})( jQuery );
