var VeLangTest;
(function (VeLangTest) {
    var Tokenizer = Ve.Lang.Tokenizer;
    var VeMode = Ve.Lang.VeMode;
    var _ = (code, consider = true) => {
        if (consider) {
            var mode = new VeMode({
                isIgnoreLineBreaks: false
            });
            var tokenizer = new Tokenizer(code, mode);
            var token = tokenizer.onParse();
            console.log(token);
        }
    };
    _(`"ssss"`, false);
    _(`"ss@{}ss"`, false);
    _(`"ss@{a}@{a}ss"`, false);
    _(`"  ss@{a}  
      @{a}

      ss"  `, false);
    _(`"ss@{a}
    def
    +/***/
    @{a}
    ss"`, false);
    _(`{

    }`, false);
    _(`[

    ]`, false);
    _(`|boy=1,
    girl=2
    |`, false);
    _(`/2008-09-25/date`, false);
    _(`/2008-09-25/date`, false);
    _(`a<b`, false);
    _(`a[0]<b`, false);
    _(`(a+b)<b`, false);
    _(`test(a,b)<b`, false);
    _(`class classA<T,K,U>{ }`, false);
    _(`fun ab<T>(t:T){ }`, false);
    _(`test<String,Url>(a,b);`, false);
    _(`test<String
    ,Url>(a,b)`, false);
    _(`a/b/c`, false);
    _(`a+c/(/2008-09-25/date.year)+/2008-09-25/date`, false);
    _(`a+c+/#fff/color.r`, false);
    _(`fun ab(a):string{

    }`, false);
    _(`def ab=(x:int):int=>{ return x}`);
    _(`def ab:(x:int)=>int=(x:int):int=>x`);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=token.js.map