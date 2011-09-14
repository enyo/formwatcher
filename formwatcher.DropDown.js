/*  © Matthias Loitsch   */

var DropDown = Class.create({
  initialize: function(watcher, elements, options) {
    this.watcher = watcher;
    this.elements = elements;
    this.options = options;
    elements.get('button').observe('click', function() {
      this.toggleList();
    }.bind(this));
    
    elements.get('list').select('a').each(function(link) {
      link.observe('click', this.selectedOption.bind(this, link._optionIdx));
    }, this);
    
//    var optionIdx;
//    this.options.find(function(option, i) {
//      if (option.value == elements.get('input').getValue()) {
//        optionIdx = i;
//        return true;
//      }
//    });
//    if (optionIdx !== null) this.selectedOption(optionIdx);
    
  },
  toggleList: function() {
    this.elements.get('list').toggle();
  },
  selectedOption: function(optionIdx) {
    var option = this.options[optionIdx];
    this.elements.get('button').update(option.name);
    this.elements.get('list').hide();
    this.elements.get('input').setValue(option.value);
    Formwatcher.changed(this.elements, this.watcher);
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

    var listElement = new Element('div', {
      className: 'list'
    });
    listElement.hide();
    var ulElement = new Element('ul');
    listElement.appendChild(ulElement);

    var options = [];
    var buttonText = '';
    var i = 0;
    $A(input.options).each(function(option) {
      if (!input.hasClassName('required') || option.value != '') {
        var liElement = new Element('li', { });

        var linkElement = new Element('a', {
          href: 'javascript:undefined;'
        }).update(option.innerHTML);
        linkElement._value = option.value;
        linkElement._optionIdx = i;

        liElement.appendChild(linkElement);
        ulElement.appendChild(liElement);
      }
      options[i] = {
        value: option.value, 
        name: option.innerHTML
      };
      if (option.value == input.getValue()) buttonText = option.innerHTML;
      i ++;
    });


    var buttonElement = new Element('button', {
      type: 'button'
    });
    buttonElement.update(buttonText);


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

    new this.Class(watcher, elements, options);

    return elements;
  },
  Class: DropDown
})));