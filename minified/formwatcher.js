/**
 * Formwatcher Version 1.1.0
 * More infos at http://www.formwatcher.org
 *
 * Copyright (c) 2012, Matias Meno
 * Graphics by Tjandra Mayerhold
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(a){a.el=function(b){return a(document.createElement(b))},a.fn.center=function(){return this.css("position","absolute"),this.css("top",(a(window).height()-this.outerHeight())/2+a(window).scrollTop
()+"px"),this.css("left",(a(window).width()-this.outerWidth())/2+a(window).scrollLeft()+"px"),this},a.fn.uid=function(){var a=this.attr("id");return a||(a="generatedUID"+Formwatcher.uidCounter++,this.attr
("id",a)),a},a.fn.outerClick=function(b,c){var d="."+this.uid()+(c?NaN+c:"");return a("body").bind("click"+d,_.bind(function(c){a(c.target).closest(this).length||b()},this)),this},a.fn.unbindOuterClick=
function(b){return a("body").unbind("click."+this.uid()+(b?NaN+b:"")),this},a.fn.hideOnOuterClick=function(){var a=this,b="hideOnOuterClick";return _.defer(function(){a.outerClick(function(){a.hide(),a
.unbindOuterClick(b)},b)}),this},a.fn.fwData=function(a,b){this.data("_formwatcher")||this.data("_formwatcher",{});if(a===undefined)return this;var c=this.data("_formwatcher");return b===undefined?c[a]
:(c[a]=b,this.data("_formwatcher",c),this)},this.Formwatcher={Version:"1.1.0",REQUIRED_JQUERY_VERSION:"1.6.0",debugging:!1,uidCounter:0,require:function(b){a("body").append('<script type="text/javascript" src="'+
b+'"></script>')},load:function(){function b(a){var b=a.split(".");return parseInt(b[0])*1e5+parseInt(b[1])*1e3+parseInt(b[2])}if(b(jQuery.fn.jquery)<b(Formwatcher.REQUIRED_JQUERY_VERSION))throw"Formwatcher requires the jQuery JavaScript framework >= "+
Formwatcher.REQUIRED_JQUERY_VERSION;a("script").filter(function(){return this.src&&this.src.match(/formwatcher\.js(\?.*)?$/)}).each(function(){var b=this.src.replace(/formwatcher\.js(\?.*)?$/,""),c=this
.src.match(/\?.*load=([a-zA-Z,]*)/);c&&a.each(c[1].split(","),function(a,c){Formwatcher.require(b+"formwatcher."+c+".js")})})},debug:function(){this.debugging&&typeof console!="undefined"&&typeof console
.debug!="undefined"&&console.debug.apply(console,arguments)},getErrorsElement:function(b,c){var d=b.input,e;d.attr("name")&&(e=a("#"+d.attr("name")+"-errors"));if(!e||!e.length&&d.attr("id"))e=a("#"+d.
attr("id")+"-errors");if(!e||!e.length)e=a(document.createElement("span")),d.attr("name")&&e.attr("id",d.attr("name")+"-errors"),d.after(e);return e.hide().addClass("errors").addClass("fw-errors"),e},getLabel
:function(b,c){var d=b.input,e;d.attr("id")&&(e=a("label[for="+d.attr("id")+"]"),e.length||(e=undefined));if(!e&&c){var e=d.prev();if(!e.length||e.get(0).nodeName!=="LABEL"||e.attr("for"))e=undefined}return e
},changed:function(a,b){var c=a.input;if(!c.fwData("forceValidationOnChange")&&(c.attr("type")==="checkbox"&&c.fwData("previouslyChecked")===c.is(":checked")||c.fwData("previousValue")===c.val()))return;
c.fwData("forceValidationOnChange",!1),this.setPreviousValueToCurrentValue(a),c.attr("type")==="checkbox"&&c.fwData("initialyChecked")!=c.is(":checked")||c.attr("type")!=="checkbox"&&c.fwData("initialValue"
)!=c.val()?Formwatcher.setChanged(a,b):Formwatcher.unsetChanged(a,b),b.options.validate&&b.validateElements(a)},setChanged:function(b,c){var d=b.input;if(d.fwData("changed"))return;a.each(b,function(a,
b){b.addClass("changed")}),d.fwData("changed",!0),c.options.submitUnchanged||Formwatcher.restoreName(b),c.options.submitOnChange&&c.options.ajax&&c.submitForm()},unsetChanged:function(b,c){var d=b.input
;if(!d.fwData("changed"))return;a.each(b,function(a,b){b.removeClass("changed")}),d.fwData("changed",!1),c.options.submitUnchanged||Formwatcher.removeName(b)},storeInitialValue:function(a){var b=a.input
;b.attr("type")==="checkbox"?b.fwData("initialyChecked",b.is(":checked")):b.fwData("initialValue",b.val()),this.setPreviousValueToInitialValue(a)},restoreInitialValue:function(a){var b=a.input;b.attr("type"
)==="checkbox"?b.attr("checked",b.fwData("initialyChecked")):b.val(b.fwData("initialValue")),this.setPreviousValueToInitialValue(a)},setPreviousValueToInitialValue:function(a){var b=a.input;b.attr("type"
)==="checkbox"?b.fwData("previouslyChecked",b.fwData("initialyChecked")):b.fwData("previousValue",b.fwData("initialValue"))},setPreviousValueToCurrentValue:function(a){var b=a.input;b.attr("type")==="checkbox"?
b.fwData("previouslyChecked",b.is(":checked")):b.fwData("previousValue",b.val())},removeName:function(a){var b=a.input;if(b.attr("type")==="checkbox")return;b.fwData("name")||b.fwData("name",b.attr("name"
)||""),b.attr("name","")},restoreName:function(a){var b=a.input;if(b.attr("type")==="checkbox")return;b.attr("name",b.fwData("name"))},Decorators:[],decorate:function(a,b){var c=_.detect(a.decorators,function(
a){if(a.accepts(b))return!0});return c?(Formwatcher.debug('Decorator "'+c.name+'" found for input field "'+b.attr("name")+'".'),c.decorate(b)):{input:b}},Validators:[],currentWatcherId:0,watchers:[],add
:function(a){this.watchers[a.id]=a},get:function(a){return this.watchers[a]},getAll:function(){return this.watchers},scanDocument:function(){var b=function(b){b=a(b);if(b.fwData("watcher"))return;var c=
b.attr("id"),d={};c&&Formwatcher.options[c]&&(d=Formwatcher.options[c]);var e=b.data("fw");e&&(d=_.extend(d,e)),new Watcher(b,d)};a('form[data-fw], form[data-fw=""]').each(function(){b(this)}),_.each(Formwatcher
.options,function(c,d){b(a("#"+d))})},watch:function(b,c){a("document").ready(function(){new Watcher(b,c)})}};var b=!1,c=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;Formwatcher.Class=function(){},Formwatcher
.Class.extend=function(a){function g(){!b&&this.init&&this.init.apply(this,arguments)}var d=this.prototype;b=!0;var e=new this;b=!1;for(var f in a)e[f]=typeof a[f]=="function"&&typeof d[f]=="function"&&
c.test(a[f])?function(a,b){return function(){var c=this._super;this._super=d[a];var e=b.apply(this,arguments);return this._super=c,e}}(f,a[f]):a[f];return g.prototype=e,g.prototype.constructor=g,g.extend=
arguments.callee,g},this.Formwatcher._ElementWatcher=Formwatcher.Class.extend({name:"No name",description:"No description",nodeNames:null,classNames:[],defaultOptions:{},options:null,init:function(b){this
.watcher=b,this.options=a.extend(!0,{},this.defaultOptions,b.options[this.name]||{})},accepts:function(a){return this.watcher.options[this.name]!==undefined&&!this.watcher.options[this.name]?!1:_.any(this
.nodeNames,function(b){return a.get(0).nodeName==b})&&_.all(this.classNames,function(b){return a.hasClass(b)})}}),this.Formwatcher.Decorator=this.Formwatcher._ElementWatcher.extend({decorate:function(a
,b){return{input:b}}}),this.Formwatcher.Validator=this.Formwatcher._ElementWatcher.extend({nodeNames:["INPUT","TEXTAREA","SELECT"],validate:function(a,b){return!0},sanitize:function(a){return a}}),a(document
).ready(function(){Formwatcher.load()}),this.Formwatcher.defaultOptions={ajax:!1,validate:!0,submitOnChange:!1,submitUnchanged:!0,submitFormIfAllUnchanged:!1,resetFormAfterSubmit:!1,automatchLabel:!0,responseCheck
:function(a){return!a},onSubmit:function(){},onSuccess:function(a){},onError:function(a){alert(a)}},this.Formwatcher.options={},this.Watcher=Formwatcher.Class.extend({init:function(b,c){this.form=typeof 
b=="string"?a("#"+b):a(b);if(this.form.length<1)throw"Form element not found.";if(this.form.length>1)throw"The jQuery contained more than 1 element.";if(this.form.get(0).nodeName!=="FORM")throw"The element was not a form."
;this.allElements=[],this.id=Formwatcher.currentWatcherId++,Formwatcher.add(this),this.observers={};var d=this;this.form.fwData("watcher",this),this.form.fwData("originalAction",this.form.attr("action"
)||"").attr("action","javascript:undefined;"),this.options=a.extend(!0,{},Formwatcher.defaultOptions,c||{}),this.decorators=[],this.validators=[],_.each(Formwatcher.Decorators,function(a){d.decorators.
push(new a(d))}),_.each(Formwatcher.Validators,function(a){d.validators.push(new a(d))}),this.observe("submit",this.options.onSubmit),this.observe("success",this.options.onSuccess),this.observe("error"
,this.options.onError),a.each(a(":input",this.form),function(b){var c=a(this);if(!c.fwData("initialized"))if(c.attr("type")==="hidden")c.fwData("forceSubmission",!0);else{var e=Formwatcher.decorate(d,c
);e.input.get()!==c.get()&&(e.input.attr("class",c.attr("class")),c=e.input);if(!e.label){var f=Formwatcher.getLabel(e,d.options.automatchLabel);f&&(e.label=f)}if(!e.errors){var g=Formwatcher.getErrorsElement
(e,!0);e.errors=g}d.allElements.push(e),c.fwData("validators",[]),_.each(d.validators,function(a){a.accepts(c,d)&&(Formwatcher.debug('Validator "'+a.name+'" found for input field "'+c.attr("name")+'".'
),c.fwData("validators").push(a))}),Formwatcher.storeInitialValue(e),(c.val()===null||!c.val())&&a.each(e,function(){this.addClass("empty")}),d.options.submitUnchanged||Formwatcher.removeName(e);var h=
_.bind(Formwatcher.changed,Formwatcher,e,d),i=_.bind(d.validateElements,d,e,!0);a.each(e,function(){this.focus(_.bind(function(){this.addClass("focus")},this)),this.blur(_.bind(function(){this.removeClass
("focus")},this)),this.change(h),this.blur(h),this.keyup(i)})}});var e=a(":submit",this.form),f=a('<input type="hidden" name="" value="" />');d.form.append(f),a.each(e,function(b){var c=a(this);c.click
(function(a){f.attr("name",c.attr("name")||"").attr("value",c.attr("value")||""),d.submitForm(),a.stopPropagation()})})},callObservers:function(a){var b=_.toArray(arguments);b.shift();var c=this;_.each
(this.observers[a],function(a){a.apply(c,b)})},observe:function(a,b){return this.observers[a]===undefined&&(this.observers[a]=[]),this.observers[a].push(b),this},stopObserving:function(a,b){return this
.observers[a]=_.select(this.observers[a],function(){return this!==b}),this},enableForm:function(){a(":input",this.form).prop("disabled",!1)},disableForm:function(){a(":input",this.form).prop("disabled"
,!0)},submitForm:function(a){if(!this.options.validate||this.validateForm()){this.callObservers("submit");if(!this.options.ajax)return this.form.attr("action",this.form.fwData("originalAction")),_.defer
(_.bind(function(){this.form.submit(),this.disableForm()},this)),!1;this.disableForm(),this.submitAjax()}},validateForm:function(){var a=!0;return _.each(this.allElements,function(b){this.validateElements
(b)||(a=!1)},this),a},validateElements:function(a,b){var c=a.input,d=!0;if(c.fwData("validators").length){if(!b||!c.fwData("lastValidatedValue")||c.fwData("lastValidatedValue")!=c.val())c.fwData("lastValidatedValue"
,c.val()),Formwatcher.debug("Validating input "+c.attr("name")),c.fwData("validationErrors",[]),d=_.all(c.fwData("validators"),function(a){if(c.val()==""&&a.name!="Required")return Formwatcher.debug("Validating "+
a.name+". Field was empty so continuing."),!0;Formwatcher.debug("Validating "+a.name);var b=a.validate(a.sanitize(c.val()),c);return b!==!0?(d=!1,c.fwData("validationErrors").push(b),!1):!0}),d?(a.errors
.html("").hide(),_.each(a,function(a){a.addClass("validated"),a.removeClass("error")}),b&&a.input.fwData("forceValidationOnChange",!0)):(_.each(a,function(a){a.removeClass("validated")}),b||(a.errors.html
(c.fwData("validationErrors").join("<br />")).show(),_.each(a,function(a){a.addClass("error")})));if(!b&&d){var e=c.fwData("lastValidatedValue");_.each(c.fwData("validators"),function(a){e=a.sanitize(e
)}),c.val(e)}}else _.each(a,function(a){a.addClass("validated")});return d},submitAjax:function(){Formwatcher.debug("Submitting form via AJAX.");var b={},c=0,d=this;return a.each(a(":input",this.form),
function(c,e){e=a(e);if(e.fwData("forceSubmission")||e.attr("type")==="checkbox"||e.fwData("changed")||d.options.submitUnchanged)if(e.attr("type")!=="checkbox"||e.is(":checked"))b[e.attr("name")?e.attr
("name"):"unnamedInput_"+c++]=e.val()}),_.size(b)===0&&!this.options.submitFormIfAllUnchanged?_.defer(_.bind(function(){this.enableForm(),this.ajaxSuccess()},this)):a.ajax({url:this.form.fwData("originalAction"
),type:"POST",data:b,context:this,success:function(a){this.enableForm(),this.options.responseCheck(a)?(this.callObservers("success",a),this.ajaxSuccess()):this.callObservers("error",a)}}),undefined},ajaxSuccess
:function(){_.each(this.allElements,_.bind(function(b){Formwatcher.unsetChanged(b,this),this.options.resetFormAfterSubmit?Formwatcher.restoreInitialValue(b):Formwatcher.storeInitialValue(b);var c=b.input
.val()===null||!b.input.val();a.each(b,function(){c?this.addClass("empty"):this.removeClass("empty")})},this))}}),a(document).ready(Formwatcher.scanDocument)})(jQuery);