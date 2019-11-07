var VeCodeTest;
(function (VeCodeTest) {
    var AstParser = Ve.Lang.AstParser;
    var print = (code, props, isPrint) => {
        if (isPrint != false) {
            var ast = new AstParser();
            ast.on('error', function (result) {
                console.error(result);
            });
            var result = ast.compileExpress(code, props);
            console.log(result);
        }
    };
    print(`a+123`, [{ text: "a", type: 'int' }], false);
    print(`account.count+1>234&&sex==true&&"sjsis"!=1233`, [{ text: 'account', type: 'string' }, { text: 'sex', type: 'bool' }], false);
    print(`(@手机号==帐号||@姓名==帐号)&&@密码==密码`, [
        { text: '帐号', type: 'string' },
        { text: '密码', type: 'string' },
        { text: '@手机号', type: 'string' },
        { text: '@姓名', type: 'string' },
        { text: '@密码', type: 'string' }
    ]);
})(VeCodeTest || (VeCodeTest = {}));
//# sourceMappingURL=expression.js.map