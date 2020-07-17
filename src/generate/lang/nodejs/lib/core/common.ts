namespace Ve.Lang.Generate.nodeJS {

    export var genCommon: apiPackage={
        'Ve.Core.Any': {
            isNull: `(@caller===null||typeof @caller=="undefined")`,
            isNotNull: `!(@caller===null||typeof @caller=="undefined")`,
            toString: `(@caller===null||typeof @caller=="undefined")?"null":@(caller).toString()`,
            '==': `@caller==@other`,
            "!=": '@caller!=@other'
        },
        'Ve.Core.Null': {

        },
        'Ve.Core.Bool': {
            "&&": `@caller&&@other`,
            '||': `@caller||@other`
        }
    }
}