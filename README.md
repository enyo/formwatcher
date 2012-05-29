# Formwatcher Version 2.0.5-dev

The formwatcher is a tool to easily improve forms with JavaScript.

It is designed to be as unobtrusive as possible, so that every form remains intact without
the use of JavaScript, and is built with (and depends on):

  - [qwery][] (Selector Engine)
  - [bonzo][] (DOM utility)
  - [bean][] (Event utility)
  - [reqwest][] (AJAX utility)

[qwery]: https://github.com/ded/qwery
[bonzo]: https://github.com/ded/bonzo
[bean]: https://github.com/fat/bean
[reqwest]: https://github.com/ded/reqwest




## Installation

Simply install with [ender](http://ender.no.de):

    ender build formwatcher

or

    ender add formwatcher

You can also just download the `lib/` files, and install the dependencies manually, but I don't recommend it.

## Features

The **main features** include:

- Validation ¹
- Decorators ¹ (Turn a simple select input field into an image selector, or a font selector or display a nice hint)
- AJAX conversion (Turn a form into an AJAX call automatically)
- Simple html attribute configuration that is W3C valid.
- It's very easy to create your own validators / decorators.
- ...plenty more.


¹ *Formwatcher is built to be easily extendible, so writing your own validators and
decorators is both easy and recommended*


> Please refer to the README/ folder for instructions on how to use and extend formwatcher.
