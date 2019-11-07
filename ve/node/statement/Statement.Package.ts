///<reference path='statement.ts'/>

namespace Ve.Lang {

    export enum Modifier {
        private,
        public,
        const,
        readonly,
        static,
        export
    }
    export class PackageStatement extends Statement {
        public name: string;
        public type: StatementType = StatementType.package;
        private _body: VeArray<Statement> = new VeArray();
        public get body(): VeArray<Statement> {
            return this._body;
        }
        public set body(value: VeArray<Statement>) {
            this._body = value;
            this.append(value);
        }
        public get lastName(): String {
            var ns = this.name.split(".");
            return ns[ns.length - 1];
        }
        private $classList: VeArray<ClassOrIntrfaceStatement>;
        public get classList(): VeArray<ClassOrIntrfaceStatement> {
            if (typeof this.$classList == typeof undefined) {
                this.$classList = this.findAll(x => x instanceof ClassOrIntrfaceStatement) as VeArray<ClassOrIntrfaceStatement>;
            }
            return this.$classList;
        }
        public search(name: string, predict?: (item: ClassOrIntrfaceStatement | ClassProperty) => boolean): ClassOrIntrfaceStatement | ClassProperty {
            var c = this.classList.find(x => {
                if (x.isName(name)) {
                    if (typeof predict == 'function' && predict(x) == false) return false;
                    return true;
                }
            });
            if (c) return c;
            var p;
            this.classList.each(c => {
                var r = c.body.find(z => {
                    if (z.isName(name)) {
                        if (typeof predict == 'function' && predict(z) == false) return false;
                        return true;
                    }
                });
                if (r) {
                    p = r; return false;
                }
            })
            if (p) {
                return p;
            }
            var useList = this.findAll(x => x instanceof UseStatement) as VeArray<UseStatement>;
            useList.each(use => {
                var r = use.search(name, predict);
                if (r) {
                    p = r; return false;
                }
            })
            return p;
        }
        public searchAll(name: string, predict?: (item: ClassOrIntrfaceStatement | ClassProperty) => boolean): VeArray<ClassOrIntrfaceStatement | ClassProperty> {
            var list: VeArray<ClassOrIntrfaceStatement | ClassProperty> = new VeArray;
            this.classList.each(c => {
                if (c.isName(name)) {
                    if (typeof predict == 'function' && predict(c) == false) return;
                    list.push(c);
                }
                else {
                    c.body.each(cc => {
                        if (typeof predict == 'function' && predict(cc) == false) return;
                        if (cc.isName(name)) { list.push(cc); }
                    })
                }
            })
            var useList = this.findAll(x => x instanceof UseStatement) as VeArray<UseStatement>;
            useList.each(use => {
                list.append(use.searchAll(name, predict));
            })
            return list;
        }
    }
    export class UseStatement extends Statement {
        public name: string;
        public localName: string;
        public type: StatementType = StatementType.use;
        /*
         * 
         * 通过名称去查找相关联的类或类的属性或方法
         *  
         */
        public search(name: string, predict?: (item: ClassOrIntrfaceStatement | ClassProperty) => boolean): ClassOrIntrfaceStatement | ClassProperty {
            var ns: VeArray<string> = new VeArray();
            ns.push(name);
            ns.push(this.name + "." + name);
            if (this.localName) {
                if (name.startsWith(this.localName)) {
                    ns.push(this.name + name.substring(this.localName.length));
                }
            }
            if (this.program) {
                return this.program.find(x => {
                    if (x instanceof ClassOrIntrfaceStatement || x instanceof ClassProperty) {
                        if (ns.exists(n => x.isName(n))) {
                            if (typeof predict == 'function' && predict(x) == false) return false;
                            return true;
                        }
                    }
                }) as ClassOrIntrfaceStatement | ClassProperty
            }
        }
        public searchAll(name: string, predict?: (item: ClassOrIntrfaceStatement | ClassProperty) => boolean): VeArray<ClassOrIntrfaceStatement | ClassProperty> {
            var ns: VeArray<string> = new VeArray();
            ns.push(name);
            ns.push(this.name + "." + name);
            if (this.localName) {
                if (name.startsWith(this.localName)) {
                    ns.push(this.name + name.substring(this.localName.length));
                }
            }
            if (this.program) {
                return this.program.findAll(x => {
                    if (x instanceof ClassOrIntrfaceStatement || x instanceof ClassProperty) {
                        if (ns.exists(n => x.isName(n))) {
                            if (typeof predict == 'function' && predict(x) == false) return false;
                            return true;
                        }
                    }
                }) as VeArray<ClassOrIntrfaceStatement | ClassProperty>
            }
        }
    }
    export class EnumStatement extends Statement {
        public type: StatementType = StatementType.enum;
        public name: string;
        public modifiers: VeArray<Modifier> = new VeArray(Modifier.private);
        public options: VeArray<{ key: string, value: Constant }> = new VeArray();
        public get package(): PackageStatement {
            var s = this.closest(x => x.type == StatementType.package);
            return s as PackageStatement;
        }
    }
    export class ClassOrIntrfaceStatement extends Statement {
        public type: StatementType = StatementType.class;
        public name: string;
        public extendName: string;
        public modifiers: VeArray<Modifier> = new VeArray(Modifier.private);
        public attributes: VeArray<{ name: string, args: VeArray<{ key?: string, value: Constant }> }> = new VeArray();
        public generics: VeArray<{ key: string }> = new VeArray();
        private _body: VeArray<ClassProperty> = new VeArray();
        public get body(): VeArray<ClassProperty> {
            return this._body;
        }
        public set body(value: VeArray<ClassProperty>) {
            this._body = value;
            this.append(value);
        }
        public get package(): PackageStatement {
            var s = this.closest(x => x.type == StatementType.package);
            return s as PackageStatement;
        }
        public get nicks(): VeArray<string> {
            var list: VeArray<string> = new VeArray;
            var ns = this.attributes.findAll(x => x.name == 'nick');
            if (ns.length > 0) {
                ns.each(n => {
                    var af = n.args.first();
                    if (af) {
                        list.push(af.value.value);
                    }
                })
            }
            return list;
        }
        public isName(name: string): boolean {
            if (name == this.name) return true;
            if (this.package.name + "." + this.name == name) return true;
            return this.nicks.exists(nick => {
                if (nick == name) return true;
                else if (this.package.name + "." + nick == name) return true;
            })
        }
        public get fullName(): string {
            return this.package.name + "." + this.name;
        }
    }
    export enum ClassPropertyKind {
        method,
        prop,
        field
    }
    export class ClassContext extends Statement {
        public type = StatementType.context;
        public name: 'this' | 'super';
    }
    export class ClassProperty extends Statement {
        public type = StatementType.classProperty;
        public name: string;
        public isInterface?: boolean;
        public modifiers: VeArray<Modifier> = new VeArray(Modifier.private);
        public generics: VeArray<{ key: string }> = new VeArray();
        public attributes: VeArray<{ name: string, args: VeArray<{ key?: string, value: Constant }> }> = new VeArray();
        public kind: ClassPropertyKind;
        public propType?: TypeExpression;
        public value?: Constant;
        public args: VeArray<Parameter> = new VeArray();
        public returnType?: TypeExpression;
        private _get: VeArray<Statement> = new VeArray();
        public get get(): VeArray<Statement> {
            return this._get;
        }
        public set get(value: VeArray<Statement>) {
            this._get = value;
            this.append(value);
        }
        private _set: VeArray<Statement> = new VeArray();
        public get set(): VeArray<Statement> {
            return this._set;
        }
        public set set(value: VeArray<Statement>) {
            this._set = value;
            this.append(value);
        }
        private _body_1: VeArray<Statement> = new VeArray();
        public get body(): VeArray<Statement> {
            return this._body_1;
        }
        public set body(value: VeArray<Statement>) {
            this._body_1 = value;
            this.append(value);
        }
        public get class(): ClassOrIntrfaceStatement {
            return this.closest(x => x instanceof ClassOrIntrfaceStatement) as ClassOrIntrfaceStatement;
        }
        public get isStatic(): boolean {
            return this.modifiers.exists(Modifier.static);
        }
        public get isPublic(): boolean {
            return this.modifiers.exists(x => x != Modifier.private);
        }
        public get isPrivate(): boolean {
            return this.modifiers.exists(x => x == Modifier.private);
        }
        public get isCtor(): boolean {
            return this.name == 'new';
        }
        public isName(name: string): boolean {
            if (name.endsWith(this.name)) {
                var ns = name.substring(0, name.length - this.name.length);
                if (ns.endsWith(".")) ns = ns.substring(0, ns.length - 1);
                return this.class.isName(ns);
            }
        }
        public get fullName(): string {
            return this.class.fullName + "." + this.name;
        }
        public get unqiueName(): string {
            var list: VeArray<string> = new VeArray;
            var unqiue = this.attributes.find(x => x.name == 'unqiue');
            if (unqiue) {
                return this.class.fullName + "." + unqiue;
            }
            else {
                var index = this.class.body.findIndex(this);
                var len = this.class.body.findAll((x, i) => x.name == this.name && i < index).length;
                return this.class.fullName + "." + this.name + (len == 0 ? "" : "_" + len);
            }
        }
    }
    export class FunStatement extends Statement {
        public modifiers: VeArray<Modifier> = new VeArray(Modifier.private);
        public name: string;
        public generics: VeArray<{ key: string }> = new VeArray();
        public args: VeArray<Parameter> = new VeArray();
        public returnType: TypeExpression;

        public type: StatementType = StatementType.fun;
        private _body: VeArray<Statement> = new VeArray();
        public get body(): VeArray<Statement> {
            return this._body;
        }
        public set body(value: VeArray<Statement>) {
            this._body = value;
            this.append(value);
        }
        public get package(): PackageStatement {
            if (this.parent && this.parent.type == StatementType.package) {
                return this.parent as PackageStatement;
            }
            return null;
        }
    }
    export class DeclareVariable extends Statement {
        public type: StatementType = StatementType.declareVariable;
        public isReadonly: boolean;
        public name: string;
        public variableType: TypeExpression;
        private _value: Expression;
        public get value(): Expression {
            return this._value;
        }
        public set value(value: Expression) {
            this._value = value;
            this.append(value);
        }
    }

}