///<reference path='../statement/Statement.ts'/>

namespace Ve.Lang {

    export enum TypeKind {
        union = 0,
        fun = 1,
        object = 2,
        unit = 3,
        dic = 4
    }

    export class TypeExpression extends Expression {
        public type = StatementType.type;
        constructor(kind?: TypeKind, options?: {
            name?: string
        }) {
            super();
            if (typeof kind != typeof undefined)
                this.kind = kind;
            if (typeof options != typeof undefined) {
                if (typeof options.name != typeof undefined) this.name = options.name;
            }
        }
        public kind: TypeKind;
        /**unit type**/
        public name?: string;

        /**当前类型的状态*/
        public states: VeArray<string> = new VeArray();

        /**fun type property */
        public args?: VeArray<{ key: string, type: TypeExpression }> = new VeArray();
        public returnType?: TypeExpression;

        /***object type property */
        public props?: VeArray<{ key: string, type: TypeExpression }> = new VeArray();

        /***enum type property */
        public options?: VeArray<{ key: string, value: string | number }> = new VeArray();

        /***union type property */
        public unionType: TypeExpression;
        public generics: VeArray<TypeExpression> = new VeArray();

        injectGenericImplement(map: Record<string, TypeExpression>) {
            if (!map) map = {};
            switch (this.kind) {
                case TypeKind.unit:
                    if (typeof map[this.name] == 'string') {
                        return map[this.name];
                    }
                    else {
                        return TypeExpression.createUnitType(this.name);
                    }
                case TypeKind.object:
                    var typeObject = new TypeExpression(this.kind);
                    typeObject.props = this.props.map(x => {
                        return {
                            key: x.key,
                            type: x.type.injectGenericImplement(map)
                        }
                    })
                    return typeObject;
                case TypeKind.fun:
                    var typeFun = new TypeExpression(this.kind);
                    typeFun.args = this.args.map(x => {
                        return {
                            key: x.key,
                            type: x.type.injectGenericImplement(map)
                        }
                    })
                    if (this.returnType) typeFun.returnType = this.returnType.injectGenericImplement(map);
                    return typeFun;
                case TypeKind.dic:
                    var typeFun = new TypeExpression(this.kind);
                    typeFun.options = this.options;
                    return typeFun;
                case TypeKind.union:
                    var typeUnion = new TypeExpression(this.kind);
                    typeUnion.unionType = this.unionType.injectGenericImplement(map);
                    typeUnion.generics = this.generics.map(x => {
                        return x.injectGenericImplement(map)
                    })
                    return typeUnion;
            }
        }
        static createUnitType(name: string) {
            return new TypeExpression(TypeKind.unit, { name })
        }
        /***
         * 
         * 判断前面的类型是否适配后面的类型
         * 
         */
        public static TypeIsAdaptive(from: TypeExpression,
            to: TypeExpression,
            gens?: VeArray<{ key: string }>,
            pg?: Statement
        ): boolean {
            if (!gens) gens = new VeArray;
            if (from.kind == to.kind) {
                switch (from.kind) {
                    case TypeKind.unit:
                        if (from.name == to.name) return true;
                        else {
                            //先判断当前类型是否有别名
                            if (pg) {
                                var rf = Statement.search(pg, from.name, x => x instanceof ClassOrIntrfaceStatement);
                                if (rf && rf.referenceStatement) {
                                    var fromClass = rf.referenceStatement as ClassOrIntrfaceStatement;
                                    if (fromClass.name == to.name || fromClass.nicks.exists(to.name)) return true;
                                }
                            }
                            //判断泛型实现是否包含
                            if (gens.exists(z => z.key == to.name)) return true;
                            var maps = [{ from: 'int', to: "number" }];
                            return maps.filter(x => x.from == from.name && x.to == to.name).length > 0 ? true : false;
                        }
                    case TypeKind.dic:
                        return from.options.exists(op => {
                            return !to.options.exists(z => z.key == op.key && z.value == op.value)
                        })
                    case TypeKind.union:
                        if (!this.TypeIsAdaptive(from.unionType, to.unionType, gens, pg)) return false;
                        if (from.generics.exists((x, i) => !this.TypeIsAdaptive(x, to.generics.eq(i), gens, pg))) return false;
                        return true;
                    case TypeKind.object:
                        if (from.props.length == to.props.length) {
                            return from.props.exists(f => {
                                var t = to.props.find(z => z.key == f.key);
                                if (t) {
                                    if (this.TypeIsAdaptive(f.type, t.type, gens, pg)) return false;
                                }
                                return true;
                            }) ? false : true;
                        }
                        return false;
                    case TypeKind.fun:
                        if (!this.TypeIsAdaptive(from.returnType, to.returnType, gens, pg)) return false;
                        return from.args.exists((f, i) => {
                            var t = to.args.eq(i);
                            if (t) {
                                if (this.TypeIsAdaptive(f.type, t.type, gens, pg)) return false;
                            }
                            return true;
                        }) ? false : true;

                }
            }
        }
    }
}