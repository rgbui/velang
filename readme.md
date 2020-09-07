## Ve lang 
   Ve语言是一门胶水式编程语言，主要用来封装及生成其它编程语言的语言。   
   Ve语言是[火凤凰](https://viewparse.com "火凤凰")这款软件设计工具中所内置的编程语言，基于ts编写的。   
   Ve语言就像集中箱打包货物一样，它会将现阶段相对比较好的各种开源库进行包装，使得整体遵循统一的调用设计规范。同时在包装api的过程中，会打上标签、尽量的语义化、收集更多的信息，这有肋于生成更优质的代码。   
   > 当前Ve语言不建议使用，因为整体功能并不是十分完善。只是测了[火凤凰](https://viewparse.com "火凤凰")用到的一些功能。仅供开发人员学习。  
## 语法特色
 相关详细语法请参考[ve语法](https://github.com/rgbui/velang/blob/master/doc/language.md "ve语法")  
 
 ```
  package Ve.Core;
  use Ve.Core.String ;
  #alias('例子')
  out class Example extends Test{
      ctor();
      ctor(v:int){
          @value=v;
          @super();
      }
      ctor(str:String){
          @value=str.toInt(0);
          this.super();
      }
      #Deprecated('方法将弃用')
      args(...args:string[]):string[]{
          return args;
      }
      thisArgs(this:{a:string}){
          return @a;
      }
      private value:int;
      static copy<T>(t:T){
          return t;
      }
      get length(){
          return this.value.length;
      }
      toString() {
          return `toString value is @value,it can be @{this.value}`;
      }
      /**
      * 这是自定义操作符+
      */
      operator +(other:Example){
          return @value+other.value;
      }
  }
  def exp=123Example;// 相当于def exp=new Example(123);
  def exp='123'Example; //相当于def exp=new Example('123');
  fun print(message:string)
  {
      console.log(message);
  }
  print(exp.toString());
  when {
      exp=='123'Example->print(exp.toString());
      true->console.log(true);
      false->console.log(false);
  }
  ```
  解释一下
  1. "@"在字符模板中做为引用符，相当于js中的字符模板'${a}'中的"$"  
     "@"中在类中有取代this的效果
  2. "123Example"，这表示“值单位”，在数据中表达会比JSON文件中表达的类型更为丰富一些。  
      如果构造器中的参数是单独的文本或数字，皆可在单独的文本或数字后面紧跟类型名。
      例如下面的ve语言中的json文件
      ```
      {
          width:3cm,
          height:1px,
          color:'rgba(255,255,255)'Color,
          date:'2018-09-25'Date,
      }
      ```      
  3.  #alias('例子') 表示注解，表示当前类有别名
     ```
      def exp=123例子;
     ```
  4. 类里面的属性和方法默认是公开的，如果是私有的，需要主动强调声明
  5. when的语法   
     when{   
         ...\[express->express|statement]   
     }  
## 包装API接口示例
   1. 需要用Ve语言申明相关的接口    
    ```
     package Ve.Core;
     outer interface File{
         private filePath:string;
         ctor(filePath:string);
         read():string;
    }
    ```
   2. 包装API接口最终会生成的其它语言   
      如果生成nodejs语言
      ```
      {
          'Ve.Core.File':{
               ctor:`
               var @def('file')={__ve_type:"File",value:@ref("filePath")};
               @next(def('file'))`,
               read:`
               @declare('fs','var fs="require("fs")')
               @declare('fs').readFile(@(this).value,"utf-8",(@def('err'),@def('data'))=>{
                    if(@def('err')){@throw(def('err'))}
                    else{
                        @next(@def('data'))
                    }
               })
               `
          }
      }
      ```
      如果生成js
      ```
        {
          'Ve.Core.File':{
               ctor:`
               var @def('file')={__ve_type:"File",value:@ref("filePath")};
               @next(def('file'))`,
               read:`
               var @def('reader') = new FileReader();
               @def('reader').onload = function () {
                    @next('this.result')
                    //$('body').append('<pre>' + this.result + '</pre>');
              };
              @def('reader').readAsText(@(this).value);
               `
          }
      }
      ```
    3. 申明以上信息后，就可以在Ve语言中使用了   
      如系统环境   
      ```
         def file=new File('C:\\viewparse\\trunk\\Works\\test.text');
         def file1="C:\\viewparse\\trunk\\Works\\test.text"File;
         console.log(file.read());
      ```
      如浏览器环境   
      ```
        def file=document.selector('#file').file;
        consolg.log(file.read())
      ```

