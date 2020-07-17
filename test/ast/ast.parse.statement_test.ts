namespace VeLangTest {

    import Tokenizer = Ve.Lang.Tokenizer;
    import VeMode = Ve.Lang.VeMode;
    import Token = Ve.Lang.Token;
    import TokenStatementParser = Ve.Lang.TokenStatementParser;
    function parseStatement(code, cb: (tsp: TokenStatementParser) => any, isRun?: boolean) {
        if (isRun == false) return;
        var mode = new VeMode({
            isIgnoreLineBreaks: false
        });
        var tokenizer: Tokenizer<Token> = new Tokenizer(code, mode);
        var token = tokenizer.onParse();
        console.log(token);
        //console.log(JSON.stringify(token.get_()));

        var tsp = new TokenStatementParser(token);
        console.log(tsp.getFlagText());
        if (typeof cb == 'function') {
            var result = cb(tsp);
            if (typeof result != typeof undefined) console.log(result);
        }
    }


    parseStatement(`while(true){ def a:bool=c>d;}`, function (parser) {
        return parser.parseWhile();
    }, true)



    parseStatement(`try{ }catch(e:exception){ } `, function (parser) {
        return parser.parseTry();
    }, false);


    //def a=1+2;

}