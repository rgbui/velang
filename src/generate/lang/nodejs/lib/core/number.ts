namespace Ve.Lang.Generate.nodeJS {

    export var genNumber:  apiPackage = {
        'Ve.Core.Number':{
            'isNegative':`(@caller>=0?false:true)`,
            'isNaN':`isNaN(@caller)`,
            'abs':`Math.abs(@caller)`,
            'ceil':`Math.ceil(@caller)`,
            'floor':`Math.floor(@caller)`,
            'round':`Math.round(@caller)`,
            'toFixed':`@(caller).toFixed(@fractionDigits)`,
            'toInt':`parseInt(@(caller).toString().split(".")[0])`,
            "%": `@caller%@other`,
            "*": `@caller+@other`,
            "+": `@caller+@other`,
            "-": `@caller-@other`,
            "/": `@caller/@other`,
            "<": `@caller<@other`,
            "<=": `@caller<=@other`,
            ">": `@caller>@other`,
            ">=": `@caller>=@other`,
            "parse": `parseFloat(@caller)`,
            "tryParse": `(isNaN(parseFloat(@caller))?@defalutValue: parseFloat(@caller))`,
        },
        'Ve.Core.Int': {
            'isEven': '@caller%2==0',
            'isOdd': '@caller%2==1',
            "%": `@caller%@other`,
            "*": `@caller+@other`,
            "+": `@caller+@other`,
            "-": `@caller-@other`,
            "/": `@caller/@other`,
            "<": `@caller<@other`,
            "<=": `@caller<=@other`,
            ">": `@caller>@other`,
            ">=": `@caller>=@other`,
            "parse": `parseInt(@caller)`,
            "tryParse": `(isNaN(parseInt(@caller))?@defalutValue: parseInt(@caller))`
        },
        'Ve.Core.Double': {
            "%": `@caller%@other`,
            "*": `@caller+@other`,
            "+": `@caller+@other`,
            "-": `@caller-@other`,
            "/": `@caller/@other`,
        }
    }
}