namespace Ve.Lang.Transtate.csharp {
    // export var $PropertyExpression: NodeTranstateTemplate = {
    //     type: StatementType.objectReferenceProperty,
    //     template: `@content(node)`,
    //     content(express: PropertyExpression) {
    //         var referenceType: TypeExpression;
    //         var names: VeArray<string> = new VeArray;
    //         var preCode: string = '';
    //         for (var i = 0; i < express.propertys.length; i++) {
    //             var ep = express.propertys.eq(i);
    //             if (typeof ep == 'string') {
    //                 if (typeof referenceType != typeof undefined) {
    //                     switch (referenceType.kind) {
    //                         case TypeKind.unit:
    //                             var typeClass: ClassOrIntrfaceStatement = Statement.search(express, referenceType.name, x => { if (!(x instanceof ClassOrIntrfaceStatement)) return false; }).referenceStatement as ClassOrIntrfaceStatement;
    //                             if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {
    //                                 //主要是方法调用的同时需要考虑方法是否支持重载等
    //                             }
    //                             else {
    //                                 var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method);
    //                                 if (cp) {
    //                                     referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
    //                                     preCode = this.registerMethod(cp.unqiueName, preCode);
    //                                 }
    //                             }
    //                             break;
    //                         case TypeKind.union:
    //                             var typeClass: ClassOrIntrfaceStatement = Statement.search(express, referenceType.unionType.name, x => { if (!(x instanceof ClassOrIntrfaceStatement)) return false; }).referenceStatement as ClassOrIntrfaceStatement;
    //                             if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {
    //                                 //主要是方法调用的同时需要考虑方法是否支持重载等
    //                             }
    //                             else {
    //                                 var cp: ClassProperty = typeClass.body.find(x => x.name == ep && x.kind != ClassPropertyKind.method);
    //                                 if (cp) {
    //                                     referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
    //                                     var map: Record<string, TypeExpression> = {};
    //                                     typeClass.generics.each((gen, i) => map[gen.key] = referenceType.generics.eq(i))
    //                                     if (referenceType) referenceType = referenceType.injectGenericImplement(map);
    //                                     preCode = this.registerMethod(cp.unqiueName, preCode);
    //                                 }
    //                             }
    //                             break;
    //                         case TypeKind.object:
    //                             var prop = referenceType.props.find(x => x.type == name);
    //                             if (prop) {
    //                                 referenceType = prop.type;
    //                                 preCode = (preCode ? "." : '') + name;
    //                             }
    //                             break;
    //                     }
    //                 }
    //                 else {
    //                     names.push(ep);
    //                     var referenceStatement = Statement.search(express, names.join("."));
    //                     if (referenceStatement) {
    //                         switch (referenceStatement.kind) {
    //                             case StatementReferenceKind.FunArgs:
    //                             case StatementReferenceKind.currentClassMethodArgs:
    //                                 var target = referenceStatement.target as { key: string, default?: Constant, isParameter?: boolean, type: TypeExpression };
    //                                 referenceType = target.type || (target.default ? target.default.valueType : undefined);
    //                                 preCode = names.join(".");
    //                                 break;
    //                             case StatementReferenceKind.outerClass:
    //                                 if (i == express.propertys.length - 1 && express.parent instanceof CallMethodExpression) {
    //                                     //说明是构造函数
    //                                     var cp: ClassProperty = typeClass.body.find(x => x.kind == ClassPropertyKind.method && x.isCtor && (express.parent as CallMethodExpression).isCompatibility(x));
    //                                     if (!cp && (express.parent as CallMethodExpression).args.length == 0) {
    //                                         //说明是无参数的构造函数
    //                                         // (express.parent as CallMethodExpression).infer.referenceStatement = new StatementReference(StatementReferenceKind.outerClass, typeClass);
    //                                     }
    //                                     else {
    //                                         //(express.parent as CallMethodExpression).infer.referenceStatement = new StatementReference(StatementReferenceKind.outerClassProperty, cp);
    //                                     }
    //                                 }
    //                                 break;
    //                             case StatementReferenceKind.outerClassProperty:
    //                                 var cp = referenceStatement.referenceStatement as ClassProperty;
    //                                 referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
    //                                 //这个是引用类的静态属性
    //                                 preCode = this.registerMethod(names.join("."), preCode);
    //                                 break;
    //                             case StatementReferenceKind.DeclareVariable:
    //                                 referenceType = referenceStatement.referenceStatement.infer.expressType;
    //                                 preCode = names.join(".");
    //                                 break;
    //                         }
    //                     }
    //                 }
    //             }
    //             else if (ep instanceof Expression) {
    //                 preCode += this.call(ep);
    //                 referenceType = ep.infer.expressType;
    //             }
    //         }
    //         return preCode;
    //     }
    // }
    // export var $CallMethodExpression: NodeTranstateTemplate = {
    //     type: StatementType.callMethod,
    //     template: `@content(node)`,
    //     content(express: CallMethodExpression) {
    //         if (typeof express.name == 'string') {
    //             return `${express.name}(${express.args.map(x => this.call(x)).join(",")})`;
    //         }
    //         else if (express.name instanceof PropertyExpression) {
    //             var preCode = this.call(express.name);
    //             if (typeof express.infer.referenceStatement != typeof undefined) {
    //                 switch (express.infer.referenceStatement.kind) {
    //                     case StatementReferenceKind.DeclareFun:
    //                     case StatementReferenceKind.currentClassMethodArgs:
    //                     case StatementReferenceKind.FunArgs:
    //                         return `${preCode}(${express.args.map(x => this.call(x)).join(",")})`;
    //                     case StatementReferenceKind.outerClassProperty:
    //                         var cp = express.infer.referenceStatement.referenceStatement as ClassProperty;
    //                         var args = express.args.map(x => this.call(x));
    //                         return this.registerMethod(cp.unqiueName, preCode, ...args);
    //                     case StatementReferenceKind.outerClass:
    //                         var ci = express.infer.referenceStatement.referenceStatement as ClassOrIntrfaceStatement;
    //                         return this.registerMethod(ci.fullName, preCode, ...args);
    //                 }
    //             }
    //         }

    //     }
    // }
}