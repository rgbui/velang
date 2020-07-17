

namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    export class ArrayCallExpress extends Express {
        type = NodeType.arrayCall;
        caller: Express;
        arrayIndex: Express;
        inferType() {
            var arrayType = this.caller.inferType();
            return arrayType.generics.first();
        }
    }
    /****
     * 
     * a.length.toString.length.toString
     * 
     */
    export class ObjectCallExpress extends Express {
        type = NodeType.objectCall;
        caller: Express;
        /***运算符 "?."" "." */
        operator: string;
        key: NameCall;
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            it = InferType.InferTypeObjectKeyType(this);
            this.cache('inferType', it);
            return it;
        }
        get nameCallers(): List<Express> {
            var ns: List<Express> = this.cache('nameCallers');
            if (ns) return ns;
            ns = new List();
            var p = this.caller;
            while (true) {
                if (p instanceof ObjectCallExpress) {
                    ns.push(p);
                    p = p.caller;
                }
                else {
                    ns.push(p);
                    break;
                }
            }
            ns.reverse();
            this.cache('nameCallers', ns);
            return ns;
        }
    }
    export class MethodCallExpress extends Express {
        type = NodeType.methodCall;
        caller: Express;
        argements: List<Express> = new List;
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            if (this.caller instanceof ObjectCallExpress) {
                it = InferType.InferTypeObjectKeyType(this.caller, this);
            }
            else if (this.caller instanceof NameCall) {
                var cla = this.queryName(this.caller.name, new List(NodeType.class, NodeType.fun));
                if (this.caller.implementGeneric) {
                    it = TypeExpress.create({
                        unionType: TypeExpress.create({ name: cla.fullNames.first() }),
                        generics: this.caller.implementGeneric.copy()
                    })
                }
                else {
                    it = TypeExpress.create({ name: cla.fullNames.first() });
                }
            }
            this.cache('inferType', it);
            return it;
        }
    }
    export class NewCallExpress extends Express {
        type = NodeType.new;
        caller: Express;
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            if (this.caller instanceof NameCall) {
                var cla = this.queryName(this.caller.name, new List(NodeType.class, NodeType.fun));
                if (this.caller.implementGeneric) {
                    it = TypeExpress.create({
                        unionType: TypeExpress.create({ name: cla.fullNames.first() }),
                        generics: this.caller.implementGeneric.copy()
                    })
                }
                else {
                    it = TypeExpress.create({ name: cla.fullNames.first() });
                }
            }
            else if (this.caller instanceof MethodCallExpress) {
                it = InferType.InferTypeObjectKeyType((this.caller as any).caller, this);
            }
            this.cache('inferType', it);
            return it;
        }
    }
    /***
     * 调用的变量申明
     * a+b;
     * Math.PI
     * 注意命名空间的首名也是NameCall
     * 命名空间的全称没法初始能很好的判断出来
     * @param implementGeneric泛型实现
     * 
     */
    export class NameCall extends Express {
        type = NodeType.nameCall;
        name: string;
        implementGeneric: List<TypeExpress>;
        /**
        * 能够被调用，说明是变量名，来源申明的变量名，方法参数名
        * */
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            var rname = this.queryName(this.name);
            if (!rname) console.log(this, rname, this.name);
            it = rname.inferType();
            this.cache('inferType', it);
            return it;
        }
        /**
        * 能够被调用，说明是变量名，来源申明的变量名，方法参数名
        **/
        get refNode() {
            var it = this.cache('refNode');
            if (it) return it;
            it = this.queryName(this.name);
            this.cache('refNode', it);
            return it;
        }
    }
    export class ThisCall extends Express {
        type = NodeType.thisCall;
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            var classStatement = this.closest(x => x instanceof ClassStatement) as ClassStatement;
            it = TypeExpress.create({ name: classStatement.fullNames.first() });
            this.cache('inferType', it);
            return it;
        }
    }
    export class SuperCall extends Express {
        type = NodeType.superCall;
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            var cla = this.closest(x => x instanceof ClassStatement) as ClassStatement;
            it = cla.extend.inferType();
            this.cache('inferType', it);
            return it;
        }
    }
    /****
     * 类的@属性
     */
    export class AtExpress extends Express {
        type = NodeType.at;
        at: NameCall | MethodCallExpress | ThisCall | SuperCall;
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            if (this.at instanceof NameCall) {
                var nc = this.at as NameCall;
                //这里查找类属性，或者this参数
                var fun = this.closest(x =>
                    (x instanceof AnonymousFunExpress || x instanceof FunStatement || x instanceof ClassMethod) && x.parameters.length > 0 && x.parameters.exists(x => x.name == 'this' && (x.inferType() as TypeExpress).props && (x.inferType() as TypeExpress).props.exists(pro => pro.key == nc.name))
                ) as AnonymousFunExpress;
                if (fun) {
                    it = (fun.parameters.find(x => x.name == 'this').inferType() as TypeExpress).props.find(pro => pro.key == nc.name).type;
                }
                else {
                    var cla = this.closest(x => x instanceof ClassStatement) as ClassStatement;
                    if (cla) {
                        var pro = cla.propertys.find(x => x instanceof ClassProperty && x.isName(nc.name));
                        if (pro) {
                            it = pro.inferType();
                        }
                    }
                }
            }
            else if (this.at instanceof MethodCallExpress) {
                /**
                 * 
                 * 基本上是类方法了
                 * 
                 ***/
                var mc = this.at;
                var name = (mc.caller as NameCall).name;
                var cla = this.closest(x => x instanceof ClassStatement) as ClassStatement;
                if (cla) {
                    var proMethod = cla.propertys.find(x => x instanceof ClassMethod && x.isName(name) && InferType.InferTypeMethodCallFunTypeIsCompatibility(mc, x)) as ClassMethod;
                    if (proMethod) {
                        it = proMethod.inferType().returnType;
                    }
                }
            }
            else if (this.at instanceof ThisCall) {
                var fun = this.closest(x =>
                    (x instanceof AnonymousFunExpress || x instanceof FunStatement || x instanceof ClassMethod) && x.parameters.length > 0 && x.parameters.exists(x => x.name == 'this')
                ) as AnonymousFunExpress;
                if (fun) {
                    it = (fun.parameters.find(x => x.name == 'this').inferType() as TypeExpress);
                }
                else {
                    var cla = this.closest(x => x instanceof ClassStatement) as ClassStatement;
                    it = cla.inferType();
                }
            }
            else if (this.at instanceof SuperCall) {
                it = (this.at as SuperCall).inferType();
            }
            this.cache('inferType', it);
            return it;
        }
    }
}