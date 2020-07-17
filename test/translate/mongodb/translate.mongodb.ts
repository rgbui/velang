namespace VeLangTest {

    import TranstateFactory = Ve.Lang.TranstateFactory;
    import TranstateLanguage = Ve.Lang.TranstateLanguage;
    function translate(code, args: Ve.Lang.Outer.VeProp[], fields: Ve.Lang.Outer.VeProp[], isRun?: boolean) {
        if (isRun == false) return;
        var languageCode = Ve.Lang.Outer.TranslateSQLExpressLangCode(code, args, fields, 'mongodb', {
            argFlag: "$$$__",
            fieldFlag: "$$_"
        });
        console.log(code, '<--->', languageCode);
    }
    translate('@姓名!=a', [{ text: 'a', type: 'string' }], [{ text: '@姓名', type: 'string' }])
}