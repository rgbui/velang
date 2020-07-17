var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Test;
        (function (Test) {
            function testType(type, isRun = true) {
                if (!isRun)
                    return;
                var result = Ve.Lang.Outer.pickVeTypeFromCode(type);
                console.log(result);
            }
            testType(`
    {
        "id": int,
        "cate": "string",
        "name": "string",
        "tel": "string"
    }[]
      `, false);
            function testCode(code, isRun = true) {
                if (!isRun)
                    return;
                var result = Ve.Lang.Outer.TranslateExpressCode(code, 'js');
                console.log(result);
            }
            testCode(`{"网站名":"","网址":"","LOGO":"/资源/图片.png","ID":"","显示":false}`);
        })(Test = Lang.Test || (Lang.Test = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=outer.js.map