---
layout: default
title: Unobstrusive form extension
---

# Formwatcher

The formwatcher is a tool to easily improve forms with javascript based on the jquery library.

It is designed to be as unobtrusive as possible, so that every form remains intact if javascript is not enabled.


## Installation

The best way to install formwatcher is by using [ender][]

    ender build formwatcher

or

    ender add formwatcher


[ender]: http://ender.no.de/


## Demo

Try submitting the form without filling out all fields or try an invalid email address.

<form action="index.html" method="get" id="my-form" data-fw='{ "ajax": false }'>

  <div><input type="text" name="login" value="" data-hint="Login" class="required" /></div>
  <div><input type="password" name="password" value="" data-hint="Password" class="required" /></div>
  <div><input type="text" name="email" value="" data-hint="Email" class="validate-email required" /></div>
  <div><input type="text" name="age" value="" data-hint="Your age" class="validate-integer required" /></div>

  <button type="submit">Submit</button>
    
</form>

Source:

    <form action="index.html" method="get" id="my-form" data-fw='{ "ajax": false }'>

      <div><input type="text" name="login" value="" data-hint="Login" class="required" /></div>
      <div><input type="password" name="password" value="" data-hint="Password" class="required" /></div>
      <div><input type="text" name="email" value="" data-hint="Email" class="validate-email required" /></div>
      <div><input type="text" name="age" value="" data-hint="Your age" class="validate-integer required" /></div>

      <button type="submit">Submit</button>
        
    </form>

As you can see there's hardly any configuration necessary to produce this form that feels just right.

Most configuration is done with classes (`required`, `validate-email`, etc...).  
Formwatcher automatically watches a form as soon as it detects the `data-fw=""` property.

## Documentation

Please see the [documentation at github](https://github.com/enyo/formwatcher) for further reading or
go through the [generated docs](docs/formwatcher.html).

## Get the source at [github.com](https://github.com/enyo/formwatcher/tags)




You might be interested in another project of ours: [www.opentip.org](http://www.opentip.org/).
