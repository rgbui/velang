

namespace Ve.Lang {
    export enum StatementType {
        program,
        package,
        use,
        enum,
        class,
        interface,
        declareVariable,
        method,
        classProperty,
        field,
        fun,
        for,
        if,
        doWhile,
        while,
        switch,
        continue,
        break,
        try,
        throw,
        return,
        context,
        //运算符
        binary,
        unary,
        ternary,
        new,
        //基本的数据类型
        constant,
        variable,
        //变量
        Object,
        objectReferenceProperty,
        arrayIndex,
        array,
        classInstance,
        callMethod,
        arrowMethod,
        parameters,
        parameter,
        //数据类型
        type,
    }
    export class Statement {
        constructor(parent?: Statement) {
            if (parent) this.parent = parent;
        }
        parent: Statement;
        type: StatementType;
        token: Token = null;
        private $childs: VeArray<Statement> = new VeArray();
        append(ts: Statement | VeArray<Statement>) {
            this.$childs.append(ts);
            if (ts instanceof Statement) ts.parent = this;
            else if (ts instanceof VeArray) {
                ts.each(t => {
                    t.parent = this;
                });
            }
        }
        remove(ts: Statement | VeArray<Statement>) {
            if (ts instanceof VeArray) {
                ts.each(t => { this.childs.remove(t) })
            }
            else this.childs.remove(ts);
        }
        get childs(): VeArray<Statement> {
            return this.$childs;
        }
        set childs(val: VeArray<Statement>) {
            this.$childs = val;
            this.$childs.each(c => c.parent = this);
        }
        find(predict: (item: Statement, index?: number, thisArray?: VeArray<Statement>) => boolean, includeSelf?: boolean) {
            if (includeSelf == true && predict(this) == true) return this;
            var c = this.childs.find(predict);
            if (!c) {
                this.childs.each(r => {
                    var v = r.find(predict);
                    if (v) {
                        c = v; return false;
                    }
                })
                return c;
            }
            return c;
        }
        findAll(predict: (item: Statement, index?: number, thisArray?: VeArray<Statement>) => boolean, includeSelf?: boolean) {
            var list = new VeArray<Statement>();
            if (includeSelf == true && predict(this) == true) list.push(this);
            this.childs.each(c => {
                if (predict(c) == true) {
                    list.push(c);
                }
                var rs = c.findAll(predict);
                rs.each(r => list.push(r));
            })
            return list;
        }
        each(predict: (item: Statement) => void, includeSelf?: boolean) {
            includeSelf ? predict(this) : undefined;
            this.childs.each(c => {
                predict(c);
                c.each(predict);
            })
        }
        closest(predict: (item: Statement) => boolean) {
            var r: Statement = this;
            while (true) {
                if (predict(r) == true) return r;
                else {
                    r = r.parent;
                    if (!r) return;
                }
            }
        }
        closestPrev(predict: (item: Statement) => boolean) {
            var r: Statement = this;
            while (true) {
                if (r.parent) {
                    var index = r.parent.childs.findIndex(r);
                    if (index > -1) {
                        var search = r.parent.childs.find((x, i) => i <= index && predict(x) == true);
                        if (search)
                            return search;
                    }
                    r = r.parent;
                }
                else {
                    break;
                }
            }
        }
        parents(predict: (item: Statement) => boolean): VeArray<Statement> {
            var list = new VeArray<Statement>();
            var r: Statement = this.parent;
            while (true) {
                if (!r) break;
                if (predict(r)) list.push(r);
                r = r.parent;
            }
            return list;
        }
        parentsUntil(predict: (item: Statement) => boolean): VeArray<Statement> {
            var list = new VeArray<Statement>();
            var r: Statement = this.parent;
            while (true) {
                if (!r) break;
                list.push(r);
                if (predict(r)) { break; }
                r = r.parent;
            }
            return list;
        }
        get next(): Statement {
            if (this.parent) {
                var index = this.parent.childs.findIndex(this);
                if (index > -1) {
                    return this.parent.childs.eq(index + 1);
                }
            }
        }
        /***获取当前语句或表达式所在的语句*/
        get currentStatement(): Statement {
            if (this instanceof Statement && !(this instanceof Expression)) {
                return this;
            }
            var s = this.closest(x => x instanceof TryStatement
                || x instanceof IfStatement
                || x instanceof WhileStatement
                || x instanceof DoWhileStatement
                || x instanceof ForStatement
                || x instanceof SwitchStatement
            )
            if (!s) {
                s = this.closest(x => x instanceof Expression && !(x.parent instanceof Expression));
            }
            return s;
        }
        get scope(): (ArrowMethodExpression | FunStatement | ClassProperty | PackageStatement) {
            return this.closest(x => x instanceof ArrowMethodExpression || x instanceof PackageStatement || (x instanceof ClassProperty && x.kind == ClassPropertyKind.method) || x instanceof FunStatement) as (ArrowMethodExpression | FunStatement | ClassProperty)
        }
        get program(): ProgramStatement {
            return this.closest(x => x instanceof ProgramStatement);
        }
        static search(statement: Statement, name: string, predict?: (node: DeclareVariable | ClassProperty | FunStatement | ClassOrIntrfaceStatement) => boolean): StatementReference {
            var nrs: StatementReference;
            var dv = statement.closestPrev(x => {
                if (typeof predict == 'function' && predict(x as any) == false) return false;
                return x instanceof DeclareVariable && x.name == name
            });
            if (dv) return new StatementReference(StatementReferenceKind.DeclareVariable, dv);
            var fn = statement.closestPrev(x => {
                if (x instanceof FunStatement || (x instanceof ClassProperty && x.kind == ClassPropertyKind.method)) {
                    if (x.args.exists(z => z.key == name)) {
                        if (typeof predict == 'function' && predict(x) == false) return false;
                        return true;
                    }
                }
            }) as FunStatement | ClassProperty;
            if (fn) {
                nrs = new StatementReference(fn instanceof FunStatement ? StatementReferenceKind.FunArgs : StatementReferenceKind.currentClassMethodArgs, fn);
                nrs.target = fn.args.find(x => x.key == name);
                return nrs;
            }
            var pa = statement.closest(x => x instanceof PackageStatement) as PackageStatement;
            if (pa) {
                var f = pa.search(name, predict);
                if (f instanceof ClassOrIntrfaceStatement) {
                    nrs = new StatementReference(StatementReferenceKind.outerClass, f);
                    return nrs;
                }
                else if (f instanceof ClassProperty) {
                    nrs = new StatementReference(StatementReferenceKind.outerClassProperty, f);
                    return nrs;
                }
            }
        }
        /***对当前节点的一些判断和推断 */
        infer: {
            expressType?: TypeExpression,
            requireExpressType?: VeArray<TypeExpression>,
            referenceStatement?: StatementReference;
        } = {};
        /**对当前节点的计算值* */
        runResult: RunResult = new RunResult();
        /****渲染节点*/
        langeRender: LangRender;
    }
    export class ProgramStatement extends Statement {
        public type = StatementType.program;
    }
    export class Expression extends Statement {

    }
}