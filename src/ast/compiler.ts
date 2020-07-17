
///<reference path='../ast/node/node.ts'/>
///<reference path='../token/tokenizer.ts'/>
namespace Ve.Lang {

    export class VeLangError {
        /**
         * 错误阶段
         * @enum {string} token 解析token指令，一般主要错误是token进栈后，没有退出来，如'{'没有另一半'}',还有就是未识别的token,但这个发生的可能性很小
         * @enum {string} node 主要是语法结构的错误
         * @enum {string} infer 主要是检测用法是否正确，类型是否有冲途、检测项是最多的
         */
        stage: 'token' | 'node' | 'infer'
        /**错误的token */
        token?: Token;
        /**
         * 指定发生错误的地方
         */
        pos?: { col: number, row: number };
        /**错误信息 */
        error?: string | Error;
        static create(data: Partial<VeLangError>) {
            var err = new VeLangError();
            for (var n in data) {
                err[n] = data[n];
            }
            return err;
        }
    }
    export class Compiler extends Util.BaseEvent {
        private id: string;
        constructor() {
            super();
            this.id = Util.getId();
        }
        /**
         * 
         * @param code 编辑的代码，最好是一个类（可以多个类）文件，最好是这样
         * 
         */
        compile(code: string) {
            var tokenizer = new Tokenizer();
            tokenizer.on('error', (error, pos, token) => {
                this.emit('error', VeLangError.create({ error, pos, token, stage: 'token' }));
            })
            var rootToken: Token;
            try {
                rootToken = tokenizer.parse(code);
            }
            catch (e) {
                this.emit('error', VeLangError.create({ error: e, stage: 'token' }));
            }
            var parser = new StatementParser();
            parser.on('error', (error, pos, token) => {
                this.emit('error', VeLangError.create({ error, pos, token, stage: 'node' }));
            });
            var nodes: Util.List<Node>;
            try {
                if (rootToken)
                    nodes = parser.parse(rootToken.childs);
            }
            catch (e) {
                this.emit('error', VeLangError.create({ error: e, stage: 'node' }));
            }
            if (nodes)
                coreCompile.importNodes(nodes, LibType.code);
            return { nodes, tokens: rootToken ? rootToken.childs : undefined };
        }
        /**
         * 由于ve语言是面向对象语言，不能直接执行脚本，需要模拟一个静态方法
         * @param isExpressOrBlock 是表达式还是语句（类似于函数体)
         * @param code 
         * @param args 
         * @param thisObjectArgs 当前方法的this对象
         * 
         */
        private simulateClass(isExpressOrBlock: boolean, code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]) {
            var simulateArgs = new Util.List<{ name: string, type: string }>();
            if (thisObjectArgs) {
                simulateArgs.push({ name: 'this', type: Outer.VeTypeToCode({ props: thisObjectArgs.map(x => { return { key: x.text, type: x.type } }) }) })
            }
            if (args) {
                args.forEach(arg => {
                    if (simulateArgs.exists(x => x.name == arg.text)) {
                        throw 'duplicate parameter :' + arg.text;
                    }
                    simulateArgs.push({ name: arg.text, type: Outer.VeTypeToCode(arg.type) });
                })
            }
            var namespace = `Ve.__SimulatePackage${Util.getId() + "_" + this.id}`;
            return `
            package ${namespace};
            use Ve.Core;
            use Ve.Math;
            out class SimulateClass{
               static SimulateExpress(${simulateArgs.map(s => `${s.name}:${s.type}`).join(",")})
                {${isExpressOrBlock ? "return " : ""}${code}}
            }
            `;
        }
        /**
         * 编译表达式，因为是面向对象语言，不能直接运行表达式脚本，故模拟一个类静态方法，表达式做为返回值
         * @param code 
         * @param args 
         * @param thisObjectArgs 当前方法的this对象
         * 
         */
        express(code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]) {
            code = this.simulateClass.apply(this, [true, ...Array.from(arguments)]);
            var cn = this.compile(code);
            try {
                var pa = cn.nodes.first() as PackageStatement;
                var cla = pa.classList.find(x => x instanceof ClassStatement) as ClassStatement;
                var cm = cla.propertys.find(x => x.name == 'SimulateExpress');
                var returnStatement = cm.content.first() as ReturnStatement;
                var tokens = returnStatement.tokens.first().next.nextFindAll(x => true);
                return { express: returnStatement.result, tokens: tokens };
            }
            catch (e) {
                this.emit('error', VeLangError.create({ error: e, stage: 'node' }));
            }
        }
        /**
         * 编译代码块(函数体)，需要模拟类，构造静态方法 
         * @param code 
         * @param args 
         * @param thisObjectArgs 当前方法的this对象
         * 
         */
        block(code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]) {
            code = this.simulateClass.apply(this, [true, ...Array.from(arguments)]);
            var cn = this.compile(code);
            try {
                var pa = cn.nodes.first() as PackageStatement;
                var cla = pa.classList.find(x => x instanceof ClassStatement) as ClassStatement;
                var cm = cla.propertys.find(x => x.name == 'SimulateExpress') as ClassMethod;
                var contentToken = cm.tokens.first().nextFind(x => x.flag == '{');
                return { nodes: cm.content, tokens: contentToken.childs, classMethod: cm };
            }
            catch (e) {
                this.emit('error', VeLangError.create({ error: e, stage: 'node' }));
            }
        }
        /**
         * 编译类型代码
         * @param code  类型代码
         */
        type(code: string) {
            var code = this.simulateClass(true, 'true', [{ text: 'arg', type: code }]);
            var cn = this.compile(code);
            try {
                var pa = cn.nodes.first() as PackageStatement;
                var cla = pa.classList.find(x => x instanceof ClassStatement) as ClassStatement;
                var cm = cla.propertys.find(x => x.name == 'SimulateExpress') as ClassMethod;
                var type = cm.parameters.first().valueType;
                return { nodes: new Ve.Lang.Util.List(type), tokens: type.tokens };
            }
            catch (e) {
                this.emit('error', VeLangError.create({ error: e, stage: 'node' }));
            }
        }
        /**
         * 不用了，记得注销掉,谢谢
         */
        dispose() {
            coreCompile.removeNodes(this.id);
        }
    }
    export interface Compiler {
        on(name: 'error', fn: (error: VeLangError) => void);
    }
}