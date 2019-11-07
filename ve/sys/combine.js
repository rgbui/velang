
require('../../../common/array.js');
require('../../../common/string.js');

var fo = require("../../../common/fo.js").fo;
var ves = fo.search(__dirname, { file: true, ext: ".ve" });
var code = `namespace Ve.Lang {
    //ve base code...
    \texport var VeBaseCode:VeArray<{name:string,code:string}>=new VeArray;
${ves.map(ve => `\t\t\tVeBaseCode.push({name:'${ve.replace(__dirname, '').replace(/\\/g, '/')}',code:\`${fo.read(ve)}\`})`).join(";\n")}
}`;
var path = require("path");
fo.write(path.join(__dirname, 've.base.code.ts'), code);
