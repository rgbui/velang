namespace Ve.Lang.Test {


    function testType(type, isRun: boolean = true) {
        if (!isRun) return;
        var result = Ve.Lang.Outer.pickVeTypeFromCode(type);
        console.log(result);
    }
    testType(`
    {
        "id": int,
        "cate": "string",
        "name": "string",
        "tel": "string"
    }[]
      `, false);

    function testCode(code, isRun: boolean = true) {
        if (!isRun) return;
        var result = Ve.Lang.Outer.TranslateExpressCode(code,'js');
        console.log(result);
    }
    testCode(`{"网站名":"","网址":"","LOGO":"/资源/图片.png","ID":"","显示":false}`);


}