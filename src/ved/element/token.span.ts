

namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    /**
     * 每个tokenspan操作的range(prevTokens[value].length,size-1),
     * 其实就是跟着单词后面的坐标，首个单词前面的是上一个token或者上一行(后面跟着的)
     * 
     */
    export class TokenSpan {
        constructor(token: Token, line: Line) {
            this.token = token;
            this.line = line;
        }
        ele: HTMLElement;
        line: Line;
        get doc() {
            return this.line.doc;
        }
        get editor() {
            return this.doc.editor;
        }
        token: Token;
        get classList() {
            var classList: List<string> = new List<string>();
            var tokenName = this.token.name;
            if (tokenName.startsWith('comment')) tokenName = 'comment';
            else if (tokenName.startsWith('string')) {
                if (tokenName.startsWith('string.variable')) tokenName = 'variable';
                else tokenName = 'string';
            }
            else if (tokenName.startsWith('number')) tokenName = 'number';
            else if (tokenName.startsWith('generic.type')) tokenName = 'type';
            else if (tokenName.startsWith('generic.delimiter')) tokenName = 'delimiter';
            else if (tokenName.indexOf('bracket') > -1) tokenName = 'bracket';
            else if (tokenName.indexOf('white') > -1) tokenName = 'white';
            else if (tokenName.indexOf('keywords') > -1) {
                if (new List('if', 'else', 'for', 'break', 'continue', 'while', 'do', 'when', 'case', 'try', 'catch', 'finally').exists(this.token.flag))
                    tokenName = 'keywords-control';
                else if (this.token.flag == 'type' || this.token.flag == 'void')
                    tokenName = 'type';
                else tokenName = tokenName;
            }
            classList.push(tokenName);
            var tokenError = this.doc.getTokenError(this.token);
            if (tokenError) {
                classList.push('error');
            }
            return classList.map(c => 'ved-token-' + c.replace(/\./g, "-")).join(" ");
        }
        render() {
            this.ele.setAttribute('class', this.classList);
            this.ele.innerHTML = this.content;
        }
        get deep() {
            if (this.token) {
                var ps = this.token.parents(x => x.flag == '{', x => this.doc.tokens.exists(x));
                return ps.length;
            }
        }
        /**
         * 当前tokenspan的col范围[start,end]
         * range是动态变化的，如果修改当前token前面的token，那么此时的range也会跟着动态变化
         */
        get range() {
            return [this.col, this.end];
        }
        /**
         * 当前tokenspan第一个单词的col
         * */
        get col() {
            return this.prevTokens.map(x => x.value).join("").length;
        }
        get end() {
            return this.col + this.size;
        }
        get size() {
            return this.value.length;
        }
        get top() {
            return this.line.top;
        }
        get left() {
            var pt = this.prevTokens.map(pt => pt.value).join("");
            return Util.getTextbound(pt, this.editor.fontStyle).width;
        }
        get width() {
            return Util.getTextbound(this.value, this.editor.fontStyle).width;
        }
        get bound() {
            return new Rect({
                x: this.left,
                y: this.top,
                width: this.width,
                height: this.editor.lineHeight
            });
        }
        get charBounds() {
            var b = this.bound;
            var left = 0;
            return this.token.value.split("").map((s, i) => {
                var width = Util.getTextbound(s, this.editor.fontStyle).width;
                var x = left;
                left += width;
                return {
                    char: s,
                    wordIndx: i,
                    rect: new Rect({
                        y: b.y,
                        width: width,
                        height: b.height,
                        x
                    })
                }
            })
        }
        get content() {
            return Util.htmlEscape(this.token.value)
        }
        get value() {
            return this.token.value;
        }
        get isEmpty() {
            return this.value != '' ? false : true;
        }
        set value(val: string) {
            if (val != this.value) {
                this.doc.recoder.writeSnapshot(HistoryAction.updateTokenSpan, { row: this.line.index, col: this.col, oldValue: this.value, newValue: val });
                this.token.value = val;
                if (this.isEmpty) {
                    this.ele.remove();
                    this.line.spans.remove(this);
                }
                else this.render();
            }
        }
        get html() {
            return `<span class='${this.classList}'>${this.content}</span>`
        }
        get index() {
            return this.line.spans.findIndex(x => x == this);
        }
        get prev() {
            return this.line.spans.eq(this.index - 1);
        }
        /**
         * 前面一个tokenspan,当前行没有，则是上一行的最后一个（直到找为止）
         */
        get prevTill() {
            var prev = this.prev;
            if (prev) return prev;
            else if (this.line) return this.line.prevToken;
        }
        get next() {
            return this.line.spans.eq(this.index + 1);
        }
        /**
         * 后面一个tokenspan,当前行没有，则是下一行的首个tokenspan(直到找到为止)
         */
        get nextTill() {
            var next = this.next;
            if (next) return next;
            else if (this.line) return this.line.nextToken;
        }
        /**
         * 当前行中，该tokenspan前面所有的
         */
        get prevTokens() {
            var index = this.index;
            return this.line.spans.findAll((x, i) => i < index);
        }
        /**
         * 当前行中，该tokenspan后面所有的
         */
        get nextTokens() {
            var index = this.index;
            return this.line.spans.findAll((x, i) => i > index);
        }
    }
}