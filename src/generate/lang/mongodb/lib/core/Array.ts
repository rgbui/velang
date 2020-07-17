namespace Ve.Lang.Generate.mongodb {


    /***
     * 
     * 
     * 
     */
    export var genArray: Record<string, Record<string, any>> = {
        'Ve.Core.Array': {
            length: '{$size:@caller}',
            first: `{$first:@caller}`,
            last: `{$last:@caller}`,
            //reversed: '@(caller).map(x=>x).reverse()',
            isEmpty: `{$eq:[{$size:@caller},0]}`,
            isNotEmpty: `{$ne:[{$size:@caller},0]}`,
            //clear: `@(caller).splice(0,@(caller).length)`,
            exists: `{ $in: [@node.item,@(caller)]}`,
            //exists1: `@(caller).some(@predict)`,
           // every: `(@(caller).every(@predict))`,
           // findIndex: `@(caller).findIndex(x=>x==@item)`,
           // findIndex1: `@(caller).findIndex(@predict)`,
           // findLastIndex: `@(caller).findLastIndex(x=>x==@item)`,
           // findLastIndex1: `@(caller).findLastIndex(x=>x==@item)`,
           // find: `@(caller).find(@predict)`,
          //  findLast: ``,
           // findAll: `@(caller).filter(@predict)`,
          //  skip: ``,
         //   limit: ``,
           // range: ``,
           // remove: `@(caller).splice(@(caller).findIndex(x=>x==@item),1)`,
           // remove1: `@(caller).splice(@(caller).findIndex(@predict),1)`,
          //  removeAt: `@(caller).splice(@at,1)`,
         //   removeAll: ``,
           // each: `@(caller).forEach(@predict)`,
          //  eachReverse: ``,
         //   append: `@(caller).push(@item)`,
        //    prepend: `@(caller).splice(0,0,@item)`,
         //   insert: `@(caller).splice(@at,0,@item)`,
        //    insertMany: ``,
          //  set: `@(caller)[@at]=@item`,
         //   get: `@(caller)[@at]`,
         //   sum: `@(caller).map(@predict)`,
         //   avg: ``,
         //   max: ``,
         //   min: ``,
         //   join: ``,
         //   findMax: ``,
         //   findMin: ``,
         //    count: `@(caller).filter(@predict).length`,
         //   sort: ``,
         //    map: `@(caller).map(@predict)`
        }
    }
}