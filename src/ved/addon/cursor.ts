
namespace Ve.Lang.Ved {
    export class Cursor {
        private timer: NodeJS.Timer;
        private editor: Editor;
        private ele: HTMLElement;
        /**
         * 光标所在的位置
         * 
         */
        public position: SpanPosition;
        constructor(editor: Editor, ele: HTMLElement) {
            this.editor = editor;
            this.ele = ele;
            this.position = new SpanPosition(this.editor, 0, 0);
        }
        update() {
            this.render();
            this.editor.textInput.focus();
            this.visible();
        }
        render() {
            var pd = this.editor.paddingBound;
            this.ele.style.left = (this.position.left + pd.left) + "px";
            this.ele.style.top = (this.position.top + pd.top) + "px";
            this.ele.style.visibility = 'visible';
            this.editor.intellisense.render();
        }
        hidden() {
            var self = this;
            if (this.timer) { clearInterval(this.timer); delete this.timer; }
            self.ele.style.visibility = 'hidden';
        }
        visible() {
            var self = this;
            if (this.timer) { clearInterval(this.timer); delete this.timer; }
            this.timer = setInterval(function () {
                self.ele.style.visibility = self.ele.style.visibility == 'hidden' ? 'visible' : 'hidden';
            }, 6e2);
        }
        /**
        * 通过坐标点设定光标位置
        * @param point 当前的坐标是相对编辑器的坐标
        */
        setCursor(point: Point) {
            if (point.y < 0) point.y = 0;
            else if (point.y > this.editor.compiler.doc.length * this.editor.lineHeight) point.y = this.editor.compiler.doc.length * this.editor.lineHeight - 5;
            if (point.x < 0) point.x = 0;
            else if (point.x > this.editor.bound.width) point.x = this.editor.bound.width
            var rowIndex = Math.floor(point.y / this.editor.lineHeight);
            var line = this.editor.compiler.doc.line(rowIndex);
            if (!line) {
                line = this.editor.compiler.doc.last;
            }
            if (line) {
                var sp = line.findPointPosition(point);
                this.position.copyFrom(sp);
                this.update();
            }
        }
        resetCursor() {
            var point = new Point(this.position.left, this.position.top);
            this.setCursor(point);
        }
        /**
         * 光标移动
         * @param arrow  方向
         * @enum {string} arrow page-down 表示光标移到最下面
         * @enum {string} arrow page-up 表示光标移到最上面
         */
        move(arrow: 'arrow-left' | 'arrow-right' | 'arrow-down' | 'arrow-up' | 'page-down' | 'page-up') {
            switch (arrow) {
                case 'arrow-left':
                    if (this.position.col > 0) this.position.col -= 1;
                    else if (this.position.col == 0) {
                        var prevLine = this.position.line.prev;
                        if (prevLine) this.position.copyFrom(prevLine.endPosition)
                        else return;
                    }
                    break;
                case 'arrow-right':
                    if (this.position.col == this.position.line.value.length) {
                        var nextLine = this.position.line.next;
                        if (nextLine) this.position.copyFrom(nextLine.startPosition)
                        else return;
                    }
                    else this.position.col += 1;
                    break;
                case 'arrow-up':
                    var prevLine = this.position.line.prev;
                    if (prevLine) {
                        if (this.position.col > prevLine.value.length) this.position.col = prevLine.value.length;
                        this.position.row = prevLine.index;
                    }
                    break;
                case 'arrow-down':
                    var nextLine = this.position.line.next;
                    if (nextLine) {
                        if (this.position.col > nextLine.value.length) this.position.col = nextLine.value.length;
                        this.position.row = nextLine.index;
                    }
                    break;
                case 'page-down':
                    this.position.copyFrom(this.editor.compiler.doc.last.endPosition);
                    break;
                case 'page-up':
                    this.position.copyFrom(this.editor.compiler.doc.first.endPosition);
                    break;
            }
            this.update();
        }
        /**
        * 在光标处插入一段文字
        * @param text 
        */
        insertText(text: string) {
            if (text == '' || text === null || typeof text == 'undefined') return;
            if (text.indexOf('\n') > -1) {
                //说明有换行符
                var ns = text.split(/\n/g);
                var pick = this.position.line.cutKeepLeft(this.position.col);
                var prevLine = this.position.line;
                this.position.line.insertText(this.position.line.end, ns[0]);
                if (ns.length > 2) {
                    for (var i = 1; i < ns.length - 1; i++) {
                        prevLine = prevLine.createSimulateLine(ns[i]);
                    }
                }
                prevLine = prevLine.createSimulateLine(ns[ns.length - 1] + pick.word, pick.spans);
                this.position.row = prevLine.index;
                this.position.col = ns[ns.length - 1].length;
                this.update();
            }
            else {
                this.position.line.insertText(this.position.col, text);
                this.position.col += text.length;
                this.update();
            }
        }
        /**
         * 当前位置插入一个换行符，常用于enter换行输入
         */
        insertLine() {
            var insertT = '';
            if (this.position.tokenSpan) {
                var deep = this.position.tillTokenSpan.deep;
                if (typeof deep == 'number' && deep > 0) {
                    for (var i = 0; i < deep; i++) {
                        insertT += '\t\t';
                    }
                }
            }
            var pick = this.position.line.cutKeepLeft(this.position.col);
            var newLine = this.position.line.createSimulateLine(insertT + pick.word, pick.spans);
            this.position.row = newLine.index;
            this.position.col = insertT ? insertT.length : 0;
            this.update();
        }
        /**
         * 删除一个单词
         * @param arrow 删除当前位置前面，还是后面 
         */
        deleteWord(arrow: 'before' | 'after') {
            if (arrow == 'before') {
                if (this.position.col == 0) {
                    if (this.position.line.prev) {
                        var prevLine = this.position.line.prev;
                        this.position.col = prevLine.value.length;
                        var currentLine = this.position.line;
                        this.position.row = prevLine.index;
                        prevLine.unionLine(currentLine);
                    }
                    else return;
                }
                else {
                    var tokenSpan = this.position.tokenSpan;
                    tokenSpan.value = tokenSpan.value.slice(0, this.position.col - tokenSpan.col - 1) + tokenSpan.value.slice(this.position.col - tokenSpan.col)
                    this.position.col -= 1;
                }
            }
            else if (arrow == 'after') {
                if (this.position.col == this.position.line.value.length) {
                    if (this.position.line.next) {
                        this.position.line.unionLine(this.position.line.next)
                    }
                    else return;
                }
                else {
                    var tokenSpan = this.position.tokenSpan;
                    var dcol = this.position.col - tokenSpan.col;
                    if (dcol == tokenSpan.size) {
                        tokenSpan = tokenSpan.next;
                    }
                    tokenSpan.value = tokenSpan.value.slice(0, this.position.col - tokenSpan.col) + tokenSpan.value.slice(this.position.col - tokenSpan.col + 1)
                }
            }
            this.update();
        }
        /**
         * 删除当前行
         */
        deleteLine() {
            this.move('arrow-up');
            this.editor.cursor.position.line.remove();
        }
    }
    export class SpanPosition {
        editor: Editor;
        row: number;
        col: number;
        constructor(editor: Editor, row?: number, col?: number) {
            this.editor = editor;
            if (typeof row == 'number')
                this.row = row;
            if (typeof col == 'number')
                this.col = col;
        }
        copy() {
            return new SpanPosition(this.editor, this.row, this.col);
        }
        copyFrom(sp: SpanPosition) {
            this.row = sp.row;
            this.col = sp.col;
        }
        get top() {
            return this.row * this.editor.lineHeight;
        }
        get left() {
            if (this.col == 0) return 0;
            return Util.getTextbound(this.line.value.slice(0, this.col), this.line.editor.fontStyle).width;
        }
        /**
         * 当前的位置有没有token
         */
        get tokenSpan() {
            return this.line.findTokenSpan(this.col);
        }
        /**
         * 当前位置没有token，那么会往后找，直到找到为止，
         * 当然仍然不能保证一定会找到
         */
        get tillTokenSpan() {
            var t = this.tokenSpan;
            if (t) return t;
            else {
                return this.line.prevTokenSpan;
            }
        }
        get line() {
            return this.editor.doc.line(this.row);
        }
        get pos() {
            return {
                row: this.row,
                col: this.col
            }
        }
        set pos(value: { row: number, col: number }) {
            this.row = value.row;
            this.col = value.col;
        }
    }
}