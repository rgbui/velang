
///<reference path='../../../util/common.ts'/>
namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    export enum Modify {
        readonly,
        static,
        public,
        protected,
        private,
        out,
        inner,
        const,
        /****密封类*/
        sealed,
        class,
        interface,
        enum,
        /***自定义类操作符 */
        operator,
        fun,
        /***申明 */
        def,
        /***表示重载 */
        override,
        /***通常表示当前类为装饰类 */
        decorate,
        async,
        await,
        /****属性get,set */
        get,
        set,
        field
    }
    export class DecorateStatement extends Statement {
        name: string;
        arguments: List<Express> = new List;
    }
    export class Generic extends Statement {
        name: string;
        /***泛型继承 */
        extend?: TypeExpress;
    }
    export class PackageStatement extends Statement {
        type = NodeType.package;
        name: string;
        content: List<Statement> = new List;
        public get lastName(): String {
            var ns = this.name.split(".");
            return ns[ns.length - 1];
        }
        getReferenceNames(name: string): List<string> {
            var uses: List<UseStatement> = this.childs.findAll(x => x instanceof UseStatement) as List<UseStatement>;
            var ns = new List(name);
            /***当前的 name有可能会在当前的库里面 */
            ns.push(this.name + "." + name);
            /***通过use的引用来确定查找范围 */
            uses.each(use => {
                if (use.aliasName) {
                    ns.push(name.replace(use.aliasName, use.packageName));
                }
                else {
                    ns.push(use.packageName + "." + name);
                }
            });
            return ns;
        }
        get classList(): List<ClassStatement | EnumStatement | FunStatement> {
            var classList = this.cache('classList');
            if (classList) return classList;
            classList = this.childs.findAll(x => x instanceof ClassStatement || x instanceof EnumStatement || x instanceof FunStatement);
            this.cache('classList', classList);
            return classList;
        }
    }
    export class UseStatement extends Statement {
        type = NodeType.use;
        packageName: string;
        aliasName: string;
    }
    export class ClassStatement extends Statement {
        type = NodeType.class;
        name: string;
        extendName: string;
        content: List<Statement> = new List;
        decorates: List<DecorateStatement> = new List;
        modifys: List<Modify> = new List;
        generics: List<Generic> = new List;
        get names() {
            var decs = this.decorates.findAll(x => x.name == 'alias' || x.name == 'Alias' || x.name == '别名');
            var ns = decs.toArray(dec => (dec.arguments.first() as Constant).value);
            if (!ns.exists(this.name)) ns.insertAt(0, this.name);
            return ns;
        }
        get extend(): ClassStatement {
            var ex = this.cache('extend');
            if (ex) return ex;
            if (typeof this.extendName == 'undefined') this.extendName = 'Ve.Core.Any';
            ex = this.queryName(this.extendName, new List(NodeType.class));
            this.cache('extend', ex);
            return ex;
        }
        get extends(): List<ClassStatement> {
            var exs: List<ClassStatement> = new List();
            var p = this.extend;
            while (true) {
                if (p && !exs.exists(p)) { exs.push(p); p = p.extend; }
                else break;
            }
            return exs;
        }
        get package(): PackageStatement {
            var pa = this.cache('package');
            if (pa) return pa;
            pa = this.closest(x => x.type == NodeType.package);
            this.cache('package', pa);
            return pa;
        }
        get fullNames(): List<string> {
            var names = this.cache('fullNames');
            if (names) return names;
            var ns = this.names;
            names = ns.map(n => this.package.name + "." + n);
            this.cache('fullNames', names);
            return names;
        }
        get isOut() {
            if (this.modifys.exists(Modify.inner)) return false;
            return true;
        }
        isFullName(name: string) {
            return this.fullNames.exists(name);
        }
        isName(name: string) {
            return this.names.exists(name);
        }
        get propertys(): List<ClassMethod | ClassOperator | ClassProperty> {
            //需要考虑继承的属性
            var pros: List<ClassMethod | ClassOperator | ClassProperty> = this.cache('propertys');
            if (pros) return pros;
            pros = new List();
            var p: ClassStatement = this;
            var ps: List<ClassStatement> = new List();
            ps.push(p);
            while (true) {
                if (!p) break;
                p.content.each(c => {
                    if (c instanceof ClassMethod) {
                        if (c.isCtor) return;
                        var pro = pros.find(x => x instanceof ClassMethod && x.name == c.name && (x.isStatic && c.isStatic || !x.isStatic && !c.isStatic) && TypeExpress.typeIsEqual(c, x.inferType(), c.inferType(), true));
                        if (!pro) {
                            pros.push(c);
                        }
                    }
                    else if (c instanceof ClassOperator) {
                        var pro = pros.find(x => x instanceof ClassOperator && x.name == c.name && TypeExpress.typeIsEqual(c, x.inferType(), c.inferType(), true));
                        if (!pro) {
                            pros.push(c);
                        }
                    }
                    else if (c instanceof ClassProperty) {
                        var pro = pros.find(x => x instanceof ClassMethod && x.name == c.name && (x.isStatic && c.isStatic || !x.isStatic && !c.isStatic) && TypeExpress.typeIsEqual(c, x.inferType(), c.inferType(), true));
                        if (!pro) {
                            pros.push(c);
                        }
                    }
                });
                p = p.extend;
                if (ps.exists(p)) break;
                if (p) ps.push(p);
            }
            this.cache('propertys', pros);
            return pros;
        }
        methods(onlySelfClass: boolean = false) {
            if (onlySelfClass != true) return this.propertys.findAll(x => x instanceof ClassMethod);
            else return this.content.findAll(x => x instanceof ClassMethod);
        }
        operators(onlySelfClass: boolean = false) {
            if (onlySelfClass != true) return this.propertys.findAll(x => x instanceof ClassOperator);
            else return this.content.findAll(x => x instanceof ClassOperator);
        }
        props(onlySelfClass: boolean = false) {
            if (onlySelfClass != true) return this.propertys.findAll(x => x instanceof ClassProperty);
            else return this.content.findAll(x => x instanceof ClassProperty);
        }
        inferType() {
            if (this.generics && this.generics.length > 0) {
                return TypeExpress.create({ unionType: TypeExpress.create({ name: this.fullNames.first() }), generics: this.generics.toArray(x => TypeExpress.create({ name: x.name })) });
            }
            else {
                return TypeExpress.create({ name: this.fullNames.first() });
            }
        }
    }
    export class EnumStatement extends Statement {
        type = NodeType.enum;
        name: string;
        items: List<EnumItem> = new List;
        decorates: List<DecorateStatement> = new List;
    }
    export class EnumItem extends Statement {
        type = NodeType.enumItem;
        name: string;
        value: number;
        get fullNames() {
            return (this.parent as EnumStatement).fullNames.toArray(x => x + "." + this.name);
        }
        isFullName(name: string) {
            return this.fullNames.exists(name);
        }
    }
    export interface EnumStatement extends Pick<ClassStatement, 'package' | 'fullNames' | 'names' | 'isName' | 'isFullName' | 'isOut'> { };
    Ve.Lang.Util.Mixin(EnumStatement, ClassStatement, ['package', 'fullNames', 'names', 'isName', 'isFullName', 'isOut']);
    export class FunStatement extends Statement {
        type = NodeType.fun;
        decorates: List<DecorateStatement> = new List;
        modifys: List<Modify> = new List;
        name: string;
        content: List<Statement> = new List;
        parameters: List<Parameter> = new List;
        returnType: TypeExpress;
        generics: List<Generic> = new List;
        inferType(): TypeExpress {
            var ti = TypeExpress.create({
                args: this.parameters.toArray(x => { return { key: x.name, type: x.inferType() } }),
                returnType: this.returnType ? this.returnType : InferType.InferTypeStatements(this.content)
            });
            return ti;
        }
    }
    export interface FunStatement extends Pick<ClassStatement, 'package' | 'fullNames' | 'names' | 'isName' | 'isFullName' | 'isOut'> { };
    Ve.Lang.Util.Mixin(FunStatement, ClassStatement, ['package', 'fullNames', 'names', 'isName', 'isFullName', 'isOut']);
    export class ClassMethod extends Statement {
        type = NodeType.classMethod;
        name: string;
        content: List<Statement> = new List;
        parameters: List<Parameter> = new List;
        returnType: TypeExpress;
        decorates: List<DecorateStatement> = new List;
        modifys: List<Modify> = new List;
        generics: List<Generic> = new List;
        get class() {
            var cla = this.cache('class');
            if (cla) return cla;
            cla = this.closest(x => x instanceof ClassStatement);
            this.cache('class', cla);
            return cla;
        }
        get package() {
            return this.class.package;
        }
        get fullNames(): List<string> {
            var names = this.cache('fullNames');
            if (names) return names;
            var ns = this.names;
            names = new List();
            this.class.fullNames.each(fn => { ns.each(n => { names.push(fn + "." + n); }) })
            this.cache('fullNames', names);
            return names;
        }
        get names() {
            var decs = this.decorates.findAll(x => x.name == 'alias' || x.name == 'Alias' || x.name == '别名');
            var ns = decs.toArray(dec => (dec.arguments.first() as Constant).value);
            if (!ns.exists(this.name)) ns.insertAt(0, this.name);
            return ns;
        }
        get onlyName() {
            var only = this.cache('onlyName');
            if (!only) {
                var dec = this.decorates.find(x => x.name == 'only' || x.name == 'Only');
                if (dec) {
                    only = (dec.arguments.first() as Constant).value;
                }
                if (!only) only = this.names.first();
            }
            this.cache('onlyName', only);
            return this.class.fullNames.first() + "." + only;
        }
        get isStatic(): boolean {
            return this.modifys.exists(Modify.static);
        }
        get isPublic() {
            return this.isProtected || this.isPrivate ? false : true;
        }
        get isProtected() {
            return this.modifys.exists(Modify.protected);
        }
        get isPrivate() {
            return this.modifys.exists(Modify.private);
        }
        get isOverride() {
            return this.modifys.exists(Modify.override);
        }
        get isInterface() {
            return this.modifys.exists(Modify.interface);
        }
        isName(name: string) {
            return this.names.exists(name);
        }
        isFullName(name: string) {
            return this.fullNames.exists(name);
        }
        /***
         * 方法inferType表示当前方法的类型
         */
        inferType() {
            var ti = TypeExpress.create({
                args: this.parameters.toArray(x => { return { key: x.name, type: x.inferType() } }),
                returnType: this.returnType ? this.returnType : InferType.InferTypeStatements(this.content)
            });
            return ti;
        }
        get isCtor() {
            if (this.name == 'ctor') return true;
            if (this.class.name == this.name) return true;
            return false;
        }
    }
    export class ClassProperty extends Statement {
        type = NodeType.classProperty;
        name: string;
        /***
         * 属性字段的get,set内容
         * 
         */
        content: List<Statement>;
        /***属性字段get,set参数 */
        parameters: List<Parameter>;
        /***属性字段方法返回类型 */
        returnType: TypeExpress;
        /****注解 */
        decorates: List<DecorateStatement> = new List;
        modifys: List<Modify> = new List;
        propType: TypeExpress;
        propValue: Constant;
        get isGet(): boolean {
            if (this.modifys.exists(Modify.field) && this.modifys.exists(Modify.get)) return true;
            return true;
        }
        get isSet(): boolean {
            if (this.modifys.exists(Modify.field) && this.modifys.exists(Modify.set)) return true;
            if (this.modifys.exists(Modify.readonly)) return false;
            return true;
        }
        get class() {
            var cla = this.cache('class');
            if (cla) return cla;
            cla = this.closest(x => x instanceof ClassStatement);
            this.cache('class', cla);
            return cla;
        }
        get package() {
            return this.class.package;
        }
        get fullNames(): List<string> {
            var names = this.cache('fullNames');
            if (names) return names;
            var ns = this.names;
            names = new List();
            this.class.fullNames.each(fn => { ns.each(n => { names.push(fn + "." + n); }) })
            this.cache('fullNames', names);
            return names;
        }
        get names() {
            var decs = this.decorates.findAll(x => x.name == 'alias' || x.name == 'Alias' || x.name == '别名');
            var ns = decs.toArray(dec => (dec.arguments.first() as Constant).value);
            if (!ns.exists(this.name)) ns.insertAt(0, this.name);
            return ns;
        }
        get onlyName() {
            var only = this.cache('onlyName');
            if (!only) {
                var dec = this.decorates.find(x => x.name == 'only' || x.name == 'Only');
                if (dec) {
                    only = (dec.arguments.first() as Constant).value;
                }
                if (!only) only = this.names.first();
            }
            this.cache('onlyName', only);
            return this.class.fullNames.first() + "." + only;
        }
        get isStatic(): boolean {
            return this.modifys.exists(Modify.static);
        }
        get isPublic() {
            return this.modifys.exists(Modify.public) || !this.isProtected && !this.isPrivate;
        }
        get isProtected() {
            return this.modifys.exists(Modify.protected);
        }
        get isPrivate() {
            return this.modifys.exists(Modify.private);
        }
        get isOverride() {
            return this.modifys.exists(Modify.override);
        }
        get isInterface() {
            return this.modifys.exists(Modify.interface);
        }
        isName(name: string) {
            return this.names.exists(name);
        }
        isFullName(name: string) {
            return this.fullNames.exists(name);
        }
        inferType() {
            if (this.modifys.exists(Modify.field)) {
                if (this.returnType) this.returnType;
                else {
                    var it = this.cache('inferType');
                    if (it) return it;
                    it = InferType.InferTypeStatements(this.content);
                    this.cache('inferType', it);
                    return it;
                }
            }
            else {
                if (this.propType) return this.propType;
                else if (this.propValue) return this.propValue;
                var it = this.cache('inferType');
                if (it) return it;
                it = TypeExpress.create({ name: 'any' });
                this.cache('inferType', it);
                return it;
            }
        }
    }
    export class ClassOperator extends Statement {
        type = NodeType.classOperator;
        parameters: List<Parameter> = new List;
        returnType: TypeExpress;
        decorates: List<DecorateStatement> = new List;
        modifys: List<Modify> = new List;
        name: string;
        content: List<Statement> = new List;
        /***
         * 推导的是操作符返回值的类型，
         * 不是操作符本身方法类型
         */
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            if (this.returnType) it = this.returnType;
            if (!it) {
                if (this.content && this.content.length > 0) it = InferType.InferTypeStatements(this.content);
                else it = TypeExpress.create({ name: 'void' });
            }
            this.cache('inferType', it);
            return it;
        }
        get class() {
            var cla = this.cache('class');
            if (cla) return cla;
            cla = this.closest(x => x instanceof ClassStatement);
            this.cache('class', cla);
            return cla;
        }
        get package() {
            return this.class.package;
        }
        get fullNames(): List<string> {
            var names = this.cache('fullNames');
            if (names) return names;
            var ns = this.names;
            names = new List();
            this.class.fullNames.each(fn => { ns.each(n => { names.push(fn + "." + n); }) })
            this.cache('fullNames', names);
            return names;
        }
        get names() {
            var decs = this.decorates.findAll(x => x.name == 'alias' || x.name == 'Alias' || x.name == '别名');
            var ns = decs.toArray(dec => (dec.arguments.first() as Constant).value);
            if (!ns.exists(this.name)) ns.insertAt(0, this.name);
            return ns;
        }
        get onlyName() {
            var only = this.cache('onlyName');
            if (!only) {
                var dec = this.decorates.find(x => x.name == 'only' || x.name == 'Only');
                if (dec) {
                    only = (dec.arguments.first() as Constant).value;
                }
                if (!only) only = this.names.first();
            }
            this.cache('onlyName', only);
            return this.class.fullNames.first() + "." + only;
        }
        get isStatic(): boolean {
            return this.modifys.exists(Modify.static);
        }
        get isPublic() {
            return this.modifys.exists(Modify.public);
        }
        get isProtected() {
            return this.modifys.exists(Modify.protected);
        }
        get isPrivate() {
            return this.modifys.exists(Modify.private);
        }
        get isOverride() {
            return this.modifys.exists(Modify.override);
        }
        get isInterface() {
            return this.modifys.exists(Modify.interface);
        }
        isName(name: string) {
            return this.names.exists(name);
        }
        isFullName(name: string) {
            return this.fullNames.exists(name);
        }
    }
}