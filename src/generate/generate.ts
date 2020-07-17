///<reference path='lang/nodejs/nodejs.ts'/>
namespace Ve.Lang.Generate {
    import List = Util.List;
    export enum GenerateLanguage {
        nodejs,
        js,
        java,
        csharp,
        php,
        python,
        mongodb,
        mysql,
        mssql
    }
    export class Generate extends Ve.Lang.Util.BaseEvent {
        constructor() {
            super();
        }
        nodes: List<Node> = new List();
        lang: GenerateLanguage;
        paper: GeneratePaper;
        generate(code: string, lang: GenerateLanguage) {
            this.lang = lang;
            var compiler = new Compiler();
            compiler.on('error', (...args: any[]) => {
                this.emit('error', ...args);
            });
            var gl = this.getLang();
            if (!gl) {
                console.log('not found generage language', this.lang, GenerateLanguage[this.lang]);
                this.emit('error', 'not found gengrate language ' + this.lang);
                return;
            }
            this.paper = new GeneratePaper(gl);
            this.paper.on('error', (...args: any[]) => {
                this.emit('error', ...args);
            });
            try {
                var rs = compiler.compile(code);
                return this.paper.generate(rs.nodes);
            }
            catch (error) {
                this.emit('error', error);
            }
        }
        generateExpress(code: string,
            lang: GenerateLanguage,
            args?: Outer.VeProp[],
            thisObjectArgs?: Outer.VeProp[],
            options?: { thisObjectName?: string, parameterMapNames?: Record<string, any> }) {
            this.lang = lang;
            var compiler = new Compiler();
            compiler.on('error', (...args: any[]) => {
                this.emit('error', ...args);
            });
            var gl = this.getLang();
            if (!gl) {
                console.log('not found generage language', this.lang, GenerateLanguage[this.lang]);
                this.emit('error', 'not found gengrate language ' + this.lang);
                return;
            }
            this.paper = new GeneratePaper(gl, options);
            this.paper.on('error', (...args: any[]) => {
                this.emit('error', ...args);
            });
            try {
                var rs = compiler.express(code, args, thisObjectArgs);
                return this.paper.generate(rs.express);
            }
            catch (error) {
                this.emit('error', error);
            }
        }
        private getLang() {
            switch (this.lang) {
                case GenerateLanguage.nodejs:
                case GenerateLanguage.js:
                    return nodejsGenerate;
                    break;
                case GenerateLanguage.mongodb:
                    return generateMongodb;
                    break;
            }
        }
    }
}