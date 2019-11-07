var VeCodeTest;
(function (VeCodeTest) {
    var Runner = Ve.Lang.Runner;
    var print = (code, props, isPrint) => {
        if (isPrint != false) {
            var runner = new Runner();
            var result = runner.compileExpress(code, ...props);
            console.log(result);
        }
    };
    print(`a+1+b.length`, [{ text: "a", type: 'int', value: 1 }, { text: "b", type: 'string', value: '你好呀' }]);
})(VeCodeTest || (VeCodeTest = {}));
//# sourceMappingURL=run.js.map