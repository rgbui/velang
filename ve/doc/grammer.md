# Ve语言的基本语法
1. 基本的数据类型
  int,number,string,bool
2. 结构化类型
   object,list,array
   ```
   def a:object={ a:123,b:"eeee"};
   def a:{a:number,b:string}={a:123,b:"string"};
   def a:string[]=['eeee','ssseee'];
   def a:{a:string,b:number}[]=[{a:'eeee',b:123},{a:'exxx',b:45566}];
   def a=[{a:1223,b:'eeee'}];
   def a:{a:number,b:string}[]=[{a:123,b:'eeee'}];
   def a={
       a:'1223',
       b()
       {
             
       },
       b:fun()
       {

       },
       d{

       },
       ab[{a:'123',b:number}],
   } 
   ```
3. 空类型
  null(空值),void(空类型),any 
3. 数据类型
   def g='http://www.baidu.com'url;
   def g='http://@{url}';
   def gc='http://@{abcc}';   
4. 运算符
   四则运算：+,-,*,/,%,**
   逻辑运算：&&,||,&|
   赋值运算:+=,-=,/=,*=,%=
   空运算符:?.,.
5. 操作符
  typeof,as,is,in,match,not as ,not is,not in,no match
  [index]
5. 语句
   if,while,for,try,do...while,switch
6. 函数
   fun abc(a:string,b:string):<a:string,b:string>{
       return [{a,b}];
   }
   def abc=fun(a:string,b:string):<a:string,b:string>{

   }
   def abc:(a:string,b:string)=><a:string,b:string>=(a,b)=>{
       return [{a,b}];
   }
   fun abc(a:string='11223',...bs:string[]):void
   {
          
   }
7. 枚举
enum week{
    星期一，星期二，星期三，星期四，星期五
}
8. class 
 class classA {
      private a:string='11223',
      private readonly b:number,
      obj{
          a:string='123',
          b:number=123
      },
      public ab()
      {

      },
      cd={
          get{
              return this.a;
          }
          set{
              this.a=value;
          }
      }
  }
  class classB{
      new(a:string,b:number)
      {
          def a=new classA();
      }
  }
9. interface 接口
   interface interface1{
        ab:string;
        ab(a:string,b:number)=>void;
        ab:(a:string,b:number)=>void;
   }
9. 泛型
   * 函数泛型
     fun ab<T:string|number>(a:string,b:T):T{

     }
     def ab=<T:string|number>(a:string,b:T):T=>{
          
     }
     def abc=fun<T:string|number>(a:string,b:T):T=>{
          
     }
10. 包，引用
package ab{

}
use ab;
11. 状态器
export classA {
    public new(a:string)
    {
         
    }
    public number:int=30;
    private number:string='222';
    public method(a:string,b:number) {
        
    }
    @padding{
        public method(a:string,b:number) {

        }
        on {

        } 
        throw{

        }
    }
    @wait{
        public method(a:string,b:number)
        {

        }
    }
}

def a:classA@padding.method()=new classA();
if(a is classA@wait)
{
   
}


