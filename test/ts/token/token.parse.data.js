var VeLangTest;
(function (VeLangTest) {
    var Tokenizer = Ve.Lang.Tokenizer;
    var VeMode = Ve.Lang.VeMode;
    var TokenFormat = Ve.Lang.TokenFormat;
    var CodeMode = Ve.Lang.CodeMode;
    function tokenCode(code) {
        var tf = new TokenFormat({
            codeMode: CodeMode.code
        });
        var mode = new VeMode({
            isIgnoreLineBreaks: false
        });
        var tokenizer = new Tokenizer(code, mode);
        var token = tokenizer.onParse();
        console.log(tf.format(token));
    }
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=token.parse.data.js.map