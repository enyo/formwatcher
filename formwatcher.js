/**
 * Formwatcher
 *  programming by Matthias Loitsch
 *  design by Tjandra Mayerhold
 *
 * More infos at http://www.formwatcher.org
 *
 * Formwatcher by Matthias Loitsch & Tjandra Mayerhold is licensed under a
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
 */



Hash.addMethods({
  /**
   * When iterating through a Hash, you don't just get the value, but a pair object. So just calling .invoke does not work,
   * since the function would be called on the pair, not the value.
   */
  invokeValue: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(pair) {
      var obj = pair.value;
      return obj[method].apply(obj, args);
    });
  }
});

Element.addMethods({
  center: function(element) {
    var viewportDimensions = document.viewport.getDimensions();
    var viewportOffsets = document.viewport.getScrollOffsets();

    var thisDimensions = $(element).getDimensions();

    var newTop  = Math.max(viewportOffsets.top, (viewportDimensions.height - thisDimensions.height) / 2 + viewportOffsets.top);
    var newLeft = Math.max(viewportOffsets.left, (viewportDimensions.width  - thisDimensions.width)  / 2 + viewportOffsets.left);

    element.setStyle({ 'top': newTop + 'px', 'left': newLeft + 'px' });
  }
});

if (!Object.isFunction(Element.makeFixed)) {
  Element.addMethods({
    fixate: function(element) {
      element = $(element);
      // Make sure that the element's "offset parent" is the document itself;
      // i.e., that it has no non-statically-positioned parents
      element.setStyle({ position: "absolute" });
      var marginTop = element.viewportOffset().top;
      function adjust() { element.style.top = (document.viewport.getScrollOffsets().top + marginTop) + 'px'; }
      Event.observe(window, "scroll", adjust);
      adjust();
    }
  });
}


var Formwatcher = {
  Version: '0.4.0',
  REQUIRED_PROTOTYPE_VERSION: '1.6.0',
  REQUIRED_SCRIPTACULOUS_VERSION: '1.8.0',
  require: function(libraryName) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
    document.write('<script type="text/javascript" src="'+libraryName+'"><\/script>');
  },
  load: function() {
    function getComparableVersion(version) { var v = version.split('.'); return parseInt(v[0])*100000 + parseInt(v[1])*1000 + parseInt(v[2]); }
    if((typeof Prototype === 'undefined') || (typeof Element === 'undefined') || (typeof Element.Methods === 'undefined') || (getComparableVersion(Prototype.Version) < getComparableVersion(Formwatcher.REQUIRED_PROTOTYPE_VERSION))) { throw("Formwatcher requires the Prototype JavaScript framework >= " + Formwatcher.REQUIRED_PROTOTYPE_VERSION); }
    if((typeof Scriptaculous === 'undefined') || (typeof Effect === 'undefined') || (getComparableVersion(Scriptaculous.Version) < getComparableVersion(Formwatcher.REQUIRED_SCRIPTACULOUS_VERSION))) { throw("Formwatcher requires the Scriptaculous JavaScript framework >= " + Formwatcher.REQUIRED_SCRIPTACULOUS_VERSION); }

    /* load other wanted functions. (Thanks to scriptaculous for the idea) */
    $$('script').findAll(function(jsName) {
      return (jsName.src && jsName.src.match(/formwatcher\.js(\?.*)?$/))
    }).each(function(s) {
        var path = s.src.replace(/formwatcher\.js(\?.*)?$/, '');
        var includes = s.src.match(/\?.*load=([a-zA-Z,]*)/);
//        (includes ? includes[1] : 'FontSelect,ColorPicker,ImagePicker,SimpleDatePicker').split(',').each(function(include) {
        (includes ? includes[1] : 'FontSelect').split(',').each(function(include) {
          Formwatcher.require(path+'formwatcher.'+include+'.js'); });
      }
    );
  },
  ensureHash: function(elements) { return Object.isHash(elements) ? elements : $H({input: elements}); },
  getInput: function(elements)   { return Object.isHash(elements) ? elements.get('input') : elements; },
  getLabel: function(elements)   {
      var input = Formwatcher.getInput(elements);
      if (input.id) return $$('label[for='+input.id+']').first();
      return null;
    },
  onchange: function(elements, watcher) {
    var input = Formwatcher.getInput(elements);
    if (input._formwatcher) {
      if (((input.type === 'checkbox') && (input._formwatcher.originalyChecked != input.checked)) ||
        ((input.type !== 'checkbox') && (input._formwatcher.originalValue != input.getValue()))) { Formwatcher.setChanged(elements, watcher); }
      else { Formwatcher.unsetChanged(elements, watcher); }
    }
  },
  setChanged: function(elements, watcher) {
    var input = Formwatcher.getInput(elements);
    if (input._formwatcher && input._formwatcher.changed) return;
    elements = Formwatcher.ensureHash(elements);
    elements.invokeValue('addClassName', 'changed');
    if (input._formwatcher) {
      input._formwatcher.changed = true;
      if (!watcher.options.submitUnchanged) Formwatcher.restoreName(elements);
    }
    if (watcher.options.submitOnChange && watcher.options.ajax) watcher.submitForm();
  },
  unsetChanged: function(elements, watcher) {
    var input = Formwatcher.getInput(elements);
    if (input._formwatcher && !input._formwatcher.changed) return;
    elements = Formwatcher.ensureHash(elements);
    elements.invokeValue('removeClassName', 'changed');
    if (input._formwatcher) {
      input._formwatcher.changed = false;
      if (!watcher.options.submitUnchanged) Formwatcher.removeName(input);
    }
  },
  setOriginalValue: function(elements) {
    var input = Formwatcher.getInput(elements);
    if (input.type === 'checkbox') input._formwatcher.originalyChecked = input.checked;
    else input._formwatcher.originalValue = input.getValue();
  },
  removeName: function(elements) {
    var input = Formwatcher.getInput(elements);
    if (input.type === 'checkbox') return;
    if (!input._formwatcher.name) { input._formwatcher.name = input.name || ''; }
    input.name = '';
  },
  restoreName: function(elements) {
    var input = Formwatcher.getInput(elements);
    if (input.type === 'checkbox') return;
    input.name = input._formwatcher.name;
  },

  decorators: [],
  decorate: function(watcher, input) {
    var decorator = Formwatcher.decorators.find(function(decorator) { if (decorator.accepts(input)) return true; });
    if (decorator) { return decorator.decorate(watcher, input); } 
    else return $H({input: input});
  },
  validators: [],
  currentWatcherId: 0,
  watchers: [],
  add: function(watcher) { this.watchers[watcher.id] = watcher; },
  get: function(id) { return this.watchers[id]; },
  getAll: function() { return $A(this.watchers); }
};



/**
 * This is the base class for decorators and validators.
 */
Formwatcher._ElementWatcher = Class.create({
  name: 'No name',
  description: 'No description',
  nodeNames: null, // eg: SELECT
  classNames: [], // eg: ['font']'

  /**
   * Overwrite this function if your logic to which elements your decorator applies
   * is more complicated than a simple nodeName/className comparison.
   */
  accepts: function(input) {
    return (this.nodeNames.any(function(nodeName) { return input.nodeName == nodeName; }) && this.classNames.all(function(className) { return input.hasClassName(className); }));
  }
});


/**
 * The actual decorator class. Implement it to create a new decorator.
 */
Formwatcher.Decorator = Class.create(Formwatcher._ElementWatcher, {
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
    if (this.Class != null) { new this.Class(watcher, input); }
    this.activate(watcher, input);
    return $H({input: input});
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
Formwatcher.Validator = Class.create(Formwatcher._ElementWatcher, {
  /**
   * Return true if the validation passed, or an error message if not.
   */
  validate: function(watcher, input) {
    return true;
  }
});



Formwatcher.load();






var Watcher = Class.create({
  initialize: function(form, options) {
    this.allElements = [];
    this.id = Formwatcher.currentWatcherId ++;
    Formwatcher.add(this);
    this.observers = { };
    this.form = $(form);
    if (!this.form) { throw("Form element not found."); }

    // Those are the default options.
    // Overwrite any of them by passing an options with the same parameters to the Watcher constructor.
    this.options = Object.extend({
      submitUnchanged: true, // Remember: checkboxes are ALWAYS submitted if checked, and never if unchecked.
      ajax: true,
      submitOnChange: false, // Submit the form as soon as one input field has been changed. (Works only if ajax == true)
      responseCheck: function(transport) { return transport.responseText.empty() }, // Checks the ajax transport if everything was ok. Returns true or false
      onSubmit:  function()          { }, // This function gets called before submitting the form
      onSuccess: function(transport) { },  // If the responseCheck function returns true, this function gets called.
      onError:   function(transport) { alert(transport.responseText); } // If responseCheck returns false -> onError
    }, options || {} );

    this.observe('submit',  this.options.onSubmit);
    this.observe('success', this.options.onSuccess);
    this.observe('error',   this.options.onError);

    if (this.options.ajax) { this.convertFormToAjax(); }

    this.form.getElements().each(function(input) {
      if (!$(input)._formwatcher && input.type != 'hidden') {
        var elements = Formwatcher.ensureHash(Formwatcher.decorate(this, input));

        if (!elements.get('label')) {
          var label = Formwatcher.getLabel(elements);
          if (label) elements.set('label', label);
        }

        this.allElements.push(elements);

        input = $(elements.get('input'));
        input._formwatcher = { };


        Formwatcher.setOriginalValue(elements);

        if (input.getValue() === null || input.getValue().empty()) { elements.invokeValue('addClassName', 'empty'); }

        if (!this.options.submitUnchanged) { Formwatcher.removeName(elements); }

        elements.invokeValue('observe', 'focus', function(ev) { elements.invokeValue('addClassName', 'focus'); });
        elements.invokeValue('observe', 'blur',  function(ev) { elements.invokeValue('removeClassName', 'focus'); });

        var onchangeFunction = Formwatcher.onchange.bind(this, elements, this);
        elements.invokeValue('observe', 'change', onchangeFunction);
        elements.invokeValue('observe', 'blur', onchangeFunction);
      }
    }, this);
  },

  callObservers: function(eventName) {
    var args = $A(arguments); args.shift();
    this.observers[eventName].each(function(observer) { observer.apply(this, args); }, this)
  },
  observe: function(eventName, func) {
    if (this.observers[eventName] === undefined) { this.observers[eventName] = []; }
    this.observers[eventName].push(func); return this;
  },
  stopObserving: function(eventName, func) { this.observers[eventName] = this.observers[eventName].findAll(function(o) { return o !== func }); return this; },


  /**
   * This function converts a normal form to an AJAX based request, using the 'action' attribute as url.
   */
  convertFormToAjax: function() {
    var url = this.form.action;
    this.form.action = 'javascript:Formwatcher.get('+this.id+').submitForm();';
    var form = this.form;
    var self = this;

    this.submitForm = function() {
      self.form.disable();
      self.callObservers('submit');
      var fields = {};
      var i = 0;
      form.getElements().each(function(input) {
        if (input.type === 'hidden' || input.type === 'checkbox' || (input._formwatcher && input._formwatcher.changed) || self.options.submitUnchanged) {
          if (input.type !== 'checkbox' || input.checked) {
            fields[input.name ? input.name : 'unnamedInput_' + (i ++)] = input.value;
          }
        }
      });

      new Ajax.Request(url, {
        method: 'post',
        parameters: fields,
        onSuccess: function(transport) {
          self.form.enable();
          if (!self.options.responseCheck(transport)) { self.callObservers('error', transport); }
          else
          {
            self.callObservers('success', transport);
            self.allElements.each(function(elements) {
              Formwatcher.unsetChanged(elements, self);
              Formwatcher.setOriginalValue(elements);
              var input = Formwatcher.getInput(elements);

              if (input.getValue() != '' && input.getValue() !== null) { input.removeClassName('empty'); }
              else { input.addClassName('empty'); }

//               if (input._formwatcher) { Formwatcher.setOriginalValue(input); }
            }, self);
          }
        }
      });
      return undefined;
    };
  }

});
