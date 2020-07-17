
///<reference path='lang/js/method/string.ts'/>
///<reference path='lang/js/mode/statement.ts'/>

namespace Ve.Lang {

    export enum TranstateLanguage {
        nodejs,
        js,
        java,
        csharp,
        php,
        python,
        mysql,
        mongodb,
        mssql
    }

    export class LangRender {
        node: Statement;
        visitor: VisitorLange;
        constructor(statement: Statement, options) {
            this.node = statement;
            this.node.langeRender = this;
            if (typeof options.template == 'string') this.template = options.template;
            if (typeof options.props == 'object') for (var p in options.props) this[p] = options.props[p];
        }
        template: string;
        render(): string {
            var rt = new RazorTemplate({ caller: this });
            var text = rt.compile(this.template, this);
            for (let i = this.wrappers.length - 1; i >= 0; i--) {
                var w = this.wrappers[i];
                text = w.replace('@wrapper()', text);
            }
            return text;
        }
        renderList(statement: VeArray<Statement>) {
            statement.each(s => this.visitor.accept(s));
            return statement.map(s => s.langeRender.render()).join("\n");
        }
        call(statement: Statement) {
            if (statement.langeRender)
                return statement.langeRender.render();
            else console.trace(statement)
        }
        delclare(name: string) {
            const ARGS_NAME = '__$args';
            if (typeof this.node[ARGS_NAME] == typeof undefined) this.node[ARGS_NAME] = new VeArray<string>();
            var ng = this.node[ARGS_NAME].find(x => x.name == name);
            if (ng) return ng.map;
            var contextNode = this.node.scope;
            if (contextNode) {
                const DELCLARE_NAME = '__$delclare';
                if (typeof contextNode[DELCLARE_NAME] == typeof undefined) contextNode[DELCLARE_NAME] = new VeArray<string>();
                var list = contextNode[DELCLARE_NAME] as VeArray<string>;
                var newName = getAvailableName(name, list, x => x);
                list.push(newName);
                this.node[ARGS_NAME].push({ name: name, map: newName });
                return newName;
            }
            else {

            }
        }
        static create(statement: Statement, options: {
            template?: string,
            props?: Record<string, ((this: LangRender, ...args: any[]) => string) | string | Statement>
        }): LangRender {
            return new LangRender(statement, options);
        }
        wrappers: VeArray<string> = new VeArray();
        appendWrapper(wrapperCode: string) {
            this.wrappers.push(wrapperCode);
        }
    }
    export type MethodAccepter = { name: string, props?: Record<string, (this: VisitorLange, statement: Statement, ...args: any[]) => string> }[];
    export type ResourceReference = {
        name: string,
        items: {
            type: 'file' | 'dir' | 'code',
            path?: string,
            url?: string,
            dest?: string,
            append?: string,
            code?: string
        }[]
    }
    export class VisitorLange extends AstVisitor<void>{
        methodAccepter: MethodAccepter = [];
        onInit() {
            this.on('accept', (express) => {
                if (typeof express.langeRender == 'object')
                    express.langeRender.visitor = this;
                else console.trace(express);
            })
        }
        acceptMethod(methodName: string, statement: Statement, ...args: string[]) {
            var mn;
            this.methodAccepter.forEach(m => {
                if (methodName.startsWith(m.name)) {
                    var restName = methodName.replace(m.name + ".", "");
                    if (typeof m.props[restName] == 'function') {
                        mn = m.props[restName];
                        return false;
                    }
                }
            })
            if (mn)
                return mn.apply(this, [statement, ...args]);
            else {
                console.warn(`not found Transtate method:${methodName}`);
            }
        }
        resources: VeArray<ResourceReference> = new VeArray();
        appendResource(resource: ResourceReference) {
            if (!this.resources.exists(x => x.name == resource.name)) {
                this.resources.push(resource);
            }
        }
    }
    export class TranstateFactory {
        lang: TranstateLanguage;
        constructor(lang: TranstateLanguage) {
            this.lang = lang;
        }
        compile(code: string): string {
            var ast = new AstParser();
            var node = ast.compile(code);
            var vl = this.createVisitorLange(node);
            vl.start();
            var temp = '';
            if (Array.isArray(node)) temp = node[0].langeRender.render();
            else if (node instanceof Statement) temp = node.langeRender.render();

            temp = vl.resources.map(x => {
                return x.items.map(x => x.type == 'code' && x.code).join("");
            }).join("") + temp;
            return temp;
        }
        compileExpress(express: string, args?: Outer.VeProp[]): string {
            var ast = new AstParser();
            var node = ast.compileExpress(express, args);
            var vl = this.createVisitorLange(node);
            var lr = vl.start();
            var temp = node.langeRender.render();
            temp = vl.resources.map(x => {
                return x.items.map(x => x.type == 'code' && x.code).join("");
            }).join("") + temp;
            return temp;
        }
        private createVisitorLange(express: Statement | VeArray<Statement>) {
            var vl: VisitorLange = new VisitorLange(express);
            switch (this.lang) {
                case TranstateLanguage.nodejs:
                    vl.accepter = Ve.Lang.Transtate.nodejs.accepter;
                    vl.methodAccepter = Ve.Lang.Transtate.nodejs.methodAccepter;
                    break;
                case TranstateLanguage.js:
                    vl.accepter = Ve.Lang.Transtate.js.accepter;
                    vl.methodAccepter = Ve.Lang.Transtate.js.methodAccepter;
                    break;
                case TranstateLanguage.csharp:
                    break;
                case TranstateLanguage.mongodb:
                    vl.accepter = Ve.Lang.Transtate.mongodb.accepter;
                    vl.methodAccepter = Ve.Lang.Transtate.mongodb.methodAccepter;
                    break;
            }
            return vl;
        }
    }
}

/***
 *
 * def g=file.read(filePath)+fff;
 * deg k=file.read(g)+'sssss';
 *
 * require('fs').open(filePath,function(err,content){
 *    def g=content+fff;
 *
 * })
 */