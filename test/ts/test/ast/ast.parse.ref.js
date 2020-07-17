var VeLangTest;
(function (VeLangTest) {
    var AstParser = Ve.Lang.AstParser;
    var CodeModeType = Ve.Lang.CodeModeType;
    function parseAst(code, options, isRun) {
        if (isRun == false)
            return;
        if (typeof options == typeof undefined)
            options = {};
        options.isIncludeBasePackage = false;
        var ap = new AstParser();
        var result = ap.compile(code, options);
        console.log(result);
    }
    parseAst(`def a=10;def c=a;`, {
        codeType: CodeModeType.expression
    }, false);
    parseAst(`fun ab(a:number,b:string)
    {
        def g=a+b;
    }`, {
        codeType: CodeModeType.expression
    }, false);
    parseAst('def a=Math.PI;', {
        codeType: CodeModeType.expression
    }, false);
    parseAst(`
   def a={c:"ejfiss",vv:{c:true},gk:["ssss"]};
   def g=a.c;
   def k=a.c.length;
   def gk=a.vv.c;
   def ggk=a.gk;
   def ggk1=a.gk[0];
   `, { codeType: CodeModeType.expression }, false);
    parseAst(`
   def a=new String('#fff');
   def arr=new Array<String>();
   arr.get(0);
   `, { codeType: CodeModeType.expression });
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=ast.parse.ref.js.map