/*  © Matthias Loitsch   */
/**
 ** This class requires the Control.ColorPicker.
 ** Just include it in the header BEFORE the formwatcher script.
 **/ 
if((typeof Control !== 'undefined') || (typeof Control.ColorPicker !== 'undefined'))
{

	var ColorPicker = Class.create(Formwatcher.Decorator,
	{
		initialize: function(watcher, elements)
		{
			var input = Formwatcher.getInput(elements);
			// waiting til dom is loaded, so IE6 won't crash.
			document.observe('dom:loaded', function() {
				new Control.ColorPicker(input, { swatch: elements.get('swatch'), 'IMAGE_BASE': "Pictures/colorPicker/", onUpdate: function() { Formwatcher.onchange(input, watcher.options) } });
			});
		}
	});


	var decorator = Class.create(Formwatcher.Decorator,
	{
		accepts: function(input)
		{
			return (input.nodeName == 'INPUT' && input.hasClassName('color'));
		},
		wrap: function(watcher, input)
		{
			var swatch = $(Builder.node('button', { className: 'colorpicker' }));

			var inputWidth = parseInt(input.getStyle('width'));

			input.insert({ after: swatch });

			var elements = $H({ input: input, swatch: swatch });

			new this.Class(watcher, elements);

			return elements;
		},
		Class: ColorPicker
	});

	Formwatcher.decorators.push(new decorator());

}