namespace Ve.Lang.Generate.mongodb {


    /***
     * 
     * 
     * 
     */
    export var genMath: apiPackage = {
        'Ve.Core.Math': {
            PI: `3.14159`,
            E: `2.718`,
            LN2: '0.693',
            LN10: '2.302',
            LOG2E: '1.414',
            log10E: '0.434',
            SQRT1_2: '0.707',
            SQRT2: '1.414',
            pow: `{$pow:[@num]}`,
            sin: `{$sin:[@num]}`,
            cos: `{$cos:[@num]}`,
            tan: `{$tan:[@num]}`,
            asin: `{$asin:[@num]}`,
            acos: `{$acos:[@num]}`,
            atan: `{$atan:[@num]}`,
            sqrt: `{$sqrt:[@num]}`,
            log: `{$log:[@num]}`,
            abs: `{$abs:[@num]}`,
            round: `{$round:[@num]}`,
            ceil: `{$ceil:[@num]}`,
            floor: `{$floor:[@num]}`

        }
    }
}