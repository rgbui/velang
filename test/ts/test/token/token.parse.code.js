var VeLangTest;
(function (VeLangTest) {
    var Tokenizer = Ve.Lang.Tokenizer;
    var Mode = Ve.Lang.Mode;
    var TokenFormat = Ve.Lang.TokenFormat;
    var CodeMode = Ve.Lang.CodeMode;
    function tokenCode(code) {
        var mode = new Mode({
            isIgnoreLineBreaks: false
        });
        var tokenizer = new Tokenizer(code, mode);
        var token = tokenizer.onParse();
        var tf = new TokenFormat({
            codeMode: CodeMode.code
        });
        console.log(tf.format(token));
    }
    tokenCode(`def a=10`);
    tokenCode('def a:number=10;');
    tokenCode(`def a:{a:string,b:number}={a:'12233',b:123};`);
    tokenCode(`def a:string[]=["bjosss","ddd"]`);
    tokenCode(`def a:string[]=['abbb',"eeees@{a}"]`);
    tokenCode(`def a:{a:string,b:number}[]=[{a:'eee',b:123}]`);
    tokenCode(`def a={ab:fun(){}}`);
    tokenCode(`def a={ab:fun(a:string,b:number):number{return b;}`);
    tokenCode(`def a="abbcc

@{c}

@b
";`);
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
`);
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
}`);
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
    tokenCode('定义 变量=“教学楼”；');
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=token.parse.code.js.map