namespace VeLangTest {

    import Tokenizer = Ve.Lang.Tokenizer;
    import VeMode = Ve.Lang.VeMode;
    import TokenParseExpress = Ve.Lang.TokenParseExpress;
    import Token = Ve.Lang.Token;
    function parseExpression(code, isRun?: boolean) {
        if (isRun == false) return;
        var mode = new VeMode({
            isIgnoreLineBreaks: false
        });
        var tokenizer: Tokenizer<Token> = new Tokenizer(code, mode);
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

    //争对数据的一些解析处理
    parseExpression(`[ass,a+b]`, false);
    parseExpression(`{a:"eeeee",b:"exxxeee"}`, false);
    parseExpression(`{a,b:"exxxeee"}`, false);
    parseExpression(`{a:['eee','esxxxx']`, false);

    //争对箭头函数的解析与处理
    parseExpression('(o:string,c:{d:number})=>o+e', false)
    parseExpression(`o=>x+o;`, false);
    parseExpression(`(a:number,b:color):Ve.String=>{}`, false);

    // 复杂一些的测试
    parseExpression(`list.findIndex(x=>x.a=="eeee");`, false);
}