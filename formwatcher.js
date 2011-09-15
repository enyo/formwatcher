/**
 * Formwatcher
 *  programming by Matias Meno
 *  design by Tjandra Mayerhold
 *
 * More infos at http://www.formwatcher.org
 *
 * Formwatcher by Matias Meno & Tjandra Mayerhold is licensed under a
 * Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States License. 
 * http://creativecommons.org/licenses/by-nc-sa/3.0/us/
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
 */


(function( $ ){

  $.fn.center = function() {
    this.css("position","absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
  };
  // TODO: implement: fixate


  // Returns and stores attributes only for formwatcher.
  $.fn.fwAttr = function(attr, value) {
    if (!this.attr('_formwatcher')) this.attr('_formwatcher', {});
    
    if (attr === undefined) return this;
    
    var formwatcherAttributes = this.attr('_formwatcher');
    if (value === undefined) {
      // Get the attribute
      return formwatcherAttributes.attr;
    }
    else {
      // Set attribute
      formwatcherAttributes.attr = value;
      this.attr('_formwatcher', formwatcherAttributes);
      return this;
    }
  };


  this.Formwatcher = {
    Version: '0.5.0',
    REQUIRED_JQUERY_VERSION: '1.6.3',
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
        $.each((includes ? includes[1] : 'validators').split(','), function(index, include) {
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

      if (((input.attr('type') === 'checkbox') && (input.fwAttr('originalyChecked') != input.is(':checked'))) ||
        ((input.attr('type') !== 'checkbox') && (input.fwAttr('originalValue') != input.val()))) {
        Formwatcher.setChanged(elements, watcher);
      }
      else {
        Formwatcher.unsetChanged(elements, watcher);
      }

      watcher.validateElements(elements);
    },
    setChanged: function(elements, watcher) {
      var input = elements.input;

      if (input.fwAttr('changed')) return;
      
      $.each(elements, function(index, element) {
        element.addClass('changed');
      });

      input.fwAttr('changed', true);

      if (!watcher.options.submitUnchanged) Formwatcher.restoreName(elements);

      if (watcher.options.submitOnChange && watcher.options.ajax) watcher.submitForm();
    },
    unsetChanged: function(elements, watcher) {
      var input = elements.input;

      if (!input.fwAttr('changed')) return;

      $.each(elements, function(index, element) {
        element.removeClass('changed');
      });

      input.fwAttr('changed', false);

      if (!watcher.options.submitUnchanged) Formwatcher.removeName(input);
    },
    setOriginalValue: function(elements) {
      var input = elements.input;
      if (input.attr('type') === 'checkbox') input.fwAttr('originalyChecked', input.is(':checked'));
      else input.fwAttr('originalyChecked', input.val());
    },
    removeName: function(elements) {
      var input = elements.input;
      if (input.attr('type') === 'checkbox') return;

      if (!input.fwAttr('name')) {
        input.fwAttr('name', input.attr('name') || '');
      }
      input.attr('name', '');
    },
    restoreName: function(elements) {
      var input = elements.input;
      if (input.attr('type') === 'checkbox') return;
      input.attr('name', input.fwAttr('name'));
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
      return (this.nodeNames.any(function(nodeName) {
        return input.nodeName == nodeName;
      }) && this.classNames.all(function(className) {
        return input.hasClassName(className);
      }));
    }
  });


  /**
   * The actual decorator class. Implement it to create a new decorator.
   */
  this.Formwatcher.Decorator = this.Formwatcher._ElementWatcher.extend({
    /**
     * This function does all the magic.
     * It creates additional elements if necessary, and then actually creates
     * the object (or calls the function) that is going to handle the input.
     * 
     * This function has to return a hash of all fields that you want to get updated with .focus and .changed classes.
     * 'input' has to be the actual form element to transmit the data.
     * 'label' is reserved for the actual label.
     */
    decorate: function(watcher, input) {
      if (this.Class != null) {
        new this.Class(watcher, input);
      }
      this.activate(watcher, input);
      return $H({
        input: input
      });
    },
    /**
     * If you don't need a class, simply define the activate function
     */
    Class: null,
    /**
     * This actually activates the decorator.
     * If you have a Class you probably don't need activate.
     */
    activate: function(watcher, input) { }
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
      this.form.fwAttr('watcher', this);

      // Making sure the form always goes through the formwatcher on submit.
      this.form
      .fwAttr('originalAction', this.form.attr('action'))
      .attr('action', 'javascript:Formwatcher.get('+this.id+').submitForm();');


      // Those are the default options.
      // Overwrite any of them by passing an options with the same parameters to the Watcher constructor.
      this.options = $.extend({
        submitUnchanged: true, // Remember: checkboxes are ALWAYS submitted if checked, and never if unchecked.
        ajax: true,
        submitOnChange: false, // Submit the form as soon as one input field has been changed. (Works only if ajax == true)
        responseCheck: function(transport) {
          return transport.responseText.empty()
        }, // Checks the ajax transport if everything was ok. Returns true or false
        onSubmit:  function()          { }, // This function gets called before submitting the form
        onSuccess: function(transport) { },  // If the responseCheck function returns true, this function gets called.
        onError:   function(transport) {
          alert(transport.responseText);
        } // If responseCheck returns false -> onError
      }, options || {} );

      this.observe('submit',  this.options.onSubmit);
      this.observe('success', this.options.onSuccess);
      this.observe('error',   this.options.onError);


      var self = this;

      $.each($(':input', this.form), function(i, input) {
        var input = $(input);
        if (!input.fwAttr('initialized') && input.attr('type') != 'hidden') {
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

          input.fwAttr('validators', []);

          // Check which validators apply
          $.each(Formwatcher.validators, function(validator) {
            if (validator.accepts(input)) {
              Formwatcher.debug('Validator "' + validator.name + '" found for input field "' + input.name + '".');
              input.fwAttr('validators').push(validator);
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

      });
    },

    callObservers: function(eventName) {
      var args = arguments;
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
    submitForm: function() {
      if (this.validateForm()) {
        this.form.disable();
        this.callObservers('submit');

        // Do submit
        if (this.options.ajax) {
          this.submitAjax();
        }
        else {
          this.form.action = this.form._formwatcher.originalAction;
          this.form.submit.bind(this.form).defer();
          return false;
        }
      }
      else {
    // Abort
      }
    },
    validateForm: function() {
      var validated = true;
      this.allElements.each(function(elements) {
        // Not using .all() here, because I want every element to be inspected, even
        // if the first one fails.
        if (!this.validateElements(elements)) validated = false;
      }, this);
      return validated;
    },

    /**
     * inlineValidating: whether the user is still in the element, typing.
     */
    validateElements: function(elements, inlineValidating) {
    },

    submitAjax: function() {

    }
  });







})( jQuery );
