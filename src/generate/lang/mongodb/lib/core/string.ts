namespace Ve.Lang.Generate.mongodb {

    export var genString: Record<string, Record<string, any>> = {
        'Ve.Core.String': {
            length: '{$strLenBytes:@caller}',
            isEmpty: `{@eq:[{$strLenBytes:@caller},0]} `,
            isNotEmpty: `{@ne:[{$strLenBytes:@caller},0]}`,
            //chars: `@(caller).split("")`,
            //replace: `@(caller).replace(new RegExp(@old,"gm"),@str)`,
            //replace1: `@(caller).replace(@match,@str)`,
            
            contains: `{$regexMatch:{input:@(caller),regex:new RegExp(@str)}}`,

            //indexOf: `@(caller).indexOf(@str)`,
            //lastIndexOf: `@(caller).lastIndexOf(@str)`,

            toLower: `{$toLower:[@(caller)]}`,
            toUpper: `{$toUpper:[@(caller)]}`,


            isMatch: `{$regexMatch:{input:@caller,regex:@regex}}`,

            substring: `{$substr: [@(caller),@startIndex,@endIndex]}`,
            startsWith: `{$regexMatch:{input:@(caller),regex:new RegExp("^"+@str)}}`,
            endsWith: `{$regexMatch:{input:@(caller),regex:new RegExp(@str+"$")}}`,
            trim: `{$trim:{input: @(caller)}}`,
            trimLeft: `{$ltrim:{input: @caller}}`,
            trimRight: `{$rtrim:{input: @caller}}`,
            toNumber: `{@toDecimal:@call}`,
            toInt: `{@toInt:@call}`,
            '+': `{$concat:[@caller,@other]}`
        }
    }
}