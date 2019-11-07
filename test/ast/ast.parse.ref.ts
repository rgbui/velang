namespace VeLangTest {
//     import AstParser = Ve.Lang.AstParser;
//     import CodeModeType = Ve.Lang.CodeModeType;
//     function parseAst(code, options?: {
//         codeType?: CodeModeType,
//         isExportBaseLib?: boolean,
//         isIncludeBasePackage?: boolean
//     },isRun?: boolean)
//     {
//         if (isRun == false) return;
//         if (typeof options == typeof undefined) options = {};
//         options.isIncludeBasePackage = false;
//         var ap: AstParser = new AstParser();
//         var result = ap.compile(code, options);
//         console.log(result);
//     }
//     ///测试元素的引用关系
//     parseAst(`def a=10;def c=a;`, {
//         codeType: CodeModeType.expression
//     }, false);
//     parseAst(`fun ab(a:number,b:string)
//     {
//         def g=a+b;
//     }`, {
//             codeType: CodeModeType.expression
//         }, false);

//     parseAst('def a=Math.PI;', {
//         codeType: CodeModeType.expression
//     }, false)

//     parseAst(`
//    def a={c:"ejfiss",vv:{c:true},gk:["ssss"]};
//    def g=a.c;
//    def k=a.c.length;
//    def gk=a.vv.c;
//    def ggk=a.gk;
//    def ggk1=a.gk[0];
//    `, { codeType: CodeModeType.expression }, false);


//     parseAst(`
//    def a=new String('#fff');
//    def arr=new Array<String>();
//    arr.get(0);
//    `, { codeType: CodeModeType.expression });


    /****
     * 
     * def a=new Class<String>();
     * a.gg;
     * def b=new Class<Number>();
     * 
     * def a=new Class<string>();
     * 
     * defword=newclass<word>()
     * 
     * if(a>b){ }
     * 
     * if(){}
     * 
     * def a=a+b;if(a>b){a=3}elseif(){ }else
     * [token..token[if]..[ifend].]
     * map
     * defword=word+word;if(word>word)word=number
     * 
     * 
     * if()({}|express)(elseif()({}|express))*(else({}|express))?
     * 
     */
}