namespace Ve.Lang.Generate.nodeJS {

    export var genString:  apiPackage= {
        'Ve.Core.String': {
            length: '@(caller).length',
            isEmpty: `(@caller===""||@caller===null||@caller===undefined)`,
            isNotEmpty: `!(@caller===""||$caller===null||$caller===undefined)`,
            chars: `@(caller).split("")`,
            replace: `@(caller).replace(new RegExp(@old,"gm"),@str)`,
            replace1: `@(caller).replace(@match,@str)`,
            contains: `@(caller).indexOf(@str)>-1`,
            indexOf: `@(caller).indexOf(@str)`,
            lastIndexOf: `@(caller).lastIndexOf(@str)`,
            toLower: `@(caller).toLowerCase()`,
            toUpper: `@(caller).toUpperCase()`,
            padLeft: `new Array(@width - @(caller).length + 1).join(@padding||'')+@(caller)`,
            padRight: `@(caller) + new Array(@width - @(caller).length + 1).join(@padding|| '')`,
            match: `@(caller).match(@regex)[0]`,
            matchs: `@(caller).match(new RegExp(@(regex).toString(),"gm"))`,
            isMatch: `@regex.test(@caller)`,
            split: `@(caller).split(new RegExp(@str,"gm"))`,
            substring: `@(caller).substring(@startIndex,@endIndex)`,
            reserve: `@(caller).split("").reserve().join("")`,
            startsWith: `@(caller).startsWith(@str)`,
            endsWith: `@(caller).endsWith(@str)`,
            trim: `@(caller).trim()`,
            trimLeft: `@(caller).replace(/^[\s]+/g,"")`,
            trimRight: `@(caller).replace(/[\s]+$/g,"")`,
            toNumber: `(isNaN(parseFloat(@caller))?@defaultValue: parseFloat(@caller))`,
            toInt: `(isNaN(parseInt(@caller))?@defaultValue: parseInt(@caller))`,
            '+': `@caller+@other`
        }
    }
}