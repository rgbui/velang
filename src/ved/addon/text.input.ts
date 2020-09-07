
namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    export class TextInput {
        private editor: Editor;
        private ele: HTMLTextAreaElement;
        constructor(editor: Editor, ele: HTMLTextAreaElement) {
            this.editor = editor;
            this.ele = ele;
            this.init();
        }
        private init() {
            var self = this;
            this.render();
            this.ele.addEventListener('focus', function (event: FocusEvent) {
                event.preventDefault();
            });
            this.ele.addEventListener('keydown', function (event: KeyboardEvent) {
                var kb = new KeyBoard(event);
                var value = self.ele.value;
                if (kb.everyMatch('backspace')) {
                    /**
                     * 没有值说明要回退，
                     * 如果有选区，先清掉选区，
                     * 后续才是真正的回退
                     * */
                    if (!value) {
                        self.editor.doc.recoder.createHistory(HistoryCommand.onKeyBackspace);
                        if (self.editor.selection.isNotEmpty) self.deleteSelection()
                        else self.backspace(event);
                        self.editor.doc.recoder.writeHistory();
                    }
                }
                else if (kb.everyMatch('delete')) {
                    self.editor.doc.recoder.createHistory(HistoryCommand.onKeyDelete);
                    /**
                     * 如果有选区，先清掉选区
                     * 没有选区，则吃掉光标下一个字符
                     */
                    if (self.editor.selection.isNotEmpty) self.deleteSelection()
                    else self.delete(event);
                    self.editor.doc.recoder.writeHistory();
                }
                else if (kb.everyMatch('shift+delete')) {
                    self.editor.doc.recoder.createHistory(HistoryCommand.onKeyShiftDelete);
                    /**
                     * 删除当前行
                     */
                    if (self.editor.selection.isNotEmpty) self.deleteSelection()
                    else self.editor.cursor.deleteLine();
                    self.editor.doc.recoder.writeHistory();
                }
                else if (kb.everyMatch('enter')) {
                    self.editor.doc.recoder.createHistory(HistoryCommand.onKeyEnter);
                    event.preventDefault();
                    if (self.editor.intellisense.open) self.editor.intellisense.enter(event)
                    else self.enter(event);
                    self.editor.doc.recoder.writeHistory();
                }
                else if (kb.match('arrowleft')) {
                    /** */
                    self.editor.cursor.move('arrow-left');
                }
                else if (kb.match('arrowright')) {
                    /** */
                    self.editor.cursor.move('arrow-right');
                }
                else if (kb.match('arrowdown')) {
                    /** */
                    if (self.editor.intellisense.open) self.editor.intellisense.moveFocusIndex('arrow-down')
                    else self.editor.cursor.move('arrow-down');
                }
                else if (kb.match('arrowup')) {
                    /** */
                    if (self.editor.intellisense.open) self.editor.intellisense.moveFocusIndex('arrow-up')
                    else self.editor.cursor.move('arrow-up');
                }
                else if (kb.match('pagedown')) {
                    /**光标移到最下面 */
                    self.editor.cursor.move('page-down');
                }
                else if (kb.match('pageup')) {
                    /**光标移到最上面 */
                    self.editor.cursor.move('page-up');
                }
                else if (kb.everyMatch('ctrl+a')) {
                    /**全选 */
                    self.editor.selection.selectAll();
                }
                else if (kb.everyMatch('ctrl+l')) {
                    /***选择当前行 */
                    self.editor.selection.selectLine()
                }
                else if (kb.everyMatch('ctrl+x')) {
                    if (self.editor.selection.isNotEmpty) {
                        var code = self.editor.selection.code;
                        var oldValue = self.ele.value;
                        self.ele.value = code;
                        self.ele.select();
                        document.execCommand('copy');
                        self.ele.value = oldValue;
                        self.editor.selection.deleteAll();
                    }
                }
                else if (kb.everyMatch('ctrl+c')) {
                    if (self.editor.selection.isNotEmpty) {
                        var code = self.editor.selection.code;
                        var oldValue = self.ele.value;
                        self.ele.value = code;
                        self.ele.select();
                        document.execCommand('copy');
                        self.ele.value = oldValue;
                    }
                }
                else if (kb.everyMatch('ctrl+z')) {
                    /**
                     * 撤消 */
                    self.editor.doc.onUndo();
                }
                else if (kb.everyMatch('ctrl+y')) {
                    /**
                     * 恢复 */
                    self.editor.doc.onRedo();
                }
                else if (kb.everyMatch('ctrl+f')) {
                    /**
                     * 查找 
                     * */
                }
                else if (kb.everyMatch('ctrl+h')) {
                    /**替换 */
                }
                else if (kb.everyMatch('ctrl+/')) {
                    /**
                     * 注释、反注释
                     * */
                }
                else if (kb.everyMatch('ctrl+s')) {
                    /**
                     * 保存
                     * */
                    event.preventDefault();
                    var code = self.editor.compiler.doc.getCode();
                    self.editor.emit('save', code);
                }
            });
            function inputFx(event) {
                self.editor.doc.recoder.createHistory(HistoryCommand.InputWords);
                self.input();
                self.editor.doc.recoder.writeHistory();
            }
            this.ele.addEventListener('input', function (event) {
                inputFx(event);
            });
            this.ele.addEventListener('paste', function (event: ClipboardEvent) {
                self.editor.doc.recoder.createHistory(HistoryCommand.onKeyPaster);
                event.preventDefault();
                self.paster(event);
                self.editor.doc.recoder.writeHistory();
            });
        }
        render() {
            if (this.editor.cursor) {
                var pd = this.editor.visibleBound;
                this.ele.style.top = (pd.y + pd.height / 2) + "px";
                this.ele.style.left = (pd.x + pd.width / 2) + "px";
            }
        }
        active() {
            this.render();
            if (document.activeElement != this.ele)
                this.ele.focus();
        }
        blur() {
            if (this.ele == document.activeElement) {
                this.ele.blur();
            }
        }
        private pos: { col: number, row: number };
        private lastValue: string = '';
        focus() {
            this.render();
            this.editor.intellisense.close();
            this.ele.value = '';
            this.pos = this.editor.cursor.position.pos;
            this.lastValue = '';
        }
        enter(event: KeyboardEvent) {
            this.editor.cursor.insertLine();
            this.editor.compiler.scan(200);
        }
        deleteSelection() {
            this.editor.selection.deleteAll();
            this.editor.compiler.scan(200);
        }
        input() {
            if (this.editor.cursor.position.tokenSpan) {
                var ts = this.editor.cursor.position.tokenSpan;
                if (ts.token) {
                    // console.log(ts.prevTokens.map(p => p.token && p.token.node ? p.token.node : undefined));
                }
            }
            var self = this;
            var value = this.ele.value;
            var ms = value.match(/[\(\{"'\[]/g);
            var map = { '(': ')', "\"": "\"", "'": "'", "[": "]", "{": "}" };
            var cs: string[] = [];
            if (ms) {
                for (var i = 0; i < ms.length; i++) {
                    if (ms[i]) {
                        cs.push(map[ms[i]]);
                    }
                }
            }
            var ctext = cs.reverse().join("");
            var newValue = value + ctext;
            this.editor.doc.line(this.pos.row).replaceText(this.pos.col, newValue, this.lastValue.length);
            this.lastValue = newValue;
            this.editor.cursor.position.pos = { col: this.pos.col + value.length, row: this.pos.row };
            this.editor.cursor.render();
            this.editor.compiler.scan(500);
        }
        paster(event: ClipboardEvent) {
            var self = this;
            var text = event.clipboardData.getData('text');
            if (text) {
                if (self.editor.selection.isNotEmpty) self.deleteSelection()
                this.editor.cursor.insertText(text);
                this.editor.compiler.scan(200);
            }
        }
        /**
         * 后退吃一个
         */
        backspace(event: KeyboardEvent) {
            this.editor.cursor.deleteWord('before');
            this.editor.compiler.scan(1000);
        }
        /**
         * 往前吃一个
         */
        delete(event: KeyboardEvent) {
            this.editor.cursor.deleteWord('after');
            this.editor.compiler.scan(1000);
        }
    }
}