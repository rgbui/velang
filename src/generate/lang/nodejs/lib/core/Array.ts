namespace Ve.Lang.Generate.nodeJS {


    /***
     * 
     * 
     * 
     */
    export var genArray: apiPackage = {
        'Ve.Core.Array': {
            length: '@(caller).length',
            first: `(@(caller).length>0?@(caller)[0]:null)`,
            last: `(@(caller).length>0?@caller[@(caller).length-1]:null)`,
            reversed: '@(caller).map(x=>x).reverse()',
            isEmpty: `(@(caller).length==0?true:false)`,
            isNotEmpty: `(@(caller).length==0?false:true)`,
            clear: `@(caller).splice(0,@(caller).length)`,
            exists: `@(caller).some(x=>x==@item)`,
            exists1: `@(caller).some(@predict)`,
            every: `(@(caller).every(@predict))`,
            findIndex: `@(caller).findIndex(x=>x==@item)`,
            findIndex1: `@(caller).findIndex(@predict)`,
            findLastIndex: `@(caller).findLastIndex(x=>x==@item)`,
            findLastIndex1: `@(caller).findLastIndex(x=>x==@item)`,
            find: `@(caller).find(@predict)`,
            findLast: ``,
            findAll: `@(caller).filter(@predict)`,
            skip: ``,
            limit: ``,
            range: ``,
            remove: `@(caller).splice(@(caller).findIndex(x=>x==@item),1)`,
            remove1: `@(caller).splice(@(caller).findIndex(@predict),1)`,
            removeAt: `@(caller).splice(@at,1)`,
            removeAll: ``,
            each: `@(caller).forEach(@predict)`,
            eachReverse: ``,
            append: `@(caller).push(@item)`,
            prepend: `@(caller).splice(0,0,@item)`,
            insert: `@(caller).splice(@at,0,@item)`,
            insertMany: ``,
            set: `@(caller)[@at]=@item`,
            get: `@(caller)[@at]`,
            sum: `@(caller).map(@predict)`,
            avg: ``,
            max: ``,
            min: ``,
            join: ``,
            findMax: ``,
            findMin: ``,
            count: `@(caller).filter(@predict).length`,
            sort: ``,
            map: `@(caller).map(@predict)`
        }
    }
}