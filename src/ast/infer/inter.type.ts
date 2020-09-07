///<reference path='../../util/list.ts'/>

namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    export class InferType {
        static InferTypeStatements(statement: Statement | List<Statement>): TypeExpress {
            var st = statement instanceof List ? statement : new List(statement);
            if (st.length == 1 && st.first() instanceof Express) {
                return st.first().inferType();
            }
            var r: ReturnStatement;
            st.each(s => {
                if (s instanceof ReturnStatement) {
                    r = s;
                    return false;
                }
                var re = s.find(x => x instanceof ReturnStatement) as ReturnStatement;
                if (re) {
                    r = re;
                    return false;
                }
            });
            if (r) return r.result.inferType();
            else return TypeExpress.create({ name: 'void' });
        }
        static InferTypeOperatorBinaryExpress(binary: BinaryExpress): ClassOperator {
            var leftType = binary.left.inferType();
            var rightType = binary.right.inferType();
            var typeName = leftType.name;
            /****类型不一致，先检测是否是父类与子类 */
            if (!TypeExpress.typeIsEqual(binary, leftType, rightType)) {
                if (TypeExpress.typeIsEqual(binary, leftType, rightType, true)) {
                    //说明leftType继承于rightType
                    typeName = rightType.name;
                }
                else if (TypeExpress.typeIsEqual(binary, rightType, leftType, true)) {

                }
                else if (
                    TypeExpress.typeIsEqual(binary, leftType, TypeExpress.create({ name: 'string' }))
                    ||
                    TypeExpress.typeIsEqual(binary, rightType, TypeExpress.create({ name: 'string' }))
                ) {
                    //这里有字符串，那么操作符返回的就是字符串
                    typeName = TypeExpress.create({ name: 'string' }).name;
                }
            }
            var cla = binary.queryName(typeName, new List(NodeType.class));
            var op = cla.propertys.find(x => (x instanceof ClassOperator) && x.name == binary.operator) as ClassOperator;
            if (op) return op;
        }
        static InferTypeObjectKeyType(node: ObjectCallExpress, callExpress?: MethodCallExpress | NewCallExpress): TypeExpress {
            var callers = node.nameCallers;
            var names: List<string> = new List();
            var inferType: TypeExpress;
            var searchKey = (key: string, last?: boolean) => {
                if (inferType) {
                    /**
                     * 推断unit类型
                     */
                    if (inferType.name) {
                        if (last == true && callExpress instanceof MethodCallExpress) {
                            var cla = node.queryName(inferType.name, new List(NodeType.class)) as ClassStatement;
                            var pros = cla.propertys.findAll(x => (x instanceof ClassMethod) && x.isPublic && !x.isStatic && x.name == key) as List<ClassMethod>;
                            if (pros.length == 0) {
                                throw Exception.create([ExceptionCode.notFoundMethod, node, '"@{className}"类中无法找到方法"${name}"', { name: key, className: cla.fullNames.first() }]);
                            }
                            var pro = pros.find(x => this.InferTypeMethodCallFunTypeIsCompatibility(callExpress, x, inferType.generics)) as any;
                            if (pro) {
                                inferType = pro.inferType().returnType;
                            }
                            else {
                                throw Exception.create([ExceptionCode.notFoundMethod, node, '调用"@{className}"类中的方法"${name}"方法不兼容', { name: key, className: cla.fullNames.first() }]);
                            }
                        }
                        else if (last == true && callExpress instanceof NewCallExpress) {
                            var cla = node.queryName(inferType.name, new List(NodeType.class)) as ClassStatement;
                            var pros = cla.propertys.findAll(x => (x instanceof ClassMethod) && x.isCtor && x.isPublic) as List<ClassMethod>;
                            if (pros.length == 0) {
                                throw Exception.create([ExceptionCode.notFoundMethod, node, '"@{className}"类中无法找到方法"${name}"', { name: key, className: cla.fullNames.first() }]);
                            }
                            var pro = pros.find(x => this.InferTypeMethodCallFunTypeIsCompatibility(callExpress.caller as MethodCallExpress, x, inferType.generics)) as any;
                            if (pro) {
                                inferType = pro.inferType().retunType;
                            }
                            else {
                                throw Exception.create([ExceptionCode.notFoundMethod, node, '调用"@{className}"类中的方法"${name}"方法不兼容', { name: key, className: cla.fullNames.first() }]);
                            }
                        }
                        else {
                            var cla = node.queryName(inferType.name, new List(NodeType.class)) as ClassStatement;
                            if (!cla) {
                                throw `not found class name:${inferType.name}`
                            }
                            var pro = cla.propertys.find(x => x instanceof ClassProperty && x.isPublic && !x.isStatic && x.isName(key)) as any;
                            if (pro) {
                                inferType = pro.inferType();
                            }
                            else {
                                throw `this class ${cla.fullNames.first()} not found ${key} `;
                            }
                        }
                    }
                    else if (inferType.generics.length > 0) {
                        /***
                         *  这里处理的是数组类型
                         * 
                         */
                        var name = inferType.unionType.name;
                        if (last == true && callExpress instanceof MethodCallExpress) {
                            var cla = node.queryName(name, new List(NodeType.class)) as ClassStatement;
                            var pros = cla.propertys.findAll(x => (x instanceof ClassMethod) && x.isPublic && !x.isStatic && x.name == key) as List<ClassMethod>;
                            if (pros.length == 0) {
                                throw Exception.create([ExceptionCode.notFoundMethod, node, '"@{className}"类中无法找到方法"${name}"', { name: key, className: cla.fullNames.first() }]);
                            }
                            var pro = pros.find(x => this.InferTypeMethodCallFunTypeIsCompatibility(callExpress, x, inferType.generics)) as any;
                            if (pro) {
                                inferType = pro.inferType().returnType;
                            }
                            else {
                                throw Exception.create([ExceptionCode.notFoundMethod, node, '调用"@{className}"类中的方法"${name}"方法不兼容', { name: key, className: cla.fullNames.first() }]);
                            }
                        }
                        else if (last == true && callExpress instanceof NewCallExpress) {
                            var cla = node.queryName(name, new List(NodeType.class)) as ClassStatement;
                            var pros = cla.propertys.findAll(x => (x instanceof ClassMethod) && x.isCtor && x.isPublic) as List<ClassMethod>;
                            if (pros.length == 0) {
                                throw Exception.create([ExceptionCode.notFoundMethod, node, '"@{className}"类中无法找到方法"${name}"', { name: key, className: cla.fullNames.first() }]);
                            }
                            var pro = pros.find(x => this.InferTypeMethodCallFunTypeIsCompatibility(callExpress.caller as MethodCallExpress, x, inferType.generics)) as any;
                            if (pro) {
                                inferType = pro.inferType().retunType;
                            }
                            else {
                                throw Exception.create([ExceptionCode.notFoundMethod, node, '调用"@{className}"类中的方法"${name}"方法不兼容', { name: key, className: cla.fullNames.first() }]);
                            }
                        }
                        else if (name) {
                            var cla = node.queryName(name, new List(NodeType.class)) as ClassStatement;
                            if (!cla) {
                                throw `not found class name:${name}`
                            }
                            var pro = cla.propertys.find(x => x instanceof ClassProperty && x.isPublic && !x.isStatic && x.isName(key)) as any;
                            if (pro) {
                                inferType = pro.inferType();
                            }
                            else {
                                throw `this class ${cla.fullNames.first()} not found ${key} `;
                            }
                        }
                    }
                }
                else {
                    names.push(key);
                    var cp = node.queryName(names.join("."), (x) => x instanceof ClassProperty && x.isStatic && x.isPublic);
                    if (cp) {
                        inferType = cp.inferType();
                    }
                }
            }
            for (let i = 0; i < callers.length; i++) {
                if (i == 0) {
                    var caller = callers.eq(i);
                    if (caller instanceof AtExpress) {
                        inferType = caller.inferType();
                    }
                    else if (caller instanceof NameCall) {
                        var nb = caller.queryName(caller.name);
                        if (nb) {
                            inferType = nb.inferType();
                        }
                        else {
                            names.push(caller.name);
                        }
                    }
                    else {
                        inferType = caller.inferType();
                    }
                }
                else searchKey((callers.eq(i) as ObjectCallExpress).key.name);
            }
            searchKey(node.key.name, true);
            return inferType;
        }
        /***判断函数调用的类型是否与函数类型相一致 */
        static InferTypeMethodCallFunTypeIsCompatibility(methodCall: MethodCallExpress, fun: FunStatement | ClassMethod, classGen?: List<TypeExpress>) {
            var gens: List<Generic>;
            var imps: List<TypeExpress>;
            if (methodCall.caller instanceof NameCall) {
                /***函数调用的泛型实现，需要判断fun是否提供泛型，至于泛型的约束类型，暂不考虑 */
                if (methodCall.caller.implementGeneric && fun.generics) {
                    gens = fun.generics;
                    imps = methodCall.caller.implementGeneric;
                    if (methodCall.caller.implementGeneric.length != fun.generics.length) return false;
                }
                else throw Exception.create([ExceptionCode.notImplementGenerics, methodCall, '未实现方法@{name}的泛型参数<@{gens}>', { name: methodCall.caller.name, gens: fun.generics.map(g => g.name).join(",") }]);
                var cla = (fun as ClassMethod).class;
                if (classGen && cla.generics && cla.generics.length > 0) {
                    if (!gens) gens = new List();
                    if (!imps) imps = new List();
                    gens.insertArrayAt(0, cla.generics);
                    imps.insertAt(0, classGen);
                }
            }
            var len = Math.max(fun.parameters.length, methodCall.argements.length);
            var restBaseType;
            for (var i = 0; i < len; i++) {
                var arg = methodCall.argements.eq(i);
                var parm = fun.parameters.eq(i);
                var argType: TypeExpress, parmType: TypeExpress;
                if (!arg && parm) {
                    /***说明函数的参数没有调用完 */
                    //看看是否是可选参数，有没有初始值
                    if (parm.optional == true)
                        //说明是可选的，那么默认值为Null
                        continue;
                    else if (parm.default)
                        //有初始值
                        continue;
                    else return false;
                }
                else if (arg && !parm) {
                    //如果函数参数用完了，则判断有没有剩余的扩展参数
                    if (!restBaseType) return false;
                    parmType = restBaseType;
                    argType = arg.inferType();
                }
                else if (arg && parm) {
                    argType = arg.inferType();
                    if (parm.rest) parmType = parm.inferType().generics.first();
                    else parmType = parm.inferType();
                    if (gens) parmType = parmType.injectImplementGenerics(gens, imps);
                }
                if (!TypeExpress.typeIsEqual(methodCall, argType, parmType, true)) return false;
            }
            return true;
        }
        /***判断类型参数数组与函数参数类型相一致 */
        static InterTypeListTypeFunTypeIsCompatibility(listType: List<TypeExpress>, fun: FunStatement | ClassMethod) {
            var len = Math.max(fun.parameters.length, listType.length);
            var restBaseType;
            for (var i = 0; i < len; i++) {
                var parm = fun.parameters.eq(i);
                var arg: TypeExpress, parmType: TypeExpress;
                arg = listType.eq(i);
                if (!arg && parm) {
                    /***说明函数的参数没有调用完 */
                    //看看是否是可选参数，有没有初始值
                    if (parm.optional == true)
                        //说明是可选的，那么默认值为Null
                        continue;
                    else if (parm.default)
                        //有初始值
                        continue;
                    else return false;
                }
                else if (arg && !parm) {
                    //如果函数参数用完了，则判断有没有剩余的扩展参数
                    if (!restBaseType) return false;
                    parmType = restBaseType;
                }
                else if (arg && parm) {
                    if (parm.rest) parmType = parm.inferType().generics.first();
                    else parmType = parm.inferType();
                }
                if (!TypeExpress.typeIsEqual(fun, arg, parmType, true)) return false;
            }
            return true;
        }
    }
}
