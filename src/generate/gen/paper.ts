namespace Ve.Lang.Generate {
    import List = Util.List;
    export class GeneratePaper extends Ve.Lang.Util.BaseEvent {
        thisObjectName: string;
        parameterMapNames: Record<string, any>;
        constructor(generateLang: GenerateLang,
            options?: {
                thisObjectName?: string;
                parameterMapNames?: Record<string, any>
            }) {
            super();
            if (typeof options == 'object') {
                for (var n in options) this[n] = options[n];
            }
            this.generateLang = generateLang;
            this.generateLang.paper = this;
        }
        generateLang: GenerateLang;
        render(node: Node) {
            if (!node) console.trace(node);
            if (typeof node.type == 'undefined') console.error('the node type is undefiend', node);
            var action = NodeType[node.type];
            if (typeof this.generateLang[action] != 'function') action = '$' + action;
            if (typeof this.generateLang[action] != 'function') {
                console.error('not found action:' + action, node.type, node);
                this.emit('error', new Error(`not found action:${action}`));
                return;
            }
            var render = new NodeRender(this, node);
            var result = this.generateLang[action](node, render);
            if (typeof result == 'string') {
                render.template = result;
            }
            else if (typeof result == 'object') {
                render.load(result);
            }
            else render.template = '';
            return render;
        }
        private renders: List<NodeRender> = new List<NodeRender>();
        generate(nodes: Node | List<Node>) {
            var ns = nodes instanceof List ? nodes : new List<Node>(nodes);
            this.renders = ns.toArray(x => this.render(x));
            return this.renders.toArray(x => x.generate()).join("");
        }
    }
}