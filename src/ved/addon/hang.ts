namespace Ve.Lang.Ved {

    export class Hang {
        private editor: Editor;
        private ele: HTMLElement;
        constructor(editor: Editor, ele: HTMLElement) {
            this.editor = editor;
            this.ele = ele;
            this.ele.style.display = 'none';
            this.init();
        }
        timer: NodeJS.Timer;
        span: HTMLElement;
        type: 'warn' | 'error' | 'info' | 'property';
        title: string;
        des: string;
        private init() {
            var self = this;
            this.editor.content_ele.addEventListener('mouseover', function (event: MouseEvent) {
                var span = event.target as HTMLElement;
                if (span.tagName.toLowerCase() == 'span') {
                    self.clear();
                    self.timer = setTimeout(() => {
                        self.span = span;
                        self.show();
                    }, 800);
                }
            });
            this.editor.content_ele.addEventListener('mouseout', function (event) {
                self.clear();
            });
            this.ele.addEventListener('mouseleave', function (event: MouseEvent) {
                self.hide();
            });
        }
        clear() {
            var self = this; if (typeof self.timer != 'undefined') {
                clearTimeout(self.timer);
                self.timer = undefined;
            }
        }
        hide() {
            this.ele.style.display = 'none';
        }
        show() {
            var line_ele = this.span.closest('.ved-line');
            if (!line_ele  || line_ele && !line_ele.parentElement) return;
            var index = 0;
            for (var i = 0; i < line_ele.parentElement.children.length; i++) {
                if (line_ele.parentElement.children[i] === line_ele) { index = i; break; }
            }
            var line = this.editor.doc.line(index);
            var tokenSpan = line.spans.find(x => x.ele === this.span);
            if (tokenSpan) {
                var error = this.editor.doc.getTokenError(tokenSpan.token);
                if (error && error.error) {
                    this.des = error.error.toString();
                    this.type = 'error';
                    this.render();
                }
                if (tokenSpan.token) {
                    //console.log(tokenSpan.token.node);
                }
            }
        }
        render() {
            this.ele.style.display = 'block';
            var bound = this.span.getBoundingClientRect();
            var point = this.editor.relativeContentPoint({ x: bound.left, y: bound.top });
            var pd = this.editor.paddingBound;
            var height = 12 + (this.title ? this.editor.lineHeight : 0) + (this.editor.lineHeight * (this.des ? this.des.split(/\n/g).length : 0));
            var top = point.y - height + pd.top;
            if (top < 0) {
                top = point.y + this.editor.lineHeight;
            }
            this.ele.style.top = top + "px";
            this.ele.style.left = (point.x + pd.left) + "px";
            this.ele.setAttribute('class', `ved-editor-hang ved-editor-hang-${this.type}`);
            var title: HTMLElement = this.ele.querySelector('.ved-editor-hang-title');
            var des: HTMLElement = this.ele.querySelector('.ved-editor-hang-content');
            title.style.height = this.editor.lineHeight + "px";
            title.style.lineHeight = this.editor.lineHeight + 'px';
            des.style.lineHeight = this.editor.lineHeight + 'px';
            if (this.title) { title.innerHTML = this.title; title.style.display = 'block'; }
            else title.style.display = 'none';
            if (this.des) { des.innerHTML = this.des; des.style.display = 'block'; }
            else des.style.display = 'none';
        }
    }
}