namespace VeLangTest {

    import Tokenizer = Ve.Lang.Tokenizer;
    import VeMode = Ve.Lang.VeMode;
    import Token = Ve.Lang.Token;
    var _ = (code, consider = true) => {
        if (consider) {
            var mode = new VeMode({
                isIgnoreLineBreaks: false
            });
            var tokenizer: Tokenizer<Token> = new Tokenizer(code, mode);
            var token = tokenizer.onParse();
            console.log(token);
        }
    }
    /***字符串的解析测试 */
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
    /***
     * 跨行的块的解析测试
     * 
     */
    _(`{

    }`, false);
    _(`[

    ]`, false);
    _(`|boy=1,
    girl=2
    |`, false);

    _(`/2008-09-25/date`, false);
    _(`/2008-09-25/date`, false);

    /*
     * 小于符号泛型符号的区分处理
     * 
     */
    _(`a<b`, false);
    _(`a[0]<b`, false);
    _(`(a+b)<b`, false);
    _(`test(a,b)<b`, false);
    _(`class classA<T,K,U>{ }`, false);
    _(`fun ab<T>(t:T){ }`, false);
    _(`test<String,Url>(a,b);`, false);
    _(`test<String
    ,Url>(a,b)`, false); /*error:因为分行了，所以这种无法判断，只能后续处理回滚，可在test<打上标记，*/

    /*
     * 
     * 实体数据类型与除法的区分
     * 实体数据格式明确，中间没有换行符
     * 
     */
    _(`a/b/c`, false);
    _(`a+c/(/2008-09-25/date.year)+/2008-09-25/date`, false);
    _(`a+c+/#fff/color.r`, false);

    /***箭头函数处理*/
    _(`fun ab(a):string{

    }`, false);
    _(`def ab=(x:int):int=>{ return x}`);
    _(`def ab:(x:int)=>int=(x:int):int=>x`);
}