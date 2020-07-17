var VeLangTest;
(function (VeLangTest) {
    var TranstateFactory = Ve.Lang.TranstateFactory;
    var TranstateLanguage = Ve.Lang.TranstateLanguage;
    function translate(code, isRun) {
        if (isRun == false)
            return;
        var tf = new TranstateFactory();
        var languageCode = tf.compile(code, TranstateLanguage.js);
        console.log(code, '<--->', languageCode);
    }
    translate(`def a=b+c;def g=a==b?true:false;`, false);
    translate('def a={a:"eeee",b:"eesxxx"};def c=a.a;', false);
    translate(`
    
    def a={a:"eeeex"};
    def c=a.a.length;
        
    `);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=translate.js.js.map