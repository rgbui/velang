
///<reference path='syntax.ts'/>
///<reference path='writer.ts'/>
namespace Ve.Lang.Razor {

    export class RazorTemplate {

        static escape(code: string) {
            return code.replace(/@(?![@])/g, "@@");
        }
        static compile(code: string, obj: Record<string, any>, ViewBag?: Record<string, any>) {
            if (typeof ViewBag == 'undefined') ViewBag = {};
            var tokenizer = new RazorTokenizer();
            var token = tokenizer.parse(code);
            var writer = new RazorWriter();
            writer.write(token);
            var jsCode = writer.outputCode();
            /****
             * 扩展默认系统的对象与方法
             * 如@include('~/views/index.rjs')
             * 
             */
            var baseObj = {

            };
            var baseMaps = this.getObjectKeyValues(baseObj);
            var maps = this.getObjectKeyValues(obj);
            maps = [...maps, ...baseMaps];
            var funCode = `function(ViewBag,...args)
            {
                 function innerFun(${maps.map(x => x.key).join(",")})
                 {
                     ${jsCode}
                 };
                 return innerFun.apply(this,args);
            }`;
            try {
                var gl = typeof window == 'undefined' ? global : window;
                var fun = (gl as any).eval(`(${funCode})`);
                return fun.apply(obj, [ViewBag, ...maps.map(x => x.value)])
            }
            catch (e) {
                console.log(funCode);
                throw e;
            }
        }
        /***
         * 提取对象的所有property name,包括继承的
         */
        private static getObjectKeyValues(data) {
            var prototypes: any[] = [];
            var current = data.__proto__;
            while (true) {
                if (current === Object.prototype) {
                    break;
                }
                else {
                    prototypes.push(current);
                    current = current.__proto__;
                    if (!current) break;
                }
            }
            var keys: string[] = [];
            for (var n in data) {
                if (!Ve.Lang.Util._.exists(keys, n)) keys.push(n);
            }
            prototypes.forEach(pro => {
                var ps: string[] = Reflect.ownKeys(pro) as string[];
                Ve.Lang.Util._.remove(ps, 'constructor');
                ps.forEach(m => { if (!Ve.Lang.Util._.exists(keys, m)) keys.push(m) })
            })
            var maps: { key: string, value: any }[] = [];
            keys.forEach(key => {
                (function (key) {
                    var map = { key } as any;
                    if (typeof data[key] == 'function') {
                        map.value = function () {
                            return data[key].apply(data, arguments);
                        }
                    }
                    else map.value = data[key];
                    maps.push(map);
                })(key);
            })
            return maps;
        }
    }

}