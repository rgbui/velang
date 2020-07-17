var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Test;
        (function (Test) {
            var editor = new Lang.Ved.Editor(document.querySelector('#ved-editor'), { fontSize: 14, height: 400 });
            editor.on('error', (error) => {
                console.log(error);
            });
            editor.on('mousedown', (cursor) => {
            });
            editor.load(`xx+123789`);
        })(Test = Lang.Test || (Lang.Test = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=ved.js.map