/**
 * More infos at http://www.formwatcher.org
 *
 * Copyright (c) 2009, Matias Meno
 * Graphics by Tjandra Mayerhold
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */



/**
 * Changelog
 *
 * 0.0 - 0.1
 * - The basics are done... a form is watched, and the decorators are loaded when needed.
 * - You can observe events now, by either passing it with the options object, or calling observe() afterwards.
 * 
 * 0.1 - 0.2
 * - Names are not removed anymore after submitting a form (Saving was only possible the first time).
 * - The ColorPicker gets only loaded on dom:loaded so IE6 won't crash anymore.
 * - Form actions aren't set to javascript:undefined anymore, but a valid javascript function that submits the AJAX form (so form.submit() will work again)
 *
 * 0.2 - 0.3
 * - The wrap function really gets an input now, and has to return the elements wrapper.
 * - Checkboxes are now supported.
 * - Labels for inputs are watched as well now. ('changed' and 'focus' classes are added).
 *
 * 0.3 - 0.4
 * - Corrected the bug that after submitting the AJAX form, the labels and all other elements get 'unchanged'
 * - License change
 * - Added the changeOnSubmit option. (When the form is set to AJAX, the form is submitted everytime an input is changed)
 * - The wrap() function is now decorate()
 * - Added validators.
 * 
 * 0.4 - 1.0
 * - Changed the whole library to jQuery.
 */


(function( $ ){

  $.el = function(nodeName) {
    return $(document.createElement(nodeName));
  }

  $.fn.center = function() {
    this.css("position","absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
  };
  // TODO: implement: fixate


  // Returns and stores attributes only for formwatcher.
  // Be careful when you get data because it does return the actual object, not
  // a copy of it. So if you manipulate an array, you don't have to store it again.
  $.fn.fwData = function(name, value) {
    if (!this.data('_formwatcher')) this.data('_formwatcher', {});
    
    if (name === undefined) return this;
    
    var formwatcherAttributes = this.data('_formwatcher');
    if (value === undefined) {
      // Get the attribute
      return formwatcherAttributes[name];
    }
    else {
      // Set attribute
      formwatcherAttributes[name] = value;
      this.data('_formwatcher', formwatcherAttributes);
      return this;
    }
  };


  this.Formwatcher = {
    Version: '0.5.0',
    REQUIRED_JQUERY_VERSION: '1.6.0',
    debugging: false,
    require: function(libraryName) {
      // inserting via DOM fails in Safari 2.0, so brute force approach
      $('body').append('<script type="text/javascript" src="'+libraryName+'"><\/script>');
    },
    load: function() {
      function getComparableVersion(version) {
        var v = version.split('.');
        return parseInt(v[0])*100000 + parseInt(v[1])*1000 + parseInt(v[2]);
      }
      if((getComparableVersion(jQuery.fn.jquery) < getComparableVersion(Formwatcher.REQUIRED_JQUERY_VERSION))) {
        throw("Formwatcher requires the jQuery JavaScript framework >= " + Formwatcher.REQUIRED_JQUERY_VERSION);
      }

      /* load other wanted functions. (Thanks to scriptaculous for the idea) */
      $('script').filter(function() {
        return (this.src && this.src.match(/formwatcher\.js(\?.*)?$/))
      }).each(function() {
        var path = this.src.replace(/formwatcher\.js(\?.*)?$/, '');
        var includes = this.src.match(/\?.*load=([a-zA-Z,]*)/);
        //        (includes ? includes[1] : 'validators,FontSelect,ColorPicker,ImagePicker,SimpleDatePicker').split(',').each(function(include) {
        $.each((includes ? includes[1] : 'validators,FontSelect').split(','), function(index, include) {
          Formwatcher.require(path+'formwatcher.'+include+'.js');
        });
      }
      );
    },
    debug: function() {
      if (this.debugging && typeof console !== 'undefined' && typeof console.debug !== 'undefined') console.debug.apply(console, arguments);
    },
    /**
     * Tries to find an existing errors element, and creates one if there isn't.
     */
    getErrorsElement: function(elements, createIfNotFound)   {
      var input = elements.input;
      // First try to see if there is a NAME-errors element, then if there is an ID-errors.
      var errors;
      if (input.attr("name")) { 
        errors = $('#' + input.attr("name") + '-errors');
      }
      if (!errors || !errors.length && input.attr("id")) {
        errors = $('#' + input.attr("id") + '-errors');
      }
      if (!errors || !errors.length) {
        errors = $(document.createElement('div'));
        if (input.attr("name")) errors.attr("id", input.attr("name") + '-errors');
        input.after(errors);
      }
      errors.hide().addClass('errors');
      return errors;
    },
    getLabel: function(elements)   {
      var input = elements.input;
      var label;
      if (input.attr("id")) {
        label = $('label[for='+input.attr("id")+']');
        if (!label.length) label = null;
      }
      return label;
    },
    changed: function(elements, watcher) {
      var input = elements.input;

      if (((input.attr('type') === 'checkbox') && (input.fwData('originalyChecked') != input.is(':checked'))) ||
        ((input.attr('type') !== 'checkbox') && (input.fwData('originalValue') != input.val()))) {
        Formwatcher.setChanged(elements, watcher);
      }
      else {
        Formwatcher.unsetChanged(elements, watcher);
      }

      watcher.validateElements(elements);
    },
    setChanged: function(elements, watcher) {
      var input = elements.input;

      if (input.fwData('changed')) return;
      
      $.each(elements, function(index, element) {
        element.addClass('changed');
      });

      input.fwData('changed', true);

      if (!watcher.options.submitUnchanged) Formwatcher.restoreName(elements);

      if (watcher.options.submitOnChange && watcher.options.ajax) watcher.submitForm();
    },
    unsetChanged: function(elements, watcher) {
      var input = elements.input;

      if (!input.fwData('changed')) return;

      $.each(elements, function(index, element) {
        element.removeClass('changed');
      });

      input.fwData('changed', false);

      if (!watcher.options.submitUnchanged) Formwatcher.removeName(elements);
    },
    setOriginalValue: function(elements) {
      var input = elements.input;
      if (input.attr('type') === 'checkbox') input.fwData('originalyChecked', input.is(':checked'));
      else input.fwData('originalValue', input.val());
    },
    removeName: function(elements) {
      var input = elements.input;
      if (input.attr('type') === 'checkbox') return;

      if (!input.fwData('name')) {
        input.fwData('name', input.attr('name') || '');
      }
      input.attr('name', '');
    },
    restoreName: function(elements) {
      var input = elements.input;
      if (input.attr('type') === 'checkbox') return;
      input.attr('name', input.fwData('name'));
    },

    decorators: [],
    decorate: function(watcher, input) {
      var decorator = _.detect(Formwatcher.decorators, function(decorator) {
        if (decorator.accepts(input)) return true;
      });
      if (decorator) {
        return decorator.decorate(watcher, input);
      } 
      else return {
        input: input
      };
    },
    validators: [],
    currentWatcherId: 0,
    watchers: [],
    add: function(watcher) {
      this.watchers[watcher.id] = watcher;
    },
    get: function(id) {
      return this.watchers[id];
    },
    getAll: function() {
      return this.watchers;
    },
      

    watch: function(form, options) {
      $('document').ready(function() {
        new Watcher(form, options)
      });
    }
  };





  /**
   * This is the base class for decorators and validators.
   */
  this.Formwatcher._ElementWatcher = Class.extend({
    name: 'No name',
    description: 'No description',
    nodeNames: null, // eg: SELECT
    classNames: [], // eg: ['font']'

    /**
     * Overwrite this function if your logic to which elements your decorator applies
     * is more complicated than a simple nodeName/className comparison.
     */
    accepts: function(input) {
      return (_.any(this.nodeNames, function(nodeName) {
        return input.get(0).nodeName == nodeName;
      }) && _.all(this.classNames, function(className) {
        return input.hasClass(className);
      }));
    }
  });


  /**
   * The actual decorator class. Implement it to create a new decorator.
   */
  this.Formwatcher.Decorator = this.Formwatcher._ElementWatcher.extend({
    /**
     * This function does all the magic.
     * It creates additional elements if necessary, and could instantiate an object
     * that will be in charge of handling this input.
     * 
     * This function has to return a hash of all fields that you want to get updated
     * with .focus and .changed classes. Typically this is just { input: THE_INPUT }
     * 
     * 'input' has to be the actual form element to transmit the data.
     * 'label' is reserved for the actual label.
     */
    decorate: function(watcher, input) {
      // Overwrite this function, and do all your magic here.
      return {
        input: input
      };
    }
  });



  /**
   * The validator class.
   */
  this.Formwatcher.Validator = this.Formwatcher._ElementWatcher.extend({
    // Typically most validators work on every input field
    nodeNames: ['INPUT', 'TEXTAREA', 'SELECT'],
    /**
     * Return true if the validation passed, or an error message if not.
     */
    validate: function(watcher, input) {
      return true;
    },
    /**
     * If your value can be sanitized (eg: integers should not have leading or trailing spaces)
     * this function should return the sanitized value.
     * When the user leaves the input field, the value will be updated in the field.
     */
    sanitize: function(value) {
      return value;
    }
  });


  $(document).ready(function() {
    Formwatcher.load();
  });





  /**
   * Those are the default options a new watcher uses if nothing is provided.
   * Overwrite any of these when instantiating a watcher (or put it in data-fw=''
   */
  this.Formwatcher.defaultOptions = {
    // Whether to convert the form to an AJAX form.
    ajax: true,
    // Whether or not the form should validate on submission. This will invoke
    // every validator attached to your input fields.
    validate: true,
    // If ajax and submitOnChange are true, then the form will be submitted every
    // time an input field is changed. This removes the need of a submit button.
    submitOnChange: false,
    // If the form is submitted via AJAX, the formwatcher uses changed values.
    // Otherwise formwatcher removes the name parameter of the input fields so they
    // are not submitted.
    // Remember: checkboxes are ALWAYS submitted if checked, and never if unchecked.
    submitUnchanged: true, 
    // If you have `submitUnchanged = false` and the user did not change anything and
    // hit submit, there would not actually be anything submitted to the server.
    // To avoid that, formwatcher does not actually send the request. But if you want
    // that behaviour you can set this to true.
    submitFormIfAllUnchanged: false,
    // Checks the ajax transport if everything was ok. If this function returns
    // false formwatcher assumes that the form submission resulted in an error.
    // So, if this function returns true `onSuccess` will be called. If false,
    // `onError` is called.
    responseCheck: function(data) {
      // The default implementation is quite forward: if there is no result, it's fine
      return !data;
    },
    // This function gets called before submitting the form. You could hide the form
    // or show a spinner here.
    onSubmit:  function()     { },
    // If the responseCheck function returns true, this function gets called.
    onSuccess: function(data) { },
    // If the responseCheck function returns false, this function gets called.
    onError:   function(data) {
      // The default implementation just alerts the error message returned.
      alert(data);
    }
  };


  /**
   * This is a map of options for your different forms. You can simply overwrite it
   * to specify your form configurations, if it is too complex to be put in the
   * form data-fw='' field.
   * CAREFUL: When you set options here, they will be overwritten by the DOM options.
   * Example:
   * Formwatcher.options.myFormId = { ajax: true };
   */
  this.Formwatcher.options = {};



  this.Watcher = Class.extend({
    init: function(form, options) {
      this.allElements = [];
      this.id = Formwatcher.currentWatcherId ++;
      Formwatcher.add(this);
      this.observers = { };
      this.form = $(form);
      if (!this.form.length) {
        throw("Form element not found.");
      }

      // Putting the watcher object in the form element.
      this.form.fwData('watcher', this);

      // Making sure the form always goes through the formwatcher on submit.
      this.form
      .fwData('originalAction', this.form.attr('action'))
      .attr('action', 'javascript:Formwatcher.get('+this.id+').submitForm();');

      // Now merging the provided options with the default options.
      this.options = $.extend(_.clone(Formwatcher.defaultOptions), options || {} );

      this.observe('submit',  this.options.onSubmit);
      this.observe('success', this.options.onSuccess);
      this.observe('error',   this.options.onError);


      var self = this;

      $.each($(':input', this.form), function(i, input) {
        input = $(input);
        if (!input.fwData('initialized')) {
          if (input.attr('type') === 'hidden') {
            // Hidden input fields should always be submitted since they probably contain entity IDs and such.
            input.fwData('forceSubmission', true);
          }
          else {
            var elements = Formwatcher.decorate(self, input);

            if (elements.input.get() !== input.get()) {
              // The input has changed, since the decorator can convert it to a hidden field
              // and actually show a completely different UI
              // Make sure the classNames stay intact for further inspection
              elements.input.attr('class', input.attr('class'));
              input = elements.input;
            }

            if (!elements.label) {
              var label = Formwatcher.getLabel(elements);
              if (label) elements.label = label;
            }

            if (!elements.errors) {
              var errorsElement = Formwatcher.getErrorsElement(elements, true);
              elements.errors = errorsElement;
            }

            self.allElements.push(elements);

            input.fwData('validators', []);

            // Check which validators apply
            _.each(Formwatcher.validators, function(validator) {
              if (validator.accepts(input)) {
                Formwatcher.debug('Validator "' + validator.name + '" found for input field "' + input.name + '".');
                input.fwData('validators').push(validator);
              }
            });

            Formwatcher.setOriginalValue(elements);

            if (input.val() === null || !input.val()) {
              $.each(elements, function() {
                this.addClass('empty');
              });
            }

            if (!self.options.submitUnchanged) {
              Formwatcher.removeName(elements);
            }

            var onchangeFunction = _.bind(Formwatcher.changed, Formwatcher, elements, self);
            var validateElementsFunction = _.bind(self.validateElements, self, elements, true);

            $.each(elements, function() {
              this.focus(_.bind(function() {
                this.addClass('focus');
              }, this));
              this.blur(_.bind(function() {
                this.removeClass('focus');
              }, this));
              this.change(onchangeFunction);
              this.blur(onchangeFunction);
              this.keyup(validateElementsFunction);
            });
          }
        }

      });
    },

    callObservers: function(eventName) {
      var args = _.toArray(arguments);
      args.shift();
      var self = this;
      _.each(this.observers[eventName], function(observer) {
        observer.apply(self, args);
      })
    },
    observe: function(eventName, func) {
      if (this.observers[eventName] === undefined) {
        this.observers[eventName] = [];
      }
      this.observers[eventName].push(func);
      return this;
    },
    stopObserving: function(eventName, func) {
      this.observers[eventName] = _.select(this.observers[eventName], function() {
        return this !== func
      });
      return this;
    },
    enableForm: function() {
      $(':input', this.form).prop('disabled', false);
    },
    disableForm: function() {
      $(':input', this.form).prop('disabled', true);
    },
    submitForm: function() {
      if (!this.options.validate || this.validateForm()) {
        this.disableForm();
        this.callObservers('submit');

        // Do submit
        if (this.options.ajax) {
          this.submitAjax();
        }
        else {
          this.form.attr('action', this.form.fwData('originalAction'));
          _.defer(_.bind(this.form.submit, this.form));
          return false;
        }
      }
      else { /* Abort */ }
    },
    validateForm: function() {
      var validated = true;
      _.each(this.allElements, function(elements) {
        // Not using _.detect() here, because I want every element to be inspected, even
        // if the first one fails.
        if (!this.validateElements(elements)) validated = false;
      }, this);
      return validated;
    },

    /**
     * inlineValidating: whether the user is still in the element, typing.
     */
    validateElements: function(elements, inlineValidating) {
      var input = elements.input;

      var validated = true;

      if (input.fwData('validators').length) {

        // Only revalidated if the value has changed
        if (!inlineValidating || !input.fwData('lastValidatedValue') || input.fwData('lastValidatedValue') != input.val()) {
          input.fwData('lastValidatedValue', input.val());
          Formwatcher.debug('Validating input ' + input.attr('name'));

          input.fwData('validationErrors', []);

          validated = _.all(input.fwData('validators'), function(validator) {
            var validationOutput = validator.validate(validator.sanitize(input.val()));
            if (validationOutput !== true) {
              validated = false;
              input.fwData('validationErrors').push(validationOutput);
              return false;
            }
            return true;
          });

          if (!validated) {
            _.each(elements, function(element) {
              element.removeClass('validated');
            });
            if (!inlineValidating) {
              elements.errors.html(input.fwData('validationErrors').join('<br />')).show();
              _.each(elements, function(element) {
                element.addClass('error');
              });
            }
          }
          else {
            elements.errors.html("").hide();
            _.each(elements, function(element) {
              element.addClass('validated');
              element.removeClass('error');
            });
          }
        }
        if (!inlineValidating && validated) {
          var sanitizedValue = input.fwData("lastValidatedValue");
          _.each(input.fwData('validators'), function(validator) {
            sanitizedValue = validator.sanitize(sanitizedValue);
          });
          input.val(sanitizedValue);
        }
      }

      return validated;
    },

    submitAjax: function() {
      Formwatcher.debug('Submitting form via AJAX.');

      var fields = {};
      var i = 0;
      var self = this;

      $.each($(':input', this.form), function(i, input) {
        input = $(input);
        // In previous versions I checked if the input field was hidden, and forced the submission
        // then. But if a decorator transforms any input field in a hidden field, and puts
        // a JS selector on top of it, the actual input field will always be hidden, thus submitted.
        // So now the check if the field is hidden and should be submitted takes place
        // in the constructor, and sets `forceSubmission` on the input field.
        if (input.fwData('forceSubmission') || input.attr('type') === 'checkbox' || input.fwData('changed') || self.options.submitUnchanged) {
          if (input.attr('type') !== 'checkbox' || input.is(':checked')) {
            fields[input.attr('name') ? input.attr('name') : 'unnamedInput_' + (i ++)] = input.val();
          }
        }
      });

      if (_.size(fields) === 0 && !this.options.submitFormIfAllUnchanged) {
        // There was no field to submit, so do nothing!
        _.defer(_.bind(function() {
          this.enableForm();
          this.ajaxSuccess();
        }, this));
      }
      else {
        $.ajax({
          url: this.form.fwData('originalAction'),
          type: 'POST',
          data: fields,
          context: this,
          success: function(data) {
            this.enableForm();
            if (!this.options.responseCheck(data)) {
              // If the response check returns false, there has been an error
              this.callObservers('error', data);
            }
            else {
              this.callObservers('success', data);
              this.ajaxSuccess();
            }
          }
        });
      }

      return undefined;
    },
    ajaxSuccess: function() {
      _.each(this.allElements, function(elements) {
        Formwatcher.unsetChanged(elements, this);
        Formwatcher.setOriginalValue(elements);

        var isEmpty = (elements.input.val() === null || !elements.input.val());

        $.each(elements, function() {
          if (isEmpty) this.addClass('empty');
          else this.removeClass('empty');
        });
      });
    }
  });




  // Handle all forms that have the data-fw tag
  $(document).ready(function() {
    var handleForm = function(form) {
      var form = $(form);
      var formId = form.attr('id');
      var options = {};
      if (formId) {
        // Check if options have been set for it.
        if (Formwatcher.options[formId]) {
          options = Formwatcher.options[formId];
        }
      }
      var domOptions = form.data('fw');
      if (domOptions) {
        // domOptions always overwrite the normal options.
        options = _.extend(options, domOptions);
      }
      new Watcher(form, options);
    }

    $('form[data-fw]').each(function() {
      handleForm(this);
    });
    
    _.each(Formwatcher.options, function(options, formId) {
      handleForm($('#' + formId));
    });
  });




})(jQuery);
