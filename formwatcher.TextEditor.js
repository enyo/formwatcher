/*  © Matthias Loitsch   */
/**
 * NOT FINISHED! UNUSABLE
 */

if ((typeof tinyMCE !== 'undefined'))
{

  var TextEditor = Class.create(Formwatcher.Decorator,
  {
    initialize: function(watcher, input)
    {
      tinyMCE.execCommand("mceAddControl", true, input.identify());
    }
  });


  function myCustomOnChangeHandler(inst)
  {
    var element = inst.formElement;
    console.dir(inst);
//     console.debug(element);
    element.value = 'tes';
    Formwatcher.onchange(element, {
      submitUnchanged: false,
      ajax: true });

  }

  tinyMCE.init({
    mode : "none",
    theme : "simple",
    onchange_callback : "myCustomOnChangeHandler"
  });


  var decorator = Class.create(Formwatcher.Decorator,
  {
    accepts: function(input)
    {
      return (input.nodeName == 'TEXTAREA' && input.hasClassName('html'));
    },
    Class: TextEditor
  });

  Formwatcher.decorators.push(new decorator());

}