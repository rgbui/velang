
namespace Ve.Lang.Run {
    export var Run$ObjectReferenceProperty: Accepter<RunVisitor, void> = {
        /***查询对象的引用来源*/
        objectReferenceProperty(express: PropertyExpression) {
            var referenceType: TypeExpression;
            var rv = express.runResult;
            var names: VeArray<string> = new VeArray;
            for (var i = 0; i < express.propertys.length; i++) {
                var ep = express.propertys.eq(i);
                if (typeof ep == 'string') {
                    if (typeof referenceType != typeof undefined) {
                        switch (referenceType.kind) {
                            case TypeKind.unit:
                                var typeClass: ClassOrIntrfaceStatement = Statement.search(express, referenceType.name, x => { if (!(x instanceof ClassOrIntrfaceStatement)) return false; }).referenceStatement as ClassOrIntrfaceStatement;
                                if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {
                                    //主要是方法调用的同时需要考虑方法是否支持重载等
                                }
                                else {
                                    var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method);
                                    if (cp) {
                                        referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                        /**计算类的属性值 */
                                        rv.value = this.callObjectProp(express, cp, rv.value);
                                    }
                                    else
                                        this.error(`not found class ${typeClass.name} property:${ep}`);
                                }
                                break;
                            case TypeKind.union:
                                var typeClass: ClassOrIntrfaceStatement = Statement.search(express, referenceType.unionType.name, x => { if (!(x instanceof ClassOrIntrfaceStatement)) return false; }).referenceStatement as ClassOrIntrfaceStatement;
                                if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {
                                    //主要是方法调用的同时需要考虑方法是否支持重载等
                                }
                                else {
                                    var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method);
                                    if (cp) {
                                        referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                        var map: Record<string, TypeExpression> = {};
                                        typeClass.generics.each((gen, i) => map[gen.key] = referenceType.generics.eq(i))
                                        if (referenceType) referenceType = referenceType.injectGenericImplement(map);
                                        /**计算类的属性值*/
                                        rv.value = this.callObjectProp(express, cp, rv.value);
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
                                    /**计算object的属性值*/
                                    if (typeof rv.value[prop.key] != typeof undefined)
                                        rv.value = rv.value[prop.key]
                                    else rv.value = null;
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
                                    //说明当前的数据类源于函数参数
                                    var target = referenceStatement.target as Parameter;
                                    referenceType = target.parameterType || (target.default ? target.default.valueType : undefined);
                                    rv.value = target.runResult.value;
                                    break;
                                case StatementReferenceKind.outerClass:
                                    if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {
                                        //说明是构造函数
                                    }
                                    break;
                                case StatementReferenceKind.outerClassProperty:
                                    var cp = referenceStatement.referenceStatement as ClassProperty;
                                    referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                    //说明是类的静态属性
                                    this.accept(referenceStatement.referenceStatement);
                                    rv.value = referenceStatement.referenceStatement.runResult.value;
                                    break;
                                case StatementReferenceKind.DeclareVariable:
                                    referenceType = referenceStatement.referenceStatement.infer.expressType;
                                    rv.value = referenceStatement.referenceStatement.runResult.value;
                                    break;
                            }
                        }
                    }
                }
                else if (ep instanceof Expression) {
                    this.accept(ep);
                    referenceType = ep.infer.expressType;
                    rv.value = ep.runResult.value;
                }
            }
            if (referenceType)
                express.infer.expressType = referenceType;
        },
        /**查询调用方法的引用来源 */
        callMethod(express: CallMethodExpression) {
            express.args.each(arg => this.accept(arg));
            if (typeof express.name == 'string') {
                this.accept(express.infer.referenceStatement.referenceStatement);
            }
            else if (express.name instanceof PropertyExpression) {
                this.accept(express.name);
            }
            if (typeof express.infer.referenceStatement != typeof undefined) {
                switch (express.infer.referenceStatement.kind) {
                    case StatementReferenceKind.DeclareFun:
                        this.accept(express.infer.referenceStatement.referenceStatement);
                        var caller = express.infer.referenceStatement.referenceStatement.runResult.caller as (FunStatement | ArrowMethodExpression);
                        if (typeof caller != typeof undefined) {
                            express.runResult.value = this.callMethod(express, caller, ...express.args.map(x => x.runResult.value));
                        }
                        break;
                    case StatementReferenceKind.currentClassMethodArgs:
                    case StatementReferenceKind.FunArgs:
                        //说明来源于当前函数的参数，且参数的类函数为函数类型
                        var ca = express.infer.referenceStatement.target.caller as any;
                        if (typeof caller != typeof undefined) {
                            express.runResult.value = this.callMethod(express, ca, ...express.args.map(x => x.runResult.value));
                        }
                        break;
                    case StatementReferenceKind.outerClassProperty:
                        //来源类的方法，需要判断当前的方法是否为构造函数
                        var cp = express.infer.referenceStatement.referenceStatement as ClassProperty;
                        if (cp.isCtor) {
                            //初始化
                            var $this: Record<string, any> = JSON.parse(JSON.stringify(cp.class.runResult.value));
                            //然后计算
                            this.callObjectProp(express, cp, $this, ...express.args.map(x => x.runResult.value))
                            express.runResult.value = $this;
                        }
                        else {
                            var context = (express.name as PropertyExpression).runResult.value;
                            express.runResult.value = this.callObjectProp(express, cp, context, ...express.args.map(x => x.runResult.value))
                        }
                        break;
                    case StatementReferenceKind.outerClass:
                        var cl = express.infer.referenceStatement.referenceStatement as ClassOrIntrfaceStatement;
                        //构造函数
                        this.accept(cl)
                        //初始化,创建类的实例，需要初始一个对象
                        var $this: Record<string, any> = JSON.parse(JSON.stringify(cl.runResult.value));
                        //查询否有没参数的构造函数，如果有，则需要计算一下，否则直接给$this
                        if (cl.body.exists(x => x instanceof ClassProperty && x.isCtor && x.args.length == 0)) {
                            var cp = cl.body.find(x => x instanceof ClassProperty && x.isCtor && x.args.length == 0) as ClassProperty;
                            this.callObjectProp(express, cp, $this, ...express.args.map(x => x.runResult.value))
                        }
                        express.runResult.value = $this;
                        break;
                }
            }
        }
    }
}
