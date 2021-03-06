// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Formwatcher.decorators.push((function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.name = "DatePicker";

    _Class.prototype.description = "Shows a date picker to select a date.";

    _Class.prototype.nodeNames = ["INPUT"];

    _Class.prototype.classNames = ["date"];

    _Class.prototype.strPad = function(str, length) {
      if (length == null) {
        length = 2;
      }
      str = str.toString();
      while (str.length < length) {
        str = "0" + str;
      }
      return str;
    };

    _Class.prototype.defaultOptions = {
      months: null,
      formatDate: function(year, month, day) {
        return [year, this.strPad(month), this.strPad(day)].join('-');
      },
      weekStart: 0,
      daysOfWeek: null
    };

    _Class.prototype.decorate = function(input) {
      var elements, options;
      elements = {
        input: input
      };
      options = Formwatcher.deepExtend({
        date: new Date(input.val())
      }, this.options);
      input.calender(options);
      return elements;
    };

    return _Class;

  })(Formwatcher.Decorator));

}).call(this);
