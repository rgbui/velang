var VeLangTest;
(function (VeLangTest) {
    var Tokenizer = Ve.Lang.Tokenizer;
    var VeMode = Ve.Lang.VeMode;
    var TokenStatementParser = Ve.Lang.TokenStatementParser;
    function parseStatement(code, cb, isRun) {
        if (isRun == false)
            return;
        var mode = new VeMode({
            isIgnoreLineBreaks: false
        });
        var tokenizer = new Tokenizer(code, mode);
        var token = tokenizer.onParse();
        console.log(token);
        var tsp = new TokenStatementParser(token);
        console.log(tsp.getFlagText());
        if (typeof cb == 'function') {
            var result = cb(tsp);
            if (typeof result != typeof undefined)
                console.log(result);
        }
    }
    parseStatement(`while(true){ def a:bool=c>d;}`, function (parser) {
        return parser.parseWhile();
    }, true);
    parseStatement(`try{ }catch(e:exception){ } `, function (parser) {
        return parser.parseTry();
    }, false);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=ast.parse.statement_test.js.map