///<reference path='../../dist/ve.d.ts'/>
namespace Ve.Lang.Test {
    function testExpressInferType(code: string, isRun?: boolean, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]) {
        if (isRun == false) return;
        console.log(code);
        var type = Ve.Lang.Outer.inferExpressType(code, args, thisObjectArgs);
        console.log(type);
    }
    testExpressInferType(`1`, false);
    testExpressInferType(`"sssss@{a}sssss"`, false);
    testExpressInferType(`true`, false);
    testExpressInferType(`null`, false);
    testExpressInferType('"rgba(255,255,255,1)"Color', false);
    testExpressInferType('1+2', false);
    /***类型不一致，类型中左右两边非继承，那么如果一方有字符串的话，那么别一方非字符串会默认调用.toString()方法 */
    testExpressInferType('1+"ssss"', false);
    /****ok */
    testExpressInferType(`1+2.3`, false);
    testExpressInferType(`true&&false`, false);
    testExpressInferType(`a>b?1:2`, false);
    testExpressInferType(`a>b?1:2.3`, false);
    testExpressInferType(`a.length`, false, [{ text: 'a', type: 'string' }]);
    testExpressInferType(`{a:a.length,b:a+a}`, false, [{ text: 'a', type: 'string' }]);
    testExpressInferType(`(c:string)->{return c+a};`, false, [{ text: 'a', type: 'string' }]);
    testExpressInferType(`(c:string)->c+a`, false, [{ text: 'a', type: 'string' }]);
    testExpressInferType(`(c:string)->{return {a:a,c:c.length,a:a.chars}}`, false, [{ text: 'a', type: 'string' }]);
    testExpressInferType(`{a:@a,c:@a.length}`, false, [], [{ text: 'a', type: 'string' }]);

    //`用户ID==@ID&&结果==@密码`
    testExpressInferType(`用户ID==@ID&&结果==@密码`, false, [
        { text: '用户ID', type: 'string' },
        { text: '结果', type: 'string' }
    ],
        [
            { text: 'ID', type: 'string' },
            { text: '密码', type: 'string' }
        ]);
    testExpressInferType(`@title.contains(关键词)&&@是否推送至公众号==是否推荐`, false, [
        { text: '关键词', type: 'string' },
        { text: '是否推荐', type: 'bool' }
    ],
        [
            { text: 'title', type: 'string' },
            { text: '是否推送至公众号', type: 'bool' }

        ]
    );
    testExpressInferType(`{标题：@标题，分类：@分类，封面：@封面，是否推到公众号：@是否推送至公众号==true?"是":"否"，ID:@ID}`, false, [], [
        { text: '标题', type: 'string' },
        { text: '分类', type: 'string' },
        { text: '封面', type: 'string' },
        { text: 'ID', type: 'string' },
        { text: '是否推送至公众号', type: 'bool' },
    ]);
    testExpressInferType(`{是否推到公众号：@是否推送至公众号==true?"是":"否"}`, true, [], [
        { text: '标题', type: 'string' },
        { text: '分类', type: 'string' },
        { text: '封面', type: 'string' },
        { text: 'ID', type: 'string' },
        { text: '是否推送至公众号', type: 'bool' },
    ])
}