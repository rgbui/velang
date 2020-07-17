///<reference path='express/binary.ts' />
///<reference path='express/data.ts' />
///<reference path='express/objectReferenceProperty.ts' />
///<reference path='express/statement.ts' />

namespace Ve.Lang {

    export class RunResult {
        context: any = null;
        value: any = null;
        continue: boolean = false;
        break: boolean = false;
        return: boolean = false;
        throw: boolean = false;
        traces: { statement: Statement, value?: any }[] = new VeArray();
        caller: Statement;
    }
    export class Runner {
        compile(code: string, ...args: any[]) {
            var ast = new AstParser();
            var node = ast.compile(code);
            var cp: ClassProperty;
            var fm = (x: Statement) => {
                return x instanceof ClassProperty && x.isStatic == true && x.name == 'Main' && x.kind == ClassPropertyKind.method
            }
            if (Array.isArray(node)) {
                node.each(n => {
                    var c = n.find(fm) as ClassProperty;
                    if (c) {
                        cp = c; return false;
                    }
                })
            }
            else {
                cp = node.find(fm) as ClassProperty;
            }
            if (cp) {
                var rv = new RunVisitor(cp);
                return rv.callMethod(cp, cp, ...args);
            }
            else {
                throw 'not found static main method'
            }
        }
        compileExpress(code: string, ...args: Outer.VeProp[]) {
            var ast = new AstParser();
            var node = ast.compileExpress(code, args);
            var cp: ClassProperty = node.parent.parent as ClassProperty;
            var rv = new RunVisitor(cp);
            return rv.callMethod(cp, cp, ...args.map(x => {
                return x.value
            }));
        }
    }
    export class RunVisitor extends AstVisitor<void>{
        accepter = RunAccepter;
        /**
         * $this对应当前方法里面的this
         * 另外对里面的方法需要拦截，并转到相应的实现方法里面
         * 
         **/
        callObjectProp(node: Statement, statement: ClassProperty, $this: any, ...args: any[]) {
            statement.class.runResult.context = $this;
            statement.args.each((arg, i) => {
                arg.runResult.value = args[i];
            })
            var className = statement.class.fullName;
            var rc = Run.runMethod.find(x => x.name == className);
            if (rc) {
                var propName = statement.unqiueName.replace(className + ".", "");
                if (typeof rc.props[propName] == 'function') {
                    try {
                        statement.runResult.value = rc.props[propName].apply(this, [$this, ...args]);
                    }
                    catch (e) {
                        statement.runResult.throw = false;
                        statement.runResult.traces.push({ statement: node, value: e });
                    }
                    return statement.runResult.value
                }
            }
            statement.body.each(s => {
                this.accept(s);
                if (statement.runResult.return == true) {
                    return false;
                }
            })
            if (statement.runResult.throw == true) {
                node.scope.runResult.throw = true;
                node.scope.runResult.traces.push({ statement: node });
            }
            return statement.runResult.value;
        }
        callMethod(node: Statement, statement: FunStatement | ArrowMethodExpression | ClassProperty, ...args: any[]) {
            statement.args.each((arg, i) => {
                arg.runResult.value = args[i];
            })
            statement.body.each(s => {
                this.accept(s);
                if (statement.runResult.return == true) {
                    return false;
                }
            })
            if (statement.runResult.throw == true) {
                node.scope.runResult.throw = true;
            }
            return statement.runResult.value;
        }
        runStatements(sts: VeArray<Statement>) {
            for (let i = 0; i < sts.length; i++) {
                this.accept(sts[i]);
                if (sts[i].scope.runResult.return == true) {
                    break;
                }
                else if (sts[i].scope.runResult.throw == true) {
                    break;
                }
            }
        }
    }
    export type RunMethod = {
        name: string,
        props: Record<string, (this: RunVisitor, ...args: any[]) => any>
    }
    export var RunAccepter: Accepter<RunVisitor, void> = {
    }

    applyExtend(RunAccepter, Run.Run$Statement, Run.Run$ObjectReferenceProperty, Run.Run$Data, Run.Run$Binary);
}