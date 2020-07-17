var VeCodeTest;
(function (VeCodeTest) {
    console.log(Ve.Lang.Outer.TranslateSQLExpressLangCode('(@手机号==帐号||@姓名==帐号)&&@密码==密码', [
        { text: '帐号', type: 'string' },
        { text: '密码', type: 'string' }
    ], [
        { text: '@手机号', type: 'string' },
        { text: '@姓名', type: 'string' },
        { text: '@密码', type: 'string' }
    ], 'mongodb'));
})(VeCodeTest || (VeCodeTest = {}));
//# sourceMappingURL=outer.js.map