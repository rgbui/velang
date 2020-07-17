
namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    export enum TypeKind {
        union = 0,
        fun = 1,
        object = 2,
        unit = 3
    }
    export class TypeExpress extends Express {
        type = NodeType.type;
        /**unit type**/
        public name?: string;
        /**fun type property */
        public args?: List<{ key: string, type: TypeExpress }>;
        public returnType?: TypeExpress;

        /***object type property */
        public props?: List<{ key: string, type: TypeExpress }>;

        /***union type property */
        public unionType: TypeExpress;
        public generics: List<TypeExpress>;
        static create(options: Partial<TypeExpress>) {
            var te = new TypeExpress();
            var sysNames = new List('any', 'Null', 'Any', 'bool', 'Bool', 'number', 'Number', 'string', 'String', 'double', 'Double', 'Int', 'int',
                'Object', 'Array', 'Date');
            for (var n in options) {
                if (n == 'name') {
                    if (sysNames.exists(options[n])) {
                        te[n] = `Ve.Core.` + (options[n].replace(/^([a-z])/, ($, $1) => ($1 as string).toUpperCase()));
                    }
                    else te[n] = options[n];
                }
                else
                    te[n] = options[n];
            }
            return te;
        }
        toString() {
            if (this.name) return this.name;
            else if (this.args) return `(${this.args.map(arg => arg.type.toString()).join(",")})->${this.returnType ? this.returnType.toString() : "void"}`;
            else if (this.props) return `{${this.props.map(pro => `${pro.key}:${pro.type.toString()}`).join(",")}}`
            else if (this.unionType) {
                if (this.unionType.name == 'Array') return `${this.generics.first().toString()}[]`;
                else return `${this.unionType.toString()}<${this.generics.map(g => g.toString()).join(",")}>`;
            }
        }
        injectImplementGenerics(Generics: List<Generic>, ImplementGenerics: List<TypeExpress>) {
            if (this.name) {
                var genIndex = Generics.findIndex(x => x.name == this.name);
                if (genIndex > -1) {
                    return ImplementGenerics.eq(genIndex);
                }
                else return TypeExpress.create({ name: this.name })
            }
            else if (this.props) {
                return TypeExpress.create({
                    props: this.props.toArray(pro => {
                        return {
                            key: pro.key,
                            type: pro.type.injectImplementGenerics(Generics, ImplementGenerics)
                        }
                    })
                })
            }
            else if (this.args) {
                return TypeExpress.create({
                    args: this.args.toArray(pro => {
                        return {
                            key: pro.key,
                            type: pro.type.injectImplementGenerics(Generics, ImplementGenerics)
                        }
                    }),
                    returnType: this.returnType.injectImplementGenerics(Generics, ImplementGenerics)
                })
            }
            else if (this.unionType) {
                return TypeExpress.create({
                    unionType: this.unionType.injectImplementGenerics(Generics, ImplementGenerics),
                    generics: this.generics.toArray(x => x.injectImplementGenerics(Generics, ImplementGenerics))
                })
            }
        }
        /****
         * 判断类型是否相等
         * @param isCompatibility 类型是否兼容 如int兼容number，因为int继成number
         */
        static typeIsEqual(node: Node, type1: TypeExpress, type2: TypeExpress, isCompatibility: boolean = false) {
            if (type1.name && type2.name) {
                if (type1.name == type2.name) return true;
                var cla = node.queryName(type1.name, new List(NodeType.class, NodeType.enum)) as ClassStatement;
                if (!cla) {
                    throw 'not found type name' + type1.name;
                }
                if (cla.isName(type2.name)) return true;
                if (isCompatibility == true) {
                    var exs = cla.extends;
                    var c2 = node.queryName(type2.name, new List(NodeType.class, NodeType.enum)) as ClassStatement;
                    if (exs.exists(x => x.isFullName(c2.fullNames.first()))) return true;
                }
                return false;
            }
            else if (type1.props && type2.props) {
                if (type1.props.length != type2.props.length) return false;
                if (type1.props.trueForAll(x => type2.props.exists(y => y.key == x.key && this.typeIsEqual(node, y.type, x.type)))) return true;
            }
            else if (type1.args && type2.args) {
                if (type1.args.length != type2.args.length) return false;
                if (type1.args.trueForAll(x => type2.args.exists(y => y.key == x.key && this.typeIsEqual(node, y.type, x.type)))) {
                    if (!type1.returnType && type2.returnType && type2.returnType.name == 'void') return true;
                    else if (!type2.returnType && type1.returnType && type1.returnType.name == 'void') return true;
                    else if (this.typeIsEqual(node, type1.returnType, type2.returnType)) return true;
                }
                return false;
            }
            else if (type1.unionType && type2.unionType) {
                if (!this.typeIsEqual(node, type1.unionType, type2.unionType)) return false;
                if (type1.generics.trueForAll(g => type2.generics.exists(x => this.typeIsEqual(node, g, x)))) return true;
            }
        }
    }
}