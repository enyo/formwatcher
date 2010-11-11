/*  © Matthias Loitsch   */
var FontSelect = Class.create(Formwatcher.Decorator,
{
	initialize: function(watcher, input)
	{
		if (input.getValue()) { input.setStyle({fontFamily: input.getValue() }); }
		$A(input.options).each(function(option) { $(option).setStyle({ fontFamily: option.value }); });
		input.observe('change', function(ev) { input.setStyle({ fontFamily: input.getValue() }) });
	}
});


var decorator = Class.create(Formwatcher.Decorator,
{
	accepts: function(input) { return (input.nodeName == 'SELECT' && input.hasClassName('font')) },
	Class: FontSelect
});

Formwatcher.decorators.push(new decorator());