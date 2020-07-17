///<reference path='../util/array.ts'/>
namespace Ve.Lang {
    //ve base code...
    export var VeBaseCode: VeArray<{ name: string, code: string }> = new VeArray; 
    VeBaseCode.push({
        name: '/Any.ve', code: `package Ve{
	[nick("any")]
   export  interface Any{
	   toString():string;
   }
   [nick("int")]
   export  interface Int{
       new():int;
	   new(value:string):int;
   }
   [nick("number")]
   export  interface Number{
       new():number;
	   new(value:string):number;
   }
}





`});
    VeBaseCode.push({
        name: '/Array.ve', code: `package Ve{
    export interface Array<T>{
        readonly length:int;
        clear():void;
        exists(item:T):bool;
        exists(predict:(item:T)=>bool):bool;
        findIndex(item:T):int;
        findLastIndex(item:T):int;
        findIndex(predict:(item:T)=>bool):bool;
        find(predict:(item:T,at:int)=>bool):T;
        findLast(predict:(item:T,at:int)=>bool):T;
        findAll(predict:(item:T,at:int)=>bool):T[];
        append(item:T):void;
        prepend(item:T):void;
        insertAt(item:T,at:int):void;
        set(at:int,item:T):void;
        get(at:int):T;
        sum(predict:(item:T,at:int)=>number):number;
        avg(predict:(item:T,at:int)=>number):number;
        max(predict:(item:T,at:int)=>number):number;
        min(predict:(item:T,at:int)=>number):number;
        count(predict:(item:T,at:int)=>bool):number;
        sort(predict:(item:T,at:int)=>any,order:int):T[];
    }
}
`});
    VeBaseCode.push({
        name: '/Console.ve', code: `package Ve{
    export interface Console{
        log(message:any):void;
    }
}`});
    VeBaseCode.push({
        name: '/Date.ve', code: `package Ve {
    [nick("date")]
    export interface Date{
          new(dateString:string):Date;
          static readonly now:Date;
          year:int;
          month:int;
          day:int;
          weekday:int;
          readonly week:int;
          hour:int;
          minute:int;
          second:int;
          millis:int;
          add(format:string,num:int):Date;
          diff(from:date,to:date,format:string='day'):number;
          gap(from:date,to:date,format:string='day'):int;
          toString(format:string):string
    }
    [nick('color')]
    export interface Color{
         new():Color;
         new(colorFormat:string):Color;
         r:int;
         g:int;
         b:int;
         a:int;
         h:int;
         s:int;
         l:int;
         rgb:string;
         rgba:string;
         hex:string;
         hsl:string;
    }
}
`});
    VeBaseCode.push({
        name: '/File.ve', code: `package Ve{
   export  interface File{
	    new(filePath:string):File;
        content:string;
   }
}`});
    VeBaseCode.push({
        name: '/Math.ve', code: `package Ve{
    export interface Math{
        static PI:number;
        pow(a:number,index:number):number;
        add(...a:number[]):number;
        div(a:number,b:number):number;
        mul(a:number,b:number):number;
        sub(a:number,b:number):number;
        max(...a:number[]):number;
        min(...a:number[]):number;
        sum(...a:number[]):number;
        avg(...a:number[]):number;
        /**中位数*/
        media(...a:number[]):number;
        /**众数*/
        mode(...a:number[]):number[];
        sin(angle:number):number;
        cos(angle:number):number;
        tan(angle:number):number;
        asin(value:number):number;
        acos(value:number):number;
        atan(value:number):number;
        random(a:int,b:int):int;
    }
}`});
    VeBaseCode.push({
        name: '/Object.ve', code: `package Ve{
    export interface Object{
        
    }
}`});
    VeBaseCode.push({
        name: '/String.ve', code: `
package Ve {
    [nick("string")]
    export interface String {
        new():string;
        new(val:string):string;
        readonly length:int;
        readonly count:int;
        readonly chars:string[];
        replace(old:String,newString:string):string;
        [unqiue("replace1")]
        replace(match:Regex,newString:string):string;
        contain(...str:string[]):bool;
        containOfAny(...str:string[]):bool;
        indexOf(str:String):int;
        lastIndexOf(str:String):int;
        indexOfAny(...str:string[]):int;
        lastIndexOfAny(...str:string[]):int;
        toLower():String;
        toUpper():String;
        match(regex:Regex):bool;
        split(...str:string[]):string[];
        filter(...str:string[]):string;
        substring(from:int,size:int):string;
        substring(from:int):string;
        reserve():string;
        pick(...regex:Regex[]):string[];
        at(pos:int):string;
        start(...str:string[]):bool;
        end(...str:string[]):bool;
    }
    [nick('regex')]
    export interface Regex{
         new(regexString:string):Regex;
    }
}
`});
    VeBaseCode.push({
        name: '/Url.ve', code: `package Ve {
    [nick("url")]
    export interface Url {
        new(val:string):url;     
    }
}
`})
}