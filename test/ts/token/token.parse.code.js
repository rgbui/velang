var VeLangTest;
(function (VeLangTest) {
    var Tokenizer = Ve.Lang.Tokenizer;
    var VeMode = Ve.Lang.VeMode;
    function tokenCode(code) {
        var mode = new VeMode({
            isIgnoreLineBreaks: false
        });
        var tokenizer = new Tokenizer(code, mode);
        var token = tokenizer.onParse();
        console.log(token);
    }
    tokenCode('def a=10');
    tokenCode('def a:int=30');
    tokenCode('def a=10,b:number=20');
    tokenCode(`def json={a:1,b:2}`);
    tokenCode(`def json:{a:number,b:int}={a:1,b:2}`);
    tokenCode(`def a:string[]=["ejfis","sssx"]`);
    tokenCode(`def a="sjsss@{b+c}sjsss"`);
    tokenCode(`def a=[{a:1,b:2},{a:3,b:4}]`);
    tokenCode(`def a=b>c?c:d`);
    tokenCode(`def a=b&&!c||d`);
    tokenCode(`def a=/2008-25-95/date`);
    tokenCode(`def a:|sex=1,
    
    sex=2|=1`);
    tokenCode(`if(a>b){ }else{ }`);
    tokenCode(`for(def i=0;i<10;i++){ }`);
    tokenCode(`public classA<T>{
         public a:string='123';
         private ab:number;
         public abc:string{
             get{
                 return ab;
             }
             set{
                 ab=value;
             }
         }
         contains(t:T):bool
         {

         }
         search(predict:(t:T)=>bool):T
         {

         }
    }`);
    tokenCode(`package Ve.Test{
          use Ve.Sys;
          [nick("ct")]
          public classTest{
               [nick('methodA')]
               static method(a:string,b:number):string
               {
                   
               }
          }
    }`);
    tokenCode(`abcd`);
    tokenCode(`ab cd`);
    tokenCode(`ab
    
    cd`);
    tokenCode(`123`);
    tokenCode(`123 456`);
    tokenCode(`123
     456`);
    tokenCode(`a+b`);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=token.parse.code.js.map