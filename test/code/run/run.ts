namespace VeCodeTest {

    import Runner = Ve.Lang.Runner;
    var print = (code: string, props?: Ve.Lang.Outer.VeProp[], isPrint?: boolean) => {
        if (isPrint != false)
        {
            var runner = new Runner();
            var result = runner.compileExpress(code, ...props);
            console.log(result);
        }
    }
    print(`a+1+b.length`, [{ text: "a", type: 'int', value: 1 }, { text: "b", type: 'string', value: '你好呀' }]);
}