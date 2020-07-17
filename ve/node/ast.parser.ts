

///<reference path='../util/event.ts'/>
namespace Ve.Lang {
    /**
     * 
     * 语法解析器
     * 
     */
    export class AstParser extends BaseEvent {
        compile(code: string): Statement | VeArray<Statement> {
            var mode = new VeMode({
                isIgnoreLineBreaks: false
            });
            var tokenizer: Tokenizer<Token> = new Tokenizer(code, mode);
            var token = tokenizer.onParse();
            token.each(x => {
                x.childs.removeAll(x => x.type == TokenType.comment || x.type == TokenType.newLine);
            })
            var programStatement: ProgramStatement = new ProgramStatement();
            programStatement.append(AstParser.baseLib);
            var ps = new TokenStatementParser(token, programStatement);
            var st = ps.parse();
            programStatement.append(st);
            var IF = new InferFactory(st);
            IF.on('error', (...args: any[]) => {
                this.emit('error', ...args);
            })
            IF.start();
            return st;
        }
        compileExpress(express: string, args?: Outer.VeProp[]) {
            if (!Array.isArray(args)) args = [];
            /***需要构造一个函数 */
            var code = `package Ve.Express.Test{
                use Ve;
                export class Test{
                    static Main(${Outer.VePropToParameter(args)}){
                        return ${express}
                    }
                }
            }`;
            var mode = new VeMode({
                isIgnoreLineBreaks: false
            });
            var tokenizer: Tokenizer<Token> = new Tokenizer(code, mode);
            var token = tokenizer.onParse();
            token.each(x => {
                x.childs.removeAll(x => x.type == TokenType.comment || x.type == TokenType.newLine);
            });
            var programStatement: ProgramStatement = new ProgramStatement();
            programStatement.append(AstParser.baseLib);
            var ps = new TokenStatementParser(token.childs, programStatement);
            var st = ps.parse() as VeArray<Statement>;
            programStatement.append(st);
            var main = st.first().find(x => x instanceof ClassProperty && x.name == 'Main') as ClassProperty;
            try {
                var IF = new InferFactory(main);
                IF.on('error', (...args: any[]) => {
                    this.emit('error', ...args);
                });
                IF.start();
            }
            catch (e) {
                throw e;
            }
            var rs = main.body.first() as ReturnStatement;
            return rs.expression;
        }
        private static $baseLib: VeArray<Statement>;
        static get baseLib(): VeArray<Statement> {
            if (typeof this.$baseLib == typeof undefined) {
                this.$baseLib = new VeArray();
                VeBaseCode.each(c => {
                    var mode = new VeMode({
                        isIgnoreLineBreaks: false
                    });
                    var tokenizer: Tokenizer<Token> = new Tokenizer(c.code, mode);
                    var token = tokenizer.onParse();
                    var ps = new TokenStatementParser(token);
                    this.$baseLib.append(ps.parse());
                })
            }
            return this.$baseLib;
        }
    }
    export interface AstParser {
        on(name: 'error', cb: (error: any) => void)
    }
}