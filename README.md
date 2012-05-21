# Formwatcher Version 2.0.0-dev

> I'm currently switching this library to work with qwery, bonzo and underscore instead of
> jQuery and adding the library to ender, so it's a bit messy right now.

The formwatcher is a tool to easily improve forms with javascript.

It is designed to be as unobtrusive as possible, so that every form remains intact without the use of Javascript.


## Features

The **main features** include:

- Validation
- Decorators (Turn a simple select input field into an image selector, or a font selector or display a nice hint)
- AJAX conversion (Turn a form into an AJAX call automatically)
- Simple html attribute configuration that is W3C valid.
- It's very easy to create your own validators / decorators.
- ...plenty more.


## Usage

The most common useage is to include `formwatcher.js` along with `formwatcher.validators.js` and `formwatcher.Hint.js`.
Luckily there is a minified pack which contains exactly those 3 files: `minified/formwatcher.pack.js`.

So just include it in your `<head></head>` section:

    <head>
      [...]
      <script type="text/javascript" src="javascripts/forwmatcher.pack.js"></script>
    </head>

Well,... and basically you're done.

Please refer to the README/ folder for instructions on how to use and extend formwatcher.
