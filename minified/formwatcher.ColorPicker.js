/*  © Matias Meno   *//**
 ** This class requires the Control.ColorPicker.
 ** Just include it in the header BEFORE the formwatcher script.
 **/if(typeof Control!="undefined"||typeof Control.ColorPicker!="undefined"){var ColorPicker=Class.create(Formwatcher.Decorator,{initialize:function(a,b){var c=Formwatcher
.getInput(b);document.observe("dom:loaded",function(){new Control.ColorPicker(c,{swatch:b.get("swatch"),IMAGE_BASE:"Pictures/colorPicker/",onUpdate:function(){Formwatcher.changed(c,a.options)}})})}}),decorator=Class.create(Formwatcher.Decorator,{accepts:function(a){return a.nodeName=="INPUT"&&a.hasClassName
("color")},wrap:function(a,b){var c=$(Builder.node("button",{className:"colorpicker"})),d=parseInt(b.getStyle("width"));b.insert({after:c});var e=$H({input:b,swatch:c});return new this.Class(a,e),e},Class:ColorPicker});Formwatcher.decorators.push(new decorator)};