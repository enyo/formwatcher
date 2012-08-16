# Formwatcher Version 2.1.10-dev

The formwatcher is a tool to easily improve forms with JavaScript with following goals in mind:

- Be completely unobtrusive (your forms still work without JS)
- Provide sensible defaults so you won't have to configure much
- Provide the best user experience possible

It is written in [CoffeeScript][] and built with (and depends on):

  - [domready][]
  - [qwery][] (Selector Engine)
  - [bonzo][] (DOM utility)
  - [bean][] (Event utility)
  - [reqwest][] (AJAX utility)

[domready]: https://github.com/ded/domready
[qwery]: https://github.com/ded/qwery
[bonzo]: https://github.com/ded/bonzo
[bean]: https://github.com/fat/bean
[reqwest]: https://github.com/ded/reqwest

[coffeescript]: http://coffeescript.org/


Visit the [official site](http://www.formwatcher.org/) for a demo.


## Installation

Simply install with [ender](http://ender.no.de):

    ender build formwatcher

or

    ender add formwatcher

You can also just download the `lib/` files, and install the dependencies manually, but I don't recommend it.



## Features

The **features** include:

- AJAX conversion: Turn a form into an AJAX call automatically
- Automatically add `.focus`, `.changed`, `.validated`, `.error`, `.empty`, etc... classes to input fields
- Lots of built in validators, and the possibilty to write your own
- Decorators: Turn a simple select input field into an image selector, or a font selector or display a nice hint
- Simple html attribute configuration that is W3C valid, either by setting classes on the input field, or using the `data-fw` attribute.
- Automatching of `<label>` elements so you don't have to write the `for=""` attribute.
- ...and more

Formwatcher is tested with qunit and works in Safari, Chrome, Firefox, Opera and IE7+.

> IE7 does not have a native `JSON` object. So if you intend to use AJAX with your form **and** want
> to support IE7 you have to install [ender-json](https://github.com/amccollum/ender-json) as well.


##Formwatcher modules

Those are the modules that can already exist and can be used with formwatcher:

- `formwatcher-hint` Shows nice hints that fade out when the input field is focused.
- `formwatcher-date-picker` Based on [CalEnder](https://github.com/ded/CalEnder)
- *more coming soon...*

To install any of them simply use ender like this: `ender add formwatcher-hint` for example.

To list all formwatcher modules in the npm registry you can simply
[list all modules with the formwatcher tag](http://search.npmjs.org/#/_tag/formwatcher).


## Configuration

You can configure formwatcher [imperatively](#imperative-configuration) or by
[defining specific html attributes](#attribute-configuration) on your form


### Imperative configuration

Although most of the time, the simplest way to configure Formwatcher is by
[attribute configuration](#attribute-configuration), there are a few use cases
where the imperative configuration is necessary or more appropriate:

    Formwatcher.watch('form-id');


### Attribute configuration

Instead of configuring your forms with JS, you can simply add the `data-fw`
attribute to your elements so Formwatcher knows how to handle them. The best
part about it: _it doesn't break your HTML markup_; it still validates fine.


    <form action="" data-fw="">
      <!-- Input fields -->
    </form>

When Formwatcher is included, it will scan all forms in the document as soon as
it's loaded to see if there is any form with the `data-fw` attribute, and attaches
itself to it.

The `data-fw` attribute is just a JSON object, that will be passed to the new
`Watcher` instance and serves as `options` object.

A Formwatcher configuration could look like this:

    <form action="" data-fw='{ "ajax": true, "validate": false }'>
    </form>

> __NOTE:__ The `data-fw` content is pure JSON. All names and strings have to be
> in double quotes, so you have to put the `data-fw` value itself in single quotes.

Since it's JSON, not JS, you won't be able to directly define your callback
functions here.

You can directly configure decorators or validators inside this JSON object:

    <form action="" data-fw='{
      "validate": true,
      "Hint": { "auto": true },
      "Float": { "decimalMark": "," }
    }'>
    </form>


## Writing your own Validators

Adding a validator is very easy. You just push a new instance of `Formwatcher.Validator` to the `Formwatcher.validators`
list.

As an example, the `required` validator:

    # ## Required validator
    #
    # If it's a checkbox, it has to be checked. Otherwise the value can't be 0 or an empty string (whitespace is trimmed)
    Formwatcher.validators.push class extends Formwatcher.Validator
      name: "Required"
      description: "Makes sure the value is not blank (nothing or spaces)."
      classNames: [ "required" ]
      validate: (value, input) ->
        return "Can not be blank." if (input.attr("type") is "checkbox" and not input.is(":checked")) or not trim value
        true

If the `validate()` funciton returns a string, the validation failed, and the string is used as error message.

If `true` is returned, the validation passed.


## Writing your own Decorators


Writing decorators is a bit more complex, but not difficult neither. The basic concept is again pushing instances of
`Formwatcher.Decorator` to `Formwatcher.decorators`:

    Formwatcher.decorators.push class extends Formwatcher.Decorator

      name: "SomeDecorator"
      description: "The description of the decorator"
      nodeNames: [ "INPUT", "TEXTAREA" ]
      defaultOptions:
        myOption: "test"

      accepts: (input) ->
        if super input # The default implementation checks for classes and node names.
          # Return true if this decorator should decorate this input field.
          return true
        false

      decorate: (input) ->
        # The decorate function has to return an object with all fields that have been generated and that should be updated
        # with `.focus`, `.validated`, etc... classes.
        # The `elements` object HAS TO contain at least `input` which is the field that will hold the actual value to be
        # transmitted. (It can be changed to a hidden field)
        elements = { input: input }

        # Here is your code to nicely wrap (or replace) the input field.

        return elements

Take a look at the [built in hint decorator](https://github.com/enyo/formwatcher/blob/master/src/hint/hint.coffee) for a full example.


