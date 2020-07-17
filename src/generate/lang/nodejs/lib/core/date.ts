namespace Ve.Lang.Generate.nodeJS {


    /***
     * 
     * 计算一年中的第几周 参考https://www.jianshu.com/p/aa6dd016db26
     * 
     */
    export var genDate: apiPackage = {
        'Ve.Core.Date': {
            year: `@(caller).getFullYear()`,
            month: `(@(caller).getMonth()+1)`,
            day: `@(caller).getDate()`,
            weekday: '(@(caller).getDay()+1)',
            week: '',
            hour: '@(caller).getHours()',
            minute: `@(caller).getMinutes()`,
            second: `@(caller).getSeconds()`,
            millis: '@(caller).getMilliseconds()',
            y: '@(caller).getFullYear()',
            m: '(@(caller).getMonth()+1)',
            d: '@(caller).getDate()',
            w: '(@(caller).getDay()+1)',
            h: '@(caller).getHours()',
            min: '@(caller).getMinutes()',
            s: '@(caller).getSeconds()',
            ms: '@(caller).getMilliseconds()',
            add: ``,
            diff: ``,
            toString1: ``,
            "<": `@(caller).getTime()<@(other).getTime()`,
            "<=": `@(caller).getTime()<=@(other).getTime()`,
            ">": `@(caller).getTime()>@(other).getTime()`,
            ">=": `@(caller).getTime()>=@(other).getTime()`,
            'parse': ``,
            'now': `new Date()`
        }
    }
}