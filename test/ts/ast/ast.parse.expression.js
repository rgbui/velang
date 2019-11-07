var VeLangTest;
(function (VeLangTest) {
    var Tokenizer = Ve.Lang.Tokenizer;
    var VeMode = Ve.Lang.VeMode;
    var TokenParseExpress = Ve.Lang.TokenParseExpress;
    function parseExpression(code, isRun) {
        if (isRun == false)
            return;
        var mode = new VeMode({
            isIgnoreLineBreaks: false
        });
        var tokenizer = new Tokenizer(code, mode);
        var token = tokenizer.onParse();
        console.log(token);
        var tsp = new TokenParseExpress(token);
        var result = tsp.parse();
        console.log(result);
    }
    parseExpression(`a+b+Math.power(a,b)+"ksfjsos@{a+b}sjsisss"`, false);
    parseExpression(`"ssss\\\"dddd"`, true);
    parseExpression(`(c=d+a)>c`, false);
    parseExpression(`x+y+x+123>g`, true);
    parseExpression('c+a*b', false);
    parseExpression('a+b.name', false);
    parseExpression('a+b*3>c?true:false', false);
    parseExpression('a?b?true:false:false', false);
    parseExpression('a?true:c?true:false', false);
    parseExpression('a@b', false);
    parseExpression('a+(b+c)', false);
    parseExpression(`"ssxfeeea@{a+b}feeee"`, false);
    parseExpression(`“ssxfeeea@{a+b}feeee”`, false);
    parseExpression('ab(1,2,3)', false);
    parseExpression(`a@b(1,2,3)`, false);
    parseExpression(`new A(1,2,3)`, false);
    parseExpression('new Ve.string(1,2,3,a+b);', false);
    parseExpression(`A<String>(1,2,3)`, false);
    parseExpression(`new Ve.Number<String>(1,2,3,4)`, false);
    parseExpression(`[ass,a+b]`, false);
    parseExpression(`{a:"eeeee",b:"exxxeee"}`, false);
    parseExpression(`{a,b:"exxxeee"}`, false);
    parseExpression(`{a:['eee','esxxxx']`, false);
    parseExpression('(o:string,c:{d:number})=>o+e', false);
    parseExpression(`o=>x+o;`, false);
    parseExpression(`(a:number,b:color):Ve.String=>{}`, false);
    parseExpression(`list.findIndex(x=>x.a=="eeee");`, false);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=ast.parse.expression.js.map