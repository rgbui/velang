

namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    export class Selection {
        private ele: HTMLElement;
        private editor: Editor;
        constructor(editor: Editor, ele: HTMLElement) {
            this.editor = editor;
            this.ele = ele;
        }
        start: SpanPosition;
        private _end: SpanPosition;
        get end() {
            return this._end;
        }
        set end(value: SpanPosition) {
            this._end = value;
            if (this.isNotEmpty) this.render();
            else this.ele.style.display = 'none';
        }
        clear() {
            delete this.start;
            delete this._end;
            this.ele.style.display = 'none';
        }
        get isEmpty() {
            if (typeof this.start != 'undefined' && typeof this._end != 'undefined') {
                /**起始位于同一个位置 */
                if (this.start.left == this._end.left && this.start.line == this._end.line) return true;
                return false;
            }
            else return true;
        }
        get isNotEmpty() { return this.isEmpty ? false : true }
        /**
         * 判断鼠标点击是否在选区
         * @param event 
         */
        isInSelection(point: Point) {
            return this.getRowBounds().exists(x => x.isInside(point));
        }
        /**
         * 全选
         */
        selectAll() {
            this.start = this.editor.compiler.doc.first.startPosition;
            this._end = this.editor.compiler.doc.last.endPosition;
            this.render();
        }
        /**
         * 选择当前行
         */
        selectLine() {
            this.start = this.editor.cursor.position.line.startPosition;
            this._end = this.editor.cursor.position.line.endPosition;
            this.render();
        }
        /***
         * 删除选区
         */
        deleteAll() {
            var { min, max } = this.getMinAndMax();
            var minIndex = min.line.index;
            var maxIndex = max.line.index;
            if (minIndex == maxIndex) {
                //同一行
                min.line.delete(min.col, max.col);
            }
            else {
                /**
                 * 反向删除
                 */
                max.line.delete(0, max.col);
                var ml = max.line;
                for (var i = maxIndex - 1; i > minIndex; i--) {
                    var line = this.editor.compiler.doc.line(i);
                    line.remove();
                }
                min.line.delete(min.col, min.line.endPosition.col);
                min.line.unionLine(ml);
            }
            this.start = min;
            this._end = min;
            this.render();
            this.editor.cursor.position.copyFrom(min);
            this.editor.cursor.update();
        }
        /***当前选区涉及到的内容,注意包括换行符 */
        get code() {
            var { min, max } = this.getMinAndMax();
            var minIndex = min.line.index;
            var maxIndex = max.line.index;
            var code = '';
            if (minIndex == maxIndex) {
                //同一行
                code = min.line.getValue(min.col, max.col);
            }
            else {
                /**
                 * 反向删除
                 */
                var ps: List<string> = new List<string>();
                ps.push(min.line.getValue(min.col, min.line.endPosition.col) + '\n');
                for (var i = maxIndex - 1; i > minIndex; i--) {
                    var line = this.editor.compiler.doc.line(i);
                    ps.push(line.value + '\n');
                }
                ps.push(max.line.getValue(0, max.col));
                code = ps.join("")
            }
            return code;
        }
        private render() {
            if (this.isEmpty) {
                this.ele.style.display = 'none';
                return;
            }
            var pd = this.editor.paddingBound;
            this.ele.style.display = 'block';
            var cs = this.ele.children;
            var rbs = this.getRowBounds();
            for (var i = 0; i < rbs.length; i++) {
                var ele = cs[i] as HTMLElement;
                var rb = rbs.eq(i);
                if (ele) {
                    ele.style.display = 'block';
                    ele.style.top = (rb.y + pd.top) + 'px';
                    ele.style.left = (rb.x + pd.left) + 'px';
                    ele.style.width = rb.width + 'px';
                    ele.style.height = rb.height + 'px';
                }
                else
                    break;
            }
            if (cs.length > i) {
                //说明有多余的ele
                for (var j = cs.length - 1; j >= i; j--) {
                    var ele = cs[j] as HTMLElement;
                    ele.style.display = 'none';
                }
            }
            else if (cs.length == i + 1) {
                //不多不少
            }
            else {
                //说明ele不够了
                var html = '';
                for (var j = i; j < rbs.length; j++) {
                    var rb = rbs.eq(j);
                    html += `<div class='ved-editor-selection-row' style='top:${rb.y + pd.top}px;left:${rb.x + pd.left}px;width:${rb.width}px;height:${rb.height}px'></div>`;
                }
                if (cs.length == 0) this.ele.insertAdjacentHTML('afterbegin', html);
                else this.ele.insertAdjacentHTML('beforeend', html);
            }
        }
        private getRowBounds() {
            var { min, max } = this.getMinAndMax();
            var minIndex = min.line.index;
            var maxIndex = max.line.index;
            var rowBounds: List<Rect> = new List();
            var minTop = min.top;
            for (var i = minIndex; i <= maxIndex; i++) {
                var left = i == minIndex ? min.left : 0;
                var width: number;
                if (i == maxIndex) {
                    width = i == minIndex ? max.left - min.left : max.left;
                }
                else {
                    var cb = this.editor.compiler.doc.line(i).contentBound;
                    if (i == minIndex) width = cb.width + this.editor.wordWidth - min.left;
                    else width = cb.width + this.editor.wordWidth;
                }
                var top = minTop + (i - minIndex) * this.editor.lineHeight;
                var height = this.editor.lineHeight;
                rowBounds.push(new Rect({ y: top, x: left, width, height }))
            }
            return rowBounds;
        }
        getMinAndMax() {
            var min: SpanPosition = this.start;
            var max: SpanPosition = this.end;
            if (this.start.line.index > this.end.line.index) {
                min = this.end;
                max = this.start;
            }
            else if (this.start.line.index == this.end.line.index) {
                if (this.start.left > this.end.left) {
                    min = this.end;
                    max = this.start;
                }
            }
            return { min, max };
        }
        copy() {
            var se = new Selection(this.editor, this.ele);
            se.start = this.start ? this.start.copy() : undefined;
            se._end = this._end ? this._end.copy() : undefined;
            return se;
        }
        createDragEvent() {
            return new DragSelectionEvent(this.editor, this);
        }
    }
    const MIN_DISTANCE = 4;
    export class DragSelectionEvent {
        selection: Selection;
        constructor(editor: Editor, selection: Selection) {
            this.selection = selection;
            this.editor = editor;
        }
        private editor: Editor;
        isDown: boolean = false;
        isMove: boolean = false;
        startCursor: SpanPosition;
        start?: Point;
        current?: Point;
        operator: 'selection' | 'drag-selection' | 'none' = 'none';
        dragDown(point: Point) {
            this.isDown = true;
            this.start = point;
            this.startCursor = this.editor.cursor.position.copy();
        }
        dragMove(event: Point) {
            var { x: dx, y: dy } = event.sub(this.start);
            if (this.isMove != true) {
                if (Math.abs(dx) > MIN_DISTANCE || Math.abs(dy) > MIN_DISTANCE) {
                    this.isMove = true;
                    if (this.selection.isNotEmpty && this.selection.isInSelection(event)) {
                        this.operator = 'drag-selection';
                        this.current = event;
                    }
                    else {
                        this.selection.clear();
                        this.operator = 'selection';
                        this.selection.start = this.startCursor;
                    }
                    return
                }
            }
            else {
                if (this.operator == 'selection')
                    this.selection.end = this.editor.cursor.position.copy();
                else if (this.operator) {
                    this.current = event;
                }
            }
        }
        dragEnd(event: Point) {
            this.current = event;
            this.clear();
        }
        clear() {
            this.operator = 'none';
            this.isDown = false;
            this.isMove = false;
            delete this.start;
            delete this.current;
        }
    }
}