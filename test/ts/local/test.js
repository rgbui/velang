var VeLangTest;
(function (VeLangTest) {
    var PickExpressArgs = Ve.Lang.PickExpressArgs;
    var PickExpressArgs_test = Ve.Lang.PickExpressArgs_test;
    var _f = function (is, x) {
        if (typeof x == 'function' && is == true)
            x();
    };
    function run_PickExpressArgs(type, express, isRun) {
        if (isRun != true)
            return;
        PickExpressArgs_test(type, express);
        console.log("PickExpressArgs ------------- ");
        var args = PickExpressArgs(type, express);
        console.log("args : ", args);
    }
    var print = (one, ...args) => {
        if (one)
            console.log.apply(console, args);
    };
    run_PickExpressArgs("bool", "a>3", false);
    run_PickExpressArgs("bool", "[333,13].exists(a)", true);
    run_PickExpressArgs("bool", "[333,5+8].exists(a)", false);
    run_PickExpressArgs("bool", "[333,'13'].exists(a)", false);
    run_PickExpressArgs("bool", "x+y+x+123>g", false);
    run_PickExpressArgs("bool", "x+y+x+123>g&&['111','eee'] && true", false);
    run_PickExpressArgs("bool", "[333,5+8].exists(a) && true", false);
    run_PickExpressArgs("bool", "x+y+x+123>g&&['111','eee'].exists(a) && true", false);
    run_PickExpressArgs("bool", "a+b.name", false);
    run_PickExpressArgs("bool", "a+b.name && true", false);
    run_PickExpressArgs("bool", "'aabbcc'.contains('d')", false);
    run_PickExpressArgs("bool", "a>3", false);
    run_PickExpressArgs("bool", "a+2", false);
    run_PickExpressArgs("bool", "a.toa(33)", false);
    run_PickExpressArgs("bool", "a>c?true:false", false);
    run_PickExpressArgs("bool", "!a", false);
    run_PickExpressArgs("bool", "[].exists(a) && true", false);
    run_PickExpressArgs("bool", "[333,13].exists(a) && true", false);
    run_PickExpressArgs("bool", "[333,5+8].exists(a) && true", false);
    run_PickExpressArgs("bool", "[a,b].exists(a) && true", false);
    run_PickExpressArgs("bool", "[a,a+b].exists(a) && true", false);
    run_PickExpressArgs("string", "a.toString()", false);
    run_PickExpressArgs("number", "Math.sin(30)", false);
    run_PickExpressArgs("number", "A.test()", false);
    run_PickExpressArgs("number", "A.test(40)", false);
    run_PickExpressArgs("number", "A.test(40,80)", false);
    run_PickExpressArgs("number", "test(40)", false);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=test.js.map