namespace Ve.Lang.Generate.mongodb {


    /***
     * 
     * 计算一年中的第几周 参考https://www.jianshu.com/p/aa6dd016db26
     * 
     */
    export var genDate:apiPackage = {
        'Ve.Core.Date': {
            year: `{$year:[@caller]}`,
            month: `{$month:[@caller]}`,
            day: `{$dayOfMonth:[@caller]}`,
            weekday: '{$dayOfWeek:[@caller]}',
            yearday: '{$dayOfYear:[@caller]}',
            week: '{$week:[@caller]}',
            hour: '{$hour:[@caller]}',
            minute: `{$minute:[@caller]}`,
            second: `{$second:[@caller]}`,
            millis: '{$millisecond:[@caller]}',
            y: '{$year:[@caller]}',
            m: '{$month:[@caller]}',
            d: '{$dayOfMonth:[@caller]}',
            w: '{$week:[@caller]}',
            h: '{$hour:[@caller]}',
            min: '{$minute:[@caller]}',
            s: '{$second:[@caller]}',
            ms: '{$millisecond:[@caller]}',
            add: ``,
            adds: ``,
            sub: `{$floor:{$divide:[{$subtract:[@caller,@date]},60 * 60 * 24 * 1000] }}`,
            subs: ``,
            toString1: `{$dateToString:{format: "%H:%M:%S:%L%z",date:@caller,timezone: "+08:00" } }`,
            "<": `{$lt:[@caller,@other]}`,
            "<=": `{$lte:[@caller,@other]}`,
            ">": `{$gt:[@caller,@other]}`,
            ">=": `{$gte:[@caller,@other]}`,
            parse: ``,
            now: `new Date()`
        }
    }
}