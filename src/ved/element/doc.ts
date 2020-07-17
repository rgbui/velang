///<reference path='doc.recorder.ts'/>
namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    export class Doc {
        editor: Editor;
        el: HTMLElement;
        private errors: List<Ve.Lang.VeLangError> = new List();
        constructor(editor: Editor,el: HTMLElement) {
            this.editor = editor;
            this.el = el;
            this.initRecoder();
        }

        clearError() {
            this.errors = new List();
        }
        appendError(error: Ve.Lang.VeLangError) {
            this.errors.push(error);
        }
        getTokenError(token: Token) {
            return this.errors.find(x => x.token == token);
        }
        tokens: List<Token>;
        load(tokens: List<Token>) {
            this.tokens = tokens;
            this.lines = new List();
            var line: Line = new Line(this);
            this.lines.push(line);
            var ts = (tokens: List<Token>) => {
                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens.eq(i);
                    if (token.flag == 'line') {
                        //说明是换行符
                        line = new Line(this);
                        this.lines.push(line);
                    }
                    else {
                        line.spans.push(new TokenSpan(token, line));
                    }
                    if (token.childs.length > 0) ts(token.childs);
                }
            }
            ts(this.tokens);
        }
        render() {
            var cs = this.editor.content_ele.children;
            var i: number;
            for (i = 0; i < this.lines.length; i++) {
                var ele: HTMLElement = cs[i] as HTMLElement;
                var line = this.lines.eq(i);
                if (ele) {
                    line.ele = ele;
                    line.render();
                }
                else break;
            }
            if (cs.length > i) {
                //说明有多余的行ele
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
                for (var j = i; j < this.lines.length; j++) {
                    html += this.lines.eq(j).html;
                }
                if (cs.length == 0) this.editor.content_ele.innerHTML = html;
                else this.editor.content_ele.insertAdjacentHTML('beforeend', html);
                cs = this.editor.content_ele.children;
                for (var k = i; k < this.lines.length; k++) {
                    var ele: HTMLElement = cs[k] as HTMLElement;
                    var line = this.lines.eq(k);
                    line.ele = ele;
                    line.render();
                }
            }
        }
        private lines: List<Line> = new List<Line>();
        getCode() {
            var len = this.lines.length;
            return this.lines.map((x, i) => {
                return x.value + (i == len - 1 ? "" : "\n");
            }).join("");
        }
        /**
        * 查找tokenspan
        * @param predict 条件
        */
        findTokenSpan(predict: (ts: TokenSpan) => boolean): TokenSpan {
            var ts: TokenSpan;
            this.lines.each(line => {
                var r = line.spans.find(predict);
                if (r) { ts = r; return false; }
            });
            return ts;
        }
        /**
         * 查找行
         * @param predict 条件
         */
        findLine(predict: (line: Line) => boolean): Line {
            return this.lines.find(predict);
        }
        line(row: number) {
            return this.lines.eq(row);
        }
        getLineIndex(predict: (line: Line) => boolean) {
            return this.lines.findIndex(predict);
        }
        insertAt(at: number, line: Line) {
            this.lines.insertAt(at, line);
        }
        remove(predict: ((line: Line) => boolean) | Line) {
            return this.lines.remove(predict);
        }
        get length() {
            return this.lines.length;
        }
        get last() {
            return this.lines.last()
        }
        get first() {
            return this.lines.first();
        }
    }
    export interface Doc extends Doc$Recorder { }
    Ve.Lang.Util.Inherit(Doc, Doc$Recorder);
}