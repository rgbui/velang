var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Test;
        (function (Test) {
            var lang = Ve.Lang.Generate.GenerateLanguage.mongodb;
            function testGenerateExpress(express, isRun = true, args, thisObjectArgs, options) {
                if (!isRun)
                    return;
                var gc = new Ve.Lang.Generate.Generate();
                gc.on('error', function () {
                    console.log(arguments);
                });
                var code = gc.generateExpress(express, lang, args, thisObjectArgs, options);
                console.log(code);
            }
            testGenerateExpress(`a`, false);
            testGenerateExpress(`[{a:"ssss"}]`, false);
            testGenerateExpress(`"ssss".length`, false);
            testGenerateExpress(`"sssss".chars`, false);
            testGenerateExpress('a.chars', false, [{ text: 'a', type: 'string' }]);
            testGenerateExpress(`"a+@a"`, false, [{ text: 'a', type: 'Ve.Core.String' }]);
            testGenerateExpress(`"a\`\`+@a"`, false, [{ text: 'a', type: 'Ve.Core.String' }]);
            testGenerateExpress(`"a\`\`+@a"`, false, [{ text: 'a', type: 'Ve.Core.String' }]);
            testGenerateExpress(`{"网站名":"","网址":"","LOGO":"/资源/图片.png","ID":"","显示":false}`, false);
            testGenerateExpress(`@帐号==帐号&&密码==@密码`, true, [
                { text: '帐号', type: 'Ve.Core.String' },
                { text: '密码', type: 'Ve.Core.String' },
            ], [
                { text: '@ID', type: 'string' },
                { text: '@日期', type: 'string' },
                { text: '@帐号', type: 'string' },
                { text: '@密码', type: 'string' }
            ], {
                thisObjectName: '$',
                parameterMapNames: {
                    帐号: "___vvvgg___帐号",
                    密码: "___vvvgg___密码"
                }
            });
        })(Test = Lang.Test || (Lang.Test = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=generate.express.js.map