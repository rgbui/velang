var VeLangTest;
(function (VeLangTest) {
    var Tokenizer = Ve.Lang.Tokenizer;
    var Mode = Ve.Lang.Mode;
    var TokenStatementParser = Ve.Lang.TokenStatementParser;
    function parseStatement(code, cb, isRun) {
        if (isRun == false)
            return;
        var mode = new Mode({
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
    parseStatement('use Ve.String', (parser) => {
        return parser.parseUseStatement();
    }, false);
    parseStatement('use Ve.String=String;', (parser) => {
        return parser.parseUseStatement();
    }, false);
    parseStatement('use Ve.String;', (parser) => {
        return parser.parseUseStatement();
    }, false);
    parseStatement('break', (parser) => {
        return parser.parseBreak();
    }, false);
    parseStatement('break;', (parser) => {
        return parser.parseBreak();
    }, false);
    parseStatement('continue;', (parser) => {
        return parser.parseContinue();
    }, false);
    parseStatement(`fun ab(a:string,b:number):string{ }`, function (parser) {
        return parser.parseFunStatement();
    }, false);
    parseStatement(`def a={a:'eee',c:'eefssss'}`, function (parser) {
        return parser.parseVariableStatement();
    }, false);
    parseStatement(`[sy{a:ee,b:eee}]public  class Name<T> extends Ve.String{}`, function (parser) {
        return parser.parseClassOrInterfaceStatement();
    }, false);
    parseStatement(`public enum abc{a,b,c}`, function (parser) {
        return parser.parseEnumStatement();
    }, false);
    parseStatement(`[sy{a:'eee',b:'esssss'}] public abc<String>(a:string,b:string):color{ }`, function (parser) {
        return parser.parseMethodStatement(true);
    }, false);
    parseStatement(`[sy{a:'eee',b:'esssss'}] public abc<String>():{a:string,b:color}{}`, function (parser) {
        return parser.parseMethodStatement(true);
    }, false);
    parseStatement(`public abc:string='eeee';`, function (parser) {
        return parser.parsePropertyStatement(true);
    }, false);
    parseStatement(`public abc:string{get{ return a;}set{ a=value;}};`, function (parser) {
        return parser.parseFieldStatement(true);
    }, false);
    parseStatement(`if(x>y)a=b; else (c>d){ g=b;}`, function (parser) {
        return parser.parseIf();
    });
    parseStatement(`if(x>y)a=b else if(c>d)  a=1 else if(c>d) a=1 else { g=b;}`, function (parser) {
        return parser.parseIf();
    }, false);
    parseStatement(`while(true){ def a=c>d;}`, function (parser) {
        return parser.parseWhile();
    }, false);
    parseStatement(`do { def a=c>d; } while(a>b)`, function (parser) {
        return parser.parseDoWhile();
    }, false);
    parseStatement(`for(def i=0;i<10;i++){ }`, function (parser) {
        return parser.parseFor();
    }, false);
    parseStatement(`switch(c){case 'eee':break;} `, function (parser) {
        return parser.parseSwitch();
    }, false);
    parseStatement(`return {a:'eee',b:"seefss"} `, function (parser) {
        return parser.parseReturn();
    }, false);
    parseStatement(`throw {a:'eee',b:"seefss"} `, function (parser) {
        return parser.parseThrow();
    }, false);
    parseStatement(`switch(c){case 'eee':break;default:'eefssss';} `, function (parser) {
        return parser.parseSwitch();
    }, false);
    parseStatement(`try{ }catch(e:exception){ } `, function (parser) {
        return parser.parseTry();
    }, false);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=ast.parse.statement.js.map