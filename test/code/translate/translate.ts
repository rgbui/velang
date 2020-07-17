namespace VeLangTest {

    import TranstateFactory = Ve.Lang.TranstateFactory;
    var transtateExpress = (code: string, props?: Ve.Lang.Outer.VeProp[], isPrint?: boolean) => {
        if (isPrint != false)
        {
            console.log(code);
            var tf = new TranstateFactory(Ve.Lang.TranstateLanguage.js);
            var code = tf.compileExpress(code, props);
            console.log(code);
        }
    }
    transtateExpress(`a+123`, [{ text: "a", type: 'int' }], false);
    transtateExpress(`account.length+1>234&&sex==true&&"sjsis"!=1233`, [{ text: 'account', type: 'string' }, { text: 'sex', type: 'bool' }], false)
    transtateExpress(`/2008-08-25/date.year+a.week+"eeee".count`, [{ text: "a", type: 'date' }], false);
    transtateExpress(`/DDD.text/File.content+/AB.text/File.content`, [], false);



    var transtateCode = (code: string, isPrint?: boolean) => {
        if (isPrint != false) {
            console.log(code);
            var tf = new TranstateFactory(Ve.Lang.TranstateLanguage.js);
            var code = tf.compile(code);
            console.log(code);
        }
    }
    transtateCode(`package Ve.Test{
         use Ve;
         export class Test{
            main(a:int,b:number):string{
                   return a+b;
            }
         }
    }`);

}