namespace Ve.Lang {

    export var Infer$ObjectReferenceProperty: Accepter<InferFactory, void> = {
        /***查询对象的引用来源*/
        $objectReferenceProperty(express: PropertyExpression) {
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
                                        //主要是方法调用的同时需要考虑方法是否支持重载等
                                        var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind == ClassPropertyKind.method && (express.parent as CallMethodExpression).isCompatibility(x));
                                        if (!cp) {
                                            if (typeClass.body.find(x => x.name == ep && x.kind == ClassPropertyKind.method)) {
                                                this.error(`the class ${typeClass.fullName} method ${ep} args is not  compatibility`);
                                            }
                                            else if (typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method)) {
                                                this.error(`the class ${typeClass.fullName} method ${ep}  is not method name `);
                                            }
                                            else {
                                                this.error(`not found class ${typeClass.fullName} method ${ep} `);
                                            }
                                        }
                                        else {
                                            (express.parent as CallMethodExpression).infer.referenceStatement = new StatementReference(StatementReferenceKind.outerClassProperty, cp);
                                        }
                                    }
                                    else {
                                        var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method);
                                        if (cp)
                                            referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                        else
                                            this.error(`not found class ${typeClass.name} property:${ep}`);
                                    }
                                }
                                else {
                                    this.error(`not found class ${referenceType.name} `);
                                }
                                break;
                            case TypeKind.union:
                                var typeClass: ClassOrIntrfaceStatement = Statement.search(express, referenceType.unionType.name, x => { if (!(x instanceof ClassOrIntrfaceStatement)) return false; }).referenceStatement as ClassOrIntrfaceStatement;
                                if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {
                                    //主要是方法调用的同时需要考虑方法是否支持重载等
                                    var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind == ClassPropertyKind.method && (express.parent as CallMethodExpression).isCompatibility(x));
                                    (express.parent as CallMethodExpression).infer.referenceStatement = new StatementReference(StatementReferenceKind.outerClassProperty, cp);
                                }
                                else {
                                    var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method);
                                    if (cp) {
                                        referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                        var map: Record<string, TypeExpression> = {};
                                        typeClass.generics.each((gen, i) => map[gen.key] = referenceType.generics.eq(i))
                                        if (referenceType) referenceType = referenceType.injectGenericImplement(map);
                                    }
                                    else {
                                        this.error(`not found class ${typeClass.name} property:${ep}`);
                                    }
                                }
                                break;
                            case TypeKind.object:
                                var prop = referenceType.props.find(x => x.type == name);
                                if (prop) {
                                    referenceType = prop.type;
                                }
                                else
                                    this.error(`无法找到object对象${name}`);
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
                                    break;
                                case StatementReferenceKind.outerClass:
                                    if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {
                                        //说明是构造函数
                                        var cp: ClassProperty = typeClass.body.find(x => x.kind == ClassPropertyKind.method && x.isCtor && (express.parent as CallMethodExpression).isCompatibility(x));
                                        if (!cp && (express.parent as CallMethodExpression).args.length == 0) {
                                            //说明是无参数的构造函数
                                            (express.parent as CallMethodExpression).infer.referenceStatement = new StatementReference(StatementReferenceKind.outerClass, typeClass);

                                        }
                                        else {
                                            (express.parent as CallMethodExpression).infer.referenceStatement = new StatementReference(StatementReferenceKind.outerClassProperty, cp);

                                        }
                                    }
                                    else {
                                        //继续查找
                                    }
                                    break;
                                case StatementReferenceKind.outerClassProperty:
                                    var cp = referenceStatement.referenceStatement as ClassProperty;
                                    referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                    break;
                                case StatementReferenceKind.DeclareVariable:
                                    referenceType = referenceStatement.referenceStatement.infer.expressType;
                                    break;
                            }
                        }
                    }
                }
                else if (ep instanceof Expression) {
                    this.accept(ep);
                    referenceType = ep.infer.expressType;
                }
            }
            if (referenceType)
                express.infer.expressType = referenceType;
        },
        /**查询调用方法的引用来源 */
        callMethod(express: CallMethodExpression) {
            express.args.each(arg => this.accept(arg));
            if (typeof express.name == 'string') {
                var reference = Statement.search(express, express.name, x => {
                    if (x instanceof ClassProperty && x.kind != ClassPropertyKind.method) return false;
                });
                if (reference) express.infer.referenceStatement = reference;
            }
            else if (express.name instanceof PropertyExpression) {
                this.accept(express.name);
            }
            if (typeof express.infer.referenceStatement != typeof undefined) {
                switch (express.infer.referenceStatement.kind) {
                    case StatementReferenceKind.DeclareFun:
                        var method = express.infer.referenceStatement.referenceStatement as FunStatement;
                        express.infer.expressType = method.returnType.injectGenericImplement(express.getGenericMap());
                        break;
                    case StatementReferenceKind.currentClassMethodArgs:
                    case StatementReferenceKind.FunArgs:
                        var target = express.infer.referenceStatement.target as { key: string, default?: Constant, isParameter?: boolean, type: TypeExpression };
                        var argType = target.type || (target.default ? target.default.valueType : undefined);
                        if (argType && argType.kind == TypeKind.fun) {
                            express.infer.expressType = argType.returnType.injectGenericImplement(express.getGenericMap());
                        }
                        break;
                    case StatementReferenceKind.outerClassProperty:
                        var cp = express.infer.referenceStatement.referenceStatement as ClassProperty;
                        if (!cp) {
                            console.log(express);
                        }
                        if (cp.isCtor) {
                            if (cp.class.generics.length > 0) {
                                express.infer.expressType = new TypeExpression(TypeKind.union);
                                express.infer.expressType.unionType = TypeExpression.createUnitType(cp.class.fullName);
                                express.infer.expressType.generics = express.generics.map(x => x.type);
                            }
                            else
                                express.infer.expressType = TypeExpression.createUnitType(cp.class.fullName);
                        }
                        else {
                            express.infer.expressType = cp.returnType.injectGenericImplement(express.getGenericMap());
                        }
                        break;
                    case StatementReferenceKind.outerClass:
                        var ci = express.infer.referenceStatement.referenceStatement as ClassOrIntrfaceStatement;
                        express.infer.expressType = new TypeExpression(TypeKind.union);
                        express.infer.expressType.unionType = TypeExpression.createUnitType(ci.fullName);
                        express.infer.expressType.generics = express.generics.map(x => x.type);
                        break;
                }
            }
        }
    }
}

/***
 *  def list=new Array<String>();
 *  list.find(x=>x=="ssss");
 *  list.first;
 *  def obj={a:"ejsis",g:"efsss"};
 *  def g=obj.a;
 *
 */