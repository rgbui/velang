namespace Ve.Lang.Generate.mongodb {

    export var genCommon: Record<string,Record<string,any>>={
        'Ve.Core.Any': {
            isNull: `{$eq:[@caller,null]}`,
            isNotNull: `{$ne:[@caller,null]}`,
            toString: `{$toString:@caller}`,
            '==': `{$eq:[@caller,@other]}`,
            "!=": '{$ne:[@caller,@other]}'
        },
        'Ve.Core.Null': {

        },
        'Ve.Core.Bool': {
            "&&": `{$and:[@caller,@other]}`,
            '||': `{$or:[@caller,@other]}`
        }
    }
}