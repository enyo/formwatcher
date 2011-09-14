/*  © Matthias Loitsch   */

var DropDown = Class.create({
  initialize: function(watcher, elements, options, selectedOptionIdx) {
    this.watcher = watcher;
    this.elements = elements;
    this.options = options;
    this.selectedOptionIdx = selectedOptionIdx;

    elements.get('button').observe('click', function() {
      this.toggleList();
    }.bind(this));
    
    elements.get('list').select('a').each(function(link) {
      link.observe('click', this.selectedOption.bind(this, link._optionIdx));
    }, this);

    this.updateState();
  },
  toggleList: function() {
    this.elements.get('list').toggle();
  },
  selectedOption: function(optionIdx) {
    this.selectedOptionIdx = optionIdx;
    var option = this.getSelectedOption();
    this.elements.get('button').update(option.name);
    this.elements.get('list').hide();
    this.elements.get('input').setValue(option.value);
    this.updateState();
    Formwatcher.changed(this.elements, this.watcher);
  },
  updateState: function() {
    var option = this.getSelectedOption();
    if (option) {
      this.elements.get('button').update(option.name);
      this.elements.get('list').select('li.selected').invoke('removeClassName', 'selected');
      this.elements.get('list').select('li').any(function(liElement) {
        if (liElement.down('a')._optionIdx == this.selectedOptionIdx) {
          liElement.addClassName('selected');
          return true;
        }
      }, this);
    }
  },
  getSelectedOption: function() {
    if (this.selectedOptionIdx === null) return null;
    return this.options[this.selectedOptionIdx];
  }
});



Formwatcher.decorators.push(new (Class.create(Formwatcher.Decorator, {
  name: 'DropDown',
  description: 'Converts a select into a button, which shows a div of all available options when clicked. This is ment to facilitate designing drop downs.',
  nodeNames: ['SELECT'],
  classNames: ['drop-down'],
  decorate: function(watcher, input) {
    
    var valueInput = new Element('input', {
      name: input.name, 
      value: input.getValue(), 
      type: 'hidden'
    });


    var options = [];
    var buttonText = '';
    var selectedOptionIdx;

    $A(input.options).each(function(option, i) {
      options[i] = {
        value: option.value, 
        name: option.innerHTML
      };
      if (option.value == input.getValue()) {
        selectedOptionIdx = i;
        buttonText = option.innerHTML;
      }
    });

    var buttonElement = this.createButtonElement(buttonText);
    var listElement = this.createListElement(options);

    var elementsContainer = new Element('div', {
      className: 'drop-down'
    });
    
    elementsContainer.appendChild(buttonElement);
    elementsContainer.appendChild(listElement);
    elementsContainer.appendChild(valueInput);
    
    input.insert({
      after: elementsContainer
    });
    Element.remove(input);

    var elements = $H({
      input: valueInput, 
      button: buttonElement, 
      list: listElement
    });

    new this.Class(watcher, elements, options, selectedOptionIdx);

    return elements;
  },
  createButtonElement: function(text) {
    return new Element('button', {
      type: 'button'
    }).update(text);
  },
  createListElement: function(options, allowEmpty) {
    var listElement = new Element('div', {
      className: 'list'
    });
    listElement.hide();
    var ulElement = new Element('ul');
    listElement.appendChild(ulElement);

    options.each(function(option, i) {
      if (allowEmpty || option.value != '') {
        var liElement = new Element('li', { });

        var linkElement = new Element('a', {
          href: 'javascript:undefined;'
        }).update(option.name);
        linkElement._value = option.value;
        linkElement._optionIdx = i;

        liElement.appendChild(linkElement);
        ulElement.appendChild(liElement);
      }
    });
    
    return listElement;
  },
  Class: DropDown
})));