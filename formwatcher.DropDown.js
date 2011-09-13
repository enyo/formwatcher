/*  © Matthias Loitsch   */

var DropDown = Class.create({
  initialize: function(watcher, elements) {
    this.watcher = watcher;
    this.elements = elements;
    elements.get('button').observe('click', function() { elements.get('list').toggle(); });
    
    elements.get('list').select('a').each(function(link) {
      link.observe('click', this.selectedOption.bind(this, link._value, link.innerHTML));
    }, this);
    
  },
  selectedOption: function(value, name) {
    this.elements.get('button').update(name);
    this.elements.get('list').hide();
  }
});

Formwatcher.decorators.push(new (Class.create(Formwatcher.Decorator, {
  name: 'DropDown',
  description: 'Converts a select into a button, which shows a div of all available options when clicked. This is ment to facilitate designing drop downs.',
  nodeNames: ['SELECT'],
  classNames: ['drop-down'],
  decorate: function(watcher, input) {
    
    var valueInput = new Element('input', { name: input.name, value: input.getValue(), type: 'hidden' });

    var ulElement = new Element('ul');
    ulElement.hide();

//    var options = [];
    $A(input.options).each(function(option) { 
      var liElement = new Element('li', { });
      
      var linkElement = new Element('a', { href: 'javascript:undefined;' }).update(option.innerHTML);
      linkElement._value = option.value;
      
      liElement.appendChild(linkElement);
      ulElement.appendChild(liElement);
      
//      options.push({ value: option.value, name: option.innerHTML});
    });


    var buttonElement = new Element('button', { type: 'button' });
    buttonElement.update(input.getValue());


    var elementsContainer = new Element('div');
    
    elementsContainer.appendChild(valueInput);
    elementsContainer.appendChild(buttonElement);
    elementsContainer.appendChild(ulElement);
    
    input.insert({ after: elementsContainer });
    Element.remove(input);

    var elements = $H({ input: valueInput, button: buttonElement, list: ulElement });

    new this.Class(watcher, elements);

    return elements;
  },
  Class: DropDown
})));