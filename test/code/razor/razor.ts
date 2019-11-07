namespace VeLangTest {
    import RT = Ve.Lang.RazorTemplate;
    var rt = new RT({ caller: {} });
    var code = rt.compile(`@if(text)
    {

     @{
         @:"snjsiss"
     }
    }

    else {
       
    }
    `, { text: 'sss' })
    console.log(code);
}