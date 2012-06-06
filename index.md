---
layout: default
title: Unobstrusive form extension
---

# Formwatcher

The formwatcher is a tool to easily improve forms with javascript based on the jquery library.

It is designed to be as unobtrusive as possible, so that every form remains intact if javascript is not enabled.


## Features

- AJAX conversion: Turn a form into an AJAX call automatically
- Automatically add `.focus`, `.changed`, `.validated`, `.error`, `.empty`, etc... classes to input fields
- Lots of built in validators, and the possibilty to write your own
- Decorators: Turn a simple select input field into an image selector, or a font selector or display a nice hint
- Simple html attribute configuration that is W3C valid, either by setting classes on the input field, or using the `data-fw` attribute.
- Automatching of `<label>` elements so you don't have to write the `for=""` attribute.
- ...and more

Formwatcher is tested with qunit and works in Safari, Chrome, Firefox, Opera and IE7+.


## Installation

The best way to install formwatcher is with [ender][]:

    ender build formwatcher

or

    ender add formwatcher


[ender]: http://ender.no.de/


The basic formwatcher install does **not** include decorators. If you want to use a decorator, you have to install it.

Examples:

    ender add formwatcher-hint
    ender add formwatcher-date-picker

For a complete list of formwatcher decorators (or addon validators) [search for the "formwatcher" tag in the npm registry](http://search.npmjs.org/#/_tag/formwatcher).


## Demo

Try submitting the form without filling out all fields or try an invalid email address.

<script type="text/javascript">
  Formwatcher.options['my-form'] = {
    onSuccess: function() { alert("Form successfully submitted."); },
    resetFormAfterSubmit: true
  };
</script>

<form action="target.html" method="get" id="my-form" data-fw='{ "ajax": true }'>

  <div><input type="text" name="login" value="" data-hint="Login" class="required" /></div>
  <div><input type="password" name="password" value="" data-hint="Password" class="required" /></div>
  <div><input type="text" name="email" value="" data-hint="Email" class="validate-email required" /></div>
  <div><input type="text" name="age" value="" data-hint="Your age" class="validate-integer required" /></div>

  <button type="submit">Submit</button>
    
</form>

Source:

{% highlight javascript %}
// JavaScript
Formwatcher.options['my-form'] = {
  onSuccess: function() { alert("Form successfully submitted."); },
  resetFormAfterSubmit: true
};
{% endhighlight %}

{% highlight html %}
<!-- HTML -->
<form action="target.html" method="get" id="my-form" data-fw='{ "ajax": true }'>

  <div><input type="text" name="login" value="" data-hint="Login" class="required" /></div>
  <div><input type="password" name="password" value="" data-hint="Password" class="required" /></div>
  <div><input type="text" name="email" value="" data-hint="Email" class="validate-email required" /></div>
  <div><input type="text" name="age" value="" data-hint="Your age" class="validate-integer required" /></div>

  <button type="submit">Submit</button>
    
</form>
{% endhighlight %}

As you can see there's hardly any configuration necessary to produce this form that feels just right.

Most configuration is done with classes (`required`, `validate-email`, etc...).  
Formwatcher automatically watches a form as soon as it detects the `data-fw=""` property.

## Documentation

Please see the [documentation at github](https://github.com/enyo/formwatcher) for further reading or
go through the [generated docs](docs/formwatcher.html).

## Get the source at [github.com](https://github.com/enyo/formwatcher/tags)



You might be interested in another project of ours: [www.opentip.org](http://www.opentip.org/)

