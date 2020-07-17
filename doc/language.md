# Ve语言预览
这里将介绍 Ve 主要功能，从变量和运算符到类和库，假设您已经知道如何使用其他语言编程。
# 一个简单的Ve程序
下面的代码用了很多Ve的基本功能
```
use Ve.Core;
/* 申明代码包 HelloWorldApplication */
package HelloWorldApplication;
/*申明一个类 HellowWorld**/
out class  HellowWorld {
      /* main 主函数**/
      static Main(...args:string[])
      {
          /**定义一个内部方法PrintStr**/
           fun PrintStr(str:string)
           {
               Console.print('hellow world,@str');
           }
           def name:string='ve lang';
           PrintStr(name);
      }
}
```
以下是此程序使用的代码，这些代码适用于所有（或几乎所有）的 Ve 应用：
1. /\*\*\*xxx\*\*\*/ 代码注释   
多行注释,Ve支持多行和单行注释
2. string  类型   
   Ve内置的类型，一些其它的内置类型 Array,bool,number
3. '...'或"...."   
    字符串常量
4. @variableName (或 @{expression})   
   字符串插值： 包括字符串文字内部的变量或表达式的字符串。
5. use 包名    
   引用其它包名,Ve.Core是Ve的核心包
6. package 包名   
   定义当前类所属的包
7. class 类   
   定义一个类，out表示该类是公开类，外部可调用
8. static Main 表示入口方法   
   该方法在程序中是唯一的，且是静态的
9. def 定义一个变量    
   支持推导类型
# 重要的概念
  在学习Ve语言时，应该基于以下几个概念和事实:  
  * 任何保存在变量中的都是一个 对象 ， 并且所有的对象都是对应一个 类 的实例。 无论是数字，函数和 null 都是对象。所有对象继承自 Any 类
  * null的处理偏好策略，对于内置的类型，当仅仅申明一个变量，而没有赋值，那么当前的变量基本都会有默认的初始值，而不是null,如 def a:int ，那么a=0  
     def str:string ,str的值为空字符串。除非你指定为空值 def a:int=null;如果是自定义的类，那么会寻找这样的构造器ctor()，如果没有只好为null。
  * 尽管 Ve设计上是强类型的，但是 Ve 可以推断类型，所以类型注释是可选的。 在上述的代码中def name='ve lang' 中可推导name为字符串类型 。 如果要明确说明不需要任何类型， 需要使用类型 Any 。
  * Ve 支持泛型，如 Array&lt;int&gt; （整数列表）或 Array&lt;any&gt; （任何类型的对象列表）。
  * Ve 支持顶级函数 同样函数绑定在类或对象上（分别是 静态函数 和 实例函数 ）。 以及支持函数内创建函数 （ 嵌套 或 局部函数 ） 。但不支持顶级变量
  * 与其它的面向对象语言相比，类的属性和方法没有修辞符时，默认都是public，除非你指定了private
  * Ve 语法中包含 表达式（ expressions ）（有运行时值）和 语句（ statements ）（没有运行时值）例如，条件表达式 condition ? expr1 : expr2 的值可能是 expr1 或 expr2 。 将其与 if-else 语句 相比较，if-else 语句没有值。 一条语句通常包含一个或多个表达式，相反表达式不能直接包含语句。

# 关键字
Ve语言的关键字列表
  * if
  * else 
  * while
  * do
  * for
  * in
  * switch
  * case 
  * default
  * when
  * then
  * break
  * continue
  * class
  * interface
  * enum
  * fun
  * ctor
  * new
  * is 
  * as 
  * not
  * extends
  * return
  * throw 
  * const
  * def 
  * static
  * readonly
  * get
  * set
  * try
  * catch
  * finally
  * void
  * assert
  * check
  * use
  * out
  * package
  * super
  * this
  * async
  * await
  * operator
# 变量
创建一个变量并进行初始化:
```  
def name = 'Bob';  
```
变量仅存储对象引用，这里的变量是 name 存储了一个 String 类型的对象引用。 “Bob” 是这个 String 类型对象的值。   
name 变量的类型被推断为 String 。 但是也可以通过指定类型的方式，来改变变量类型。 如果对象不限定为单个类型，可以指定为 对象类型 或 动态类型。
```   
def name:any = 'Bob';   
```
# 默认值
未初始化的变量都会有初始的默认值，因为在Ve 中一切都是对象，数字类型 也不例外。   
```
def lineCount:int;   
assert(lineCount == null,'lineCount is not null');
assert(lineCount==0,'lineCount is zero')  
```

# def 和 const
def 申明一个变量
const 申明一个常量，初始值一旦声明就不可改变
> const实际上保证的，并不是变量的值不得改动，而是变量指向的那个内存地址不得改动。对于简单类型的数据（数值、字符串、布尔值），值就保存在变量指向的那个内存地址，因此等同于常量。  
>但对于复合类型的数据（主要是对象Object和数组Array），变量指向的内存地址，保存的只是一个指针，const只能保证这个指针是固定的，至于它指向的数据结构是不是可变的，就完全不能控制了。因此，将一个对象声明为常量必须非常小心。

# 内建类型
Ve 语言支持以下内建类型：
* String
* Array
* Bool
* Number(Double,Int)
* Object
* Any  
* Null
内置的部分类型可支持小写 string,bool,number,int,double,any
这些类型都有一些初始化的字面量， 例如, 'this is a string' 是一个字符串的字面量， true 是一个布尔的字面量。  
因为在 Ve 所有的变量终究是一个对象（一个类的实例）， 所以变量可以使用 构造涵数 进行初始化。
# Number
Ve 语言的 Number 有两种类型:

int
整数值不大于64位， 具体取决于编译语言所属的平台。 Ve 被编译为 JavaScript 时，使用 JavaScript numbers, 值的范围从 -253 到 253 - 1.

double
64位（双精度）浮点数，依据 IEEE 754 标准。

int 和 double 都是 number 的亚类型。 number类型包括基本运算 +， -， /， 和 *， 以及 abs()， ceil()， 和 floor()， 等函数方法。  如果 num 及其亚类型找不到你想要的方法， 尝试查找使用 Ve.Core.Math  库。

整数类型不包含小数点。 下面是定义整数类型字面量的例子:
```
def x=2;
def y=2int;
```
如果一个数字包含小数点，那么就是小数类型。 下面是定义小数类型字面量的例子:
```
def x=2.1;
def y=2.1double;
def z=2.3e4;
```
2.1double其实等价于new double(2.1),  
凡是构造器是ctor(value:double)均可这样表达，示例如下
```
out class cm{
    value:number;
    ctor(value:number);
    operator +(other:cm):cm{
        return new cm(this.value+cm.value);
    }
    operator * (other:cm){
        return new cm(this.value*cm.value);
    }
}
...
...
...
def a=3cm,b=5.1cm;
def sum=a+b;
def size={
    width:3cm,
    height:6cm
}
def area=size.width*size.height;
```

下面是字符串与数字的转换方法：
```

//文本转数字
def one='123'.toInt();
def second='123.01'.toNumber();
def three='abcc'.toInt(5);// 转换不了，会取默认值5,如果不指定，则是0,该方法的接口 String.toInt(defaultValue=0):int;


//数字转文本

def oneStr=1.toString();
def secondStr=2.1.toString();//2.1
def threeStr=3.1415926.toFixed(2); //3.14

```

# String

字符串通过单引号或者双引号创建。
```
def s1 = 'Single quotes work well for string literals.';
def s2 = "Double quotes work just as well.";
def s3 = 'It\'s easy to escape the string delimiter.';
def s4 = "It's even easier to use the other delimiter.";
```

字符串可以通过 @{expression} 的方式内嵌表达式。 如果表达式是一个标识符，则 {} 可以省略。 在 Ve 中通过调用就对象的 toString() 方法来得到对象相应的字符串。
```
var s = 'string interpolation';
Console.print('Ve has @s, which is very handy.' ==
    'Ve has string interpolation, ' +
        'which is very handy.');
Console.print('That deserves all caps. ' +
        '@{s.toUpper()} is very handy!' ==
    'That deserves all caps. ' +
        'STRING INTERPOLATION is very handy!');
```
基于字符串的字面类型
```
#alias('color')
out class Color{
    r:int=0;
    g:int=0;
    b:int=0;
    a:number=1.0;
    ctor():Color;
    /**
    *  @param color 可解析的文本格式 "rgba(r,g,b,a)" "#hex"
    *
    */
    ctor(color:string):Color;
    ctor(r:int,b:int,b:int,a:number):Color:
    /**
    * @param percent 0-100
    */
    fade(percent:int);
}
```
```
def color1='rgba(255,234,211,0.1)'Color;
def color2='#fff'color;
def style={
    backgroundColor:'#fff'color
}
style.backgroundColor.fade(60);
```

# Boolean
Ve 使用 bool 类型表示布尔值。 Ve 只有字面量 true and false 是布尔类型， 这两个对象都是编译时常量。

Ve 的类型安全意味着不能使用 if (nonbooleanValue) 。 而是应该像下面这样，明确的进行值检查：
```
// 检查空字符串。
var fullName = '';
assert(fullName.isEmpty);

// 检查 0 值。
var hitPoints = 0;
assert(hitPoints <= 0);

// 检查 null 值。
var unicorn;
assert(unicorn == null);

// 检查 NaN 。
var iMeantToDoThis = 0 / 0;
assert(iMeantToDoThis.isNaN);
```

# Array
几乎每种编程语言中最常见的集合可能是 Array 或有序的对象集合List
下面是一个 Ve Array 的示例：
```
def list=[1,2,3]; // list type  Array<int>
def list1:Array<number>=[1,2,3] // list1 type Array<number>
def list2=[1,2,3.14];// list3 type  Array<number>
def list3=[1,2,3.1,'ssss'] // list4 type Array<any>
```
数组的类型推导，是取集合所有元素类型继承链最先相同的第一个类型，上述例子，因为所有类型都默认继承于Any，所有list推导的类型是Array<any>

Array 的下标索引从 0 开始，第一个元素的索引是 0。 Array.length - 1 是最后一个元素的索引。 访问 Array 的长度和元素与 JavaScript 中的用法一样：
```
var list = [1, 2, 3];
assert(list.length == 3);
assert(list[1] == 2);

list[1] = 1;
assert(list[1] == 1);
```

# Object
通常来说， Object 是用来关联 keys 和 values 的对象。 keys 和 values 可以是任何类型的对象。在一个 Object 对象中一个 key 只能出现一次。 但是 value 可以出现多次。 

```
def gifts = {
  // Key:    Value
  'first': 'partridge',
  'second': 'turtledoves',
  'fifth': 'golden rings'
};

def nobleGases = {
  2: 'helium',
  10: 'neon',
  18: 'argon',
};
```
以上 Object 对象也可以使用 Object 构造函数创建：

```
def gifts = new Object();
gifts.first = 'partridge';
gifts.second = 'turtledoves';
gifts.fifth = 'golden rings';


def gifts1 = {};
gifts1.first = 'partridge';
gifts1.second = 'turtledoves';
gifts1.fifth = 'golden rings';

```

# 函数
Ve 是一门真正面向对象的语言， 甚至其中的函数也是对象，并且有它的类型 Function 。 这也意味着函数可以被赋值给变量或者作为参数传递给其他函数。 也可以把 Ve 类的实例当做方法来调用。
已下是函数实现的示例：
```
fun isNoble(atomicNumber:int):bool {
  return _nobleGases[atomicNumber] != null;
}
```
如果函数中只有一句表达式，可以使用简写语法：
```
def isNoble=(atomicNumber:int):bool->_nobleGases[atomicNumber] != null;
```

# 默认参数值
在定义方法的时候，可以使用 = 来定义可选参数的默认值。 默认值只能是编译时常量。 如果没有提供默认值，则默认值为当前类型的默认值。

下面是设置可选参数默认值示例：
```
// 设置 [bold] 和 [hidden] 标志 ...
fun enableFlags(bold=false,hidden=false){...}

// bold 值为 true; hidden 值为 false.
enableFlags(true);

```

# 匿名函数
多数函数是有名字的。 也可以创建没有名字的函数，这种函数被称为 匿名函数， 有时候也被称为 lambda 或者 closure 。 匿名函数可以赋值到一个变量中， 举个例子，在一个集合中可以添加或者删除一个匿名函数。  

匿名函数和命名函数看起来类似— 在括号之间可以定义一些参数或可选参数，参数使用逗号分割。  

下面例子中定义了一个包含一个无类型参数 item 的匿名函数。 list 中的每个元素都会调用这个函数，打印元素位置和值的字符串。
```
def list = ['apples', 'bananas', 'oranges'];
list.each((item,at)->{
    Console.print(`list[@at]:@item`);
})
```

# 词法作用域
Ve 是一门词法作用域的编程语言，就意味着变量的作用域是固定的， 简单说变量的作用域在编写代码的时候就已经确定了。 花括号内的是变量可见的作用域。

下面示例关于多个嵌套函数的变量作用域：
```
use Ve.Core;
package Example.Test;
out class Test{
   method():void
   {
       def insideMain = true;
       fun myFunction()
       {
            def insideFunction = true;
            fun nestedFunction()
            {
                def insideNestedFunction = true;
                assert(insideMain);
                assert(insideFunction);
                assert(insideNestedFunction);
            }
        }
    } 
}
```

# 运算符
下表是 Ve 定义的运算符。 多数运算符可以被重载
描述| 运算符
-|-|-
单目运算符 后缀| expr++    expr--    ()    []    .    ?. | 
单目运算符 前缀 | -expr    !expr    ~expr    ++expr    --expr    | 
二元运算符 | + - * / % ** is as 'not is' 'not as' && \|\| \> \< \>= \<= != == ?? |
三元运算符 | ?: |
赋值运算符 | += -= *= /= %= **= |
范围运算符 | ..|
创建表达式的时候会用到运算符。 下面是一些运算符表达式的实例：
```
a++
a + b
a = b
a == b
c ? a : b
a is T
```
## 运算符优先级
例如 % 运算符优先级高于 == ， 而 == 高于 &&。 根据优先级规则，那么意味着以下两行代码执行的方式相同：
```
// 括号可以提高可读性。
if ((n % i == 0) && (d % i == 0)) ...

// 可读性差，但是是等效的。
if (n % i == 0 && d % i == 0) ...
```
## 算术运算符
Ve 支持常用的运算运算符：
```
assert(2 + 3 == 5);
assert(2 - 3 == -1);
assert(2 * 3 == 6);
assert(5 / 2 == 2.5); // 结果是双浮点型
assert(5 % 2 == 1); // 余数
assert('5/2 = @{5 ~/ 2} r @{5 % 2}' == '5/2 = 2 r 1');
```
## 自增和自减运算符。
示例：
```
def a:int, b:int;

a = 0;
b = ++a; // a自加后赋值给b。
assert(a == b); // 1 == 1

a = 0;
b = a++; // a先赋值给b后，a自加。
assert(a != b); // 1 != 0

a = 0;
b = --a; // a自减后赋值给b。
assert(a == b); // -1 == -1

a = 0;
b = a--; // a先赋值给b后，a自减。
assert(a != b); // -1 != 0
```
## 关系运算符
要测试两个对象x和y是否表示相同的事物， 使用 == 运算符。 (在极少数情况下， 要确定两个对象是否完全相同，需要使用 identical() 函数。) 下面给出 == 运算符的工作原理：

如果 x 或 y 可以 null，都为 null 时返回 true ，其中一个为 null 时返回 false。

结果为函数 x.==(y) 的返回值。 (如上所见, == 运算符执行的是第一个运算符的函数。 我们甚至可以重写很多运算符，包括 ==， 运算符的重写，参考 重写运算符。）

这里列出了每种关系运算符的示例：
```
assert(2 == 2);
assert(2 != 3);
assert(3 > 2);
assert(2 < 3);
assert(3 >= 3);
assert(2 <= 3);
```

## 类型判定运算符
as， is， 和 not is ,not as 运算符用于在运行时处理类型检查：
例如， obj is Object 总是 true。 但是只有 obj 实现了 T 的接口时， obj is T 才是 true。
使用 as 运算符将对象强制转换为特定类型。 通常，可以认为是 is 类型判定后，被判定对象调用函数的一种缩写形式。 请考虑以下代码：
```
if (emp is Person) {
  // Type check
  emp.firstName = 'Bob';
}
```
使用 as 运算符进行缩写：
```
  (emp as Person).firstName = 'Bob';
```
## 赋值运算符
使用 = 为变量赋值。 使用 ??= 运算符时，只有当被赋值的变量为 null 时才会赋值给它。
```
// 将值赋值给变量a
a = value;
// 如果b为空时，将变量赋值给b，否则，b的值保持不变。
b ??= value;
```
## 逻辑运算符
逻辑操作符可以反转或组合布尔表达式。
下面是关于逻辑表达式的示例：
```
if (!done && (col == 0 || col == 3)) {
  // ...Do something...
}
```
## 条件表达式
Ve有两个运算符，有时可以替换 if-else 表达式， 让表达式更简洁：

condition ? expr1 : expr2
如果条件为 true, 执行 expr1 (并返回它的值)： 否则, 执行并返回 expr2 的值。
expr1 ?? expr2
如果 expr1 是 non-null， 返回 expr1 的值； 否则, 执行并返回 expr2 的值。
如果赋值是根据布尔值， 考虑使用 ?:。
```
def visibility = isPublic ? 'public' : 'private';
```
如果赋值是基于判定是否为 null， 考虑使用 ??。
```
playerName(name:String):String =>name??'Guest';
```
下面给出了其他两种实现方式， 但并不简洁：
```
// Slightly longer version uses ?: operator.
playerName(name:String):String =>name??'Guest';

// Very long version uses if-else statement.
playerName(name:string):string {
  if (name != null)
  {
    return name;
  } else {
    return 'Guest';
  }
}
```
# 控制流程语句
你可以通过下面任意一种方式来控制 Ve 程序流程：
 * if and else
 * for loops
 * while and do while
 * break and continue
 * switch and case ,when and then
 * assert and check
 使用 try-catch 和 throw 也可以改变程序流程  
## if 和 else
Ve 支持 if - else 语句，其中 else 是可选的， 比如下面的例子
```
if (isRaining()) {
  you.bringRainCoat();
} else if (isSnowing()) {
  you.wearJacket();
} else {
  car.putTopDown();
}
```
> 和 JavaScript 不同，Ve 的判断条件必须是布尔值，不能是其他类型
## for 循环
进行迭代操作，可以使用标准 for 语句。 例如：
```
```
## while and do while
while 循环在执行前判断执行条件：
```
while (!isDone()) {
  doSomething();
}
```
do-while 循环在执行后判断执行条件：
```
do {
  printLine();
} while (!atEndOfPage());
```
## break 和 continue
使用 break 停止程序循环：
```
while (true) {
  if (shutDownRequested()) break;
  processIncomingRequests();
}
```
使用 continue 跳转到下一次迭代：
```
for (int i = 0; i < candidates.length; i++) {
  var candidate = candidates[i];
  if (candidate.yearsExperience < 5) {
    continue;
  }
  candidate.interview();
}
```
如果对象实现了 Iterable 接口;  那么上面示例完全可以用另一种方式来实现：
```
candidates
    .where((c) => c.yearsExperience >= 5)
    .forEach((c) => c.interview());

```
## switch and case
在 case 语句中，每个非空的 case 语句结尾需要跟一个 break 语句。 除 break 以外，还有可以使用 continue, throw，者 return。
当没有 case 语句匹配时，执行 default 代码：
```
var command = 'OPEN';
switch (command) {
  case 'CLOSED':
    executeClosed();
    break;
  case 'PENDING':
    executePending();
    break;
  case 'APPROVED':
    executeApproved();
    break;
  case 'DENIED':
    executeDenied();
    break;
  case 'OPEN':
    executeOpen();
    break;
  default:
    executeUnknown();
}
```
下面的 case 程序示例中缺省了 break 语句，导致错误：
```
var command = 'OPEN';
switch (command) {
  case 'OPEN':
    executeOpen();
    // ERROR: 丢失 break

  case 'CLOSED':
    executeClosed();
    break;
}
```
但是， Ve 支持空 case 语句， 允许程序以 fall-through 的形式执行。
```
var command = 'CLOSED';
switch (command)
{
  case 'CLOSED': // Empty case falls through.
  case 'NOW_CLOSED':
    // Runs for both CLOSED and NOW_CLOSED.
    executeNowClosed();
    break;
}
```
case 语句可以拥有局部变量， 这些局部变量只能在这个语句的作用域中可见。
## when and then

## assert
如果 assert 语句中的布尔条件为 false ， 那么正常的程序执行流程会被中断。 在本章中包含部分 assert 的使用， 下面是一些示例：
```
// 确认变量值不为空。
assert(text != null);

// 确认变量值小于100。
assert(number < 100);

// 确认 URL 是否是 https 类型。
assert(urlString.startsWith('https'));

```
assert 的第二个参数可以为其添加一个字符串消息。
```
assert(urlString.startsWith('https'),
    'URL ($urlString) should start with "https".');
```
assert 的第一个参数可以是解析为布尔值的任何表达式。 如果表达式结果为 true ， 则断言成功，并继续执行。 如果表达式结果为 false ， 则断言失败，并抛出异常 (AssertionError)
# 异常
Ve 代码可以抛出和捕获异常。 异常表示一些未知的错误情况。 如果异常没有被捕获， 则异常会抛出， 导致抛出异常的代码终止执行。
Ve 提供了 Exception 和 Error 类型， 以及一些子类型。 当然也可以定义自己的异常类型。 但是，此外 Ve 程序可以抛出任何非 null 对象， 不仅限 Exception 和 Error 对象。
# throw
下面是关于抛出或者 引发 异常的示例：
```
throw FormatException('Expected at least 1 section');
```
也可以抛出任意的对象：
```
throw 'Out of llamas!';
```
因为抛出异常是一个表达式， 所以可以在 -> 语句中使用，也可以在其他使用表达式的地方抛出异常：
```
void distanceTo(Point other) => throw UnimplementedError();
```
## catch
捕获异常可以避免异常继续传递。 可以通过捕获异常的机会来处理该异常：
···
try {
  breedMoreLlamas();
} cathe(e:OutOfLlamasException){
  buyMoreLlamas();
}
···
## finally
不管是否抛出异常， finally 中的代码都会被执行。 如果 catch 没有匹配到异常， 异常会在 finally 执行完成后，再次被抛出：
try {
  breedMoreLlamas();
} finally {
  // Always clean up, even if an exception is thrown.
  cleanLlamaStalls();
}

任何匹配的 catch 执行完成后，再执行 finally ：
```
try {
  breedMoreLlamas();
} catch (e) {
  Console.print('Error: @e'); // Handle the exception first.
} finally {
  cleanLlamaStalls(); // Then clean up.
}
```
# 类
每个对象都是一个类的实例，所有的类都继承于Any
## 使用类的成员变量
象的由函数和数据（即方法和实例变量）组成。 方法的调用要通过对象来完成： 调用的方法可以访问其对象的其他函数和数据。

使用 (.) 来引用实例对象的变量和方法：
```
ar p = new Point(2, 2);

// 为实例的变量 y 设置值。
p.y = 3;

// 获取变量 y 的值。
assert(p.y == 3);

// 调用 p 的 distanceTo() 方法。
def distance = p.distanceTo(new Point(4, 4));

```
使用 ?. 来代替 . ， 可以避免因为左边对象可能为 null ， 导致的异常：
```
// 如果 p 为 non-null，设置它变量 y 的值为 4。
p?.y = 4;
```
## 构造函数
Ve语言的构造函数支持重载,关键词ctor
在没有声明构造函数的情况下，Ve 会提供一个默认的构造函数。 默认构造函数没有参数并会调用父类的无参构造函数。

```
out class Student{
     name:string;
     sex:bool;
     age:int;
     ctor():Student;
     ctor(name:string,sex:bool,age:int):Student;
}
```
## Getter 和 Setter
Getter 和 Setter 是用于对象属性读和写的特殊方法。 回想之前的例子，每个实例变量都有一个隐式 Getter ，通常情况下还会有一个 Setter 。 使用 get 和 set 关键字实现 Getter 和 Setter ，能够为实例创建额外的属性。
```
class Rectangle {
    left:number;
    top:number;
    width:number;
    height:number;
    get right(){
        return this.width+this.left;
    }
    get bottom(){
        returnt this.height+this.top;
    }
}
```
最开始实现 Getter 和 Setter 也许是直接返回成员变量； 随着需求变化， Getter 和 Setter 可能需要进行计算处理而使用方法来实现； 但是，调用对象的代码不需要做任何的修改。
## 重写类成员
子类可以重写实例方法，getter 和 setter。 可以使用 #override 注解指出想要重写的成员：
```
out class SmartTelevision extends Television {
  #override
  turnOn():void {...}
  // ···
}
```
## 重写运算符
下标的运算符可以被重写。 例如，想要实现两个向量对象相加，可以重写 + 方法。
下面示例演示一个类重写 + 和 - 操作符：

```
out class Vector {
    x:number;
    y:number;
    ctor(x:number,y:number);
    operator + (v:Vector){
        return new Vector(v.x+this.x,v.y+this.y);
    }
    operator - (v:Vector){
        return new Vector(this.x-v.x,this.y-v.y);
    }
}
...
...
...

fun test()
{
  const v = new Vector(2, 3);
  const w = new Vector(2, 2);

  assert(v + w == new Vector(4, 5));
  assert(v - w == new Vector(0, 1));
}


```

# 枚举类型
枚举类型也称为 enumerations 或 enums ， 是一种特殊的类，用于表示数量固定的常量值。

## 使用枚举
使用 enum 关键字定义一个枚举类型：
```
enum Color { red, green, blue }
```
枚举中的每个值都有一个 index getter 方法， 该方法返回值所在枚举类型定义中的位置（从 0 开始）。 例如，第一个枚举值的索引是 0 ， 第二个枚举值的索引是 1。
```
assert(Color.red.index == 0);
assert(Color.green.index == 1);
assert(Color.blue.index == 2);
```
可以在 switch 语句 中使用枚举。
```
def aColor = Color.blue;
switch (aColor)
{
  case Color.red:
    Console.print('Red as roses!');
    break;
  case Color.green:
    Console.print('Green as grass!');
    break;
  default: 
    Console.print(aColor); // 'Color.blue'
}
```
枚举类型具有以下限制：
* 枚举不能被子类化或实现。
* 枚举不能被显式实例化。
# 泛型
 在 API 文档中你会发现基础数组类型 Array 的实际类型是 Array<E> 。 <…> 符号将 Array 标记为 泛型 (或 参数化) 类型。 这种类型具有形式化的参数。 通常情况下，使用一个字母来代表类型参数， 例如 E, T, S, K, 和 V 等。

## 为什么使用泛型
在类型安全上通常需要泛型支持， 它的好处不仅仅是保证代码的正常运行：
* 正确指定泛型类型可以提高代码质量。
* 使用泛型可以减少重复的代码。
如果想让 Array 仅仅支持字符串类型， 可以将其声明为 Array<String> （读作“字符串类型的 list ”）。 那么，当一个非字符串被赋值给了这个 list 时，开发工具就能够检测到这样的做法可能存在错误。 例如：
```
def names = new Array<String>();
names.addRange(['Seth', 'Kathy', 'Lars']);
names.push(42); // 错误
```
另外一个使用泛型的原因是减少重复的代码。 泛型可以在多种类型之间定义同一个实现， 同时还可以继续使用检查模式和静态分析工具提供的代码分析功能。 例如，假设你创建了一个用于缓存对象的接口：
```
class ObjectCache {
  getByKey(key:string):Object;
  setByKey(key:string,value:Object):void;
}
```
后来发现需要一个相同功能的字符串类型接口，因此又创建了另一个接口：
```
 class StringCache {
   getByKey(key:string):String;
   setByKey(key:string,value:string):void;
}
```
后来，又发现需要一个相同功能的数字类型接口 … 这里你应该明白了。

泛型可以省去创建所有这些接口的麻烦。 通过创建一个带有泛型参数的接口，来代替上述接口：
```
 class Cache<T> {
   getByKey(key:string):T;
   setByKey(key:string,value:T):void;
}
```
在上面的代码中，T 是一个备用类型。 这是一个类型占位符，在开发者调用该接口的时候会指定具体类型。

# 库
## 申明库

## 使用库

# 元数据(注解)
使用元数据可以提供有关代码的其他信息。 元数据注释以字符 # 开头， 后跟对编译时常量 (如 deprecated) 的引用或对常量构造函数的调用。

对于所有 Ve 代码有两种可用注解：#deprecated 和 #override。 关于 #override 的使用， 参考 扩展类（继承）。 下面是使用 #deprecated 注解的示例：
```
class Television {
  /// _Deprecated: Use [turnOn] instead._
  #deprecated
   activate() {
    turnOn();
  }

  /// Turns the TV's power on.
  turnOn() {...}
}
```
可以自定义元数据注解。 下面的示例定义了一个带有两个参数的 #todo 注解：
```

```

# 注释
## 单行注释
单行注释以 // 开始。 所有在 // 和改行结尾之间的内容被编译器忽略。
```
fun main() {
  // TODO: refactor into an AbstractLlamaGreetingFactory?
  Console.print('Welcome to my Llama farm!');
}
```
## 多行注释
多行注释以 /* 开始， 以 */ 结尾。 所有在 /* 和 */ 之间的内容被编译器忽略 （不会忽略文档注释）。 多行注释可以嵌套。
```
fun main() {
  /*
   * This is a lot of work. Consider raising chickens.

  def larry:Llama =new Llama();
  larry.feed();
  larry.exercise();
  larry.clean();
   */
}
```