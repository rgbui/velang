///<reference path='../../ve.d.ts'/>
namespace VeLangTest {
    import Tokenizer = Ve.Lang.Tokenizer;
    import VeMode = Ve.Lang.VeMode;
    import Token=Ve.Lang.Token;
    import TokenFormat = Ve.Lang.TokenFormat;
    import CodeMode = Ve.Lang.CodeMode;
    function tokenCode(code)
    {
        var tf = new TokenFormat({
            codeMode: CodeMode.code
        });
        var mode = new VeMode({
            isIgnoreLineBreaks: false
        });
        var tokenizer: Tokenizer<Token> = new Tokenizer(code, mode);
        var token = tokenizer.onParse();
        console.log(tf.format(token));
    }
}