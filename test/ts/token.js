var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var testToken;
        (function (testToken_1) {
            function testToken(code, isRun) {
                if (isRun == false)
                    return;
                try {
                    var tokenizer = new Lang.Tokenizer();
                    tokenizer.on('error', (error, pos) => {
                        console.log(error, pos);
                    });
                    var rootToken = tokenizer.parse(code);
                    var json = rootToken.get();
                    console.log(code, json);
                }
                catch (e) {
                    console.error(e);
                }
            }
            testToken('def a=10;', false);
            testToken('def a=10;\n', false);
            testToken('if(a>b){}', false);
            testToken('if(a>b)c=123;', false);
            testToken("\"eeee\"", false);
            testToken("def g=\"\";", false);
            testToken('{def c="eeee";}', false);
            testToken('"@{ee}"', false);
            testToken('def c="xxx\\\\"ggg"', false);
            testToken('def a="ggg=@{gg}"', false);
            testToken('def a=\'ffff\\\\\'essssseee\\\\"ssseefffeexf@fjse eee@{xxx}@{y}@x+eeee\'', false);
            testToken(`if(a>b){ }else{ }`, false);
            testToken(`fun ab<T>(t:T)`, false);
            testToken(`a<b&&b>d`, false);
            testToken(`def a=new Array<string>("sssxxx","eeegggg");`, false);
            testToken(`//sssss\ndefa=10`, false);
            testToken(`/*******ddd
    
    
    d*/`, false);
            testToken(`/******rrrr
gg
    dd*/`, false);
            testToken(`/***dd
    /***
    ///
    */
   //*****
   def a=10;
   def g=/*eee*/20;
   
   
    `, false);
            testToken(`/*申明一个类 HellowWorld**/`, false);
            testToken(`def a=b??true;
    def g=a?.b?.cc;
    
    `, false);
            testToken(`{`, false);
            testToken('"\'', false);
            testToken(`~&|`, false);
            testToken(`           fun PrintStr(str:string)
    {`, false);
            testToken(`}`, false);
            testToken(`def 你好吗={
  
    }`, false);
            testToken(`[{a:"ssss"}]`, false);
            testToken(`
    package Ve.__SimulatePackage2_1;
    use Ve.Core;
    use Ve.Math;
    out class SimulateClass{
       static SimulateExpress()
        {return [{a:"ssss"}]}
    }`, false);
            testToken(`def a=“122333”；`);
        })(testToken = Lang.testToken || (Lang.testToken = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=token.js.map