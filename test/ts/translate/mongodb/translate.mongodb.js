var VeLangTest;
(function (VeLangTest) {
    function translate(code, args, fields, isRun) {
        if (isRun == false)
            return;
        var languageCode = Ve.Lang.Outer.TranslateSQLExpressLangCode(code, args, fields, 'mongodb', {
            argFlag: "$$$__",
            fieldFlag: "$$_"
        });
        console.log(code, '<--->', languageCode);
    }
    translate('@姓名!=a', [{ text: 'a', type: 'string' }], [{ text: '@姓名', type: 'string' }]);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=translate.mongodb.js.map