var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            var List = Ve.Lang.Util.List;
            class Compiler {
                constructor(editor) {
                    this.mode = 'code';
                    this.code = '';
                    this.args = [];
                    this.thisObjectArgs = [];
                    this.editor = editor;
                    this.doc = new Ved.Doc(this.editor, this.editor.content_ele);
                }
                load(mode, code, args, thisObjectArgs) {
                    var startDate = new Date().getTime();
                    this.mode = mode;
                    this.code = code;
                    this.args = args;
                    this.thisObjectArgs = thisObjectArgs;
                    this.compiler = new Ve.Lang.Compiler();
                    this.doc.clearError();
                    var stages = new List();
                    this.compiler.on('error', error => {
                        if (!stages.exists(x => x == error.stage))
                            stages.push(error.stage);
                        if (error.pos) {
                            this.doc.appendError(error);
                        }
                    });
                    var tokens;
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
                        return;
                    }
                    if (new Date().getTime() - startDate > 200)
                        console.log('compile time:' + (new Date().getTime() - startDate));
                    startDate = new Date().getTime();
                    if (tokens && !stages.exists('token')) {
                        this.doc.load(tokens);
                        this.doc.render();
                        this.editor.cursor.hidden();
                        if (new Date().getTime() - startDate > 200)
                            console.log('render time:' + (new Date().getTime() - startDate));
                    }
                }
                reload(mode, code, args, thisObjectArgs) {
                    var startDate = new Date().getTime();
                    this.mode = mode;
                    this.code = code;
                    this.args = args;
                    this.thisObjectArgs = thisObjectArgs;
                    this.compiler = new Ve.Lang.Compiler();
                    this.doc.clearError();
                    var stages = new List();
                    this.compiler.on('error', error => {
                        if (!stages.exists(x => x == error.stage))
                            stages.push(error.stage);
                        if (error.pos) {
                            this.doc.appendError(error);
                        }
                    });
                    var tokens;
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
                        return;
                    }
                    if (new Date().getTime() - startDate > 200)
                        console.log('compile time:' + (new Date().getTime() - startDate));
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
                scan(interval = 700) {
                    if (this.timer) {
                        clearTimeout(this.timer);
                        delete this.timer;
                    }
                    this.timer = setTimeout(() => {
                        this.rce();
                    }, interval);
                }
                rce() {
                    if (this.compiler)
                        this.compiler.dispose();
                    var code = this.doc.getCode();
                    this.reload(this.mode, code, this.args, this.thisObjectArgs);
                }
            }
            Ved.Compiler = Compiler;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class Editor extends Ve.Lang.Util.BaseEvent {
                constructor(ele, options) {
                    super();
                    this.fontSize = 14;
                    this.fontFamily = 'Consolas,"Courier New",monospace';
                    this.scrollX = 0;
                    this.scrollY = 0;
                    this.lineHeight = 19;
                    this.theme = 'light';
                    this.padding = [10];
                    this.focused = false;
                    this._inited = false;
                    this.editor_wrapper_ele = ele;
                    this.wordWidth = Ved.Util.getTextbound(' ', this.fontStyle).width;
                    this.compiler = new Ved.Compiler(this);
                    this._initElement();
                    this.setOption(options);
                    this._inited = true;
                }
                get fontStyle() {
                    return {
                        fontSize: this.fontSize,
                        fontFamily: this.fontFamily
                    };
                }
                onblur() {
                    this.textInput.blur();
                }
                _initElement() {
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
                    this.cursor = new Ved.Cursor(this, this.editor_ele.querySelector('.ved-editor-cursor'));
                    this.textInput = new Ved.TextInput(this, this.editor_ele.querySelector('textarea'));
                    this.selection = new Ved.Selection(this, this.editor_ele.querySelector('.ved-editor-selection'));
                    this.intellisense = new Ved.Intellisense(this, this.editor_ele.querySelector('.ved-editor-intellisense'));
                    this.contextmenu = new Ved.Contextmenu(this, this.editor_ele.querySelector('.ved-edtior-contextmenu'));
                    this.hang = new Ved.Hang(this, this.editor_ele.querySelector('.ved-editor-hang'));
                    var dragEvent = this.selection.createDragEvent();
                    this.editor_ele.addEventListener('focusin', function (event) {
                        self.textInput.active();
                        if (!self.editor_ele.contains(event.relatedTarget)) {
                            self.focused = true;
                            self.emit('focus', event);
                            self.cursor.visible();
                        }
                    });
                    this.editor_ele.addEventListener('focusout', function (event) {
                        if (!self.editor_ele.contains(event.relatedTarget)) {
                            self.focused = false;
                            self.emit('blur', event);
                            self.cursor.hidden();
                        }
                    });
                    this.editor_ele.addEventListener('scroll', function (event) {
                        self.scrollX = self.editor_ele.scrollLeft;
                        self.scrollY = self.editor_ele.scrollTop;
                    });
                    this.content_ele.addEventListener('mousedown', function (event) {
                        var point = self.relativeContentPoint(event);
                        self.cursor.setCursor(point);
                        dragEvent.dragDown(point);
                        self.emit('mousedown', self.cursor, event);
                    });
                    document.addEventListener('mousemove', function (event) {
                        if (dragEvent.isDown == true) {
                            var point = self.relativeContentPoint(event);
                            self.cursor.setCursor(point);
                            dragEvent.dragMove(point);
                        }
                    });
                    document.addEventListener('mouseup', function (event) {
                        var ele = event.target;
                        if (dragEvent.isDown == true) {
                            var point = self.relativeContentPoint(event);
                            self.cursor.setCursor(point);
                            if (dragEvent.isMove != true)
                                self.selection.clear();
                            dragEvent.dragEnd(point);
                        }
                        else if (self.content_ele.contains(ele)) {
                            var point = self.relativeContentPoint(event);
                            self.cursor.setCursor(point);
                        }
                    });
                    this.content_ele.addEventListener('contextmenu', function (event) {
                        event.preventDefault();
                        var point = self.relativeContentPoint(event);
                        self.cursor.setCursor(point);
                        var r = self.emit('contextmenu', self.cursor, event);
                        if (r != false) {
                        }
                    });
                }
                get paddingBound() {
                    var [top, right, bottom, left] = this.padding;
                    if (typeof right == 'undefined')
                        right = top;
                    if (typeof bottom == 'undefined')
                        bottom = top;
                    if (typeof left == 'undefined')
                        left = right;
                    return {
                        top,
                        right,
                        bottom,
                        left
                    };
                }
                get bound() {
                    var b = this.editor_ele.getBoundingClientRect();
                    var { top, right, bottom, left } = this.paddingBound;
                    return new Ved.Rect({
                        x: b.left + left,
                        y: b.top + top,
                        width: b.width - left - right,
                        height: b.height - top - bottom
                    });
                }
                get visibleBound() {
                    return new Ved.Rect({
                        x: this.scrollX,
                        y: this.scrollY,
                        width: this.width,
                        height: this.height
                    });
                }
                get doc() {
                    return this.compiler.doc;
                }
                relativeContentPoint(point) {
                    var p = new Ved.Point(point);
                    return p.sub(this.bound.point).add(new Ved.Point(this.scrollX, this.scrollY));
                }
                load(code) {
                    this.compiler.load('code', code);
                }
                loadExpress(code, args, thisObjectArgs) {
                    this.compiler.load('express', code, args, thisObjectArgs);
                }
                loadType(code) {
                    this.compiler.load('type', code);
                }
                loadBlock(code, args, thisObjectArgs) {
                    this.compiler.load('block', code, args, thisObjectArgs);
                }
                getCode() {
                    return this.compiler.doc.getCode();
                }
                setOption(options) {
                    if (typeof options == 'object') {
                        for (var n in options) {
                            this[n] = options[n];
                        }
                        if (typeof options.lineHeight == 'undefined') {
                            this.lineHeight = Ved.Util.computeFontSize('test行高需要', this.fontStyle).height + 2;
                        }
                    }
                    if (typeof this.width == 'undefined' || typeof this.height == 'undefined') {
                        var rb = this.editor_wrapper_ele.getBoundingClientRect();
                        if (typeof this.width == 'undefined')
                            this.width = rb.width;
                        if (typeof this.height == 'undefined')
                            this.height = rb.height;
                    }
                    this.editor_ele.parentElement.setAttribute('class', `ved-editor ved-editor-${this.theme}${this.readonly ? " ved-editor-readonly" : ""}`);
                    this.editor_ele.parentElement.style.width = this.width + "px";
                    this.editor_ele.parentElement.style.height = this.height + "px";
                    this.editor_ele.querySelector('.ved-editor-cursor').style.height = this.lineHeight + "px";
                    this.content_ele.style.cssText = `line-height:${this.lineHeight}px;font-size:${this.fontSize}px;font-family:${this.fontFamily};padding:${this.padding.map(pd => pd + "px").join(" ")}`;
                    this.editor_ele.querySelector('textarea').readOnly = this.readonly ? true : false;
                    if (this._inited == true) {
                        this.cursor.update();
                    }
                }
                layout(options) {
                    if (typeof options == 'undefined')
                        options = {};
                    if (typeof options.width == 'undefined' || typeof options.height == 'undefined') {
                        var rb = this.editor_wrapper_ele.getBoundingClientRect();
                        if (typeof options.width == 'undefined')
                            this.width = rb.width;
                        else
                            this.width = options.width;
                        if (typeof options.height == 'undefined')
                            this.height = rb.height;
                        else
                            this.height = options.height;
                    }
                    this.editor_ele.parentElement.style.width = this.width + "px";
                    this.editor_ele.parentElement.style.height = this.height + "px";
                }
            }
            Ved.Editor = Editor;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class Contextmenu {
                constructor(editor, ele) {
                    this.editor = editor;
                    this.ele = ele;
                }
            }
            Ved.Contextmenu = Contextmenu;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class Cursor {
                constructor(editor, ele) {
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
                    if (this.timer) {
                        clearInterval(this.timer);
                        delete this.timer;
                    }
                    self.ele.style.visibility = 'hidden';
                }
                visible() {
                    var self = this;
                    if (this.timer) {
                        clearInterval(this.timer);
                        delete this.timer;
                    }
                    this.timer = setInterval(function () {
                        self.ele.style.visibility = self.ele.style.visibility == 'hidden' ? 'visible' : 'hidden';
                    }, 6e2);
                }
                setCursor(point) {
                    if (point.y < 0)
                        point.y = 0;
                    else if (point.y > this.editor.compiler.doc.length * this.editor.lineHeight)
                        point.y = this.editor.compiler.doc.length * this.editor.lineHeight - 5;
                    if (point.x < 0)
                        point.x = 0;
                    else if (point.x > this.editor.bound.width)
                        point.x = this.editor.bound.width;
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
                    var point = new Ved.Point(this.position.left, this.position.top);
                    this.setCursor(point);
                }
                move(arrow) {
                    switch (arrow) {
                        case 'arrow-left':
                            if (this.position.col > 0)
                                this.position.col -= 1;
                            else if (this.position.col == 0) {
                                var prevLine = this.position.line.prev;
                                if (prevLine)
                                    this.position.copyFrom(prevLine.endPosition);
                                else
                                    return;
                            }
                            break;
                        case 'arrow-right':
                            if (this.position.col == this.position.line.value.length) {
                                var nextLine = this.position.line.next;
                                if (nextLine)
                                    this.position.copyFrom(nextLine.startPosition);
                                else
                                    return;
                            }
                            else
                                this.position.col += 1;
                            break;
                        case 'arrow-up':
                            var prevLine = this.position.line.prev;
                            if (prevLine) {
                                if (this.position.col > prevLine.value.length)
                                    this.position.col = prevLine.value.length;
                                this.position.row = prevLine.index;
                            }
                            break;
                        case 'arrow-down':
                            var nextLine = this.position.line.next;
                            if (nextLine) {
                                if (this.position.col > nextLine.value.length)
                                    this.position.col = nextLine.value.length;
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
                insertText(text) {
                    if (text == '' || text === null || typeof text == 'undefined')
                        return;
                    if (text.indexOf('\n') > -1) {
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
                deleteWord(arrow) {
                    if (arrow == 'before') {
                        if (this.position.col == 0) {
                            if (this.position.line.prev) {
                                var prevLine = this.position.line.prev;
                                this.position.col = prevLine.value.length;
                                var currentLine = this.position.line;
                                this.position.row = prevLine.index;
                                prevLine.unionLine(currentLine);
                            }
                            else
                                return;
                        }
                        else {
                            var tokenSpan = this.position.tokenSpan;
                            tokenSpan.value = tokenSpan.value.slice(0, this.position.col - tokenSpan.col - 1) + tokenSpan.value.slice(this.position.col - tokenSpan.col);
                            this.position.col -= 1;
                        }
                    }
                    else if (arrow == 'after') {
                        if (this.position.col == this.position.line.value.length) {
                            if (this.position.line.next) {
                                this.position.line.unionLine(this.position.line.next);
                            }
                            else
                                return;
                        }
                        else {
                            var tokenSpan = this.position.tokenSpan;
                            var dcol = this.position.col - tokenSpan.col;
                            if (dcol == tokenSpan.size) {
                                tokenSpan = tokenSpan.next;
                            }
                            tokenSpan.value = tokenSpan.value.slice(0, this.position.col - tokenSpan.col) + tokenSpan.value.slice(this.position.col - tokenSpan.col + 1);
                        }
                    }
                    this.update();
                }
                deleteLine() {
                    this.move('arrow-up');
                    this.editor.cursor.position.line.remove();
                }
            }
            Ved.Cursor = Cursor;
            class SpanPosition {
                constructor(editor, row, col) {
                    this.editor = editor;
                    if (typeof row == 'number')
                        this.row = row;
                    if (typeof col == 'number')
                        this.col = col;
                }
                copy() {
                    return new SpanPosition(this.editor, this.row, this.col);
                }
                copyFrom(sp) {
                    this.row = sp.row;
                    this.col = sp.col;
                }
                get top() {
                    return this.row * this.editor.lineHeight;
                }
                get left() {
                    if (this.col == 0)
                        return 0;
                    return Ved.Util.getTextbound(this.line.value.slice(0, this.col), this.line.editor.fontStyle).width;
                }
                get tokenSpan() {
                    return this.line.findTokenSpan(this.col);
                }
                get tillTokenSpan() {
                    var t = this.tokenSpan;
                    if (t)
                        return t;
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
                    };
                }
                set pos(value) {
                    this.row = value.row;
                    this.col = value.col;
                }
            }
            Ved.SpanPosition = SpanPosition;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class Hang {
                constructor(editor, ele) {
                    this.editor = editor;
                    this.ele = ele;
                    this.ele.style.display = 'none';
                    this.init();
                }
                init() {
                    var self = this;
                    this.editor.content_ele.addEventListener('mouseover', function (event) {
                        var span = event.target;
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
                    this.ele.addEventListener('mouseleave', function (event) {
                        self.hide();
                    });
                }
                clear() {
                    var self = this;
                    if (typeof self.timer != 'undefined') {
                        clearTimeout(self.timer);
                        self.timer = undefined;
                    }
                }
                hide() {
                    this.ele.style.display = 'none';
                }
                show() {
                    var line_ele = this.span.closest('.ved-line');
                    if (!line_ele || line_ele && !line_ele.parentElement)
                        return;
                    var index = 0;
                    for (var i = 0; i < line_ele.parentElement.children.length; i++) {
                        if (line_ele.parentElement.children[i] === line_ele) {
                            index = i;
                            break;
                        }
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
                    var title = this.ele.querySelector('.ved-editor-hang-title');
                    var des = this.ele.querySelector('.ved-editor-hang-content');
                    title.style.height = this.editor.lineHeight + "px";
                    title.style.lineHeight = this.editor.lineHeight + 'px';
                    des.style.lineHeight = this.editor.lineHeight + 'px';
                    if (this.title) {
                        title.innerHTML = this.title;
                        title.style.display = 'block';
                    }
                    else
                        title.style.display = 'none';
                    if (this.des) {
                        des.innerHTML = this.des;
                        des.style.display = 'block';
                    }
                    else
                        des.style.display = 'none';
                }
            }
            Ved.Hang = Hang;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            var List = Ve.Lang.Util.List;
            class Intellisense extends Ve.Lang.Util.BaseEvent {
                constructor(editor, ele) {
                    super();
                    this.open = false;
                    this.markWords = new List();
                    this.focusIndex = 0;
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
                    this.ele.addEventListener('mousedown', function (event) {
                        var target = event.target;
                        if (self.ele !== target) {
                            var ma = target.closest('.ved-editor-intellisense-marked');
                            for (var i = 0; i < self.ele.children.length; i++) {
                                if (self.ele.children[i] === ma)
                                    break;
                            }
                            var mw = self.markWords.eq(i);
                            if (mw) {
                                self.onSelectMarkWords(mw);
                            }
                        }
                    });
                }
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
                        var ele = cs[i];
                        var rb = rbs[i];
                        if (ele) {
                            ele.style.display = 'block';
                            if (i == this.focusIndex)
                                ele.classList.add('hover');
                            else
                                ele.classList.remove('hover');
                            var ec = ele.children;
                            ec[0].setAttribute('class', 'ved-editor-intellisense-marked-' + rb.type);
                            ec[1].innerHTML = rb.text;
                            ec[2].innerHTML = rb.description || "";
                        }
                        else
                            break;
                    }
                    if (cs.length > i) {
                        for (var j = cs.length - 1; j >= i; j--) {
                            var ele = cs[j];
                            ele.style.display = 'none';
                        }
                    }
                    else if (cs.length == i + 1) {
                    }
                    else {
                        var html = '';
                        for (var j = i; j < rbs.length; j++) {
                            var rb = rbs[j];
                            html += `<div class='ved-editor-intellisense-marked ${j == this.focusIndex ? "hover" : ""}'>
                    <span class='ved-editor-intellisense-marked-${rb.type}'></span>
                    <span>${rb.text}</span>
                    <span>${rb.description || ''}</span>
                    </div>`;
                        }
                        if (cs.length == 0)
                            this.ele.insertAdjacentHTML('afterbegin', html);
                        else
                            this.ele.insertAdjacentHTML('beforeend', html);
                    }
                }
                close() {
                    this.open = false;
                    this.render();
                }
                onSelectMarkWords(markWord) {
                    this.emit('selectMarkWord', markWord);
                }
                moveFocusIndex(arrow) {
                    if (arrow == 'arrow-down') {
                        if (this.focusIndex >= this.markWords.length - 1)
                            return;
                        else {
                            this.focusIndex += 1;
                            this.render();
                        }
                    }
                    else if (arrow == 'arrow-up') {
                        if (this.focusIndex > 0) {
                            this.focusIndex -= 1;
                            this.render();
                        }
                    }
                }
                enter(event) {
                    var mw = this.markWords.eq(this.focusIndex);
                    if (mw)
                        this.onSelectMarkWords(mw);
                    else
                        this.close();
                }
            }
            Ved.Intellisense = Intellisense;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            var List = Ve.Lang.Util.List;
            class Selection {
                constructor(editor, ele) {
                    this.editor = editor;
                    this.ele = ele;
                }
                get end() {
                    return this._end;
                }
                set end(value) {
                    this._end = value;
                    if (this.isNotEmpty)
                        this.render();
                    else
                        this.ele.style.display = 'none';
                }
                clear() {
                    delete this.start;
                    delete this._end;
                    this.ele.style.display = 'none';
                }
                get isEmpty() {
                    if (typeof this.start != 'undefined' && typeof this._end != 'undefined') {
                        if (this.start.left == this._end.left && this.start.line == this._end.line)
                            return true;
                        return false;
                    }
                    else
                        return true;
                }
                get isNotEmpty() { return this.isEmpty ? false : true; }
                isInSelection(point) {
                    return this.getRowBounds().exists(x => x.isInside(point));
                }
                selectAll() {
                    this.start = this.editor.compiler.doc.first.startPosition;
                    this._end = this.editor.compiler.doc.last.endPosition;
                    this.render();
                }
                selectLine() {
                    this.start = this.editor.cursor.position.line.startPosition;
                    this._end = this.editor.cursor.position.line.endPosition;
                    this.render();
                }
                deleteAll() {
                    var { min, max } = this.getMinAndMax();
                    var minIndex = min.line.index;
                    var maxIndex = max.line.index;
                    if (minIndex == maxIndex) {
                        min.line.delete(min.col, max.col);
                    }
                    else {
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
                get code() {
                    var { min, max } = this.getMinAndMax();
                    var minIndex = min.line.index;
                    var maxIndex = max.line.index;
                    var code = '';
                    if (minIndex == maxIndex) {
                        code = min.line.getValue(min.col, max.col);
                    }
                    else {
                        var ps = new List();
                        ps.push(min.line.getValue(min.col, min.line.endPosition.col) + '\n');
                        for (var i = maxIndex - 1; i > minIndex; i--) {
                            var line = this.editor.compiler.doc.line(i);
                            ps.push(line.value + '\n');
                        }
                        ps.push(max.line.getValue(0, max.col));
                        code = ps.join("");
                    }
                    return code;
                }
                render() {
                    if (this.isEmpty) {
                        this.ele.style.display = 'none';
                        return;
                    }
                    var pd = this.editor.paddingBound;
                    this.ele.style.display = 'block';
                    var cs = this.ele.children;
                    var rbs = this.getRowBounds();
                    for (var i = 0; i < rbs.length; i++) {
                        var ele = cs[i];
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
                        for (var j = cs.length - 1; j >= i; j--) {
                            var ele = cs[j];
                            ele.style.display = 'none';
                        }
                    }
                    else if (cs.length == i + 1) {
                    }
                    else {
                        var html = '';
                        for (var j = i; j < rbs.length; j++) {
                            var rb = rbs.eq(j);
                            html += `<div class='ved-editor-selection-row' style='top:${rb.y + pd.top}px;left:${rb.x + pd.left}px;width:${rb.width}px;height:${rb.height}px'></div>`;
                        }
                        if (cs.length == 0)
                            this.ele.insertAdjacentHTML('afterbegin', html);
                        else
                            this.ele.insertAdjacentHTML('beforeend', html);
                    }
                }
                getRowBounds() {
                    var { min, max } = this.getMinAndMax();
                    var minIndex = min.line.index;
                    var maxIndex = max.line.index;
                    var rowBounds = new List();
                    var minTop = min.top;
                    for (var i = minIndex; i <= maxIndex; i++) {
                        var left = i == minIndex ? min.left : 0;
                        var width;
                        if (i == maxIndex) {
                            width = i == minIndex ? max.left - min.left : max.left;
                        }
                        else {
                            var cb = this.editor.compiler.doc.line(i).contentBound;
                            if (i == minIndex)
                                width = cb.width + this.editor.wordWidth - min.left;
                            else
                                width = cb.width + this.editor.wordWidth;
                        }
                        var top = minTop + (i - minIndex) * this.editor.lineHeight;
                        var height = this.editor.lineHeight;
                        rowBounds.push(new Ved.Rect({ y: top, x: left, width, height }));
                    }
                    return rowBounds;
                }
                getMinAndMax() {
                    var min = this.start;
                    var max = this.end;
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
            Ved.Selection = Selection;
            const MIN_DISTANCE = 4;
            class DragSelectionEvent {
                constructor(editor, selection) {
                    this.isDown = false;
                    this.isMove = false;
                    this.operator = 'none';
                    this.selection = selection;
                    this.editor = editor;
                }
                dragDown(point) {
                    this.isDown = true;
                    this.start = point;
                    this.startCursor = this.editor.cursor.position.copy();
                }
                dragMove(event) {
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
                            return;
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
                dragEnd(event) {
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
            Ved.DragSelectionEvent = DragSelectionEvent;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class TextInput {
                constructor(editor, ele) {
                    this.lastValue = '';
                    this.editor = editor;
                    this.ele = ele;
                    this.init();
                }
                init() {
                    var self = this;
                    this.render();
                    this.ele.addEventListener('focus', function (event) {
                        event.preventDefault();
                    });
                    this.ele.addEventListener('keydown', function (event) {
                        var kb = new Ved.KeyBoard(event);
                        var value = self.ele.value;
                        if (kb.everyMatch('backspace')) {
                            if (!value) {
                                self.editor.doc.recoder.createHistory(Ved.HistoryCommand.onKeyBackspace);
                                if (self.editor.selection.isNotEmpty)
                                    self.deleteSelection();
                                else
                                    self.backspace(event);
                                self.editor.doc.recoder.writeHistory();
                            }
                        }
                        else if (kb.everyMatch('delete')) {
                            self.editor.doc.recoder.createHistory(Ved.HistoryCommand.onKeyDelete);
                            if (self.editor.selection.isNotEmpty)
                                self.deleteSelection();
                            else
                                self.delete(event);
                            self.editor.doc.recoder.writeHistory();
                        }
                        else if (kb.everyMatch('shift+delete')) {
                            self.editor.doc.recoder.createHistory(Ved.HistoryCommand.onKeyShiftDelete);
                            if (self.editor.selection.isNotEmpty)
                                self.deleteSelection();
                            else
                                self.editor.cursor.deleteLine();
                            self.editor.doc.recoder.writeHistory();
                        }
                        else if (kb.everyMatch('enter')) {
                            self.editor.doc.recoder.createHistory(Ved.HistoryCommand.onKeyEnter);
                            event.preventDefault();
                            if (self.editor.intellisense.open)
                                self.editor.intellisense.enter(event);
                            else
                                self.enter(event);
                            self.editor.doc.recoder.writeHistory();
                        }
                        else if (kb.match('arrowleft')) {
                            self.editor.cursor.move('arrow-left');
                        }
                        else if (kb.match('arrowright')) {
                            self.editor.cursor.move('arrow-right');
                        }
                        else if (kb.match('arrowdown')) {
                            if (self.editor.intellisense.open)
                                self.editor.intellisense.moveFocusIndex('arrow-down');
                            else
                                self.editor.cursor.move('arrow-down');
                        }
                        else if (kb.match('arrowup')) {
                            if (self.editor.intellisense.open)
                                self.editor.intellisense.moveFocusIndex('arrow-up');
                            else
                                self.editor.cursor.move('arrow-up');
                        }
                        else if (kb.match('pagedown')) {
                            self.editor.cursor.move('page-down');
                        }
                        else if (kb.match('pageup')) {
                            self.editor.cursor.move('page-up');
                        }
                        else if (kb.everyMatch('ctrl+a')) {
                            self.editor.selection.selectAll();
                        }
                        else if (kb.everyMatch('ctrl+l')) {
                            self.editor.selection.selectLine();
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
                            self.editor.doc.onUndo();
                        }
                        else if (kb.everyMatch('ctrl+y')) {
                            self.editor.doc.onRedo();
                        }
                        else if (kb.everyMatch('ctrl+f')) {
                        }
                        else if (kb.everyMatch('ctrl+h')) {
                        }
                        else if (kb.everyMatch('ctrl+/')) {
                        }
                        else if (kb.everyMatch('ctrl+s')) {
                            event.preventDefault();
                            var code = self.editor.compiler.doc.getCode();
                            self.editor.emit('save', code);
                        }
                    });
                    function inputFx(event) {
                        self.editor.doc.recoder.createHistory(Ved.HistoryCommand.InputWords);
                        self.input();
                        self.editor.doc.recoder.writeHistory();
                    }
                    this.ele.addEventListener('input', function (event) {
                        inputFx(event);
                    });
                    this.ele.addEventListener('paste', function (event) {
                        self.editor.doc.recoder.createHistory(Ved.HistoryCommand.onKeyPaster);
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
                focus() {
                    this.render();
                    this.editor.intellisense.close();
                    this.ele.value = '';
                    this.pos = this.editor.cursor.position.pos;
                    this.lastValue = '';
                }
                enter(event) {
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
                        }
                    }
                    var self = this;
                    var value = this.ele.value;
                    var ms = value.match(/[\(\{"'\[]/g);
                    var map = { '(': ')', "\"": "\"", "'": "'", "[": "]", "{": "}" };
                    var cs = [];
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
                paster(event) {
                    var self = this;
                    var text = event.clipboardData.getData('text');
                    if (text) {
                        if (self.editor.selection.isNotEmpty)
                            self.deleteSelection();
                        this.editor.cursor.insertText(text);
                        this.editor.compiler.scan(200);
                    }
                }
                backspace(event) {
                    this.editor.cursor.deleteWord('before');
                    this.editor.compiler.scan(1000);
                }
                delete(event) {
                    this.editor.cursor.deleteWord('after');
                    this.editor.compiler.scan(1000);
                }
            }
            Ved.TextInput = TextInput;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class Doc$Recorder {
                initRecoder() {
                    this.recoder = new Ved.HistoryRecorder(this);
                    this.recoder.supervisor.on('redo', (history) => this.redo(history));
                    this.recoder.supervisor.on('undo', (history) => this.undo(history));
                    this.recoder.supervisor.on('canRedo', (canRedo) => { this.editor.emit('canRedo', canRedo); });
                    this.recoder.supervisor.on('canUndo', (canUndo) => { this.editor.emit('canUndo', canUndo); });
                    this.recoder.supervisor.on('error', (error) => this.editor.emit('error', error));
                }
                get canRedo() {
                    return this.recoder.supervisor.canRedo;
                }
                get canUndo() {
                    return this.recoder.supervisor.canUndo;
                }
                onRedo() {
                    this.recoder.createHistory(Ved.HistoryCommand.onKeyRedo);
                    this.recoder.supervisor.onRedo();
                    this.recoder.writeHistory();
                }
                onUndo() {
                    this.recoder.createHistory(Ved.HistoryCommand.onKeyCancel);
                    this.recoder.supervisor.onUndo();
                    this.recoder.writeHistory();
                }
                redo(history) {
                    history.snapshots.each(snapshot => {
                        switch (snapshot.action) {
                            case Ved.HistoryAction.createLine:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    line.createSimulateLine(snapshot.data.value);
                                }
                                break;
                            case Ved.HistoryAction.deleteLine:
                                var line = this.line(snapshot.data.row);
                                if (line)
                                    line.remove();
                                break;
                            case Ved.HistoryAction.deleteLineRange:
                                var line = this.line(snapshot.data.row);
                                if (line)
                                    line.delete(snapshot.data.startCol, snapshot.data.endCol);
                                break;
                            case Ved.HistoryAction.lineRemoveTokenSpan:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    var sp = line.findTokenSpan(snapshot.data.col);
                                    if (sp)
                                        line.removeTokenSpan(sp);
                                }
                                break;
                            case Ved.HistoryAction.insertTokenSpan:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    line.insertText(snapshot.data.col, snapshot.data.value);
                                }
                                break;
                            case Ved.HistoryAction.updateTokenSpan:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    line.replaceText(snapshot.data.col, snapshot.data.newValue, snapshot.data.oldValue.length);
                                }
                                break;
                        }
                    });
                    var line = this.line(history.newCursor.row);
                    if (line) {
                        this.editor.cursor.position.copyFrom(new Ved.SpanPosition(this.editor, line.index, history.newCursor.col));
                        this.editor.cursor.update();
                    }
                }
                undo(history) {
                    var sns = history.snapshots.toArray(x => x).reverse();
                    sns.each(snapshot => {
                        switch (snapshot.action) {
                            case Ved.HistoryAction.createLine:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    line.next.remove();
                                }
                                break;
                            case Ved.HistoryAction.deleteLine:
                                var line = this.line(snapshot.data.row - 1);
                                if (line) {
                                    line.createSimulateLine(snapshot.data.value);
                                }
                                break;
                            case Ved.HistoryAction.deleteLineRange:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    line.insertText(snapshot.data.startCol, snapshot.data.value);
                                }
                                ;
                                break;
                            case Ved.HistoryAction.lineRemoveTokenSpan:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    line.insertText(snapshot.data.col, snapshot.data.value);
                                }
                                break;
                            case Ved.HistoryAction.insertTokenSpan:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    var sp = line.findTokenSpan(snapshot.data.col);
                                    if (sp)
                                        sp.value = '';
                                }
                                break;
                            case Ved.HistoryAction.updateTokenSpan:
                                var line = this.line(snapshot.data.row);
                                if (line) {
                                    if (snapshot.data.newValue == '') {
                                        line.insertText(snapshot.data.col, snapshot.data.oldValue);
                                    }
                                    else {
                                        var sp = line.findTokenSpan(snapshot.data.col);
                                        if (sp) {
                                            sp.value = snapshot.data.oldValue;
                                        }
                                    }
                                }
                                break;
                        }
                    });
                    var line = this.line(history.oldCursor.row);
                    if (line) {
                        this.editor.cursor.position.copyFrom(new Ved.SpanPosition(this.editor, history.oldCursor.row, history.oldCursor.col));
                        this.editor.cursor.update();
                    }
                }
            }
            Ved.Doc$Recorder = Doc$Recorder;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            var List = Ve.Lang.Util.List;
            class Doc {
                constructor(editor, el) {
                    this.errors = new List();
                    this.lines = new List();
                    this.editor = editor;
                    this.el = el;
                    this.initRecoder();
                }
                clearError() {
                    this.errors = new List();
                }
                appendError(error) {
                    this.errors.push(error);
                }
                getTokenError(token) {
                    return this.errors.find(x => x.token == token);
                }
                load(tokens) {
                    this.tokens = tokens;
                    this.lines = new List();
                    var line = new Ved.Line(this);
                    this.lines.push(line);
                    var ts = (tokens) => {
                        for (var i = 0; i < tokens.length; i++) {
                            var token = tokens.eq(i);
                            if (token.flag == 'line') {
                                line = new Ved.Line(this);
                                this.lines.push(line);
                            }
                            else {
                                line.spans.push(new Ved.TokenSpan(token, line));
                            }
                            if (token.childs.length > 0)
                                ts(token.childs);
                        }
                    };
                    ts(this.tokens);
                }
                render() {
                    var cs = this.editor.content_ele.children;
                    var i;
                    for (i = 0; i < this.lines.length; i++) {
                        var ele = cs[i];
                        var line = this.lines.eq(i);
                        if (ele) {
                            line.ele = ele;
                            line.render();
                        }
                        else
                            break;
                    }
                    if (cs.length > i) {
                        for (var j = cs.length - 1; j >= i; j--) {
                            cs[j].remove();
                        }
                    }
                    else if (cs.length == i + 1) {
                    }
                    else {
                        var html = '';
                        for (var j = i; j < this.lines.length; j++) {
                            html += this.lines.eq(j).html;
                        }
                        if (cs.length == 0)
                            this.editor.content_ele.innerHTML = html;
                        else
                            this.editor.content_ele.insertAdjacentHTML('beforeend', html);
                        cs = this.editor.content_ele.children;
                        for (var k = i; k < this.lines.length; k++) {
                            var ele = cs[k];
                            var line = this.lines.eq(k);
                            line.ele = ele;
                            line.render();
                        }
                    }
                }
                getCode() {
                    var len = this.lines.length;
                    return this.lines.map((x, i) => {
                        return x.value + (i == len - 1 ? "" : "\n");
                    }).join("");
                }
                findTokenSpan(predict) {
                    var ts;
                    this.lines.each(line => {
                        var r = line.spans.find(predict);
                        if (r) {
                            ts = r;
                            return false;
                        }
                    });
                    return ts;
                }
                findLine(predict) {
                    return this.lines.find(predict);
                }
                line(row) {
                    return this.lines.eq(row);
                }
                getLineIndex(predict) {
                    return this.lines.findIndex(predict);
                }
                insertAt(at, line) {
                    this.lines.insertAt(at, line);
                }
                remove(predict) {
                    return this.lines.remove(predict);
                }
                get length() {
                    return this.lines.length;
                }
                get last() {
                    return this.lines.last();
                }
                get first() {
                    return this.lines.first();
                }
            }
            Ved.Doc = Doc;
            Ve.Lang.Util.Inherit(Doc, Ved.Doc$Recorder);
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            var List = Ve.Lang.Util.List;
            class Line {
                constructor(doc) {
                    this.spans = new List();
                    this.doc = doc;
                }
                render() {
                    var cs = this.ele.children;
                    if (this.spans.length == 0) {
                        this.ele.innerHTML = '';
                        return;
                    }
                    for (var i = 0; i < this.spans.length; i++) {
                        var ele = cs[i];
                        var span = this.spans.eq(i);
                        if (ele) {
                            span.ele = ele;
                            span.render();
                        }
                        else
                            break;
                    }
                    if (cs.length > i) {
                        for (var j = cs.length - 1; j >= i; j--) {
                            cs[j].remove();
                        }
                    }
                    else if (cs.length == i + 1) {
                    }
                    else {
                        var html = '';
                        for (var j = i; j < this.spans.length; j++) {
                            html += this.spans.eq(j).html;
                        }
                        if (cs.length == 0)
                            this.ele.insertAdjacentHTML('afterbegin', html);
                        else
                            this.ele.insertAdjacentHTML('beforeend', html);
                        cs = this.ele.children;
                        for (var k = i; k < this.spans.length; k++) {
                            var ele = cs[k];
                            var span = this.spans.eq(k);
                            span.ele = ele;
                        }
                    }
                }
                get html() {
                    return `<div class='ved-line' style='height:${this.editor.lineHeight}px'>${this.spans.map(s => s.html).join("")}</div>`;
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
                    return new Ved.Rect({
                        x: 0,
                        y: this.top,
                        width: this.editor.bound.width,
                        height: this.editor.lineHeight
                    });
                }
                get contentBound() {
                    return new Ved.Rect({
                        x: 0,
                        y: this.top,
                        width: this.width,
                        height: this.editor.lineHeight
                    });
                }
                get top() {
                    return this.index * this.editor.lineHeight;
                }
                get width() {
                    return Ved.Util.getTextbound(this.value, this.editor.fontStyle).width;
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
                            if (pre.spans.length > 0)
                                return pre.spans.last();
                            else {
                                index = index - 1;
                            }
                        }
                        else
                            return null;
                    }
                }
                get prevToken() {
                    var index = this.index - 1;
                    while (true) {
                        var pre = this.doc.line(index);
                        if (pre) {
                            if (pre.spans.length > 0)
                                return pre.spans.last().token;
                            else {
                                index = index - 1;
                            }
                        }
                        else
                            return null;
                    }
                }
                get nextToken() {
                    var index = this.index + 1;
                    while (true) {
                        var next = this.doc.line(index);
                        if (next) {
                            if (next.spans.length > 0)
                                return next.spans.first().token;
                            else {
                                index = index + 1;
                            }
                        }
                        else
                            return null;
                    }
                }
                get startPosition() {
                    return new Ved.SpanPosition(this.editor, this.index, 0);
                }
                get endPosition() {
                    return new Ved.SpanPosition(this.editor, this.index, this.value.length);
                }
                findPointPosition(point) {
                    var sp = new Ved.SpanPosition(this.editor, this.index);
                    var text = this.value;
                    if (text) {
                        var cw = 0;
                        var ci;
                        for (var i = 0; i < text.length; i++) {
                            var char = text.charAt(i);
                            var w = Ved.Util.getTextbound(char, this.editor.fontStyle).width;
                            if (point.x > cw + w) {
                                cw += w;
                                continue;
                            }
                            else if (point.x > cw + w / 2) {
                                ci = i + 1;
                                cw += w;
                                break;
                            }
                            else {
                                ci = i;
                                break;
                            }
                        }
                        if (typeof ci == 'undefined') {
                            return this.endPosition;
                        }
                        else {
                            sp.col = ci;
                            return sp;
                        }
                    }
                    else {
                        sp.col = 0;
                        return sp;
                    }
                }
                findTokenSpan(col) {
                    for (var i = 0; i < this.spans.length; i++) {
                        var range = this.spans.eq(i).range;
                        if (col >= range[0] && col <= range[1])
                            return this.spans.eq(i);
                    }
                }
                remove() {
                    this.doc.recoder.writeSnapshot(Ved.HistoryAction.deleteLine, { row: this.index, col: 0, value: this.value });
                    if (this.ele) {
                        this.ele.remove();
                    }
                    if (this.doc) {
                        this.doc.remove(this);
                    }
                }
                append(span) {
                    if (!this.spans.exists(span)) {
                        this.doc.recoder.writeSnapshot(Ved.HistoryAction.insertTokenSpan, { row: this.index, col: this.end, value: span.value });
                        this.spans.push(span);
                        span.line = this;
                        if (span.ele) {
                            this.ele.appendChild(span.ele);
                        }
                    }
                }
                insertText(col, text) {
                    if (this.isEmpty) {
                        var ts = this.createSimulateToken(text);
                        var sp = new Ved.TokenSpan(ts, this);
                        this.spans.push(sp);
                        this.doc.recoder.writeSnapshot(Ved.HistoryAction.insertTokenSpan, { row: this.index, col: 0, value: text });
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
                replaceText(col, text, limitSize) {
                    if (typeof limitSize == 'undefined')
                        limitSize = text.length;
                    this.delete(col, col + limitSize);
                    this.insertText(col, text);
                }
                get isEmpty() {
                    return this.spans.length == 0;
                }
                get isNotEmpty() {
                    return !this.isEmpty;
                }
                delete(startCol, endCol) {
                    this.doc.recoder.writeSnapshot(Ved.HistoryAction.deleteLineRange, { row: this.index, startCol, endCol, value: this.getValue(startCol, endCol) });
                    var ds = new List();
                    var rs = this.spans.map(x => x.range);
                    for (var i = 0; i < this.spans.length; i++) {
                        var sp = this.spans.eq(i);
                        var range = rs.eq(i);
                        if (range[0] >= endCol || range[1] <= startCol) {
                            continue;
                        }
                        else if (range[0] >= startCol && range[1] <= endCol) {
                            ds.push(sp);
                        }
                        else if (startCol >= range[0] && startCol < range[1]) {
                            var newValue = sp.value.slice(0, startCol - range[0]);
                            if (endCol < range[1]) {
                                newValue += sp.value.slice(endCol - range[0]);
                            }
                            sp.value = newValue;
                        }
                        else if (endCol >= range[0] && endCol <= range[1]) {
                            var newValue = '';
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
                getValue(startCol, endCol) {
                    var str = '';
                    var c = 0;
                    for (var i = 0; i < this.spans.length; i++) {
                        var sp = this.spans.eq(i);
                        var range = [c, c + sp.value.length];
                        c = c + sp.value.length;
                        if (range[0] >= endCol || range[1] <= startCol) {
                            continue;
                        }
                        else if (range[0] >= startCol && range[1] <= endCol) {
                            str += sp.value;
                        }
                        else if (startCol >= range[0] && startCol <= range[1]) {
                            if (endCol < range[1]) {
                                str += sp.value.slice(startCol - range[0], endCol - range[0]);
                            }
                            else {
                                str += sp.value.slice(startCol - range[0]);
                            }
                        }
                        else if (endCol >= range[0] && endCol <= range[1]) {
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
                cutKeepLeft(col) {
                    if (this.isEmpty) {
                        return { spans: new List(), word: '' };
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
                removeTokenSpan(tokenSpan) {
                    this.doc.recoder.writeSnapshot(Ved.HistoryAction.lineRemoveTokenSpan, { row: this.index, col: tokenSpan.col, value: tokenSpan.value });
                    this.spans.remove(tokenSpan);
                }
                unionLine(line) {
                    line.spans.toArray(x => x).each(sp => this.append(sp));
                    line.remove();
                }
                createSimulateLine(word, spans) {
                    this.doc.recoder.writeSnapshot(Ved.HistoryAction.createLine, { row: this.index, col: this.end, value: (word ? word : '') + (spans ? spans.map(sp => sp.value).join("") : "") });
                    var newLine = new Line(this.doc);
                    this.doc.insertAt(this.index + 1, newLine);
                    if (word) {
                        var simulateToken = newLine.createSimulateToken(word);
                        var ts = new Ved.TokenSpan(simulateToken, newLine);
                        newLine.spans.push(ts);
                    }
                    if (spans && spans.length > 0) {
                        newLine.spans.append(spans);
                        spans.each(sp => sp.line = newLine);
                    }
                    this.ele.insertAdjacentHTML('afterend', newLine.html);
                    newLine.ele = this.ele.nextElementSibling;
                    newLine.render();
                    return newLine;
                }
                createSimulateToken(insertValue) {
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
                        simulateToken.parent = nextToken.parent;
                    }
                    simulateToken.value = insertValue;
                    simulateToken.size = insertValue.length;
                    return simulateToken;
                }
            }
            Ved.Line = Line;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            var List = Ve.Lang.Util.List;
            class TokenSpan {
                constructor(token, line) {
                    this.token = token;
                    this.line = line;
                }
                get doc() {
                    return this.line.doc;
                }
                get editor() {
                    return this.doc.editor;
                }
                get classList() {
                    var classList = new List();
                    var tokenName = this.token.name;
                    if (tokenName.startsWith('comment'))
                        tokenName = 'comment';
                    else if (tokenName.startsWith('string')) {
                        if (tokenName.startsWith('string.variable'))
                            tokenName = 'variable';
                        else
                            tokenName = 'string';
                    }
                    else if (tokenName.startsWith('number'))
                        tokenName = 'number';
                    else if (tokenName.startsWith('generic.type'))
                        tokenName = 'type';
                    else if (tokenName.startsWith('generic.delimiter'))
                        tokenName = 'delimiter';
                    else if (tokenName.indexOf('bracket') > -1)
                        tokenName = 'bracket';
                    else if (tokenName.indexOf('white') > -1)
                        tokenName = 'white';
                    else if (tokenName.indexOf('keywords') > -1) {
                        if (new List('if', 'else', 'for', 'break', 'continue', 'while', 'do', 'when', 'case', 'try', 'catch', 'finally').exists(this.token.flag))
                            tokenName = 'keywords-control';
                        else if (this.token.flag == 'type' || this.token.flag == 'void')
                            tokenName = 'type';
                        else
                            tokenName = tokenName;
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
                get range() {
                    return [this.col, this.end];
                }
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
                    return Ved.Util.getTextbound(pt, this.editor.fontStyle).width;
                }
                get width() {
                    return Ved.Util.getTextbound(this.value, this.editor.fontStyle).width;
                }
                get bound() {
                    return new Ved.Rect({
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
                        var width = Ved.Util.getTextbound(s, this.editor.fontStyle).width;
                        var x = left;
                        left += width;
                        return {
                            char: s,
                            wordIndx: i,
                            rect: new Ved.Rect({
                                y: b.y,
                                width: width,
                                height: b.height,
                                x
                            })
                        };
                    });
                }
                get content() {
                    return Ved.Util.htmlEscape(this.token.value);
                }
                get value() {
                    return this.token.value;
                }
                get isEmpty() {
                    return this.value != '' ? false : true;
                }
                set value(val) {
                    if (val != this.value) {
                        this.doc.recoder.writeSnapshot(Ved.HistoryAction.updateTokenSpan, { row: this.line.index, col: this.col, oldValue: this.value, newValue: val });
                        this.token.value = val;
                        if (this.isEmpty) {
                            this.ele.remove();
                            this.line.spans.remove(this);
                        }
                        else
                            this.render();
                    }
                }
                get html() {
                    return `<span class='${this.classList}'>${this.content}</span>`;
                }
                get index() {
                    return this.line.spans.findIndex(x => x == this);
                }
                get prev() {
                    return this.line.spans.eq(this.index - 1);
                }
                get prevTill() {
                    var prev = this.prev;
                    if (prev)
                        return prev;
                    else if (this.line)
                        return this.line.prevToken;
                }
                get next() {
                    return this.line.spans.eq(this.index + 1);
                }
                get nextTill() {
                    var next = this.next;
                    if (next)
                        return next;
                    else if (this.line)
                        return this.line.nextToken;
                }
                get prevTokens() {
                    var index = this.index;
                    return this.line.spans.findAll((x, i) => i < index);
                }
                get nextTokens() {
                    var index = this.index;
                    return this.line.spans.findAll((x, i) => i > index);
                }
            }
            Ved.TokenSpan = TokenSpan;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            let HistoryCommand;
            (function (HistoryCommand) {
                HistoryCommand[HistoryCommand["onKeyCut"] = 0] = "onKeyCut";
                HistoryCommand[HistoryCommand["onKeyPaster"] = 1] = "onKeyPaster";
                HistoryCommand[HistoryCommand["onKeyCancel"] = 2] = "onKeyCancel";
                HistoryCommand[HistoryCommand["onKeyRedo"] = 3] = "onKeyRedo";
                HistoryCommand[HistoryCommand["onKeyBackspace"] = 4] = "onKeyBackspace";
                HistoryCommand[HistoryCommand["onKeyDelete"] = 5] = "onKeyDelete";
                HistoryCommand[HistoryCommand["onKeyShiftDelete"] = 6] = "onKeyShiftDelete";
                HistoryCommand[HistoryCommand["onKeyEnter"] = 7] = "onKeyEnter";
                HistoryCommand[HistoryCommand["InputWords"] = 8] = "InputWords";
            })(HistoryCommand = Ved.HistoryCommand || (Ved.HistoryCommand = {}));
            let HistoryAction;
            (function (HistoryAction) {
                HistoryAction[HistoryAction["createLine"] = 0] = "createLine";
                HistoryAction[HistoryAction["deleteLine"] = 1] = "deleteLine";
                HistoryAction[HistoryAction["deleteLineRange"] = 2] = "deleteLineRange";
                HistoryAction[HistoryAction["lineRemoveTokenSpan"] = 3] = "lineRemoveTokenSpan";
                HistoryAction[HistoryAction["insertTokenSpan"] = 4] = "insertTokenSpan";
                HistoryAction[HistoryAction["updateTokenSpan"] = 5] = "updateTokenSpan";
            })(HistoryAction = Ved.HistoryAction || (Ved.HistoryAction = {}));
            class ActionSnapshot {
                constructor(data) {
                    if (typeof data == 'object') {
                        for (var n in data) {
                            this[n] = data[n];
                        }
                    }
                    this.date = new Date().getTime();
                }
                get() {
                    return {
                        action: HistoryAction[this.action],
                        date: new Date(this.date).toString(),
                        data: this.data
                    };
                }
            }
            Ved.ActionSnapshot = ActionSnapshot;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class HistoryRecorder {
                constructor(doc) {
                    this.doc = doc;
                    this.supervisor = new Ved.HistorySupervisor();
                }
                get editor() {
                    return this.doc.editor;
                }
                createHistory(command) {
                    this.history = new Ved.History(command, this.supervisor);
                    this.history.oldCursor = this.editor.cursor.position.pos;
                    this.editor.emit('createHistory', this.history);
                }
                writeHistory() {
                    if (this.history && this.history.snapshots.length > 0) {
                        this.history.newCursor = this.editor.cursor.position.pos;
                        if (this.history.command != Ved.HistoryCommand.onKeyCancel && this.history.command != Ved.HistoryCommand.onKeyRedo)
                            this.supervisor.append(this.history);
                        this.editor.emit('writeHistory', this.history);
                        this.editor.emit('change');
                        delete this.history;
                    }
                }
                clearHistory() {
                    this.editor.emit('clearHistory', this.history);
                    delete this.history;
                }
                writeSnapshot(action, data) {
                    if (this.history) {
                        var actionSnaapshot = new Ved.ActionSnapshot({ action, data });
                        this.history.snapshots.push(actionSnaapshot);
                        this.editor.emit('writeSnapshot', actionSnaapshot);
                    }
                }
            }
            Ved.HistoryRecorder = HistoryRecorder;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            var List = Ve.Lang.Util.List;
            class History {
                constructor(command, supervisor) {
                    this.snapshots = new List();
                    this.command = command;
                    this.supervisor = supervisor;
                    this.date = new Date().getTime();
                }
                get index() {
                    return this.supervisor.historyList.findIndex(x => x == this);
                }
                get next() {
                    return this.supervisor.historyList.eq(this.index + 1);
                }
                get() {
                    return {
                        command: Ved.HistoryCommand[this.command],
                        snapshots: this.snapshots.toArray(x => x.get()),
                        date: new Date(this.date).toString()
                    };
                }
            }
            Ved.History = History;
            class HistorySupervisor extends Ve.Lang.Util.BaseEvent {
                constructor() {
                    super(...arguments);
                    this.index = 0;
                    this.maxLength = 100;
                    this.historyList = new List();
                }
                get current() {
                    return this.historyList.eq(this.index);
                }
                get next() {
                    return this.historyList.eq(this.index + 1);
                }
                get canRedo() {
                    if (this.next)
                        return true;
                    else
                        return false;
                }
                get canUndo() {
                    if (this.current)
                        return true;
                    else
                        return false;
                }
                onRedo() {
                    if (this.canRedo) {
                        try {
                            this.emit('redo', this.next);
                        }
                        catch (e) {
                            this.emit('error', e);
                        }
                        this.index += 1;
                    }
                }
                onUndo() {
                    if (this.canUndo) {
                        try {
                            this.emit('undo', this.current);
                        }
                        catch (e) {
                            this.emit('error', e);
                        }
                        this.index -= 1;
                    }
                }
                append(history) {
                    var ru = { r: this.canRedo, u: this.canUndo };
                    if (this.index < this.historyList.length - 1) {
                        this.historyList.removeAll((x, i) => i > this.index);
                    }
                    this.historyList.push(history);
                    history.supervisor = this;
                    history.date = new Date().getTime();
                    this.index = this.historyList.length - 1;
                    if (this.historyList.length > this.maxLength) {
                        var deleteCount = this.historyList.length - this.maxLength;
                        this.historyList.splice(0, deleteCount);
                        this.index = this.index - deleteCount;
                        if (this.index <= 0)
                            this.index = 0;
                    }
                    if (ru.r != this.canRedo) {
                        this.emit('canRedo', this.canRedo);
                    }
                    if (ru.u != this.canUndo) {
                        this.emit('canUndo', this.canUndo);
                    }
                }
                clear() {
                    this.index = 0;
                    this.historyList = new List();
                }
            }
            Ved.HistorySupervisor = HistorySupervisor;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            var List = Ve.Lang.Util.List;
            Ved.keyInfos = [
                {
                    "text": "Esc",
                    "code": 27
                },
                {
                    "text": "F1",
                    "code": 112
                },
                {
                    "text": "F2",
                    "code": 113
                },
                {
                    "text": "F3",
                    "code": 114
                },
                {
                    "text": "F4",
                    "code": 115
                },
                {
                    "text": "F5",
                    "code": 116
                },
                {
                    "text": "F6",
                    "code": 117
                },
                {
                    "text": "F7",
                    "code": 118
                },
                {
                    "text": "F8",
                    "code": 119
                },
                {
                    "text": "F9",
                    "code": 120
                },
                {
                    "text": "F10",
                    "code": 121
                },
                {
                    "text": "F11",
                    "code": 122
                },
                {
                    "text": "F12",
                    "code": 123
                },
                {
                    "text": "ScrLk",
                    "code": 145
                },
                {
                    "text": "Pause",
                    "code": 19
                },
                {
                    "text": "`",
                    "code": 192,
                    "name": "tilde"
                },
                {
                    "text": "1",
                    "code": 49
                },
                {
                    "text": "2",
                    "code": 50
                },
                {
                    "text": "3",
                    "code": 51
                },
                {
                    "text": "4",
                    "code": 52
                },
                {
                    "text": "5",
                    "code": 53
                },
                {
                    "text": "6",
                    "code": 54
                },
                {
                    "text": "7",
                    "code": 55
                },
                {
                    "text": "8",
                    "code": 56
                },
                {
                    "text": "9",
                    "code": 57
                },
                {
                    "text": "0",
                    "code": 48
                },
                {
                    "text": "-",
                    "code": 189
                },
                {
                    "text": "=",
                    "code": 187
                },
                {
                    "text": "Backspace",
                    "code": 8
                },
                {
                    "text": "Insert",
                    "code": 45
                },
                {
                    "text": "Home",
                    "code": 36
                },
                {
                    "text": "pageUp",
                    "code": 33
                },
                {
                    "text": "NumLock",
                    "code": 144
                },
                {
                    "text": "/",
                    "code": 111
                },
                {
                    "text": "*",
                    "code": 106
                },
                {
                    "text": "-",
                    "code": 109,
                    "name": "minus"
                },
                {
                    "text": "Tab",
                    "code": 9
                },
                {
                    "text": "Q",
                    "code": 81
                },
                {
                    "text": "W",
                    "code": 87
                },
                {
                    "text": "E",
                    "code": 69
                },
                {
                    "text": "R",
                    "code": 82
                },
                {
                    "text": "T",
                    "code": 84
                },
                {
                    "text": "Y",
                    "code": 89
                },
                {
                    "text": "U",
                    "code": 85
                },
                {
                    "text": "I",
                    "code": 73
                },
                {
                    "text": "O",
                    "code": 79
                },
                {
                    "text": "P",
                    "code": 80
                },
                {
                    "text": "[",
                    "code": 219
                },
                {
                    "text": "]",
                    "code": 221
                },
                {
                    "text": "Enter",
                    "code": 13
                },
                {
                    "text": "Delete",
                    "code": 46
                },
                {
                    "text": "End",
                    "code": 35
                },
                {
                    "text": "pageDown",
                    "code": 34
                },
                {
                    "text": "7",
                    "code": 103,
                    "name": "num-7"
                },
                {
                    "text": "8",
                    "code": 104
                },
                {
                    "text": "9",
                    "code": 105
                },
                {
                    "text": "+",
                    "code": 107,
                    "name": "plus"
                },
                {
                    "text": "Caps",
                    "code": 20
                },
                {
                    "text": "A",
                    "code": 65
                },
                {
                    "text": "S",
                    "code": 83
                },
                {
                    "text": "D",
                    "code": 68
                },
                {
                    "text": "F",
                    "code": 70
                },
                {
                    "text": "G",
                    "code": 71
                },
                {
                    "text": "H",
                    "code": 72
                },
                {
                    "text": "J",
                    "code": 74
                },
                {
                    "text": "K",
                    "code": 75
                },
                {
                    "text": "L",
                    "code": 76
                },
                {
                    "text": ";",
                    "code": 186
                },
                {
                    "text": "'",
                    "code": 222
                },
                {
                    "text": "\\",
                    "code": 220
                },
                {
                    "text": "4",
                    "code": 100,
                    "name": "num-4"
                },
                {
                    "text": "5",
                    "code": 101
                },
                {
                    "text": "6",
                    "code": 102,
                    "name": "num-6"
                },
                {
                    "text": "Shift",
                    "code": 16
                },
                {
                    "text": "Z",
                    "code": 90
                },
                {
                    "text": "X",
                    "code": 88
                },
                {
                    "text": "C",
                    "code": 67
                },
                {
                    "text": "V",
                    "code": 86
                },
                {
                    "text": "B",
                    "code": 66
                },
                {
                    "text": "N",
                    "code": 78
                },
                {
                    "text": "M",
                    "code": 77
                },
                {
                    "text": ",",
                    "code": 188
                },
                {
                    "text": ".",
                    "code": 190,
                },
                {
                    "text": "/",
                    "code": 191
                },
                {
                    "text": "arrowUp",
                    "code": 38,
                    "name": "arrow-up"
                },
                {
                    "text": "1",
                    "code": 97,
                    "name": "num-1"
                },
                {
                    "text": "2",
                    "code": 98
                },
                {
                    "text": "3",
                    "code": 99,
                    "name": "num-3"
                },
                {
                    "text": "Ctrl",
                    "code": 17
                },
                {
                    "text": "Alt",
                    "code": 18
                },
                {
                    "text": " ",
                    "code": 32,
                    "name": "space"
                },
                {
                    "text": "arrowLeft",
                    "code": 37,
                    "name": "arrow-left"
                },
                {
                    "text": "arrowDown",
                    "code": 40,
                    "name": "arrow-down"
                },
                {
                    "text": "arrowRight",
                    "code": 39,
                    "name": "arrow-right"
                },
                {
                    "text": "0",
                    "code": 96,
                    "name": "num-0"
                },
                {
                    "text": ".",
                    "code": 110,
                    "name": "num-point"
                }
            ];
            class KeyBoard {
                constructor(event) {
                    this.event = event;
                }
                get isShift() {
                    return this.event.shiftKey;
                }
                get isCtrl() {
                    return this.event.ctrlKey;
                }
                get isAlt() {
                    return this.event.altKey;
                }
                get keys() {
                    var ks = new List();
                    if (this.isCtrl)
                        ks.push('ctrl');
                    if (this.isShift)
                        ks.push('shift');
                    if (this.isAlt)
                        ks.push('alt');
                    var ki = Ved.keyInfos.find(x => x.code == this.event.keyCode);
                    if (ki) {
                        if (!ks.exists(ki.text.toLowerCase())) {
                            ks.push(ki.text.toLowerCase());
                        }
                    }
                    return ks;
                }
                get key() {
                    return this.keys.join("+");
                }
                match(key) {
                    var ks = key.split(/\+/g).map(s => s.trim());
                    var keys = this.keys;
                    return ks.length <= keys.length && ks.every(k => keys.exists(k));
                }
                everyMatch(key) {
                    var ks = key.split(/\+/g).map(s => s.trim());
                    var keys = this.keys;
                    return ks.length == keys.length && ks.every(k => keys.exists(k));
                }
            }
            Ved.KeyBoard = KeyBoard;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class Point {
                constructor(x, y) {
                    if (typeof x == 'number') {
                        this.x = x;
                        this.y = y;
                    }
                    else {
                        this.x = x.x;
                        this.y = x.y;
                    }
                }
                add(point) {
                    return new Point({
                        x: this.x + point.x,
                        y: this.y + point.y
                    });
                }
                sub(point) {
                    return new Point({
                        x: this.x - point.x,
                        y: this.y - point.y
                    });
                }
                isInRect(rect) {
                    return rect.isInside(this);
                }
            }
            Ved.Point = Point;
            class Rect {
                constructor(x, y, width, height) {
                    if (typeof x == 'number') {
                        this.x = x;
                        this.y = y;
                        this.width = width;
                        this.height = height;
                    }
                    else if (typeof x == 'object') {
                        for (var n in x) {
                            this[n] = x[n];
                        }
                        ;
                    }
                }
                get right() {
                    return this.x + this.width;
                }
                get bottom() {
                    return this.y + this.height;
                }
                get point() {
                    return new Point(this.x, this.y);
                }
                isInside(point) {
                    if (point.x >= this.x && point.x < this.right) {
                        if (point.y >= this.y && point.y < this.bottom)
                            return true;
                    }
                    return false;
                }
            }
            Ved.Rect = Rect;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Ved;
        (function (Ved) {
            class Util {
                static computeFontSize(text, fontStyle) {
                    let sd = document.createElement("span");
                    sd.style.fontSize = fontStyle.fontSize + "px";
                    sd.style.opacity = "0";
                    sd.style.fontFamily = fontStyle.fontFamily;
                    sd.innerHTML = text;
                    document.body.append(sd);
                    let bound = {};
                    bound.width = sd.offsetWidth;
                    bound.height = sd.offsetHeight;
                    sd.remove();
                    return bound;
                }
                static getTextbound(text, fontStyle) {
                    if (!text) {
                        return { width: 0 };
                    }
                    ;
                    if (!this.__g) {
                        var c = document.createElement("canvas");
                        document.body.appendChild(c);
                        c.width = 100;
                        c.height = 100;
                        c.style.display = "none";
                        this.__g = c.getContext("2d");
                    }
                    var _default = Object.assign({
                        fontSize: 14,
                        fontFamily: `Consolas,"Courier New",monospace`
                    }, fontStyle);
                    this.__g.font = `${_default.fontSize}px ${_default.fontFamily}`;
                    var bound = this.__g.measureText(text);
                    return bound;
                }
                static htmlEscape(sHtml) {
                    return sHtml.replace(/[<>&" \t]/g, function (c) { return { ' ': "&nbsp;", '\t': '&nbsp;&nbsp;&nbsp;&nbsp;', '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; });
                }
            }
            Ved.Util = Util;
        })(Ved = Lang.Ved || (Lang.Ved = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=ved.js.map