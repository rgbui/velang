///<reference path='../../../dist/ved.d.ts'/>
namespace Ve.Lang.Test {
    var editor = new Ved.Editor(document.querySelector('#ved-editor'), { fontSize: 14, height: 400 });
    editor.on('error', (error) => {
        console.log(error);
    });
    editor.on('mousedown', (cursor) => {
        //console.log(cursor.position.pos);
    })
    // editor.on('createHistory', (history) => {
    //     console.log(history.get())
    // });
    // editor.on('writeSnapshot', (snap) => {
    //     console.log(snap.get());
    // })
    //editor.loadType('{}');

    // editor.load(`package Ve.Core;

    // out interface Array<T>{
    //         ctor();
    //         readonly length:int;
    //         readonly first:T;
    //         readonly last:T;
    //         readonly reversed:T[];
    //         readonly isEmpty:bool;
    //         readonly isNotEmpty:bool;
    //         clear():void;
    //         exists(item:T):bool;
    //         #only('exists1')
    //         exists(predict:(item:T,at:int)->bool):bool;
    //         every(predict:(item:T,at:int)->bool):bool;
    //         findIndex(item:T):int;
    //         #only('findIndex1')
    //         findIndex(predict:(item:T)->bool):bool;

    //         findLastIndex(item:T):int;
    //         #only('findLastIndex1')
    //         findLastIndex(predict:(item:T)->bool):int;

    //         find(predict:(item:T,at:int)->bool):T;
    //         findLast(predict:(item:T,at:int)->bool):T;
    //         findAll(predict:(item:T,at:int)->bool):T[];

    //         skip(at:int):T[];

    //         limit(at:int,size:int):T[];
    //         //包括startIndex,但是不包括endIndex
    //         range(startIndex:int,endIndex:int):T[];

    //         remove(predict:(item:T,at:int)->bool);
    //         #only('remove1')
    //         remove(item:T);
    //         removeAt(at:int);
    //         removeAll(predict:(item:T,at:int)->bool);

    //         each(predict:(item:T,at:int)->void);
    //         eachReverse(predict:(item:T,at:int)->void);

    //         append(item:T):void;
    //         prepend(item:T):void;
    //         insert(item:T,at?:int):void;
    //         insertMany(items:T[],at?:int):void;

    //         set(at:int,item:T):void;
    //         get(at:int):T;
    //         sum(predict:(item:T,at:int)->number):number;
    //         avg(predict:(item:T,at:int)->number):number;
    //         max(predict:(item:T,at:int)->number):number;
    //         min(predict:(item:T,at:int)->number):number;
    //         join(predict:(item:T,at:int)->string):string;
    //         findMax(predict:(item:T,at:int)->number):T;
    //         findMin(predict:(item:T,at:int)->number):T;
    //         count(predict:(item:T,at:int)->number):number;
    //         sort(predict:(item:T,at:int)->any,rank=1):T[];
    //         map<R>(predict:(item:T,at:int)->R):R[];
    // }
    // `);
    editor.load(`xx+123789`);
}