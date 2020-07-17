var VeLangTest;
(function (VeLangTest) {
    var Mode = Ve.Lang.Mode;
    var Tokenizer = Ve.Lang.Tokenizer;
    var print = Ve.Lang.print;
    function tokenCode(code, is) {
        if (!is) {
            return;
        }
        var mode = new Mode({
            isIgnoreLineBreaks: false
        });
        var tokenizer = new Tokenizer(code, mode);
        print(true, "tokenizer : ", tokenizer);
        var token = tokenizer.onParse();
    }
    tokenCode(`def   a=10`, false);
    tokenCode(`def a:number=10;`, false);
    tokenCode(`def a:{a:string,b:number}={a:'12233',b:123};`, false);
    tokenCode(`def a:string[]=["bjosss","ddd"]`, false);
    tokenCode(`def a:string[]=['abbb',"eeees@{a}"]`, false);
    tokenCode(`def a:string[]=["abbb3","eeees@{a}"]`, false);
    tokenCode(`def m:{x:string,y:number}[]=[{a:'eee',b:123}]`, false);
    tokenCode(`def a={ab:fun(){}}`, false);
    tokenCode(`def a={ab:fun(a:string,b:number):number{return b;}`, false);
    tokenCode(`def a="abbcc

@{c}

@b
";`, false);
    tokenCode(`
public class classA{
     public a:string='12333';
     private a:number=123;
     ab(a:string,b:number):number{
         return b;
     }
}
public interface classA{
      ab(a:string,b:number);
      ab<T>(a:T):T;
}
public enum enClass{
    a,b,c,d,e
}
`, false);
    tokenCode(`if(a>b){


}
else if(1>2) {

}
else(true==true)
{ 


}`);
    tokenCode(`for(def i=0;i<20;i++) {
      switch(i){
          case 1:
          break;
          default:
      }
      break;
      continue;
}`, false);
    tokenCode(`if(a is string){
    if(typeof a=='string'){

    }
    if(a not is string)
    {

    }
    while(true){

    }
    do {

    }
    while(true);
}`);
    tokenCode(`package Ve.String{
      use Ve.IO;
}`);
    tokenCode('定义 变量=“教学楼”；', false);
    tokenCode(`def b:/2008-12-25/date;`, false);
    tokenCode(`def b:/2008-12-25/date2;`, false);
    tokenCode(`def b:/2008-12-25/date2;`, false);
    tokenCode(`def a:{a:string,b:number}={a:'12233',b:/2008-12-25/date};`, false);
    tokenCode(`def a:{a:string,b:number}={a:'12233',b:|week=1,monday=2|;`, true);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=token.parse.code_test.js.map