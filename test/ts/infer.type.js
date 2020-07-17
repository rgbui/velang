var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Test;
        (function (Test) {
            function testExpressInferType(code, isRun, args, thisObjectArgs) {
                if (isRun == false)
                    return;
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
            testExpressInferType('1+"ssss"', false);
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
            testExpressInferType(`用户ID==@ID&&结果==@密码`, false, [
                { text: '用户ID', type: 'string' },
                { text: '结果', type: 'string' }
            ], [
                { text: 'ID', type: 'string' },
                { text: '密码', type: 'string' }
            ]);
            testExpressInferType(`@title.contains(关键词)&&@是否推送至公众号==是否推荐`, false, [
                { text: '关键词', type: 'string' },
                { text: '是否推荐', type: 'bool' }
            ], [
                { text: 'title', type: 'string' },
                { text: '是否推送至公众号', type: 'bool' }
            ]);
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
            ]);
        })(Test = Lang.Test || (Lang.Test = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=infer.type.js.map