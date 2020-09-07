namespace Ve.Lang {
    //ve core library code ...
    	export var VeLibraryCodes:Util.List<{name:string,code:string}>=new Util.List;
			VeLibraryCodes.push({name:'/core/Array.ve',code:`package Ve.Core;
out interface Array<T>{
        ctor();
        readonly length:int;
        readonly first:T;
        readonly last:T;
        readonly reversed:T[];
        readonly isEmpty:bool;
        readonly isNotEmpty:bool;
        clear():void;
        exists(item:T):bool;
        #only('exists1')
        exists(predict:(item:T,at:int)->bool):bool;
        every(predict:(item:T,at:int)->bool):bool;
        findIndex(item:T):int;
        #only('findIndex1')
        findIndex(predict:(item:T)->bool):bool;

        findLastIndex(item:T):int;
        #only('findLastIndex1')
        findLastIndex(predict:(item:T)->bool):int;

        find(predict:(item:T,at:int)->bool):T;
        findLast(predict:(item:T,at:int)->bool):T;
        findAll(predict:(item:T,at:int)->bool):T[];
        
        skip(at:int):T[];

        limit(at:int,size:int):T[];
        //包括startIndex,但是不包括endIndex
        range(startIndex:int,endIndex:int):T[];

        remove(predict:(item:T,at:int)->bool);
        #only('remove1')
        remove(item:T);
        removeAt(at:int);
        removeAll(predict:(item:T,at:int)->bool);

        each(predict:(item:T,at:int)->void);
        eachReverse(predict:(item:T,at:int)->void);

        append(item:T):void;
        prepend(item:T):void;
        insert(item:T,at?:int):void;
        insertMany(items:T[],at?:int):void;

        set(at:int,item:T):void;
        get(at:int):T;
        sum(predict:(item:T,at:int)->number):number;
        avg(predict:(item:T,at:int)->number):number;
        max(predict:(item:T,at:int)->number):number;
        min(predict:(item:T,at:int)->number):number;
        join(predict:(item:T,at:int)->string):string;
        findMax(predict:(item:T,at:int)->number):T;
        findMin(predict:(item:T,at:int)->number):T;
        count(predict:(item:T,at:int)->number):number;
        sort(predict:(item:T,at:int)->any,rank=1):T[];
        map<R>(predict:(item:T,at:int)->R):R[];
}`});
			VeLibraryCodes.push({name:'/core/common.ve',code:`package Ve.Core;
#alias('any');
out interface Any{
     readonly isNull:bool;
     readonly isNotNull:bool;
     toString():string;
     operator ==(other:bool):bool;
     operator !=(other:bool):bool;
}
#alias('null');
out interface Null{
  
}
#alias('bool')
out interface Bool{
   ctor();
   ctor(value:bool):Bool;
   operator &&(other:bool):bool;
   operator ||(other:bool):bool;
}
out interface Object{
    ctor();
}
out interface Console{
    print(str:string):void;
}`});
			VeLibraryCodes.push({name:'/core/console.ve',code:`package Ve.Core;
#alias('console')
out class Console{
    private ctor();
    static assert(predict:bool);
    static print(msg:string);
    static log(msg:string);
    static warn(msg:string);
    static error(error:Error);
    #only('error1')
    static error(error:string);
}`});
			VeLibraryCodes.push({name:'/core/date.ve',code:`
package Ve.Core;
#alias('date')
out interface Date{
    ctor():Date;
    ctor(dateFormat:string):Date;
    ctor(ticks:number):Date;
    ctor(year:int,month:int,day:int,hour:int,minute:int,second:int,millis:int):Date;
    //1970年1月1日 （UTC/GMT的午夜）开始所经过的秒数
    ticks:int;
    year:int;
    //本月1..12
    month:int;
    //每月的一天1..31
    day:int;
    //一年中的第几天
    readonly yearday:int;
    //一星期中的星期几
    readonly weekday:int;
    //一年中的第几周
    readonly week:int;
    //一天中的小时，以24小时制0..23
    hour:int;
    //分钟0...59
    minute:int;
    //秒0...59
    second:int;
    //微秒0...999
    millis:int;
    //年 简写
    readonly y:int;
    //月 简写
    readonly m:int;
    //周 简写
    readonly w:int;
     //日 简写
    readonly d:int;
     //时 简写
    readonly h:int;
     //分钟 简写
    readonly min:int; 
     //秒 简写
    readonly s:int;
     //毫秒 简写
    readonly ms:int;
    //加上几天（相隔），示例 :时间加上2天
    add(num:int,unit="day"):date;
    //加上几天 示例 :当前时间加上2.5天
    adds(num:number,unit="day"):date;
    //当前时间相差2.5天
    sub(to:date,unit='day'):int;
    subs(to:date,unit='day'):number;
    #only("toString1")
    toString(format:string):string;
    operator <(other:date):bool;
    operator <=(other:date):bool;
    operator >(other:date):bool;
    operator >=(other:date):bool;
    static parse(string:string,format="yyyy-mm-dd hh:mm:ss.zzz"):date;
    static now():date;
}
out interface Duration{

}`});
			VeLibraryCodes.push({name:'/core/decorate.ve',code:`

package Ve.Core;
#alias('alias');
out decorate interface Alias
{
    ctor(name:string):Alias;
}
#alias('deprecated');
out decorate interface Deprecated{
    ctor(message:string):Deprecated
}
#alias('only')
out decorate interface Only{
    ctor(name:string):Only;
}`});
			VeLibraryCodes.push({name:'/core/Error.ve',code:`package Ve.Core;
/**
* 错误
*/
out class Error{
    data:any;
    //错误码
    core:int;
    //帮助链接
    link:string;
    //错误信息
    message:string;
    source:string;
    stack:string;
}`});
			VeLibraryCodes.push({name:'/core/math.ve',code:`package Ve.Core;
out interface Math{
    private ctor():Math;
    //返回圆周率（约等于3.14159）。
    static PI:number;
    //返回算术常量 e，即自然对数的底数（约等于2.718）。
    static E:number;
    // 返回 2 的自然对数（约等于0.693）。
    static LN2:number;
    // 返回 10 的自然对数（约等于2.302）。
    static LN10:number;
    // 返回以 2 为底的 e 的对数（约等于 1.414）。
    static LOG2E:number;
    // 返回以 10 为底的 e 的对数（约等于0.434）。
    static LOG10E:number;
    // 返回返回 2 的平方根的倒数（约等于 0.707）。
    static SQRT1_2:number;
    // 返回 2 的平方根（约等于 1.414）。
    static SQRT2:number;

    static cos(angle:number):number;
    static sin(angle:number):number;
    static tan(angle:number):number;
    static acos(num:number):number;
    static asin(num:number):number;
    static atan(num:number):number;
    static atan2(num:number):number;

    static exp(num:number):number;
    static log(num:number):number;
    static pow(num:number):number;
    static sqrt(num:number):number;
    static max(...args:number[]):number;
    static min(...args:number[]):number;
    
    static abs(num:number):number;
    static ceil(num:number):int;
    static floor(num:number):int;
    static round(num:number):int;

}

out interface Random{

    private ctor():Random;
    static nextInt(max:int,min:int=0):int;
    static nextBool():bool;
    static nextNumber():number;
    /**
    * 随机指定位数的数字  
    */
    static number(digit:int):int;
    /**随机文体，包含数字，字母
    * @param digit 表示指定位数
    *
    */
    static chars(digit:int):string;
}

out interface Point{
    ctor(x:number,y:number);
    x:number;
    y:number;
    distanceTo(p1:point):number;
    operator * (factor:number):Point;
    operator + (other:Point):Point;
    operator - (other:Point):Point;
    operator == (other:Point):bool;
    operator != (other:Point):bool;
}

out interface Rectangle{
     ctor(left:number,top:number,width:number,height:number):Rectangle;
     ctor(p1:Point,p2:Point):Rectangle;
     top:number;
     left:number;
     width:number;
     height:number;
     readonly area:number;
     readonly right:number;
     readonly bottom:number;
     readonly topLeft:Point;
     readonly topRight:Point;
     readonly bottomLeft:Point;
     readonly bottomRight:Point;
     boundingBox(other:Rectangle):Rectangle;
     containsPoint(point:Point):bool;
     containsRectangle(other:Rectangle):bool;
     intersection(other:Rectangle):Rectangle;
     intersects(other:Rectangle):bool;
}
out interface Range{
    ctor(min:number,max:number):Range;
    ctor(min:number,minBoundary:bool,max:number,maxBoundary:bool):Range;
    min:number;
    minBoundary:bool=true;
    max:number;
    maxBoundary:bool=true;
    contains(num:number):bool;
    intersection(other:Range):Range;
    intersects(other:Range):bool;
}
`});
			VeLibraryCodes.push({name:'/core/number.ve',code:`package Ve.Core;
#alias('number')
out interface Number{
    ctor():number;
    ctor(str:string):number;
    ctor(value:number):number;
    readonly isNegative:bool;
    readonly isNaN:bool;
    //返回当前数的绝对值
    abs():number;
    ceil():int;
    floor():int;
    round():int;
    //返回this的小数点字符串表示形式
    toFixed(fractionDigits:int):string;
    operator %(other:number):number;
    operator *(other:number):number;
    operator +(other:number):number;
    operator -(other:number):number;
    operator /(other:number):double;
    operator <(other:number):bool;
    operator <=(other:number):bool;
    operator >(other:number):bool;
    operator >=(other:number):bool;
    static parse(str:string):number;
    static tryParse(str:string,defaultValue:number=0):number;
}

#alias('int')
out interface Int extends Number{
    ctor();
    ctor(str:string):Int; 
    ctor(value:int):int;
    //偶数
    readonly isEven:bool;
    //奇数
    readonly isOdd:bool;
    operator %(other:number):int;
    operator *(other:number):int;
    operator +(other:number):int;
    operator -(other:number):int;
    operator /(other:number):double;
    operator <(other:number):bool;
    operator <=(other:number):bool;
    operator >(other:number):bool;
    operator >=(other:number):bool;
    static parse(str:String):int;
    static tryParse(str:string,defaultValue:int=0):int;
}
#alias('double')
out interface Double extends Number{
     ctor():Double;
     ctor(str:string):Double;
     operator %(other:number):double;
     operator *(other:number):double;
     operator +(other:number):double;
     operator -(other:number):double;
     operator /(other:number):double;
}`});
			VeLibraryCodes.push({name:'/core/string.ve',code:`package Ve.Core;
#alias('string')
out interface String{
    ctor();
    ctor(val:string);
    readonly length:int;
    readonly isEmpty:bool;
    readonly isNotEmpty:bool;
    readonly chars:string[];
    replace(old:string,str:string):string;
    #only("replace1");
    replace(match:Regex,str:string):string;
    contains(str:string):bool;
    indexOf(str:string):int;
    lastIndexOf(str:string):int;
    toLower():string;
    toUpper():string;
    padLeft(width:int,padding:string=' '):string;
    padRight(width:int,padding:string=' '):string;
    match(regex:Regex):string;
    matchs(regex:Regex):string[];
    isMatch(regex:Regex):bool;
    split(str:string):string[];
    substring(startIndex:int,endIndex:int):string;
    reserve():string;
    startsWith(str:string):bool;
    endsWith(str:string):bool;
    trim():string;
    trimLeft():string;
    trimRight():string;
    toNumber(defaultValue=0):number;
    toInt(defaultValue=0):int;
    operator +(other:string):string;
}
out interface Regex{
    ctor(regexStr:string);
    hasMatch(input:string):bool;
    match(input:string):string;
    matchs(input:string):string[];
}`})
}