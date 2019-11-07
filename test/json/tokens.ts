


// var Ve;
// (function (Ve) {
//     var Test;
//     (function (Test) {

//         class Test {
//             main() {
//                 return a + b
//             }
//         }

//     })(Test = Ve.Test || (Ve.Test = {}))
// })(Ve || (Ve = {}))

// namespace VeLangTest {

//     import StringStream = Ve.Lang.StringStream;

//     var _f = Ve.Lang._f;
//     var print = Ve.Lang.print;
//     var VeSyntax = Ve.Lang.VeSyntax;
//     var deepCopy = Ve.Lang.deepCopy;
//     var Token = Ve.Lang.Token;
//     var State = Ve.Lang.State;


//     var _3 = `def a:{a:string,b:number}={a:'12233',b:123};`;
//     var _4 = `for(def i=0;i<20;i++) {
//         switch(i){
//             case 1:
//             break;
//             default:
//         }
//         break;
//         continue;
//   }`;




//     _f(function init() {
//         print(true, "tokens in ……")

//     }, false);

//     _f(function test() {
//         console.log("test-----------");

//         var Operators = VeSyntax.getOperators();
//         console.log(JSON.stringify(Operators));


//     }, false);

//     _f(function _StringStream() {

//         _f(function _till() {
//             var codes = [
//                 "abc333 &b33 222b33 wwwwzeqrw sb33 end_"
//             ]
//             var text = "b33";
//             var count = 10;
//             for (var i = 0; i < codes.length; i++) {
//                 var x = codes[i];
//                 //var res1 =  new StringStream(x).till(text,true);
//                 var args1 = new StringStream(x).till(text, true, function (str) {
//                     console.log("匹配结果 : ", { res: str });

//                     count--;
//                     if (count == 0) {
//                         return true;
//                     }
//                     return false;
//                 });
//                 print(true, { res1: "res1", args1: args1 });
//             }
//         }, false);

//         _f(function _till2() {
//             console.log("test2 &");

//             var codes = [
//                 // `:aab`,
//                 `:aa/b`,
//                 `:/2008-12-25/date`,
//                 // `/2008-12-25/date`,
//                 `/2008-12-25/date/`,
//                 `/2008-12-25/date/int`,
//                 // `b/c/d`,
//                 // `b/c/d/e`
//             ]
//             var text = `/`;
//             var count = 4;
//             var show = false;
//             for (var i = 0; i < codes.length; i++) {
//                 var x = codes[i];
//                 var res1, args1;
//                 //res1 =  new StringStream(x).till(text,true);
//                 args1 = new StringStream(x).till(text, false, function (str) {
//                     show = true;
//                     console.log("查找结果 : ", { res: str });
//                     count--;
//                     if (count == 0) {
//                         count = 4;
//                         return true;
//                     }
//                     return false;
//                 });
//                 print(true, "res ", { code: x, show: show, args1: args1 });
//             }
//         }, false);

//         _f(function _till_test() {
//             console.log("matchUnit…… into2 ");
//             var codes = [
//                 `def b:/2008-12-25/date;`
//             ];
//             var code = codes[1];
//             var stream = new StringStream(code);
//             stream.pos = 21;
//             print(true, "steam 1: ", stream);

//             var token = null;
//             var unit = {
//                 is: false,
//                 value: "",
//                 type: "",
//             }
//             var text = `/`;
//             var index = 0;
//             var is = true;
//             stream.till(text, true, function (str) {
//                 print(true, "till each str : ", { str: str });
//                 console.log("steam each", stream);
//                 switch (index) {
//                     case 0:
//                         //not word || null 
//                         is = str == "" ? true : VeSyntax.notWord.test(str);
//                         break;
//                     case 1:
//                         //not null and string 
//                         is = str != "" ? true : false;
//                         unit.value = str;
//                         break;
//                     case 2:
//                         //keyword(path,date,url……)                         
//                         var qs: Ve.Lang.VeArray<string> = new Ve.Lang.VeArray();
//                         qs.push('date');
//                         qs.push('path');
//                         var sr = new StringStream(str);
//                         var res = sr.match(qs);
//                         if (res) {
//                             var i = res.indexOf(stream.str)+res.length;
//                             stream.pos = i;
//                             is = true;
//                         } else {
//                             is = false;
//                         }
//                         unit.type = str;
//                         break;
//                 }
//                 index++;
//                 if (!is) return true;
//                 if (index == 3) {
//                     index = 0;
//                     return true;
//                 }
//                 return false;
//             });

//             unit.is = is;
//             if (unit.is == true) {
//                 token = new Token(13);
//                 token.value = unit.value;
//                 token.unit = unit.type;
//             }
//             print(true, "steam end: ", stream);
//             print(true, "unit end: ", unit);
//             console.log("matchUnit res token ", token);
//         }, false);

//         _f(function _test() {
//             console.log("test ...^");
//             var enums = Ve.Lang.VeBaseType;
//             console.log("enums ", enums);
//             var arrs = ["a", "b"];
//             var is = arrs.exists("a");
//             console.log("is ", is);

//             var maps = VeSyntax.getTypeMaps();
//             console.log("maps ", maps);



//         }, false);

//         _f(function _match() {
//             // /[^a-zA-Z\_$\u4E00-\u9FA5\d]+/ 特殊字符
//             _f(function _regex() {
//                 print(true, "into match_2 …… ");
//                 var reg = /[^a-zA-Z_\$\u4E00-\u9FA5\d]+/;
//                 var strs = ["a", "1", "", "aa", "1234", "在", "正则", "&", ","];
//                 console.log("strs ", strs);

//                 for (var i = 0; i < strs.length; i++) {
//                     var x = strs[i];
//                     var res = reg.test(x);
//                     console.log("x res ", x, res);
//                 }
//             }, false);

//             _f(function _1() {
//                 var sr = new StringStream("m2 \\\" b3 \" b33  a b33 b _ bc");
//                 console.log("sr ", sr);
//                 var res;
//                 res = sr.match(/b33/);
//                 print(true, "res  ", res);
//                 res = sr.match(/m2/);
//                 print(true, "res2 ", res);
//             }, false);

//             _f(function _2() {
//                 print(true, "_match2 in ……");
//                 var stream = new StringStream("def   a=10", 1);
//                 var text = stream.match(VeSyntax.getKeyWords().map(x => x.string), VeSyntax.notWord);
//                 print(true, "text res ", text);




//             }, false);

//             _f(function regex_number() {
//                 var codes = [`123@465`, `123465`, `133问问`, `问问133`, `www133`];
//                 var reg = /\/2008-12-25\/date/;
//                 var reg_number = /\d+(\.[\d]+)?(e[\d]+)?/;
//                 for (var i = 0; i < codes.length; i++) {
//                     var x = codes[i];
//                     var stream = new StringStream(x);
//                     var res = stream.match(reg_number);
//                     console.log("s res", stream, res);
//                 }
//             }, false);



//             //unit 测试
//             // {
//             //     d:/2008-12-25/date,
//             //     gg:/#fff/color,
//             //     reg:/^[\d]+$/regex,
//             //     url:"ejfis",
//             //     gg:/fff/string,
//             //     url:/http:\/\/www.baidu.com/url,
//             //     url:url("http://www.baidu.com"),
//             //     path:/c:\/\/gk\dd/path,
//             //     point:Point(5,5),
//             //     k:true,
//             // }

//             var codes = [`/2008-12-25/date`, `/c/d`, `b/c/d`, `www`, `/www我/`, `/&&&^*/`];
//             var reg = '([a-zA-Z_\\\$\\\u4E00-\\\u9FA5][a-zA-Z_\\\$\\\u4E00-\\\u9FA5\\\d]*)';
//             for (var i = 0; i < codes.length; i++) {
//                 var x = codes[i];
//                 var stream = new StringStream(x);
//                 var res = stream.match(new RegExp(reg));
//                 console.log("s res", stream, res);
//             }

//             console.log("test e ……");
//             for (var i = 0; i < codes.length; i++) {
//                 var x = codes[i];
//                 var regex = new RegExp(reg);
//                 console.log("regex : ", regex);

//                 var testRes = regex.test(x);
//                 console.log("x testRes : ", x, testRes);

//             }





//             _f(function unit_1() {

//             }, false);





//         }, false);
//     }, true);





// }

















//  // private matchUnit(stream: StringStream, state: State): Token | null {
//         //     console.log("matchUnit…… into ");

//         //     var token = null;
//         //     var unit = {
//         //         is: false,
//         //         value: "",
//         //         type: "",
//         //     }
//         //     var text = `/`;
//         //     var index = 0;
//         //     var is = true;
//         //     print(true,"steam : ",deepCopy(stream));
//         //     stream.till(text, true, function (str) {
//         //         print(true,"till each str : ",str);
//         //         switch (index) {
//         //             case 0:
//         //                 //not word || null 
//         //                 is = VeSyntax.notWord.test(str);
//         //                 break;
//         //             case 1:
//         //                 //not null and string 
//         //                 is = str != ""?true:false;
//         //                 unit.value = str;
//         //                 break;
//         //             case 2:
//         //                 //keyword(path,date,url……) 
//         //                 is = ["path","date"].exists(str);
//         //                 unit.type = str;
//         //                 break;
//         //             case 3:
//         //                 // null
//         //                 is = str == ""?true:false;
//         //                 break;
//         //         }
//         //         index++;
//         //         if(!is) return true;
//         //         if (index == 4) {
//         //             index = 0;
//         //             return true;
//         //         }
//         //         return false;
//         //     });
//         //     unit.is = is;
//         //     if (unit.is == true) {
//         //         token = new Token(TokenType.unit);
//         //         token.value = unit.value;
//         //         token.unit = unit.type;
//         //     }
//         //     console.log("matchUnit res token ",token);
//         //     return token;
//         // }