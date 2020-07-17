namespace VeCodeTest {

    // console.log(Ve.Lang.Outer.pickArgsFromCode(null));
    // console.log(Ve.Lang.Outer.pickArgsFromCode(undefined));
    // console.log(Ve.Lang.Outer.pickArgsFromCode(``));
    // console.log(Ve.Lang.Outer.pickArgsFromCode(`a:int,b:string`));
    // console.log(Ve.Lang.Outer.pickArgsFromCode(`g:{a:string,b:color}`));
    // console.log(Ve.Lang.Outer.pickArgsFromCode(`k:file,c:string`));
    // console.log(Ve.Lang.Outer.pickArgsFromCode(`v:file[]`));

    // console.log(Ve.Lang.Outer.pickVePropFromCode(`a`));
    // console.log(Ve.Lang.Outer.pickVePropFromCode(`"1233"`));
    // console.log(Ve.Lang.Outer.pickVePropFromCode(`{a:123,b:"sjsisss"}`));
    // console.log(Ve.Lang.Outer.pickVePropFromCode(`['sss','eessss','efjsss']`));
    // console.log(Ve.Lang.Outer.pickVePropFromCode(`[1,2,3,4,5]`));
    // console.log(Ve.Lang.Outer.pickVePropFromCode(`{a:{s:{c:1223}},k:[{a:123}]}`));

    //console.log(Ve.Lang.Outer.TranslateExpressLangCode('A.indexOf("ssss")', [{ text: 'A', type: 'string' }], 'js'));

    //console.log(Ve.Lang.Outer.pickVePropFromCode(`[{键:"男",值：true},{键:"女",值：false}]`));

    console.log(Ve.Lang.Outer.TranslateSQLExpressLangCode('(@手机号==帐号||@姓名==帐号)&&@密码==密码', [
        { text: '帐号', type: 'string' },
        { text: '密码', type: 'string' }
    ],
        [
            { text: '@手机号', type: 'string' },
            { text: '@姓名', type: 'string' },
            { text: '@密码', type: 'string' }
        ], 'mongodb'));

}