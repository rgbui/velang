namespace Ve.Lang {
    //ve core library code ...
    	export var VeLibraryCodes:Util.List<{name:string,code:string}>=new Util.List;
			VeLibraryCodes.push({name:'/core/Array.ve',code:`package Ve.Core;

out interface Array<T>{
        readonly length:int;
        readonly first:T;
        readonly last:T;
        readonly reversed:T[];
        readonly isEmpty:bool;
        readonly isNotEmpty:bool;
        clear():void;
        exists(item:T):bool;
        #only('exists1')
        exists(predict:(item:T)->bool):bool;
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
   operator &&(other:bool):bool;
   operator ||(other:bool):bool;
}`});
			VeLibraryCodes.push({name:'/core/date.ve',code:`
package Ve.Core;
#alias('date')
out interface Date{
    ctor():Date;
    ctor(times:number):Date;
    ctor(year:int,month:int,day:int,hour:int, minute:int,second:int,millis:int):Date;
    year:int;
    //本月1..12
    month:int;
    //每月的一天1..31
    day:int;
    //一星期中的星期几
    readonly weekday:int;
    //一年中的每几周
    readonly week:int;
    //一天中的小时，以24小时制0..23
    hour:int;
    //分钟0...59
    minute:int;
    //秒0...59
    second:int;
    //微秒0...999
    millis:int;
    readonly yyyy:int;
    readonly yy:int;
    readonly MM:int;
    readonly dd:int;
    readonly HH:int;
    readonly hh:int; 
    readonly mm:int;
    readonly ss:int;
    readonly zzz:int;
    //当前时间加上2.5天
    add(num:number,unit:string="day"):date;
    addGap(num:int,unit:string="day"):date;
    //当前时间相差2.5天
    diff(to:date,unit:string='day'):number;
    diffGap(to:date,unit:string='day'):int;
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
#alias('check')
out decorate interface Check{
    
}
#alias('only')
out decorate interface Only{
    ctor(name:string):Only;
}`});
			VeLibraryCodes.push({name:'/core/number.ve',code:`

package Ve.Core;
#alias('number')
out interface Number{
    ctor():number;
    ctor(str:string):number;
    ctor(value:number):number;
    readonly isNegative:bool;
    readonly isNaN:bool;
    //返回当前数的绝对值
    abs():int;
    ceil():int;
    floor():int;
    round():int;
    //返回this的小数点字符串表示形式
    toFixed(fractionDigits:int):string;
    toInt():int;
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
    static tryParse(str:string,defalutValue:number=0):number;
}

#alias('int')
out interface Int extends Number{
    ctor();
    ctor(str:string):Int; 
    ctor(value:int):int;
    readonly isEven:bool;
    readonly isOdd:bool;
    operator %(other:number):number;
    operator *(other:number):number;
    operator +(other:number):number;
    operator -(other:number):number;
    operator /(other:number):double;
    operator <(other:number):bool;
    operator <=(other:number):bool;
    operator >(other:number):bool;
    operator >=(other:number):bool;
    static parse(str:String):int;
    static tryParse(str:string,defalutValue:int=0):int;
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
    replace(old:String,newStr:string):string;
    #only("replace1");
    replace(match:Regex,newStr:string):string;
    contains(str:string):bool;
    indexOf(str:String):int;
    lastIndexOf(str:String):int;
    toLower():string;
    toUpper():string;
    padLeft(width:int,padding:string=' '):string;
    padRight(width:int,padding:string=' '):string;
    match(regex:Regex):string;
    matchs(regex:Regex):string[];
    isMatch(regex:Regex):bool;
    split(...str:string[]):string[];     
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
    stringMatch(input:string):string;
    stringMatchs(input:string):string[];
}`})
}