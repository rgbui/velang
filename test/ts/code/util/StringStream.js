var VeLangTest;
(function (VeLangTest) {
    var _ = function (c, consider = true) { if (consider && typeof c == 'function')
        c(); };
    _(() => {
        let sr = new Ve.Lang.StringStream('abccc"\\\""');
        console.log(sr.till('c'), sr.pos);
        console.log(sr.till('g'), sr.pos);
        console.log(sr.till('c'), sr.pos);
        console.log(sr.till('c', true), sr.pos);
        console.log(sr.till("\"", true), sr.pos);
        console.log(sr.till("\"", true, (str) => {
            if (str.endsWith("\\\""))
                return false;
        }), sr.pos);
    });
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=StringStream.js.map