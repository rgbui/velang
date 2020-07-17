

namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    export class Constant extends Express {
        type = NodeType.constant;
        value: any;
        constantType: TypeExpress;
        get isNumber() {
            var name = this.constantType.name;
            return name == 'int' || name == 'number' || name == 'double'
        }
        inferType() { return this.constantType; }
    }
    /***形参 */
    export class Parameter extends Statement {
        type = NodeType.parameter;
        /***剩余参数...args:string[] */
        rest: boolean;
        /***参数可选，parma?:bool */
        optional: boolean;
        name: string;
        default: Express;
        valueType: TypeExpress;
        inferType() {
            if (this.valueType) return this.valueType;
            else if (this.default) return this.default.inferType;
            var it = this.cache('inferType');
            if (it) return it;
            it = TypeExpress.create({ name: 'any' });
            this.cache('inferType', it);
            return it;
        }
    }
    /***
     * 申明一个变量
     */
    export class DeclareVariable extends Express {
        type = NodeType.declareVariable;
        name: string;
        modifys: List<Modify> = new List;
        declareType: TypeExpress;
        value: Express;
        get isConst() {
            return this.modifys.exists(Modify.const);
        }
        inferType() {
            if (this.declareType) return this.declareType;
            else if (this.value) return this.value.inferType;
            var it = this.cache('inferType');
            if (it) return it;
            it = TypeExpress.create({ name: 'any' });
            this.cache('inferType', it);
            return it;
        }
    }
    export class ObjectExpress extends Express {
        type = NodeType.object;
        items: List<{ key: string, value: Express }> = new List;
        inferType() {
            var it: TypeExpress = this.cache('inferType');
            if (it) return it;
            it = new TypeExpress();
            it.props = new List();
            this.items.each(i => {
                if (i.value instanceof SpreadExpress) {

                }
                else it.props.push({ key: i.key, type: i.value.inferType() });
            });
            this.cache('inferType', it);
            return it;
        }
    }
    export class ArrayExpress extends Express {
        type = NodeType.array;
        items: List<Express> = new List;
        inferType() {
            var it: TypeExpress = this.cache('inferType');
            if (it) return it;
            it = new TypeExpress();
            it.unionType = TypeExpress.create({ name: "Array" });
            it.generics = new List();
            if (this.items.length > 0) it.generics.push(this.items.first().inferType());
            else it.generics.push(TypeExpress.create({ name: 'any' }));
            this.cache('inferType', it);
            return it;
        }
    }
    /****
     * 匿名函数
     */
    export class AnonymousFunExpress extends Express {
        type = NodeType.anonymousFun;
        content: List<Statement> = new List;
        parameters: List<Parameter> = new List;
        returnType: TypeExpress;
        /****是否为箭头函数 */
        isArrow: boolean = false;
        inferType() {
            var it: TypeExpress = this.cache('inferType');
            if (it) return it;
            it = new TypeExpress();
            it.args = this.parameters.toArray(x => {
                return {
                    key: x.name,
                    type: x.inferType()
                }
            });
            if (this.returnType) it.returnType = this.returnType;
            else it.returnType = InferType.InferTypeStatements(this.content);
            this.cache('inferType', it);
            return it;
        }
    }
    export class StringTemplateExpress extends Express {
        type = NodeType.stringTemplate;
        strings: List<Constant | NameCall | Express> = new List;
        stringType: TypeExpress;
        inferType() {
            if (this.stringType) return this.stringType;
            var it = this.cache('inferType');
            if (it) return it;
            it = TypeExpress.create({ name: 'string' });
            this.cache('inferType', it);
            return it;
        }
    }
}