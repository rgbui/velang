namespace Ve.Lang.Outer {

    export type TranslateLang = 'nodejs' | 'js' | 'java' | 'csharp' | 'php' | 'python' | 'mysql' | 'mongodb' | 'mssql';
    /*
     * 翻译生成其它语言的代码
     * 
     */
    export function TranslateCode(code: string, lang: TranslateLang, error?: (...args: any[]) => void) {
        if (typeof lang == 'string') lang = lang.toLowerCase() as any;
        var gl = Generate.GenerateLanguage[lang];
        if (typeof gl == 'undefined') {
            error('not found Generate language ' + lang);
            return;
        }
        var gen = new Ve.Lang.Generate.Generate();
        gen.on('error', (...args: any) => {
            if (typeof error == 'function') {
                error(...args);
            }
        })
        return gen.generate(code, gl);
    }
    /**
     * 翻译带参数的表达式
     * @param code  表达式
     * @param lang  语言
     * @param args  参数
     * @param thisObjectArgs 上下文参数 
     * @param options 配制参数
     * @param options.thisObjectName 上下文对象名称，类似于thisObjectName=x={name:string},生成x.name 
     * @param options.parameterMapNames  参数投影映射，会将当前构造的函数参数，替换成其它参数
     * @param error 错误回调
     * 
     */
    export function TranslateExpressCode(code: string,
        lang: TranslateLang,
        args?: Outer.VeProp[],
        thisObjectArgs?: Outer.VeProp[],
        options?: {
            thisObjectName?: string,
            parameterMapNames?: Record<string, any>
        },
        error?: (...args: any[]) => void) {
        if (typeof lang == 'string') lang = lang.toLowerCase() as any;
        var gl = Generate.GenerateLanguage[lang];
        if (typeof gl == 'undefined') {
            error('not found Generate language ' + lang);
            return;
        }
        var gen = new Ve.Lang.Generate.Generate();
        gen.on('error', (...args: any) => {
            if (typeof error == 'function') {
                error(...args);
            }
        })
        return gen.generateExpress(code, gl, args, thisObjectArgs, options);
    }
}
