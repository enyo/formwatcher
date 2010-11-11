/*  © Matthias Loitsch   */
var SimpleDatePicker = Class.create(Formwatcher.Decorator,
{
	initialize: function(watcher, elements)
	{
		var input = elements.get('input');
		var year  = elements.get('year');
		var month = elements.get('month');
		var day   = elements.get('day');

		var changeFunction = function()
		{
			var date = new Date(year.getValue(), month.getValue(), day.getValue());
/*			date.setDate(day.getValue());
			date.setMonth(month.getValue());
			date.setFullYear(year.getValue());
			date.setHours(12);*/
			input.value = Math.round(date.getTime()/1000);
			Formwatcher.onchange(elements, watcher.options)
		};

		[ year, month, day ].each(function(e) { e.observe('change', changeFunction); }, this);
	}
});


var decorator = Class.create(Formwatcher.Decorator,
{
	accepts: function(input) { return (input.nodeName === 'INPUT' && input.hasClassName('date')) },
	wrap: function(watcher, input)
	{
		input.hide();

		var presets = { };
		if (input.getValue())
		{
			var presetDate = new Date(input.getValue() * 1000);
			presets.year  = presetDate.getFullYear();
			presets.day   = presetDate.getDate();
			presets.month = presetDate.getMonth();
		}
		else
		{
			presets.year  = myDate.getFullYear();
			presets.day   = 1;
			presets.month = 0;
		}




		var myDate = new Date();
		var yearSelect = Builder.node('select', { className: 'year' });
		for (var i = myDate.getFullYear() + 5; i >= 1980; i --)
		{
			var attr = { value: i };
			if (i == presets.year) { attr.selected = 'selected'; }
			yearSelect.appendChild(Builder.node('option', attr, i));
		}

		var monthSelect = Builder.node('select', { className: 'month' });
		$R(0, 11).each(function(i) {
			var attr = { value: i };
			if (i == presets.month) { attr.selected = 'selected'; }
			monthSelect.appendChild(Builder.node('option', attr, i + 1));
		});

		var daySelect = Builder.node('select', { className: 'day' });
		$R(1, 31).each(function(i) {
			var attr = { value: i };
			if (i == presets.day) { attr.selected = 'selected'; }
			daySelect.appendChild(Builder.node('option', attr, i));
		});

		yearSelect.value = presets.year;
		daySelect.value = presets.day;
		monthSelect.value = presets.month;


		input.insert({ after: yearSelect });
		input.insert({ after: monthSelect });
		input.insert({ after: daySelect });

		elements = $H({ input: input, year: yearSelect, month: monthSelect, day: daySelect});

		new this.Class(watcher, elements);

		return elements;
	},
	Class: SimpleDatePicker
});

Formwatcher.decorators.push(new decorator());