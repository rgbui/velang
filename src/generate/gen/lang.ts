
namespace Ve.Lang.Generate {
    import List = Util.List;
    export class GenerateLang extends Ve.Lang.Util.BaseEvent {
        paper: GeneratePaper;
        private libs: List<{ ns: string, apis: Record<string, apiRender> }> = new List();
        import(la: apiPackage) {
            for (var n in la) {
                var sp = this.libs.find(x => x.ns == n);
                if (!sp) {
                    sp = { ns: n, apis: {} };
                    this.libs.push(sp);
                }
                for (let m in la[n]) {
                    sp.apis[m] = la[n][m];
                }
            }
        }
        renderClassProp(onlyName: string, obj: Record<string, any>) {
            var ap: apiRender;
            for (var i = 0; i < this.libs.length; i++) {
                var lib = this.libs.eq(i);
                if (onlyName.startsWith(lib.ns)) {
                    var nb = onlyName.replace(lib.ns + ".", '');
                    if (typeof lib.apis[nb] != 'undefined') {
                        ap = lib.apis[nb];
                    }
                }
            }
            return Razor.RazorTemplate.compile(ap, obj);
        }
        generateMethod(node: ObjectCallExpress, callExpress: MethodCallExpress | NewCallExpress, render: NodeRender) {
            var callers = node.nameCallers;
            callers.each(cal => {
                render.append(cal);
            });
            var names: List<string> = new List();
            var inferType: TypeExpress;
            var nameCode = '';
            var searchKey = (key: string, last?: boolean) => {
                if (inferType) {
                    if (inferType.name) {
                        if (last == true && callExpress instanceof MethodCallExpress) {
                            var cla = node.queryName(inferType.name, new List(NodeType.class)) as ClassStatement;
                            var pros = cla.propertys.findAll(x => (x instanceof ClassMethod) && x.isPublic && !x.isStatic && x.name == key) as List<ClassMethod>;
                            var pro = pros.find(x => InferType.InferTypeMethodCallFunTypeIsCompatibility(callExpress, x, inferType.generics)) as any;
                            if (pro) {
                                inferType = pro.inferType().retunType;
                                var cm = pro as ClassMethod;
                                var obj = { caller: nameCode };
                                callExpress.argements.each((arg, i) => {
                                    obj[cm.parameters.eq(i).name] = render.express(arg);
                                });
                                nameCode = this.renderClassProp(pro.onlyName, obj);
                            }
                        }
                        else if (last == true && callExpress instanceof NewCallExpress) {
                            var cla = node.queryName(inferType.name, new List(NodeType.class)) as ClassStatement;
                            var pros = cla.propertys.findAll(x => (x instanceof ClassMethod) && x.isCtor && x.isPublic) as List<ClassMethod>;
                            var pro = pros.find(x => InferType.InferTypeMethodCallFunTypeIsCompatibility(callExpress.caller as MethodCallExpress, x, inferType.generics)) as any;
                            if (pro) {
                                inferType = pro.inferType().retunType;
                                var cm = pro as ClassMethod;
                                var obj = { caller: nameCode };
                                (callExpress.caller as MethodCallExpress).argements.each((arg, i) => {
                                    obj[cm.parameters.eq(i).name] = render.express(arg);
                                });
                                nameCode = this.renderClassProp(pro.onlyName, obj);
                            }
                        }
                        else {
                            var cla = node.queryName(inferType.name, new List(NodeType.class)) as ClassStatement;
                            if (!cla) {
                                console.log(inferType.name, node, cla);
                            }
                            var pro = cla.propertys.find(x => x instanceof ClassProperty && x.isPublic && !x.isStatic && x.isName(key)) as any;
                            if (pro) {
                                inferType = pro.inferType();
                                var obj = { caller: nameCode };
                                nameCode = this.renderClassProp(pro.onlyName, { caller: nameCode });
                            }
                        }
                    }
                    else if (inferType.unionType) {
                        /***
                         * 数组泛型类型
                         */
                        if (last == true && callExpress instanceof MethodCallExpress) {
                            var cla = node.queryName(inferType.unionType.name, new List(NodeType.class)) as ClassStatement;
                            var pros = cla.propertys.findAll(x => (x instanceof ClassMethod) && x.isPublic && !x.isStatic && x.name == key) as List<ClassMethod>;
                            var pro = pros.find(x => InferType.InferTypeMethodCallFunTypeIsCompatibility(callExpress, x, inferType.generics)) as any;
                            if (pro) {
                                inferType = pro.inferType().retunType;
                                var cm = pro as ClassMethod;
                                var obj = { caller: nameCode };
                                callExpress.argements.each((arg, i) => {
                                    obj[cm.parameters.eq(i).name] = render.express(arg);
                                });
                                nameCode = this.renderClassProp(pro.onlyName, obj);
                            }
                        }
                        else if (last == true && callExpress instanceof NewCallExpress) {
                            var cla = node.queryName(inferType.unionType.name, new List(NodeType.class)) as ClassStatement;
                            var pros = cla.propertys.findAll(x => (x instanceof ClassMethod) && x.isCtor && x.isPublic) as List<ClassMethod>;
                            var pro = pros.find(x => InferType.InferTypeMethodCallFunTypeIsCompatibility(callExpress.caller as MethodCallExpress, x, inferType.generics)) as any;
                            if (pro) {
                                inferType = pro.inferType().retunType;
                                var cm = pro as ClassMethod;
                                var obj = { caller: nameCode };
                                (callExpress.caller as MethodCallExpress).argements.each((arg, i) => {
                                    obj[cm.parameters.eq(i).name] = render.express(arg);
                                });
                                nameCode = this.renderClassProp(pro.onlyName, obj);
                            }
                        }
                        else {
                            var cla = node.queryName(inferType.unionType.name, new List(NodeType.class)) as ClassStatement;
                            if (!cla) {
                                console.log(inferType.name, node, cla);
                            }
                            var pro = cla.propertys.find(x => x instanceof ClassProperty && x.isPublic && !x.isStatic && x.isName(key)) as any;
                            if (pro) {
                                inferType = pro.inferType();
                                var obj = { caller: nameCode };
                                nameCode = this.renderClassProp(pro.onlyName, { caller: nameCode });
                            }
                        }
                    }
                }
                else {
                    names.push(key);
                    var cp = node.queryName(names.join("."), (x) => x instanceof ClassProperty && x.isStatic && x.isPublic);
                    if (cp) {
                        inferType = cp.inferType();
                        this.renderClassProp(cp.onlyName, { caller: nameCode });
                    }
                }
            }
            for (let i = 0; i < callers.length; i++) {
                if (i == 0) {
                    var caller = callers.eq(i);
                    if (caller instanceof NameCall) {
                        var nb = caller.queryName(caller.name);
                        if (nb) {
                            inferType = nb.inferType();
                            nameCode = render.express(caller);
                        }
                        else {
                            names.push(caller.name);
                        }
                    }
                    else {
                        inferType = caller.inferType();
                        nameCode = render.express(caller);
                    }
                }
                else searchKey((callers.eq(i) as ObjectCallExpress).key.name);
            }
            searchKey(node.key.name, true);
            return nameCode;
        }
        generateAt(node: AtExpress, render: NodeRender) {
            if (node.at instanceof NameCall) {
                render.append(node.at);
                return `${this.paper.thisObjectName || 'this'}.${render.ref((node.at as NameCall).name)}`;
            }
        }
    }
}