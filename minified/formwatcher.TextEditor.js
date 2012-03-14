/*  © Matias Meno   *//**
 * NOT FINISHED! UNUSABLE
 */if(typeof tinyMCE!="undefined"){var TextEditor=Class.create(Formwatcher.Decorator,{initialize:function(a,b){tinyMCE.execCommand("mceAddControl",!0
,b.identify())}});function myCustomOnChangeHandler(a){var b=a.formElement;console.dir(a),b.value="tes",Formwatcher.changed(b,{submitUnchanged:!1,ajax:!0})}tinyMCE.init({mode:"none",theme:"simple",onchange_callback
:"myCustomOnChangeHandler"});var decorator=Class.create(Formwatcher.Decorator,{accepts:function(a){return a.nodeName=="TEXTAREA"&&a.hasClassName("html")},Class:TextEditor});Formwatcher.decorators.push(new 
decorator)};