
///<reference path='method.ts'/>
///<reference path='expression.ts'/>
///<reference path='keyword.ts'/>

namespace Ve.Lang.Transtate.js {
    export var accepter: Accepter<VisitorLange, void> = {
        package(express: PackageStatement) {
            var content = '';
            var ns = VeArray.asVeArray(express.name.split(".")) as VeArray<string>;
            ns.recursion((name: string, i: number, next: (i: number) => void) => {
                var pre = i > 0 ? ns.eq(i - 1) : '';
                content += (`var ${name};`);
                content += (`(function(${name}){`);
                next(i + 1);
                if (i == ns.length - 1) {
                    content += '@content()'
                }
                if (pre)
                    content += (`})(${name}=${pre}.${name}||(${pre}.${name}={}))`);
                else content += (`})(${name}||(${name}={}))`);
            })
            express.body.map(x => this.accept(x));
            return LangRender.create(express, {
                template: `${content}`,
                props: {
                    content() {
                        return this.renderList(express.body);
                    }
                }
            });
        },
        context(express: ClassContext) {
            return LangRender.create(express, {
                template: `${express.name}`
            });
        },
        use(express: UseStatement) {
            return LangRender.create(express, {
                template: `@if(node.localName)
                {
                    var @node.localName=@node.name;
                }
                `,
                props: {
                    node: express
                }
            })
        },
        $class(express: ClassOrIntrfaceStatement) {
            express.body.each(s => this.accept(s));
            var className = express.name;
            var lastName = express.package.lastName;
            LangRender.create(express, {
                template: `class ${className == lastName ? className + "1" : className}  @if(node.extendName) { extends @node.extendName } 
                {
                     @content()
                }
                ${lastName}.${express.name}=${className == lastName ? className + "1" : className}
                `,
                props: {
                    content() {
                        return this.renderList(express.body);
                    }
                }
            })
        },
        enum(express: EnumStatement) {
            LangRender.create(express, {
                template: `var @node.name;
                (function(@node.name){
                    @content(node);
                })(@node.name=@node.package.lastName@{}.@node.name||(@node.package.lastName@{}.@node.name={ }))
               `,
                props: {
                    content() {
                        if (this.node instanceof EnumStatement) {
                            return express.options.map(pro => {
                                return `${express.name}[${express.name}["${pro.key}"]=${this.visitor.accept(pro.value)}]="${pro.key}";`;
                            }).join("");
                        }
                    }
                }
            })
        },
        classProperty(express: ClassProperty) {
            if (express.kind == ClassPropertyKind.prop) {
                // return `${express.name}${express.value ? `=${this.call(express.value)}` : ''}`;
            }
            else if (express.kind == ClassPropertyKind.method) {
                express.body.each(s => this.accept(s));
            }
            else if (express.kind == ClassPropertyKind.field) {
                if (express.get.length > 0) {
                    express.get.each(s => this.accept(s))
                }
                if (express.set.length > 0) {
                    express.set.each(s => this.accept(s))
                }
            }
            LangRender.create(express, {
                template: `@content()`,
                props: {
                    content() {
                        if (this.node instanceof ClassProperty) {
                            var express = this.node;
                            if (express.kind == ClassPropertyKind.prop) {
                                // return `${express.name}${express.value ? `=${this.call(express.value)}` : ''}`;
                            }
                            else if (express.kind == ClassPropertyKind.method) {
                                var argsString = express.args.map(arg => this.visitor.accept(arg)).join(",");
                                return `${express.name}(${argsString}){${this.renderList(express.body)}}`;
                            }
                            else if (express.kind == ClassPropertyKind.field) {
                                var code = '';
                                if (express.get.length > 0) {
                                    code += `get ${express.name}(){${this.renderList(express.get)}}`
                                }
                                else {
                                    code += `set ${express.name}(value){${this.renderList(express.set)}}`;
                                }
                            }
                        }
                    }
                }
            })
        },
        fun(express: FunStatement) {
            express.body.each(exp => this.accept(exp));
            return LangRender.create(express, {
                template: `function @node.name@{}(@parameter()){@statement(node.body)}`,
                props: {
                    parameter() {
                        var express = this.node as FunStatement;
                        return express.args.map(arg => this.visitor.accept(arg)).join(",")
                    },
                    statement(body: VeArray<Statement>) {
                        return this.renderList(express.body);
                    }
                }
            })
        },
        declareVariable(express: DeclareVariable) {
            if (express.value)
                this.accept(express.value);
            return LangRender.create(express, {
                template: `var @node.name@if(node.value){=@call(node.value)}`,
            })
        }
    }
    applyExtend(accepter, accepter$binary, accepter$statement, accepter$method);
}