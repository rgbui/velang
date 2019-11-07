namespace Ve.Lang.Transtate.js {
    export var accepter$method: Accepter<VisitorLange, void> = {
        objectReferenceProperty(express: PropertyExpression) {

            LangRender.create(express, {
                template: `@content()`,
                props: {
                    content() {
                        var express = this.node as PropertyExpression;
                        var preCode = '';
                        var referenceType: TypeExpression;
                        var names: VeArray<string> = new VeArray;
                        for (var i = 0; i < express.propertys.length; i++) {
                            var ep = express.propertys.eq(i);
                            if (typeof ep == 'string') {
                                if (typeof referenceType != typeof undefined) {
                                    switch (referenceType.kind) {
                                        case TypeKind.unit:
                                            var result = Statement.search(express, referenceType.name, x => {
                                                if (!(x instanceof ClassOrIntrfaceStatement)) return false;
                                            });
                                            if (result) {
                                                var typeClass: ClassOrIntrfaceStatement = result.referenceStatement as ClassOrIntrfaceStatement;
                                                if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {

                                                }
                                                else {
                                                    var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method);
                                                    if (cp) {
                                                        referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                        preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                    }
                                                }
                                            }
                                            break;
                                        case TypeKind.union:
                                            var typeClass: ClassOrIntrfaceStatement = Statement.search(express, referenceType.unionType.name, x => { if (!(x instanceof ClassOrIntrfaceStatement)) return false; }).referenceStatement as ClassOrIntrfaceStatement;
                                            if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {

                                            }
                                            else {
                                                var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method);
                                                if (cp) {
                                                    referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                    var map: Record<string, TypeExpression> = {};
                                                    typeClass.generics.each((gen, i) => map[gen.key] = referenceType.generics.eq(i))
                                                    if (referenceType) referenceType = referenceType.injectGenericImplement(map);
                                                    preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                }
                                            }
                                            break;
                                        case TypeKind.object:
                                            var prop = referenceType.props.find(x => x.type == name);
                                            if (prop) {
                                                referenceType = prop.type;
                                                preCode = preCode + `.${name}`;
                                            }
                                            break;
                                    }
                                }
                                else {
                                    names.push(ep);
                                    var referenceStatement = Statement.search(express, names.join("."));
                                    if (referenceStatement) {
                                        switch (referenceStatement.kind) {
                                            case StatementReferenceKind.FunArgs:
                                            case StatementReferenceKind.currentClassMethodArgs:
                                                var target = referenceStatement.target as Parameter;
                                                referenceType = target.parameterType || (target.default ? target.default.valueType : undefined);
                                                preCode = names.join(".");
                                                break;
                                            case StatementReferenceKind.outerClass:
                                                if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {

                                                }
                                                else {
                                                    //继续查找
                                                }
                                                break;
                                            case StatementReferenceKind.outerClassProperty:
                                                var cp = referenceStatement.referenceStatement as ClassProperty;
                                                referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                break;
                                            case StatementReferenceKind.DeclareVariable:
                                                referenceType = referenceStatement.referenceStatement.infer.expressType;
                                                preCode = names.join(".");
                                                break;
                                        }
                                    }
                                }
                            }
                            else if (ep instanceof Expression) {
                                this.visitor.accept(ep);
                                this.call(ep);
                                referenceType = ep.infer.expressType;
                                preCode += ep.langeRender.render();
                            }
                        }
                        if (referenceType)
                            express.infer.expressType = referenceType;
                        return preCode;
                    }
                }
            })
        },
        callMethod(express: CallMethodExpression) {
            express.args.each(arg => this.accept(arg));
            if (typeof express.name == 'string') {
                LangRender.create(express, { template: `${express.name}(${express.args.map(x => x.langeRender.render()).join(",")})` });
            }
            else if (express.name instanceof PropertyExpression) {
                this.accept(express.name)
                if (typeof express.infer.referenceStatement != typeof undefined) {
                    switch (express.infer.referenceStatement.kind) {
                        case StatementReferenceKind.DeclareFun:
                        case StatementReferenceKind.currentClassMethodArgs:
                        case StatementReferenceKind.FunArgs:
                            LangRender.create(express, {
                                template: `@preCode@{}(@args())`,
                                props: {
                                    preCode() {
                                        var express = this.node as CallMethodExpression;
                                        if (express.name instanceof Expression) {
                                            return express.name.langeRender.render();
                                        }
                                    },
                                    args() {
                                        var express = this.node as CallMethodExpression;
                                        return express.args.map(arg => arg.langeRender.render()).join(",");
                                    }
                                }
                            })
                            break;
                        case StatementReferenceKind.outerClassProperty:
                            var cp = express.infer.referenceStatement.referenceStatement as ClassProperty;
                            var args = new VeArray('@arg(-1)').append(express.args.map((a, i) => `@arg(${i})`))
                            var template = this.acceptMethod(cp.unqiueName, express, ...args);
                            LangRender.create(express, {
                                template,
                                props: {
                                    arg(pos: number) {
                                        var express = this.node as CallMethodExpression;
                                        if (pos == -1) {
                                            if (express.name instanceof Expression)
                                                return express.name.langeRender.render()
                                            else if (typeof express.name == 'string') return express.name;
                                        }
                                        else {
                                            return express.args.eq(pos).langeRender.render();
                                        }
                                    }
                                }
                            });
                            break;
                        case StatementReferenceKind.outerClass:
                            var args = new VeArray('@arg(-1)').append(express.args.map((a, i) => `@arg(${i})`))
                            var ci = express.infer.referenceStatement.referenceStatement as ClassOrIntrfaceStatement;
                            var template = this.acceptMethod(ci.fullName, express, ...args);
                            LangRender.create(express, {
                                template: template,
                                props: {
                                    arg(pos: number) {
                                        var express = this.node as CallMethodExpression;
                                        if (pos == -1) {
                                            if (express.name instanceof Expression)
                                                return express.name.langeRender.render()
                                            else if (typeof express.name == 'string') return express.name;
                                        }
                                        else {
                                            return express.args.eq(pos).langeRender.render();
                                        }
                                    }
                                }
                            })
                    }
                }
            }
        }
    }
}