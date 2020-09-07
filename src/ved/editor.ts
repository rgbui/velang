///<reference path='../../dist/ve.d.ts'/>
namespace Ve.Lang.Ved {

    export class Editor extends Ve.Lang.Util.BaseEvent {
        private fontSize: number = 14;
        private fontFamily: string = 'Consolas,"Courier New",monospace';
        private width: number;
        private height: number;
        private scrollX: number = 0;
        private scrollY: number = 0;
        readonly: boolean;
        lineHeight: number = 19;
        /**
         * 一个空白单词的宽度
         */
        wordWidth: number;
        /**
         * @enum theme light 白色的
         * @enum theme dark 暗黑的
         */
        private theme: string = 'light';
        private padding: number[] = [10];
        /**
         * 
         * @param ele 
         * @param options 
         * @param options.theme default light
         * @param options.padding  default [10],如果指定四个方向，则是[padding-top,padding-right,padding-bottom,padding-right]
         * @param options.width 如果不指定，则将从ele只获取大小宽度
         * 
         */
        constructor(ele: HTMLElement, options?: {
            fontSize?: number,
            lineHeight?: number,
            fontFamily?: string,
            width?: number,
            height?: number,
            theme?: 'light' | 'dark',
            padding?: number[],
            readonly?: boolean
        }) {
            super();
            this._inited = false;
            this.editor_wrapper_ele = ele;
            this.wordWidth = Util.getTextbound(' ', this.fontStyle).width;
            this.compiler = new Compiler(this);
            this._initElement();
            this.setOption(options);
            this._inited = true;
        }
        private _inited?: boolean;
        get fontStyle() {
            return {
                fontSize: this.fontSize,
                fontFamily: this.fontFamily
            }
        }
        public compiler: Compiler;
        private editor_wrapper_ele: HTMLElement;
        private editor_ele: HTMLElement;
        public content_ele: HTMLElement;
        /**
         * 智能提示
         */
        public intellisense: Intellisense;
        /***
         * 鼠标悬停显示
         */
        public hang: Hang;
        public contextmenu: Contextmenu;
        public cursor: Cursor;
        public textInput: TextInput;
        public selection: Selection;
        public focused: boolean = false;
        onblur() {
            this.textInput.blur();
        }
        private _initElement() {
            var self = this;
            this.editor_wrapper_ele.innerHTML = `<div>                
                <div class='ved-editor-box' tabindex='1'>
                     <div class='ved-editor-cursor' style='visibility:hidden'></div>
                    <div class='ved-editor-content' >
                    </div>
                    <div class='ved-editor-selection'></div>
                    <div class='ved-editor-intellisense'></div>
                    <div class='ved-editor-contextmenu'></div>
                    <div class='ved-editor-hang'><div class='ved-editor-hang-title'></div><div  class='ved-editor-hang-content'></div></div>
                    <textarea></textarea>
                </div>
            </div>`;
            this.editor_ele = this.editor_wrapper_ele.querySelector('.ved-editor-box');
            this.content_ele = this.editor_ele.querySelector('.ved-editor-content');
            this.cursor = new Cursor(this, this.editor_ele.querySelector('.ved-editor-cursor'));
            this.textInput = new TextInput(this, this.editor_ele.querySelector('textarea'));
            this.selection = new Selection(this, this.editor_ele.querySelector('.ved-editor-selection'));
            this.intellisense = new Intellisense(this, this.editor_ele.querySelector('.ved-editor-intellisense'));
            this.contextmenu = new Contextmenu(this, this.editor_ele.querySelector('.ved-edtior-contextmenu'));
            this.hang = new Hang(this, this.editor_ele.querySelector('.ved-editor-hang'));
            var dragEvent = this.selection.createDragEvent();
            this.editor_ele.addEventListener('focusin', function (event: FocusEvent) {
                self.textInput.active();
                if (!self.editor_ele.contains(event.relatedTarget as HTMLElement)) {
                    self.focused = true;
                    self.emit('focus', event);
                    self.cursor.visible();
                }
            });
            this.editor_ele.addEventListener('focusout', function (event: FocusEvent) {
                if (!self.editor_ele.contains(event.relatedTarget as HTMLElement)) {
                    self.focused = false;
                    self.emit('blur', event);
                    self.cursor.hidden();
                }
            });
            this.editor_ele.addEventListener('scroll', function (event: Event) {
                self.scrollX = self.editor_ele.scrollLeft;
                self.scrollY = self.editor_ele.scrollTop;
            })
            this.content_ele.addEventListener('mousedown', function (event: MouseEvent) {
                var point = self.relativeContentPoint(event);
                self.cursor.setCursor(point);
                dragEvent.dragDown(point);
                self.emit('mousedown', self.cursor, event);
            });
            document.addEventListener('mousemove', function (event: MouseEvent) {
                if (dragEvent.isDown == true) {
                    var point = self.relativeContentPoint(event);
                    self.cursor.setCursor(point);
                    dragEvent.dragMove(point);
                }
            });
            document.addEventListener('mouseup', function (event: MouseEvent) {
                var ele = event.target as HTMLElement;
                if (dragEvent.isDown == true) {
                    var point = self.relativeContentPoint(event);
                    self.cursor.setCursor(point);
                    if (dragEvent.isMove != true) self.selection.clear();
                    dragEvent.dragEnd(point);
                }
                else if (self.content_ele.contains(ele)) {
                    var point = self.relativeContentPoint(event);
                    self.cursor.setCursor(point);
                }
            })
            this.content_ele.addEventListener('contextmenu', function (event: MouseEvent) {
                event.preventDefault();
                var point = self.relativeContentPoint(event);
                self.cursor.setCursor(point);
                var r = self.emit('contextmenu', self.cursor, event);
                if (r != false) {
                    //说明没有阻止弹出右键菜单
                }
            });
        }
        get paddingBound() {
            var [top, right, bottom, left] = this.padding;
            if (typeof right == 'undefined') right = top;
            if (typeof bottom == 'undefined') bottom = top;
            if (typeof left == 'undefined') left = right;
            return {
                top,
                right,
                bottom,
                left
            }
        }
        get bound() {
            var b = this.editor_ele.getBoundingClientRect();
            var { top, right, bottom, left } = this.paddingBound;
            return new Rect({
                x: b.left + left,
                y: b.top + top,
                width: b.width - left - right,
                height: b.height - top - bottom
            })
        }
        /**
         * 当前视野内的坐标，相对编译器
         */
        get visibleBound() {
            return new Rect({
                x: this.scrollX,
                y: this.scrollY,
                width: this.width,
                height: this.height
            })
        }
        get doc() {
            return this.compiler.doc;
        }
        /**
         * 相对当前编辑器的坐标
         * @param point 一般是全局坐标
         */
        relativeContentPoint(point: { x: number, y: number }) {
            var p = new Point(point);
            return p.sub(this.bound.point).add(new Point(this.scrollX, this.scrollY));
        }
        /**
         * 载入代码
         * @param this 
         * @param code 
         */
        load(this: Editor, code: string) {
            this.compiler.load('code', code);
        }
        loadExpress(this: Editor, code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]) {
            this.compiler.load('express', code, args, thisObjectArgs);
        }
        loadType(this: Editor, code: string) {
            this.compiler.load('type', code);
        }
        loadBlock(this: Editor, code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]) {
            this.compiler.load('block', code, args, thisObjectArgs);
        }
        getCode() {
            return this.compiler.doc.getCode();
        }
        setOption(options: {
            fontSize?: number,
            lineHeight?: number,
            fontFamily?: string,
            width?: number,
            height?: number,
            theme?: 'light' | 'dark',
            padding?: number[],
            readonly?: boolean
        }) {
            if (typeof options == 'object') {
                for (var n in options) {
                    this[n] = options[n];
                }
                if (typeof options.lineHeight == 'undefined') {
                    //如果没有指定，那么需要主动计算行高，计算的值+2效果会好一些
                    this.lineHeight = Util.computeFontSize('test行高需要', this.fontStyle).height + 2;
                }
            }
            if (typeof this.width == 'undefined' || typeof this.height == 'undefined') {
                var rb = this.editor_wrapper_ele.getBoundingClientRect();
                if (typeof this.width == 'undefined') this.width = rb.width;
                if (typeof this.height == 'undefined') this.height = rb.height;
            }
            this.editor_ele.parentElement.setAttribute('class', `ved-editor ved-editor-${this.theme}${this.readonly ? " ved-editor-readonly" : ""}`);
            this.editor_ele.parentElement.style.width = this.width + "px";
            this.editor_ele.parentElement.style.height = this.height + "px";
            (this.editor_ele.querySelector('.ved-editor-cursor') as HTMLElement).style.height = this.lineHeight + "px";
            this.content_ele.style.cssText = `line-height:${this.lineHeight}px;font-size:${this.fontSize}px;font-family:${this.fontFamily};padding:${this.padding.map(pd => pd + "px").join(" ")}`;
            this.editor_ele.querySelector('textarea').readOnly = this.readonly ? true : false;
            if (this._inited == true) {
                this.cursor.update();
            }
        }
        layout(options?: { width: number, height: number }) {
            if (typeof options == 'undefined') options = {} as any;
            if (typeof options.width == 'undefined' || typeof options.height == 'undefined') {
                var rb = this.editor_wrapper_ele.getBoundingClientRect();
                if (typeof options.width == 'undefined') this.width = rb.width;
                else this.width = options.width
                if (typeof options.height == 'undefined') this.height = rb.height;
                else this.height = options.height;
            }
            this.editor_ele.parentElement.style.width = this.width + "px";
            this.editor_ele.parentElement.style.height = this.height + "px";
        }
    }
    export interface Editor {
        on(name: 'focus', fn: (event: FocusEvent) => void);
        on(name: 'blur', fn: (event: FocusEvent) => void);
        on(name: 'contextmenu', fn: (cursor: Cursor, event: MouseEvent) => void);
        on(name: 'mousedown', fn: (cursor: Cursor, event: MouseEvent) => void);
        on(name: 'save', fn: (code: string) => void);
        on(name: 'change', fn: () => void);
        on(name: 'error', fn: (error: Error | string) => void);

        on(name: 'createHistory', fn: (history: History) => void);
        on(name: 'writeHistory', fn: (history: History) => void);
        on(name: 'clearHistory', fn: (history: History) => void);
        on(name: 'writeSnapshot', fn: (snapshot: ActionSnapshot) => void);
        on(name: 'canRedo', fn: (canRedo: boolean) => void);
        on(name: 'canUndo', fn: (canUndo: boolean) => void);
    }
}