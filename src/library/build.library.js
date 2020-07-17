var __dir = '../../../../../'
require(__dir + 'App/app/common/array.js');
require(__dir + 'App/app/common/string.js');

var fo = require(__dir + "App/app/common/fo.js").fo;
var ves = fo.search(__dirname, {
    file: true,
    ext: ".ve"
});
var code = `namespace Ve.Lang {
    //ve core library code ...
    \texport var VeLibraryCodes:Util.List<{name:string,code:string}>=new Util.List;
${ves.map(ve => `\t\t\tVeLibraryCodes.push({name:'${ve.replace(__dirname, '').replace(/\\/g, '/')}',code:\`${fo.read(ve)}\`})`).join(";\n")}
}`;
var path = require("path");
fo.write(path.join(__dirname, 'library.codes.ts'), code);