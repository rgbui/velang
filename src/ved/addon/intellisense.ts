namespace Ve.Lang.Ved {

    import List = Ve.Lang.Util.List;
    /**
     * 智能提示，主要提示有这些
     * 1. 搜索当前域内的所有变量名和参数
     * 2. 点属性时，搜索当前类型的属性
     * 3. '@'符操作的提示
     */
    export class Intellisense extends Ve.Lang.Util.BaseEvent {
        private editor: Editor;
        private ele: HTMLElement;
        constructor(editor: Editor, ele: HTMLElement) {
            super();
            this.editor = editor;
            this.ele = ele;
            this.markWords.push({ type: 'info', text: 'this' });
            this.markWords.push({ type: 'info', text: 'super', description: 'ok set value' });
            this.markWords.push({ type: 'info', text: 'if' });
            this.markWords.push({ type: 'info', text: 'else' });
            this.markWords.push({ type: 'info', text: 'set' });
            this.markWords.push({ type: 'info', text: 'get' });
            this.markWords.push({ type: 'info', text: 'if' });
            this.markWords.push({ type: 'info', text: 'else' });
            this.markWords.push({ type: 'info', text: 'set' });
            this.markWords.push({ type: 'info', text: 'get' });
            this.markWords.push({ type: 'info', text: 'if' });
            this.markWords.push({ type: 'info', text: 'else' });
            this.markWords.push({ type: 'info', text: 'set' });
            this.markWords.push({ type: 'info', text: 'get' });
            this.markWords.push({ type: 'info', text: 'if' });
            this.markWords.push({ type: 'info', text: 'else' });
            this.markWords.push({ type: 'info', text: 'set' });
            this.markWords.push({ type: 'info', text: 'get' });
            this.markWords.push({ type: 'info', text: 'if' });
            this.markWords.push({ type: 'info', text: 'else' });
            this.markWords.push({ type: 'info', text: 'set' });
            this.markWords.push({ type: 'info', text: 'get' });
            this.init();
        }
        init() {
            var self = this;
            this.ele.style.display = 'none';
            this.ele.addEventListener('mousedown', function (event: MouseEvent) {
                var target: HTMLElement = event.target as HTMLElement;
                if (self.ele !== target) {
                    var ma = target.closest('.ved-editor-intellisense-marked') as HTMLElement;
                    for (var i = 0; i < self.ele.children.length; i++) {
                        if (self.ele.children[i] === ma) break;
                    }
                    var mw = self.markWords.eq(i);
                    if (mw) {
                        self.onSelectMarkWords(mw);
                    }
                }
            });
        }
        open: boolean = false;
        markWords: List<{ type: string, text: string, description?: string }> = new List();
        focusIndex: number = 0;
        render() {
            if (this.open == false) {
                this.ele.style.display = 'none';
                return;
            }
            var pd = this.editor.paddingBound;
            this.ele.style.display = 'block';
            this.ele.style.left = (this.editor.cursor.position.left + pd.left) + "px";
            this.ele.style.top = (this.editor.cursor.position.top + this.editor.lineHeight + pd.top) + "px";
            var cs = this.ele.children;
            var rbs = this.markWords;
            for (var i = 0; i < rbs.length; i++) {
                var ele = cs[i] as HTMLElement;
                var rb = rbs[i];
                if (ele) {
                    ele.style.display = 'block';
                    if (i == this.focusIndex) ele.classList.add('hover')
                    else ele.classList.remove('hover');
                    var ec = ele.children;
                    ec[0].setAttribute('class', 'ved-editor-intellisense-marked-' + rb.type);
                    ec[1].innerHTML = rb.text;
                    ec[2].innerHTML = rb.description || "";
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
                    var rb = rbs[j];
                    html += `<div class='ved-editor-intellisense-marked ${j == this.focusIndex ? "hover" : ""}'>
                    <span class='ved-editor-intellisense-marked-${rb.type}'></span>
                    <span>${rb.text}</span>
                    <span>${rb.description || ''}</span>
                    </div>`;
                }
                if (cs.length == 0) this.ele.insertAdjacentHTML('afterbegin', html);
                else this.ele.insertAdjacentHTML('beforeend', html);
            }
        }
        close() {
            this.open = false;
            this.render();
        }
        onSelectMarkWords(markWord: ListOf<Intellisense['markWords']>) {
            this.emit('selectMarkWord', markWord);
        }
        moveFocusIndex(arrow: 'arrow-down' | 'arrow-up') {
            if (arrow == 'arrow-down') {
                if (this.focusIndex >= this.markWords.length - 1) return;
                else { this.focusIndex += 1; this.render(); }
            }
            else if (arrow == 'arrow-up') {
                if (this.focusIndex > 0) {
                    this.focusIndex -= 1;
                    this.render();
                }
            }
        }
        enter(event: KeyboardEvent) {
            var mw = this.markWords.eq(this.focusIndex);
            if (mw) this.onSelectMarkWords(mw);
            else this.close()
        }
    }
    export interface Intellisense {
        on(name: 'selectMarkWord', fn: (markWord: ListOf<Intellisense['markWords']>) => void, isR?: boolean);
    }
}