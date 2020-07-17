namespace Ve.Lang.Generate.mongodb {

    export var genNumber: apiPackage = {
        'Ve.Core.Number': {
            'isNegative': `{$lt:[@caller,0]}`,
            'abs': `{$abs:[@caller]}`,
            'ceil': `{$ceil:[@caller]}`,
            'floor': `{$floor:[@caller]}`,
            'round': `{$round:[@caller]}`,
            'toInt': `{$toInt:@caller}`,
            "%": `{$mod:[@caller,@other]}`,
            "*": `{$multiply:[@caller,@other]}`,
            "+": `{$add:[@caller,@other]}`,
            "-": `{$subtract:[@caller,@other]}`,
            "/": `{$divide:[@caller,@other]}`,
            "<": `{$lt:[@caller,@other]}`,
            "<=": `{$lte:[@caller,@other]}`,
            ">": `{$gt:[@caller,@other]}`,
            ">=": `{$gte:[@caller,@other]}`,
            "parse": `{$toDecimal:@caller}`,
        },
        'Ve.Core.Int': {
            'isEven': '{$eq:[@caller,{$mod:[@caller,2]}]}',
            'isOdd': '{$eq:[@caller,{$mod:[@caller,1]}]}',
            "%": `{$mod:[@caller,@other]}`,
            "*": `{$multiply:[@caller,@other]}`,
            "+": `{$add:[@caller,@other]}`,
            "-": `{$subtract:[@caller,@other]}`,
            "/": `{$divide:[@caller,@other]}`,
            "<": `{$lt:[@caller,@other]}`,
            "<=": `{$lte:[@caller,@other]}`,
            ">": `{$gt:[@caller,@other]}`,
            ">=": `{$gte:[@caller,@other]}`,
            "parse": `{$toInt:@caller}`,
            //"tryParse": `(isNaN(parseInt(@caller))?@defalutValue: parseInt(@caller))`
        },
        'Ve.Core.Double': {
            "%": `{$mod:[@caller,@other]}`,
            "*": `{$multiply:[@caller,@other]}`,
            "+": `{$add:[@caller,@other]}`,
            "-": `{$subtract:[@caller,@other]}`,
            "/": `{$divide:[@caller,@other]}`,
        }
    }
}