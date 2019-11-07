var VeLangTest;
(function (VeLangTest) {
    var TranstateFactory = Ve.Lang.TranstateFactory;
    var TranstateLanguage = Ve.Lang.TranstateLanguage;
    function translate(code, isRun) {
        if (isRun == false)
            return;
        var tf = new TranstateFactory();
        var languageCode = tf.compile(code, TranstateLanguage.csharp);
        console.log(code, '<--->', languageCode);
    }
    translate(`package Ve.Transtate
    {
         use Ve;
         export class Test{
              public num:Number=10;
              private cac(x:Int,y:Number):Number
              {
                 return x+y;
              }
              private len(x:String):Number{
                  return x.count;
              }
              public abc(a:Number,b:Number):Number{
                  def o=(x:Number,y:Number)=>x+y;
                  return o(a,b);                 
              }
              public test2(a:Number,b:Number):{a:String,b:String}{
                  def a={a:"eeess",b:"efssss",c:{g:"eee",k:"eeexxx"}};
                  return {a:a.a,b:a.b};
              }
         }
    }`);
})(VeLangTest || (VeLangTest = {}));
//# sourceMappingURL=translate.js.js.map