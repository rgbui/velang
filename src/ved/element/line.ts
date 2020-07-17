


namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    export class Line {
        constructor(doc: Doc) {
            this.doc = doc;
        }
        ele: HTMLElement;
        doc: Doc;
        spans: List<TokenSpan> = new List<TokenSpan>();
        render() {
            var cs = this.ele.children;
            if (this.spans.length == 0) {
                this.ele.innerHTML = '';
                return
            }
            for (var i = 0; i < this.spans.length; i++) {
                var ele = cs[i] as HTMLElement;
                var span = this.spans.eq(i);
                if (ele) {
                    span.ele = ele;
                    span.render();
                }
                else
                    break;
            }
            if (cs.length > i) {
                //说明有多余的ele
                for (var j = cs.length - 1; j >= i; j--) {
                    cs[j].remove();
                }
            }
            else if (cs.length == i + 1) {
                //不多不少
            }
            else {
                //说明ele不够了
                var html = '';
                for (var j = i; j < this.spans.length; j++) {
                    html += this.spans.eq(j).html;
                }
                if (cs.length == 0) this.ele.insertAdjacentHTML('afterbegin', html);
                else this.ele.insertAdjacentHTML('beforeend', html);
                cs = this.ele.children;
                for (var k = i; k < this.spans.length; k++) {
                    var ele: HTMLElement = cs[k] as HTMLElement;
                    var span = this.spans.eq(k);
                    span.ele = ele;
                }
            }
        }
        get html() {
            return `<div class='ved-line' style='height:${this.editor.lineHeight}px'>${this.spans.map(s => s.html).join("")}</div>`
        }
        get editor() {
            return this.doc.editor;
        }
        get code() {
            return this.spans.map(x => x.value).join("") + "\n";
        }
        get value() {
            return this.spans.map(x => x.value).join("");
        }
        get end() {
            return this.value.length;
        }
        get bound() {
            return new Rect({
                x: 0,
                y: this.top,
                width: this.editor.bound.width,
                height: this.editor.lineHeight
            })
        }
        get contentBound() {
            return new Rect({
                x: 0,
                y: this.top,
                width: this.width,
                height: this.editor.lineHeight
            })
        }
        get top() {
            return this.index * this.editor.lineHeight
        }
        get width() {
            return Util.getTextbound(this.value, this.editor.fontStyle).width
        }
        get index() {
            return this.doc.getLineIndex(x => x == this);
        }
        get prev() {
            return this.doc.line(this.index - 1);
        }
        get next() {
            return this.doc.line(this.index + 1);
        }
        get prevTokenSpan() {
            var index = this.index - 1;
            while (true) {
                var pre = this.doc.line(index);
                if (pre) {
                    if (pre.spans.length > 0) return pre.spans.last();
                    else {
                        index = index - 1;
                    }
                }
                else return null;
            }
        }
        get prevToken() {
            var index = this.index - 1;
            while (true) {
                var pre = this.doc.line(index);
                if (pre) {
                    if (pre.spans.length > 0) return pre.spans.last().token;
                    else {
                        index = index - 1;
                    }
                }
                else return null;
            }
        }
        get nextToken() {
            var index = this.index + 1;
            while (true) {
                var next = this.doc.line(index);
                if (next) {
                    if (next.spans.length > 0) return next.spans.first().token;
                    else {
                        index = index + 1;
                    }
                }
                else return null;
            }
        }
        /**
         * 当前行的开始坐标
         */
        get startPosition() {
            return new SpanPosition(this.editor, this.index, 0);
        }
        /**
         * 当前行的最后坐标
         */
        get endPosition() {
            return new SpanPosition(this.editor, this.index, this.value.length);
        }
        findPointPosition(point: Point) {
            var sp = new SpanPosition(this.editor, this.index);
            var text = this.value;
            if (text) {
                var cw = 0;
                var ci;
                for (var i = 0; i < text.length; i++) {
                    var char = text.charAt(i);
                    var w = Util.getTextbound(char, this.editor.fontStyle).width;
                    if (point.x > cw + w) { cw += w; continue }
                    else if (point.x > cw + w / 2) { ci = i + 1; cw += w; break; }
                    else { ci = i; break; }
                }
                if (typeof ci == 'undefined') {
                    //说明取的是最后一位
                    return this.endPosition;
                }
                else {
                    sp.col = ci;
                    return sp;
                }
            }
            else {
                //说明当前行是空的span
                sp.col = 0;
                return sp;
            }
        }
        findTokenSpan(col: number) {
            for (var i = 0; i < this.spans.length; i++) {
                var range = this.spans.eq(i).range;
                if (col >= range[0] && col <= range[1])
                    return this.spans.eq(i);
            }
        }
        /**
         * 删除当前行
         */
        remove() {
            this.doc.recoder.writeSnapshot(HistoryAction.deleteLine, { row: this.index, col: 0, value: this.value });
            if (this.ele) {
                this.ele.remove();
            }
            if (this.doc) {
                this.doc.remove(this);
            }
        }
        /**
         * 追加其它的tokenspan,注意如果tokenspan本向有ele,则会追加过来
         * @param span 
         */
        append(span: TokenSpan) {
            if (!this.spans.exists(span)) {
                this.doc.recoder.writeSnapshot(HistoryAction.insertTokenSpan, { row: this.index, col: this.end, value: span.value });
                this.spans.push(span);
                span.line = this;
                if (span.ele) {
                    this.ele.appendChild(span.ele);
                }
            }
        }
        /**
         * 在指定的位置插入文件，
         * @warn 当前的文本不能有换行符
         * @param col 
         * @param text 
         * 
         */
        insertText(col: number, text: string) {
            if (this.isEmpty) {
                var ts = this.createSimulateToken(text);
                var sp = new TokenSpan(ts, this);
                this.spans.push(sp);
                this.doc.recoder.writeSnapshot(HistoryAction.insertTokenSpan, { row: this.index, col: 0, value: text });
                this.render();
            }
            else {
                if (col == 0) {
                    var sp = this.spans.first();
                    sp.value = text + sp.value;
                }
                else {
                    var sp = this.findTokenSpan(col);
                    var pos = col - sp.col;
                    sp.value = sp.value.slice(0, pos) + text + sp.value.slice(pos);
                }
            }
        }
        replaceText(col: number, text: string, limitSize?: number) {
            if (typeof limitSize == 'undefined') limitSize = text.length;
            this.delete(col, col + limitSize);
            this.insertText(col, text);
        }
        get isEmpty() {
            return this.spans.length == 0
        }
        get isNotEmpty() {
            return !this.isEmpty;
        }
        /**
         * 删除指定范围内的文本
         * @param startCol 
         * @param endCol 包括结尾的
         * 
         */
        delete(startCol: number, endCol: number) {
            this.doc.recoder.writeSnapshot(HistoryAction.deleteLineRange, { row: this.index, startCol, endCol, value: this.getValue(startCol, endCol) })
            var ds: List<TokenSpan> = new List();
            var rs = this.spans.map(x => x.range);
            for (var i = 0; i < this.spans.length; i++) {
                var sp = this.spans.eq(i);
                var range = rs.eq(i);
                if (range[0] >= endCol || range[1] <= startCol) { continue; }
                else if (range[0] >= startCol && range[1] <= endCol) { ds.push(sp); }
                else if (startCol >= range[0] && startCol < range[1]) {
                    var newValue = sp.value.slice(0, startCol - range[0]);
                    if (endCol < range[1]) {
                        newValue += sp.value.slice(endCol - range[0]);
                    }
                    sp.value = newValue;
                }
                else if (endCol >= range[0] && endCol <= range[1]) {
                    var newValue: string = '';
                    if (startCol > range[0]) {
                        newValue = sp.value.slice(0, startCol - range[0]);
                    }
                    newValue = newValue + sp.value.slice(endCol - range[0]);
                    sp.value = newValue;
                }
            }
            this.spans.removeAll(x => ds.exists(x));
            this.render();
        }
        /**
         * 不包括当前行的换行符
         * @param startCol 
         * @param endCol 包括结尾的
         */
        getValue(startCol: number, endCol: number) {
            var str = '';
            var c = 0;
            for (var i = 0; i < this.spans.length; i++) {
                var sp = this.spans.eq(i);
                var range = [c, c + sp.value.length];
                c = c + sp.value.length;
                if (range[0] >= endCol || range[1] <= startCol) { continue; }
                else if (range[0] >= startCol && range[1] <= endCol) { str += sp.value; }
                else if (startCol >= range[0] && startCol <= range[1]) {
                    if (endCol < range[1]) {
                        str += sp.value.slice(startCol - range[0], endCol - range[0]);
                    }
                    else {
                        str += sp.value.slice(startCol - range[0]);
                    }
                }
                else if (endCol >= range[0] && endCol <= range[1]) {
                    // var newValue: string = '';
                    if (startCol > range[0]) {
                        str += sp.value.slice(startCol - range[0], endCol - range[0]);
                    }
                    else {
                        str += sp.value.slice(0, endCol - range[0]);
                    }
                }
            }
            return str;
        }
        /**
         * 在指定的位置切开，
         * 左边的保留
         * 右边的从当前行内删除，
         * 并取出来
         * @param col
         * @returns word 切开的单词
         * @returns spans 切开取出来的spans
         * 
         */
        cutKeepLeft(col: number) {
            if (this.isEmpty) {
                return { spans: new List<TokenSpan>(), word: '' };
            }
            else {
                if (col == 0) {
                    var right = this.spans.toArray(sp => sp);
                    this.spans.toArray(sp => sp).reverse().forEach(r => this.removeTokenSpan(r));
                    this.render();
                    return { spans: right, word: '' };
                }
                else {
                    var sp = this.findTokenSpan(col);
                    var index = sp.index;
                    var spans = this.spans.findAll((x, i) => i > index);
                    this.spans.findAll((x, i) => i > index).reverse().forEach(r => this.removeTokenSpan(r));
                    if (sp.end == col) {
                        this.render();
                        return { spans, word: '' };
                    }
                    else {
                        var word = sp.value.slice(col - sp.col);
                        sp.value = sp.value.slice(0, col - sp.col);
                        this.render();
                        return { spans, word };
                    }
                }
            }
        }
        removeTokenSpan(tokenSpan: TokenSpan) {
            this.doc.recoder.writeSnapshot(HistoryAction.lineRemoveTokenSpan, { row: this.index, col: tokenSpan.col, value: tokenSpan.value });
            this.spans.remove(tokenSpan);
        }
        /**
         * 当前行合并新的行line
         * @param line 要合并的行,合并后会注销
         */
        unionLine(line: Line) {
            line.spans.toArray(x => x).each(sp => this.append(sp));
            line.remove();
        }
        /**
         * 创建模拟的行，主要是突然插入一段文本，需要先构建好html,
         * 后续实际编译器会触发编译更新
         * @param word 
         * @param spans 
         */
        createSimulateLine(word?: string, spans?: List<TokenSpan>) {
            this.doc.recoder.writeSnapshot(HistoryAction.createLine, { row: this.index, col: this.end, value: (word ? word : '') + (spans ? spans.map(sp => sp.value).join("") : "") });
            var newLine = new Line(this.doc);
            this.doc.insertAt(this.index + 1, newLine);
            if (word) {
                var simulateToken = newLine.createSimulateToken(word);
                var ts = new TokenSpan(simulateToken, newLine);
                newLine.spans.push(ts);
            }
            if (spans && spans.length > 0) {
                newLine.spans.append(spans);
                spans.each(sp => sp.line = newLine);
            }
            this.ele.insertAdjacentHTML('afterend', newLine.html);
            newLine.ele = this.ele.nextElementSibling as HTMLElement;
            newLine.render();
            return newLine;
        }
        createSimulateToken(insertValue: string) {
            // var self = this;
            var simulateToken = new Ve.Lang.Token();
            simulateToken.name = 'text';
            simulateToken.row = this.index;
            simulateToken.col = 0;
            var preToken = this.prevToken;
            if (preToken && preToken.parent) {
                preToken.parent.childs.insertAt(preToken.index + 1, simulateToken);
                simulateToken.parent = preToken.parent;
            }
            var nextToken = this.nextToken;
            if (nextToken) {
                nextToken.parent.childs.insertAt(nextToken.index, simulateToken);
                simulateToken.parent = nextToken.parent
            }
            simulateToken.value = insertValue;
            simulateToken.size = insertValue.length;
            return simulateToken;
        }
    }
}