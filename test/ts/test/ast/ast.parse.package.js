var VeLangTest;
(function (VeLangTest) {
    var AstParser = Ve.Lang.AstParser;
    var CodeModeType = Ve.Lang.CodeModeType;
    function parseAst(code, options, isRun) {
        var ap = new AstParser();
        var result = ap.compile(code, options);
        console.log(result);
    }
    parseAst(`def a=10`, {
        codeType: CodeModeType.expression
    }, false);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=ast.parse.package.js.map