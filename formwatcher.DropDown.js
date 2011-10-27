/*  © Matias Meno   */
(function( $ ){


  var DropDown = Class.extend({
    init: function(watcher, elements, options, selectedOptionIdx) {
      this.watcher = watcher;
      this.elements = elements;
      this.options = options;
      this.selectedOptionIdx = selectedOptionIdx;

      elements.button.click(_.bind(this.toggleList, this));

      var self = this;

      $('a', elements.list).click(function() {
        self.selectedOption($(this).fwData('optionIdx'));
      });
      
      this.updateState();
    },
    toggleList: function() {
      this.elements.list.toggle();
    },
    selectedOption: function(optionIdx) {
      this.selectedOptionIdx = optionIdx;
      var option = this.getSelectedOption();
      this.elements.button.html(option.name);
      this.elements.list.hide();
      this.elements.input.val(option.value);
      this.updateState();
      Formwatcher.changed(this.elements, this.watcher);
    },
    updateState: function() {
      var option = this.getSelectedOption();
      if (option) {
        this.elements.button.html(option.name);
        $('li.selected', this.elements.list).removeClass('selected');

        _.any($('li', this.elements.list), function(liElement) {
          liElement = $(liElement);
          if ($('a', liElement).fwData('optionIdx') == this.selectedOptionIdx) {
            liElement.addClass('selected');
            return true;
          }
          return false;
        }, this);
      }
    },
    getSelectedOption: function() {
      if (this.selectedOptionIdx === null) return null;
      return this.options[this.selectedOptionIdx];
    }
  });



  Formwatcher.Decorators.push(Formwatcher.Decorator.extend({
    name: 'DropDown',
    description: 'Converts a select into a button, which shows a div of all available options when clicked. This is ment to facilitate designing drop downs.',
    nodeNames: ['SELECT'],
    classNames: ['drop-down'],
    decorate: function(select) {

      // First create a hidden input field that will be used to post the data.
      var valueInput = $.el('input')
        .attr('name', select.attr('name'))
        .attr('type', 'hidden')
        .val(select.val());


      var options = [];
      var buttonText = '';
      var selectedOptionIdx;

      $('option', select).each(function(i) {
        var option = $(this);

        options[i] = {
          value: option.val(), 
          name: option.html()
        };
        if (option.val() == select.val()) {
          selectedOptionIdx = i;
          buttonText = option.html();
        }
      });

      var buttonElement = this.createButtonElement(buttonText);
      var listElement = this.createListElement(options);

      var elementsContainer = $.el('div')
        .addClass('drop-down')
        .append(buttonElement)
        .append(listElement)
        .append(valueInput)
        .insertAfter(select);

      select.remove();

      elements = {
        input: valueInput, 
        button: buttonElement, 
        list: listElement
      };

      new DropDown(watcher, elements, options, selectedOptionIdx);

      return elements;
    },
    createButtonElement: function(text) {
      return $.el('button').attr('type', 'button').html(text);
    },
    createListElement: function(options, allowEmpty) {
      var listElement = $.el('div').addClass('list').hide();

      var ulElement = $.el('ul').appendTo(listElement);


      _.each(options, function(option, i) {
        if (allowEmpty || option.value != '') {
          var liElement = $.el('li');

          var linkElement = $.el('a').attr('href', 'javascript:undefined;').html(option.name).fwData('value', option.value).fwData('optionIdx', i).appendTo(liElement);

          ulElement.append(liElement);
        }
      });

      return listElement;
    }
  }));


})( jQuery );
