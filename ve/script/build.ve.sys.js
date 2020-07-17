

require('../../../app/common/array.js');
require('../../../app/common/string.js');
let fo = require("../../../app/common/fo").fo;
var path = require('path');
fo.write(path.join(__dirname, "../../dist/ve.sys.js"), fo.read(path.join(__dirname, "../../dist/ve.js")) + "\nmodule.exports=Ve;");
fo.copyFile(path.join(__dirname, "../../dist/ve.d.ts"), path.join(__dirname, "../../dist/ve.sys.d.ts"));