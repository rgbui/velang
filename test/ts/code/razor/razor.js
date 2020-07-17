var VeLangTest;
(function (VeLangTest) {
    var RT = Ve.Lang.RazorTemplate;
    var rt = new RT({ caller: {} });
    var code = rt.compile(`@if(text)
    {

     @{
         @:"snjsiss"
     }
    }

    else {
       
    }
    `, { text: 'sss' });
    console.log(code);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=razor.js.map