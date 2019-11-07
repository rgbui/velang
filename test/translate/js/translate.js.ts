namespace VeLangTest {
    import TranstateFactory = Ve.Lang.TranstateFactory;
    import TranstateLanguage = Ve.Lang.TranstateLanguage;
    function translate(code, args: Ve.Lang.Outer.VeProp[], isRun?: boolean) {
        if (isRun == false) return;
        var languageCode = Ve.Lang.Outer.TranslateExpressLangCode(code, args, 'js', {
            argFlag: "$$$__",
        });
        console.log(code, '<--->', languageCode);
    }
    translate(`"a+@{a}+@{b}+@{a+b}\\\"'"`, [{ text: 'a', type: 'string' }, { text: 'b', type: 'string' }])
}