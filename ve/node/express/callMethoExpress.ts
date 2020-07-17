///<reference path='../statement/Statement.ts'/>

namespace Ve.Lang {

    /**
     * 
     * Math.sin(30); //也是同类部函数，也许是当前函数
     * 'eee'.toString(); constant.typeMethod
     * a.ab.c.toString(); typeMethod||property.method
     * classA.eee();// class static.method
     * abc().abc(); // typeMethod
     * ggg[a+b].abc();// typeMethod
     * fun(1,2,3)//fun 来源函数类型或申明的函数
     * def array=new Array<String>();
     * array.find(x=>x=="abc");
     * 
     */
    export class CallMethodExpression extends Expression {
        private _name: string | Expression;
        public get name(): string | Expression {
            return this._name;
        }
        public set name(value: string | Expression) {
            this._name = value;
            if (value instanceof Expression) {
                this.append(value);
            }
        }
        private _args: VeArray<Expression> = new VeArray();
        public get args(): VeArray<Expression> {
            return this._args;
        }
        public set args(value: VeArray<Expression>) {
            this._args = value;
            this.append(value);
        }
        public generics: VeArray<{ type: TypeExpression }> = new VeArray();
        public type = StatementType.callMethod;
        public isCompatibility(cp: ClassProperty): boolean {
            for (var i = 0; i < cp.args.length; i++) {
                if (cp.args.eq(i).isParameter == true) {
                    break;
                }
                else {
                    if (!TypeExpression.TypeIsAdaptive(
                        this.args.eq(i).infer.expressType,
                        cp.args.eq(i).parameterType,
                        cp.class.generics,
                        cp)) {
                        return false;
                    }
                }
            }
            if (cp.args.exists(x => x.isParameter == true)) {
                var arrayType = cp.args.last().parameterType.unionType;
                for (let j = cp.args.length - 1; j < this.args.length; j++) {
                    if (!TypeExpression.TypeIsAdaptive(
                        this.args.eq(j).infer.expressType,
                        arrayType,
                        cp.class.generics,
                        cp
                    )) {
                        return false;
                    }
                }
            }
            return true;
        }
        public getGenericMap() {
            if (typeof this.infer.referenceStatement != typeof undefined) {
                switch (this.infer.referenceStatement.kind) {
                    case StatementReferenceKind.DeclareFun:
                    case StatementReferenceKind.FunArgs:
                        var method = this.infer.referenceStatement.referenceStatement as FunStatement;
                        var map: Record<string, any> = {};
                        method.generics.each((gen, i) => {
                            map[gen.key] = this.generics.eq(i).type;
                        })
                        return map;
                    case StatementReferenceKind.currentClassMethodArgs:
                    case StatementReferenceKind.outerClassProperty:
                        var map: Record<string, any> = {};
                        if (this.name instanceof PropertyExpression) {
                            var pe = this.name as PropertyExpression;
                            if (typeof this.name.infer.expressType != undefined) {
                                if (this.name.infer.expressType.kind == TypeKind.union) {
                                    var rf: StatementReference = Statement.search(this, this.name.infer.expressType.unionType.name, x => {
                                        if (!(x instanceof ClassOrIntrfaceStatement)) return false;
                                    });
                                    if (rf) {
                                        var typeClass = rf.referenceStatement as ClassOrIntrfaceStatement;
                                        if (typeClass) {
                                            typeClass.generics.each((gen, i) => {
                                                map[gen.key] = pe.infer.expressType.generics.eq(i);
                                            })
                                        }
                                    }
                                }
                            }
                        }
                        var cp = this.infer.referenceStatement.referenceStatement as ClassProperty;
                        cp.generics.each((gen, i) => {
                            map[gen.key] = this.generics.eq(i).type;
                        })
                        return map;
                    case StatementReferenceKind.outerClass:
                        var cla = this.infer.referenceStatement.referenceStatement as ClassOrIntrfaceStatement;
                        var map: Record<string, any> = {};
                        cla.generics.each((gen, i) => {
                            map[gen.key] = this.generics.eq(i).type;
                        })
                        return map;
                }
            }
        }
    }
}