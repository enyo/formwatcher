

trim = (string) -> string.replace /^\s.*\s$/, ""


# ## Integer validator
#
# Makes sure that only digits are present
Formwatcher.validators.push class extends Formwatcher.Validator
  name: "Integer"
  description: "Makes sure a value is an integer"
  classNames: [ "validate-integer" ]
  validate: (value) ->
    return "Has to be a number."  unless value.replace(/\d*/, "") is ""
    true

  sanitize: (value) ->
    trim value



# ## Required validator
#
# If it's a checkbox, it has to be checked. Otherwise the value can't be 0 or an empty string (whitespace is trimmed)
Formwatcher.validators.push class extends Formwatcher.Validator
  name: "Required"
  description: "Makes sure the value is not blank (nothing or spaces)."
  classNames: [ "required" ]
  validate: (value, input) ->
    return "Can not be blank."  if (input.attr("type") is "checkbox" and not input.is(":checked")) or not trim value
    true


# ## NotZero validator
#
# The value can be any number except 0
Formwatcher.validators.push class extends Formwatcher.Validator
  name: "NotZero"
  description: "Makes sure the value is not 0."
  classNames: [ "not-zero" ]
  validate: (value) ->
    intValue = parseInt(value)
    if not isNaN(intValue) and intValue is 0 then return "Can not be 0."
    true



# ## Email validator
#
# Uses the best regular expression I could find to validate email addresses
Formwatcher.validators.push class extends Formwatcher.Validator
  name: "Email"
  description: "Makes sure the value is an email."
  classNames: [ "validate-email" ]
  validate: (value) ->
    emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    unless value.match(emailRegEx) then return "Must be a valid email address." 
    true

  sanitize: (value) ->
    trim value



# ## Float validator
#
# This one is a bit tricky because it allows for different decimal marks.
#
# It autodetects the decimal mark, and parses the number accordingly.
#
# Eg.:
#
# `"123.456,789"` and  
# `"123,456.789"` both become the number `123456.789`.
#
# The actual value that will be used is the number, with the `decimalMark` option. So if you pass `','` as decimal mark
# the formatted value will be: `"123456,789"`
Formwatcher.validators.push class extends Formwatcher.Validator
  name: "Float"
  description: "Makes sure a value is a float"
  classNames: [ "validate-float" ]
  defaultOptions:
    decimalMark: ","

  validate: (value) ->
    regex = new RegExp("\\d+(\\" + @options.decimalMark + "\\d+)?")
    return "Has to be a number."  unless value.replace(regex, "") is ""
    true

  sanitize: (value) ->
    if value.indexOf(".") >= 0 and value.indexOf(",") >= 0
      if value.lastIndexOf(",") > value.lastIndexOf(".")
        # `,` seems to be the decimal mark.
        value = value.replace(/\./g, "")
      else
        value = value.replace(/\,/g, "")

    value = value.replace(/\,/g, ".")  if value.indexOf(",") >= 0

    # Apparently there is no decimal mark. Only thousands separators.
    value = value.replace(/\./g, "")  unless value.indexOf(".") is value.lastIndexOf(".")

    # Now make sure the right decimal mark is used:
    value = value.replace(/\./g, @options.decimalMark)

    trim value
