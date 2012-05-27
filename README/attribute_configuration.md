# Attribute configuration

Instead of configuring your forms with JS, you can simply add the data-fw
attribute to your elements so Formwatcher knows how to handle them. The best
part about it: _it doesn't break your HTML markup_; it still validates fine.


## Get Formwatcher to notice a form

The simplest way to get Formwatcher to notice a form is to add an empty `data-fw`
attribute:

    <form action="" data-fw="">
    </form>

When Formwatcher is included, it will scan all forms in the document as soon as
it's loaded to see if there is any form with the `data-fw` attribute, and attaches
itself to it.

## Configuring your form

The `data-fw` attribute is just a JSON object, that will be passed to the new
`Watcher` instance and serve as `options` object.

A Formwatcher configuration could look like this:

    <form action="" data-fw='{ "ajax": true, "validate": false }'>
    </form>

__NOTE:__ The `data-fw` content is pure JSON. All names and strings have to be
in double quotes, so you have to put the `data-fw` value itself in single quotes.

Since it's JSON, not JS, you won't be able to directly define your callback
functions here.

## Configuring decorators or validators.

You can directly configure decorators or validators inside this JSON object:

    <form action="" data-fw='{
      "validate": true,
      "Hint": { "auto": true },
      "Float": { "decimalMark": "," }
    }'>
    </form>

