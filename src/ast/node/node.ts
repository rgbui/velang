///<reference path='../../util/list.ts'/>



namespace Ve.Lang {
    import List = Util.List;
    export type NodeMayAppendType = Node | List<Node> | List<Node | List<Node>> | List<List<Node>>;
    export class Node {
        public childs: List<Node> = new List;
        public tokens: List<Token> = new List;
        parent: Node;
        type: NodeType;
        inferType(classGenerics?: List<TypeExpress>, methodGenerics?: List<TypeExpress>): TypeExpress {
            return null;
        }
        constructor(options?: Record<string, any>) {
            if (typeof options == 'object') {
                for (var n in options) {
                    this.set(n, options[n]);
                }
            }
        }
        append(statement: NodeMayAppendType) {
            if (statement instanceof List) {
                (statement as any).each(s => { this.append(s); })
            }
            else if (statement instanceof Node) this.childs.append(statement);
            this.childs.each(c => {
                c.parent = this;
            });
        }
        /**
         * ast 节点引用的token
         * 建议一个ast节点只关注具体标识性的一个token
         * 
         * */
        ref(tokens: List<Token> | Token) {
            if (tokens instanceof List) tokens.each(t => { this.tokens.push(t); t.node = this; });
            else {
                this.tokens.push(tokens);
                tokens.node = this;
            }
        }
        set(name: string, statement: NodeMayAppendType | any) {
            this[name] = statement;
            this.append(statement);
        }
        /***
         * 先判断当前节点，
         * 然后判断当前节点前面的所有节点
         * 然后找到父节点，
         * 再判断父节点前面的
         * 
         */
        closest(predict: (node: Node) => boolean, considerSelf: boolean = true) {
            var p = considerSelf ? this : this.parent;
            while (true) {
                if (!p) break;
                if (predict(p) == true) return p;
                else {
                    var ps = p.prevs;
                    if (Array.isArray(ps)) {
                        var g = ps.find(x => predict(x) == true);
                        if (g) return g;
                    }
                    p = p.parent;
                }
                if (!p) break;
            }
            return null;
        }
        private $cache: Record<string, any> = {};
        cache(key: string, value?: any) {
            if (typeof value == 'undefined') {
                return this.$cache[key];
            }
            else {
                this.$cache[key] = value;
                return value;
            }
        }
        get root() {
            var root = this.cache('root');
            if (root) return root;
            var p = this.parent;
            while (true) {
                if (p instanceof Program) {
                    break;
                }
                else {
                    p = p.parent;
                }
            }
            this.cache('root', p);
            return p;
        }
        /****
         * 
         * @param name 通过名称查找申明的变量名，形参名，类，类的静态参数,枚举，申明的函数
         * @param types 主要是指定查询的类型范围
         * 
         */
        queryName(name: string, types?: List<NodeType> | ((node: Node) => boolean)) {
            var rd: Express;
            var isType = (x: Node) => types ? (typeof types == 'function' ? types(x) : types.exists(x.type)) : true;
            if (name.indexOf('.') == -1) {
                var c = this.closest(x => {
                    if (x instanceof DeclareVariable && isType(x)) {
                        if (x.name == name) return true
                    }
                    else if (x instanceof FunStatement && isType(x)) {
                        if (x.parameters.exists(p => p.name == name)) return true;
                        if (x.name == name) return true;
                    }
                    else if (x instanceof ClassMethod && isType(x)) {
                        if (x.parameters.exists(p => p.name == name)) return true;
                    }
                    else if (x instanceof AnonymousFunExpress && isType(x)) {
                        if (x.parameters.exists(p => p.name == name)) return true;
                    }
                }, false);
                if (c) {
                    if (c instanceof DeclareVariable && isType(c)) rd = c;
                    else if ((c instanceof FunStatement || c instanceof AnonymousFunExpress || c instanceof ClassMethod) && isType(c) && c.parameters.exists(x => x.name == name))
                        rd = c.parameters.find(x => x.name == name);
                    else if (c instanceof FunStatement && c.name == name && isType(c)) rd = c;
                }
                if (rd) return rd;
            }
            if (!rd) {
                var pa = this.closest(x => x instanceof PackageStatement);
                if (pa) {
                    var ns = (pa as PackageStatement).getReferenceNames(name);
                    var pas: List<PackageStatement> = this.root.childs.findAll(x => x instanceof PackageStatement && ns.exists(n => n.startsWith(x.name)));
                    var r;
                    pas.each(pps => {
                        if (r) return false;
                        var classList = pps.classList;
                        classList.each(cla => {
                            if (ns.exists(n => cla.isFullName(n) && isType(cla))) {
                                r = cla;
                                return false;
                            }
                            if (cla instanceof EnumStatement) {
                                if (types && types instanceof List && types.exists(NodeType.enum)) return;
                                var op = cla.items.find(it => isType(it) && ns.exists(n => it.isFullName(n)));
                                if (op) {
                                    r = op;
                                    return false;
                                }
                            }
                            if (cla instanceof ClassStatement) {
                                if (types && types instanceof List && types.exists(NodeType.class)) return;
                                var pros = cla.propertys;
                                var pro = pros.find(x => isType(x) && (x instanceof ClassMethod || x instanceof ClassProperty) && x.isStatic && ns.exists(n => x.isFullName(n)));
                                if (pro && isType(pro)) {
                                    r = pro;
                                    return false;
                                }
                            }
                        });
                    })
                    return r;
                }
            }
        }
        findAll(predict: (node: Node) => boolean): List<Node> {
            var nodes: List<Node> = new List();
            List.treeEach(this.childs, 'childs', (item) => {
                if (predict(item) == true) nodes.push(item);
            })
            return nodes;
        }
        find(predict: (node: Node) => boolean): Node {
            var node: Node;
            List.treeEach(this.childs, 'childs', (item) => {
                if (predict(item) == true) { node = item; return { break: true }; }
            })
            return node;
        }
        get prevs() {
            if (this.parent) {
                var index = this.parent.childs.findIndex(x => x == this);
                return this.parent.childs.range(0, index - 1);
            }
            return new List<Node>();
        }
        get next() {
            if (this.parent) {
                var index = this.parent.childs.findIndex(x => x == this);
                return this.parent.childs.eq(index + 1);
            }
        }
    }
    export class Express extends Node {

    }
    export class Statement extends Node {

    }
    export class Program extends Node {
        type: NodeType.program;
        packages: List<Statement> = new List;
        append(node: List<Statement> | Statement) {
            if (node instanceof List) {
                node.forEach(c => { this.packages.append(c); super.append(c); })
            }
            else { this.packages.push(node); super.append(node); }
        }
        remove(node: List<Statement> | Statement) {
            if (node instanceof List) {
                node.forEach(c => { this.packages.remove(c); super.childs.remove(c); })
            }
            else { this.packages.remove(node); super.childs.remove(node); }
        }
    }
}