namespace Ve.Lang {

    export class RazorContext {
        ViewBag: object = {};
        layout: string;
        layoutBody: string;
        razorTemplate: RazorTemplate;
        section: any = {};
        constructor(razorTemplate: RazorTemplate) {
            this.razorTemplate = razorTemplate;
        }
        renderBody() {
            if (typeof this.layoutBody == 'string') return this.layoutBody;
            else {
                console.warn('not found layout body content...');
                return '';
            };
        }
        renderSection(sectionName) {
            if (typeof this.section[sectionName] == 'function') {
                this.section[sectionName].apply(this.razorTemplate.caller || this.razorTemplate, []);
            }
            else {
                console.warn('not found section:' + sectionName);
                return '';
            }
        }
        sectionRegister(name, fn) {
            this.section[name] = fn;
        }
        clear() {
            delete this.section;
            delete this.layoutBody;
            delete this.layout;
            this.ViewBag = {};
        }
    }
    export enum RazorTemplateType {
        View,
        LayoutMaster,
        PartialView
    }
    export class RazorTemplate {
        caller: object;
        context: RazorContext;
        type: RazorTemplateType;
        dir?: string;
        printFunCodeFilePath?: string;
        printTokenCodeFilePath?: string;
        private compilerFunction: () => string;
        private compilerParms: string[] = [];
        constructor(options?: {
            caller?: object;
            context?: RazorContext;
            type?: RazorTemplateType;
            dir?: string;
            printFunCodeFilePath?: string,
            printTokenCodeFilePath?: string
        }) {
            if (typeof options == 'object') {
                if (typeof options.caller != typeof undefined) this.caller = options.caller;
                if (typeof options.context != typeof undefined) this.context = options.context;
                if (typeof options.type != typeof undefined) this.type = options.type;
                if (typeof options.dir != typeof undefined) this.dir = options.dir;
                if (typeof options.printFunCodeFilePath != typeof undefined) this.printFunCodeFilePath = options.printFunCodeFilePath;
                if (typeof options.printTokenCodeFilePath != typeof undefined) this.printTokenCodeFilePath = options.printTokenCodeFilePath;
            }
            if (typeof this.context == typeof undefined) this.context = new RazorContext(this);
            if (typeof this.type == typeof undefined) this.type = RazorTemplateType.View;
        }
        private imports: any = {};
        import(methodName: string | object, obj: object | (() => string)) {
            if (typeof methodName == 'object') {
                for (var n in methodName) this.import(n, methodName[n]);
            }
            else {
                this.import[methodName] = obj;
            }
        }
        render(template: string | object, data?: object, ViewBag?: object) {
            if (typeof template == 'string') return this.compile(template, data);
            else {
                if (typeof data == 'object') ViewBag = data;
                if (typeof template == 'object') data = template;
                var dataArgs = this.getDataArgs(data);
                var parms = dataArgs.map(x => x.key);
                if (parms.every(x => this.compilerParms.filter(c => c == x).length > 0)) {
                    var args: any[] = [this, this.context];
                    this.compilerParms.forEach(cp => {
                        if (typeof parms[cp] == typeof undefined) args.push(undefined);
                        else args.push(dataArgs.find(x => x.key == cp).value);
                    })
                    this.context.clear();
                    if (typeof ViewBag == 'object')
                        this.context.ViewBag = ViewBag;
                    return this.compilerFunction.apply(this.caller || this, args);
                }
            }
        }
        compile(template: string, data?: object, ViewBag?: object): string {
            if (typeof data != 'object') data = {};
            var dataArgs = this.getDataArgs(data);
            var mode: RazorMode = new RazorMode;
            var tokenizer: Tokenizer<Razor> = new Tokenizer<Razor>(template, mode, false);
            var razor = tokenizer.onParse();
            var razorWriter: RazorWriter = new RazorWriter();
            razorWriter.write(razor);
            var code = razorWriter.outputCode();
            this.excuteFunction(code, dataArgs);
            var args: any[] = [this, this.context];
            dataArgs.forEach(key => args.push(key.value));
            this.context.clear();
            if (typeof ViewBag == 'object')
                this.context.ViewBag = ViewBag;
            return this.compilerFunction.apply(this.caller || this, args);
        }
        private excuteFunction(code, dataArgs) {
            var ms = [];
            var keys = Object.getOwnPropertyNames(Object.getPrototypeOf(this.context));
            _.remove(keys, 'constructor');
            keys.forEach(n => {
                if (typeof RazorContext.prototype[n] == 'function') ms.push(`var ${n}=function(){ return context.${n}.apply(context,arguments);};`);
            })
            for (var n in this.imports) {
                ms.push(`var ${n}=razorTemplate.imports[n];`);
            }
            var funCode = `function()
        { 
             var razorTemplate=arguments[0];
             var context=arguments[1];
             var ViewBag=context.ViewBag;
             var layout=context.layout;
${ms.map(x => `             ${x}\n`).join("")}
             var innerFunction=function(${dataArgs.map(x => x.key).join(",")})
             {
                 ${code}
             };
             var args=Array.from(arguments);
             args.splice(0,2);
             var result=innerFunction.apply(this,args);
             if(razorTemplate.type==${RazorTemplateType.View}&&layout)
             {
                context.layoutBody=result;
                result=layoutRegister(layout);
             }
             return result;
         }`;
            // if (typeof this.printFunCodeFilePath == 'string')
            //     fo.write(this.printFunCodeFilePath, 'var fx=' + funCode);
            try {
                var fx = eval('(' + funCode + ')');
                this.compilerFunction = fx;
            }
            catch (e) {
                console.log(funCode);
                throw e;
            }
            this.compilerParms = dataArgs.map(x => x.key);
        }
        private getDataArgs(data) {
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
                if (!(keys.filter(x => x == n).length > 0)) keys.push(n);
            }
            prototypes.forEach(pro => {
                var ps: string[] = Reflect.ownKeys(pro) as string[];
                _.remove(ps, "constructor");
                ps.forEach(m => {
                    if ((keys.filter(x => x == m).length == 0)) keys.push(m)
                })
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
