
# ## The Hint decorator
#
# This decorator puts a text over a label that fades out when the user selects the label, or edits the text.


# Using ender
$ = ender


Formwatcher.decorators.push class extends Formwatcher.Decorator

  name: "Hint"
  description: "Displays a hint in an input field."
  nodeNames: [ "INPUT", "TEXTAREA" ]
  defaultOptions:
    auto: true # This automatically makes labels into hints.
    removeTrailingColon: true # Removes the trailing ` : ` from labels.
    color: "#aaa" # The text color of the hint.

  decParseInt: (number) -> parseInt number, 10

  accepts: (input) ->
    if super input
      # If `auto` is on, and there *is* a label.
      return true  if (input.data("hint")?) or (@options.auto and Formwatcher.getLabel { input: input }, @watcher.options.automatchLabel)
    false

  decorate: (input) ->
    elements = input: input
    hint = input.data "hint"

    if !hint? or !hint
      label = Formwatcher.getLabel elements, @watcher.options.automatchLabel
      throw "The hint was empty, but there was no label."  unless label
      elements.label = label
      label.hide()
      hint = label.html()
      hint = hint.replace(/\s*\:\s*$/, "") if @options.removeTrailingColon

    Formwatcher.debug "Using hint: " + hint


    # For now I'm using `display: inline-block` instead of `inline` because of the Webkit bug with `inline` offsetParents.
    # See here: http://jsfiddle.net/enyo/uDeZ9/
    wrapper = $.create("<span style=\"display: inline-block; position: relative;\" />")
    wrapper.insertAfter input
    wrapper.append input

    # I think this is a bit of a hack... Don't know how to get the top margin otherwise though, since `offset().top` seems not to work.
    # EDIT: Since the value offsetTop seems to account for the margin, I don't have to use it anymore.
    # topMargin = @decParseInt input.css("marginTop")
    # topMargin = 0  if isNaN(topMargin)

    # Not using input.offset() here, because I'm actually interested in the offset relative to the offsetParent
    inputOffset = 
      left: input[0].offsetLeft
      top: input[0].offsetTop
      width: input[0].offsetWidth
      height: input[0].offsetHeight

    leftPosition = @decParseInt(input.css("paddingLeft")) + @decParseInt(inputOffset.left) + @decParseInt(input.css("borderLeftWidth")) + 2 + "px" # + 2 so the cursor is not over the text
    # rightPosition = @decParseInt(input.css("paddingRight")) + @decParseInt(inputOffset.left + inputOffset.width) + @decParseInt(input.css("borderRightWidth")) + "px"
    topPosition = @decParseInt(input.css("paddingTop")) + @decParseInt(inputOffset.top) + @decParseInt(input.css("borderTopWidth")) + "px"

    hintElement = $.create("<span />")
    .html(hint)
    .css
      position: "absolute"
      display: "none"
      top: topPosition
      left: leftPosition
      fontSize: input.css "fontSize"
      lineHeight: input.css "lineHeight"
      fontFamily: input.css "fontFamily"
      color: @options.color
    .addClass("hint")
    .on("click", -> input[0].focus())
    .insertAfter input

    fadeLength = 100
    input.focusin ->
      if input.val() is ""
        hintElement.animate
          opacity: 0.4
          duration: fadeLength

    input.focusout ->
      if input.val() is ""
        hintElement.animate
          opacity: 1
          duration: fadeLength

    changeFunction = ->
      if input.val() is ""
        hintElement.show()
      else
        hintElement.hide()

    input.keyup changeFunction
    input.keypress ->
      setTimeout (-> changeFunction()), 1

    input.keydown =>
      setTimeout (-> changeFunction()), 1


    input.change changeFunction
    nextTimeout = 10
    # This is an ugly but very easy fix to make sure Hints are hidden when the browser autofills.
    delayChangeFunction = ->
      changeFunction()
      setTimeout (-> delayChangeFunction()), nextTimeout

      nextTimeout = nextTimeout * 2
      nextTimeout = (if nextTimeout > 10000 then 10000 else nextTimeout)

    delayChangeFunction()

    elements
