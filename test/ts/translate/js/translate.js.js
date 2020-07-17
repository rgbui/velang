var VeLangTest;
(function (VeLangTest) {
    function translate(code, args, isRun) {
        if (isRun == false)
            return;
        var languageCode = Ve.Lang.Outer.TranslateExpressLangCode(code, args, 'js', {
            argFlag: "$$$__",
        });
        console.log(code, '<--->', languageCode);
    }
    translate(`"a+@{a}+@{b}+@{a+b}\\\"'"`, [{ text: 'a', type: 'string' }, { text: 'b', type: 'string' }]);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=translate.js.js.map