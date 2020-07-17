var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Test;
        (function (Test) {
            function testAstExpress(code, isRun) {
                if (isRun == false)
                    return;
                var compiler = new Ve.Lang.Compiler();
                compiler.on('error', function () {
                    console.log(arguments);
                });
                var exp = compiler.express(code).express;
                console.log(code, exp);
            }
            testAstExpress(`a+b`, false);
            testAstExpress(`a+b*3`, false);
            testAstExpress(`a is string`, false);
            testAstExpress(`a&&b is string`, false);
            testAstExpress(`!!a`, false);
            testAstExpress(`a>b?true:false`, false);
            testAstExpress(`a+=a>b?true:false`, false);
            testAstExpress(`a+=a>b?true:a>b?true:false`, false);
            testAstExpress(`a?.c`, false);
            testAstExpress(`a.b?.c?true:false`, false);
            testAstExpress(`(a)`, false);
            testAstExpress(`("ssss@a ")`, false);
            testAstExpress(`"rgba(255,255,255)"color`, false);
            testAstExpress(`3cm*2`, false);
            testAstExpress(`a(c,"ssss")`, false);
            testAstExpress(`g.c?.a(c,'eeeeee')`, false);
            testAstExpress(`{a:1,b:2}`, false);
            testAstExpress(`[1,2,a,"eee@{c}ee"]`, false);
            testAstExpress(`a[0][0](a,c)`, false);
            testAstExpress(`a..b`, false);
            testAstExpress(`new Array()`, false);
            testAstExpress(`a??3`, false);
            testAstExpress('@name', false);
            testAstExpress('@(1,2)', false);
            testAstExpress(`@test(1,2)`, false);
            testAstExpress('this.name', false);
            testAstExpress('super.name', false);
            testAstExpress(`this(1,2)`, false);
            testAstExpress('super(1,2)', false);
            testAstExpress(`@this>0`, false);
            testAstExpress(`()->@name==1&&@age>25`, false);
        })(Test = Lang.Test || (Lang.Test = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=ast.express.js.map