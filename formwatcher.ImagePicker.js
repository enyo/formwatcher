/*  © Matthias Loitsch // Graphics © by Tjandra Mayerhold  */
var ImagePicker = Class.create({
	thumbnailSize: 100,
	images: [],
	noImageURL: 'http://www.zella-loshausen.de/zsl/DesktopModules/ColderSoftNews/Media/noimage_36x36.gif',
	imagesPath: '../Imports/',
	initialize: function(watcher, elements, allowEmpty)
	{
		this.watcher = watcher;
		this.showListener = this.show.bindAsEventListener(this);
		this.hideListener = this.hide.bindAsEventListener(this);

		elements.get('button').observe('click', this.showListener);

		this.elements = elements;
		this.allowEmpty = allowEmpty ? true : false;
	},
	setImages: function(images) { this.images = images; },
	getNoImage: function() { return { src: this.noImageURL, name: 'NO IMAGE', type: 'remove' }; },
	show: function(evt)
	{
		$$('select', 'object', 'embed').invoke('setStyle', { visibility: 'hidden' });
		if (evt) { evt.stop(); }
		if (!this.containerElement) { this.createElements(); }
		this.containerElement.center();
		this.containerElement.show();
	},
	hide: function()
	{
		$$('select', 'object', 'embed').invoke('setStyle', { visibility: 'visible' });
		if (this.containerElement) { this.containerElement.hide(); }
	},
	selectImage: function(evt, image)
	{
		if (!image || image.type == 'remove') { image = { src: '', name: '' }; }
		this.elements.get('input').value   = image.src;
		this.elements.get('display').value = image.name;
		Formwatcher.onchange(this.elements, this.watcher.options);
		this.hide();
	},
	createElements: function()
	{
		this.containerElement = $(document.body.appendChild(Builder.node('div', { className: 'imagePicker' }, [
			Builder.node('div', { className: 'titleBar' }, [
				Builder.node('div', { className: 'wrapper' }, [
					Builder.node('h1', Builder.node('span', 'Image Picker')),
					Builder.node('div', { className: 'buttons' }, [
						Builder.node('div', { className: 'button close' }, [
							$(Builder.node('a', { href: 'javascript:undefined' }, Builder.node('span', 'Close X') )).observe('click', this.hideListener)
						])
					]),
				])
			]),
			Builder.node('div', { className: 'content' }, [
				Builder.node('div', { className: 'wrapper' }, [
					Builder.node('div', { className: 'thumbnails' } )
				])
			]),
			Builder.node('div', { className: 'footer' }, [
				Builder.node('div', { className: 'wrapper' }, [
					Builder.node('div', { className: 'functions' }, [
						Builder.node('div', { className: 'size' }, [
							'Size: ',
							Builder.node('div', { className: 'slider' }, [
								Builder.node('div', { className: 'handle' })
							])
						])
					])
				])
			])
		])));
		new Draggable(this.containerElement, { handle: this.containerElement.down('.titleBar') });

		var changeSize = function(value)
		{
			this.thumbnailSize = value;
			this.containerElement.select('.thumbnail').invoke('setStyle', { width: value + 'px' });
			this.containerElement.select('.image').invoke('setStyle', { width: value + 'px', height: value + 'px' });
		};
		changeSize = changeSize.bind(this);

		new Control.Slider(this.containerElement.down('.slider .handle'), this.containerElement.down('.slider'), {
			range: $R(40, 150),
			values: $R(4, 15).collect(function(v) { return v * 10; }),
			sliderValue: this.thumbnailSize,
			onSlide: function(value) { changeSize(value); },
			onChange: function(value) { changeSize(value); }
		});

		this.containerElement.down('.content').makeClipping();

		setTimeout(this.createThumbnails.bind(this), 1);
	},
	createThumbnails: function()
	{
		var thumbs = this.containerElement.down('.thumbnails');
		if (this.allowEmpty) { thumbs.appendChild(this.getThumbnailElement(this.getNoImage())); }
		this.images.each(function(image) { thumbs.appendChild(this.getThumbnailElement(image)); }, this);
		thumbs.appendChild(Builder.node('div', { className: 'wrap' }));
	},
	getThumbnailElement: function(image)
	{
		var src = image.src.startsWith('http://') ? image.src : this.imagesPath + image.src;

		var pictureElement = $(Builder.node('div', { className: 'image ' + image.type })).setStyle({ width: this.thumbnailSize + 'px', height: this.thumbnailSize + 'px' });

		switch (image.type)
		{
			case 'remove':
			case 'pattern': pictureElement.setStyle({ backgroundImage: 'url("'+src+'")' }); break;
			case 'gradient':
			case 'picture':
			default:
				pictureElement.appendChild(Builder.node('img', { src: src })); break;
		}

		return $(Builder.node('div', { className: 'thumbnail', style: 'width: ' + this.thumbnailSize + 'px' }, [
			pictureElement,
			Builder.node('div', { className: 'description' }, image.name)
		])).observe('click', this.selectImage.bindAsEventListener(this, image));
	}
});

ImagePicker.supportedTypes = [ 'picture', 'pattern', 'gradient' ];

var decorator = Class.create(Formwatcher.Decorator,
{
	accepts: function(input) { return (input.nodeName == 'SELECT' && input.hasClassName('image')); },
	wrap: function(watcher, input)
	{
		var images = [];
		var allowEmpty = false;
		$A(input.options).each(function(option)
		{
			if (option.value.empty()) allowEmpty = true;
			else
			{
				option = $(option);
				var imageType = ImagePicker.supportedTypes.find(function(t) { return option.hasClassName(t) }) || ImagePicker.supportedTypes.first();
				images.push({ src: option.value, name: option.text, type: imageType });
			}
		});

		var selectedOption = $A(input.options).find(function(option) { return option.selected; } );

		var valueInput   = $(Builder.node('input',  { name: input.name, value: input.getValue(), type: 'text', style: 'display:none' }));
		var displayInput = $(Builder.node('input',  { value: selectedOption.text, type: 'text', readonly: 'readonly', className: 'imagePath' }));
		var selectButton = $(Builder.node('button', { type: 'button' }, "Change"));

		var elementsContainer = $(Builder.node('div', { className: 'imagePickerElements' }, [ valueInput, displayInput, selectButton ]));

		input.insert({ after: elementsContainer });
		Element.remove(input);

		var elements = $H({ input: valueInput, display: displayInput, button: selectButton });
		var imagePicker = new this.Class(watcher, elements, allowEmpty);
		imagePicker.setImages(images);
		return elements;
	},
	Class: ImagePicker
});

Formwatcher.decorators.push(new decorator());