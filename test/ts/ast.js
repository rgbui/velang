var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Test;
        (function (Test) {
            function testAst(code, isRun) {
                if (isRun == false)
                    return;
                var compiler = new Ve.Lang.Compiler();
                compiler.on('error', function () {
                    console.log(arguments);
                });
                var ast = compiler.compile(code).nodes;
                console.log(code, ast);
            }
            testAst('package Ve.Core;', false);
            testAst(`
    package Ve.Core;
    use Ve ve;
    use Ve.Test;
    `, false);
            testAst(`
    package Ve.Core;
    use Ve.Core core;
    out class Test{
        
    }
    `, false);
            testAst(`package Ve.Core;
         use Ve.Core;
         out enum Color{
             red,
             blue=300,
             green
         }
    `, false);
            testAst(`package Ve.Core;
         use Ve.Core;
         fun ABC(a:string,b:string)
         {

         }
    `, false);
            testAst(`package Ve.Core;
    use Ve.Core;
    fun ABC<T>(a:string,b:string)
    {

    }
`, false);
            testAst(`
for(def i=0;i<20;i++)  def c=i+b
`, false);
            testAst(`

for(def i=0;i<20;i++) 
   for(def j=0;j<i;j++)
    def c=i+j;


`, false);
            testAst(`

def c=20;
if(a>c) def g=30;
else if(a<c)def k=40
else def g=30;

`, false);
            testAst(`while(a>b){ def g=20;}`, false);
            testAst(`when{
   true->{ console.log("ssss");}
   false->def a=20;
}`, false);
            testAst(`switch(a){
case a>b:
    break;
case false:
    break;
default :
  

}`, false);
            testAst(`
try{

}
catch(e:Error){

}
catch(e:error){

}
finally{
    console.log('sssss')
}


`, false);
            testAst(`if(true)return "sssss";`, false);
            testAst(`
    
    #alias('name')
    inner fun test<T>(a:string,b:string)
    {
        return a+b;
    }
    `, false);
            testAst(`package Ve.Core;

    out interface Array<T>{
            readonly length:int;
            readonly first:T;
            readonly last:T;
    }`, false);
            testAst(`
    
    def a:(a:string)->void=fun(a:string)
    {
       console.log(a);
    };
    `, false);
            testAst(`
    package Ve.Core;

    out interface Array<T>{

        readonly length:int;
        readonly first:T;
        readonly last:T;
        readonly reversed:T[];
        readonly isEmpty:bool;
        readonly isNotEmpty:bool;
        clear():void;
        exists(item:T):bool;
        exists(predict:(item:T)->bool):bool;
        findIndex(item:T):int;
        findLastIndex(item:T):int;
        findIndex(predict:(item:T)->bool):bool;
        find(predict:(item:T,at:int)->bool):T;
        findLast(predict:(item:T,at:int)->bool):T;
        findAll(predict:(item:T,at:int)->bool):T[];
        append(item:T):void;
        prepend(item:T):void;
        insertAt(at:int,item:T):void;
        at(at:int,item:T):void;
        at(at:int):T;
        sum(predict:(item:T,at:int)->number):number;
        avg(predict:(item:T,at:int)->number):number;
        max(predict:(item:T,at:int)->number):number;
        findMax(predict:(item:T,at:int)->number):T;
        min(predict:(item:T,at:int)->number):number;
        findMin(predict:(item:T,at:int)->number):T;
        count(predict:(item:T,at:int)->bool):number;
        sort(predict:(item:T,at:int)->any,order:int):T[];
        map<R>(predict:(item:T,at:int)->R):R[];
}
    
    
    `, false);
            testAst(`console.assert(lineCount == null,'lineCount is not null')`);
            testAst(`
    package Ve.__SimulatePackage2_1;
    use Ve.Core;
    use Ve.Math;
    out class SimulateClass{
       static SimulateExpress()
        {return [{a:"ssss"}]}
    }`, false);
            testAst(`def a=“122333”；`, false);
            testAst(`def a=“122333”+’森林‘；`, false);
            testAst(`def a=a>了&&以<=你好；`, false);
        })(Test = Lang.Test || (Lang.Test = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=ast.js.map