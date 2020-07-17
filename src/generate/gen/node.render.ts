
///<reference path='../../razor/template.ts'/>
namespace Ve.Lang.Generate {
    import List = Ve.Lang.Util.List;
    /***
     * @description 标记申明的位置，方便注入
     * 
     */
    export enum DeclarePosition {
        /**
         * @param  当前的申明就是自身
         * 
         */
        self,
        /***
         * @param  当前节点所在的语句的前面
         */
        prev,
        /***
         * @param  程序的头部
         */
        head,
        /**
         *@param  在方法内的前面
         */
        method,
        /**
         * @param  在大括的下面
         */
        brace
    }
    /**
     * 节点渲染器
     */
    export class NodeRender {
        constructor(paper: GeneratePaper, node: Node) {
            this.paper = paper;
            this.node = node;
        }
        load(data) {
            for (var n in data) {
                this[n] = data[n];
            }
        }
        generate() {
            var code = Razor.RazorTemplate.compile(this.template || '', this);
            return code;
        }
        paper: GeneratePaper;
        node: Node;
        childRenders: Util.List<NodeRender> = new Util.List<NodeRender>();
        append(node: Node) {
            var render = this.paper.render(node);
            this.childRenders.push(render);
            render.parentRender = this;
        }
        find(predict: ((render: NodeRender) => boolean) | Node) {
            if (predict instanceof Node) {
                return this.find(x => x.node == predict);
            }
            else {
                var r: NodeRender;
                List.treeEach(this.childRenders, 'childRenders', x => {
                    if (predict(x) == true) {
                        r = x;
                        return { break: true };
                    }
                });
                return r;
            }

        }
        parentRender: NodeRender;
        template: string;
        /***
         * @description 当前节点申明的变量名称
         * 
         */
        declares: { position: DeclarePosition, name: string, code: string }[] = [];
        /***
         * @description 通常这是编译多个语句的块，每个语句块有可能会依赖于前一个语句块
         * 
         */
        childs(name?: string | Node | List<Node>) {
            var ns: List<Node>;
            if (typeof name == 'string') {
                ns = this.node[name];
                if (typeof ns == 'undefined') throw 'not not node property name:' + name;
            }
            else ns = name as any;
            if (!(ns instanceof List)) ns = new List(ns);
            var ps = ns.toArray(n => {
                var re = this.find(n);
                if (re) return re.generate();
                else { console.warn(''); return undefined; }
            });
            ps.reverse();
            var prev = ps.first();
            for (var i = 1; i < ps.length; i++) {
                /**
                 * ps是生成的节点代码，需要转义escape
                 */
                var current: string = Razor.RazorTemplate.escape(ps.eq(i));
                if (!current.match(/@next\([\s]*\)/)) current = current + '@next()';
                prev = Razor.RazorTemplate.compile(current, { next() { return prev } })
            }
            return prev;
        }
        /***
         * @description 当前的名称是定义的
         * 
         */
        def(name?: string) {
            if (typeof name == 'string') {
                return name;
            }
            else if (this.node instanceof DeclareVariable) {
                return this.node.name;
            }
            else if (this.node instanceof Parameter) {
                if (this.paper.parameterMapNames && typeof this.paper.parameterMapNames[this.node.name] != 'undefined') {
                    return this.paper.parameterMapNames[this.node.name]
                }
                return this.node.name;
            }
            return name;
        }
        /**
         * @description 当前的名称是引用的（被调用的）
         * @param name 
         * 
         */
        ref(name?: string) {
            if (typeof name == 'string') {
                return name;
            }
            else if (this.node instanceof NameCall) {
                var rf = this.node.refNode;
                if (rf instanceof Parameter) {
                    if (this.paper.parameterMapNames && typeof this.paper.parameterMapNames[rf.name] != 'undefined') {
                        return this.paper.parameterMapNames[rf.name]
                    }
                }
                return this.node.name;
            }
        }
        next() {
            return '@next()';
        }
        prev() {

        }
        get $this() {
            return '';
        }
        get $value() {
            return '';
        }
        express(name: string | Node, at?: number) {
            var cnode;
            if (typeof name == 'string') {
                cnode = this.node[name];
                if (typeof cnode == 'undefined') throw 'not not node property name:' + name;
            }
            else cnode = name;
            if (typeof cnode != 'undefined') {
                if (cnode instanceof List) {
                    if (typeof at == 'undefined') {
                        /**
                         * @warn 应该很少触发这种情况
                         */
                        return cnode.map(c => {
                            var ce = this.find(c);
                            if (ce) return ce.generate();
                            else return '';
                        }).join("")
                    }
                    else if (typeof at == 'number' && cnode.eq(at)) {
                        var crender = this.find(cnode.eq(at));
                        if (crender) {
                            return crender.generate();
                        }
                    }
                }
                else {
                    var crender = this.find(cnode);
                    if (crender) {
                        return crender.generate();
                    }
                }
            }
        }
        /**
         * @description 语句编译
         * @enum name {string} node节点的属性名名
         * @enum name {Node}  node节点子节点
         * @param at? 如果节点是集合，那么需要指定编译的
         * 
         */
        statement(name: string | Node, at?: number) {
            var cnode;
            if (typeof name == 'string') {
                cnode = this.node[name];
                if (typeof cnode == 'undefined') throw 'not not node property name:' + name;
            }
            else cnode = name;
            if (typeof cnode != 'undefined') {
                if (cnode instanceof List) {
                    if (typeof at == 'undefined') {
                        /**
                         * @warn 应该很少触发这种情况
                         */
                        return cnode.map(c => {
                            var ce = this.find(c);
                            if (ce)
                                return ce.generate();
                            else return '';
                        }).join("")
                    }
                    else if (typeof at == 'number' && cnode.eq(at)) {
                        var crender = this.find(cnode.eq(at));
                        if (crender) {
                            return crender.generate();
                        }
                    }
                }
                else {
                    var crender = this.find(cnode);
                    if (crender) {
                        return crender.generate();
                    }
                }
            }
        }
    }
}
