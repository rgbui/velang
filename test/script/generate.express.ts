namespace Ve.Lang.Test {
      var lang = Ve.Lang.Generate.GenerateLanguage.js;
      function testGenerateExpress(express: string,
            isRun: boolean = true,
            args?: Outer.VeProp[],
            thisObjectArgs?: Outer.VeProp[],
            options?: {
                  thisObjectName?: string;
                  parameterMapNames?: Record<string, any>;
            }) {
            if (!isRun) return
            var gc = new Ve.Lang.Generate.Generate();
            gc.on('error', function () {
                  console.log(arguments);
            })
            var code = gc.generateExpress(express, lang, args, thisObjectArgs, options);
            console.log(code);
      }
      testGenerateExpress(`a`, false);
      testGenerateExpress(`[{a:"ssss"}]`, false);
      testGenerateExpress(`"ssss".length`, false);
      testGenerateExpress(`"sssss".chars`, false);
      testGenerateExpress('a.chars', false, [{ text: 'a', type: 'string' }]);
      //testGenerateExpress('a<@a', true, [{ text: 'a', type: 'int' }], [{ text: 'a', type: 'int' }], { thisObjectName: 'x' });
      // testGenerateExpress('1+a<@a', true, [{ text: 'a', type: 'int' }], [{ text: 'a', type: 'int' }], { thisObjectName: 'x', parameterMapNames: { a: '____ffff' } });
      //testGenerateExpress(`数据==“我是中”`, true, [{ text: '数据', type: "Ve.Core.String" }], []);
      testGenerateExpress(`"a+@a"`, false, [{ text: 'a', type: 'Ve.Core.String' }]);
      testGenerateExpress(`"a\`\`+@a"`, false, [{ text: 'a', type: 'Ve.Core.String' }]);
      testGenerateExpress(`"a\`\`+@a"`, false, [{ text: 'a', type: 'Ve.Core.String' }]);
      testGenerateExpress(`{"网站名":"","网址":"","LOGO":"/资源/图片.png","ID":"","显示":false}`, false);
      testGenerateExpress(`@帐号==帐号&&密码==@密码`, false, [{ text: '帐号', type: 'Ve.Core.String' }, { text: '密码', type: 'Ve.Core.String' },], [{ text: '@ID', type: 'string' }, { text: '@日期', type: 'string' }, { text: '@帐号', type: 'string' }, { text: '@密码', type: 'string' }], {
            thisObjectName: '$',
            parameterMapNames: {
                  帐号: "___vvvgg___帐号",
                  密码: "___vvvgg___密码"
            }
      });
      testGenerateExpress('"还剩下@{120-次数}秒"', true, [{ "text": "次数", "type": "int" }]);

      testGenerateExpress(`ID==当前文档ID?'状态':'默认'`, false, [
            { "text": "ID", "type": "string" },
            { "text": "当前文档ID", "type": "string" }
      ]);
      testGenerateExpress(`ID==当前文档ID？“状态”:“默认”`, false, [
            { "text": "ID", "type": "string" },
            { "text": "当前文档ID", "type": "string" }
      ]);
      testGenerateExpress(`容器_模型.length>0?true:false`, true, [
            { "text": "显示", "type": "bool" },
            {
                  "text": "容器_模型",
                  "type": {
                        "unionType": "Array", "generics": [
                              {
                                    "props": [{ "key": "知识库ID", "type": "string" },
                                    { "key": "图标", "type": "string" }, { "key": "知识库名称", "type": "string" }, { "key": "所属者", "type": "string" }]
                              }
                        ]
                  }
            },
            { "text": "显示1", "type": "bool" },
            { "text": "显示2", "type": "bool" }]
      );
}
