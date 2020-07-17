namespace Ve.Lang {
  /**
  * @enum o core 是整个Ve语言的核心库，是不可缺少的，打包时，会一起打包进去，主要是一些基本的类型
  * @enum o lib 库，主要是一些平台类型的库，如html环境，后台io，android环境等，会根据使用情况选择性的导入加载
  * @enum o code 用户编写的代码
  * 
  */
    export enum LibType {
        core,
        lib,
        code
    }
    class CoreCompile extends Util.BaseEvent {
        constructor() {
            super();
        }
        program = new Ve.Lang.Program();
        /**
         * 存储导入所有类库等信息
         */
        private packages: Util.List<{ type: LibType, nodes: Util.List<Node>, id?: string }> = new Util.List();
        importNodes(nodes: Util.List<Node>, type: LibType, id?: string) {
            this.program.append(nodes);
            this.packages.append({ nodes, type, id });
        }
        importPackage(code: string, type: LibType) {
            var tokenizer = new Tokenizer();
            tokenizer.on('error', (...args) => { this.emit('error', ...args); })
            var rootToken = tokenizer.parse(code);
            var parser = new StatementParser();
            parser.on('error', (...args) => { this.emit('error', ...args); });
            var nodes = parser.parse(rootToken.childs);
            this.importNodes(nodes, type);
            return nodes;
        }
        removeNodes(id: string) {
            this.packages.removeAll(x => x.id == id);
        }
    }
    export var coreCompile = new CoreCompile();
    /**
    * 核心库一般导入编译是不会出错的，
    * 这里出错，直接抛出来
    */
    coreCompile.on('error', (...args) => {
        console.error(...args);
        throw args[0];
    })
}