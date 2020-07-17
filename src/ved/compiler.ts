namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    export class Compiler {
        private editor: Editor;
        constructor(editor: Editor) {
            this.editor = editor;
            this.doc = new Doc(this.editor, this.editor.content_ele);
        }
        mode: 'code' | 'block' | 'express' | 'type' = 'code';
        code: string = '';
        args: Outer.VeProp[] = [];
        thisObjectArgs: Outer.VeProp[] = [];
        doc: Doc;
        compiler: Ve.Lang.Compiler;
        load(mode: Compiler['mode'], code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]) {
            var startDate = new Date().getTime();
            this.mode = mode;
            this.code = code;
            this.args = args;
            this.thisObjectArgs = thisObjectArgs;
            this.compiler = new Ve.Lang.Compiler();
            this.doc.clearError();
            var stages: List<VeLangError['stage']> = new List();
            this.compiler.on('error', error => {
                if (!stages.exists(x => x == error.stage)) stages.push(error.stage);
                if (error.pos) {
                    this.doc.appendError(error);
                }
            })
            var tokens: List<Token>;
            try {
                if (mode == 'block') {
                    tokens = this.compiler.block(code).tokens;
                }
                else if (mode == 'code') {
                    tokens = this.compiler.compile(code).tokens;
                }
                else if (mode == 'express') {
                    tokens = this.compiler.express(code).tokens;
                }
                else if (mode == 'type') {
                    tokens = this.compiler.type(code).tokens;
                }
            }
            catch (e) {
                return
            }
            if (new Date().getTime() - startDate > 200) console.log('compile time:' + (new Date().getTime() - startDate));
            startDate = new Date().getTime();
            if (tokens && !stages.exists('token')) {
                this.doc.load(tokens);
                this.doc.render();
                this.editor.cursor.hidden();
                if (new Date().getTime() - startDate > 200)
                    console.log('render time:' + (new Date().getTime() - startDate));
            }
        }
        private reload(mode: Compiler['mode'], code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]) {
            var startDate = new Date().getTime();
            this.mode = mode;
            this.code = code;
            this.args = args;
            this.thisObjectArgs = thisObjectArgs;
            this.compiler = new Ve.Lang.Compiler();
            this.doc.clearError();
            var stages: List<VeLangError['stage']> = new List();
            this.compiler.on('error', error => {
                if (!stages.exists(x => x == error.stage)) stages.push(error.stage);
                if (error.pos) {
                    this.doc.appendError(error);
                }
            })
            var tokens: List<Token>;
            try {
                if (mode == 'block') {
                    tokens = this.compiler.block(code).tokens;
                }
                else if (mode == 'code') {
                    tokens = this.compiler.compile(code).tokens;
                }
                else if (mode == 'express') {
                    tokens = this.compiler.express(code).tokens;
                }
                else if (mode == 'type') {
                    tokens = this.compiler.type(code).tokens;
                }
            }
            catch (e) {
                return
            }
            if (new Date().getTime() - startDate > 200) console.log('compile time:' + (new Date().getTime() - startDate));
            startDate = new Date().getTime();
            if (tokens && !stages.exists('token')) {
                this.doc.load(tokens);
                this.doc.render();
                if (new Date().getTime() - startDate > 200)
                    console.log('render time:' + (new Date().getTime() - startDate));
            }
            else {

            }
        }
        private timer: NodeJS.Timer;
        scan(interval: number = 700) {
            if (this.timer) { clearTimeout(this.timer); delete this.timer; }
            this.timer = setTimeout(() => {
                this.rce();
            }, interval);
        }
        private rce() {
            if (this.compiler) this.compiler.dispose();
            var code = this.doc.getCode();
            this.reload(this.mode, code, this.args, this.thisObjectArgs);
        }
    }
}