
# ## The DatePicker decorator based on [CalEnder][]
#
# This decorator shows a date picker to select a date.
#
# [calender]: https://github.com/ded/CalEnder



window.strPad = (str, length = 2) ->
  str = str.toString()
  while str.length < length
    str = "0" + str 
  str

Formwatcher.decorators.push class extends Formwatcher.Decorator

  name: "DatePicker"
  description: "Shows a date picker to select a date."
  nodeNames: [ "INPUT" ]
  classNames: [ "date" ]

  # Those are the CalEnder options. See CalEnder for more info.
  defaultOptions:
    months: null
    formatDate: (year, month, day) -> [ year, strPad(month), strPad(day)].join('-')
    weekStart: 0
    daysOfWeek: null

  decorate: (input) ->
    elements = input: input

    options = Formwatcher.deepExtend { date: new Date(input.val()) }, @options

    input.calender options

    # TODO: set the current date. This is currently not possible in CalEnder. I submitted a patch.
    # input.bind "focus click", ->

    elements
