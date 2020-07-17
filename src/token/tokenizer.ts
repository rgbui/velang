///<reference path='../util/list.ts'/>
///<reference path='../util/declare.ts'/>
///<reference path='../util/common.ts'/>
///<reference path='../util/event.ts'/>
///<reference path='token.ts'/>
///<reference path='syntax.ts'/>
///<reference path='syntax.zh.ts'/>
namespace Ve.Lang {
    export class Tokenizer extends Util.BaseEvent {
        constructor() {
            super();
            this.init();
        }
        private pos = 0;
        private len = 0;
        private code: string = '';
        private line: string = '';
        private lines: string[];
        private lineCount = 0;
        private row = 0;
        private rootToken: Token;
        private contextToken: Token;
        private contextMode: LangSyntaxRoot['root'];
        private syntax: LangSyntax;
        protected init() {
            this.load(Ve.Lang.VeZhTokenSyntax);
        }
        protected load(syntax: LangSyntax) {
            this.syntax = syntax;
        }
        protected createToken(): Token {
            return new Token();
        }
        parse(code: string): Token {
            if (typeof code != 'string') return this.emit('error', new Error('the tokenizer code require string'));
            this.pos = 0;
            this.row = 0;
            this.code = code;
            this.lines = this.code.split(/\r\n|\n|\r/g);
            this.lineCount = this.lines.length;
            this.line = this.lines[this.row];
            this.len = this.line.length;
            this.contextToken = this.rootToken = this.createToken();
            this.contextToken.row = this.contextToken.col = 0;
            this.contextToken.name = 'root';
            while (!(this.lineIsEol && this.rowIsEol)) {
                var pos = this.pos;
                var row = this.row;
                this.matchMode();
                this.nextLine();
                /**
                 * 没有区配到任意的token ,则转到非法的token
                 * */
                if (this.pos == pos && row === this.row) this.matchInvalid();
            }
            this.llegalTermination();
            return this.rootToken;
        }
        private matchMode() {
            var rest = this.line.slice(this.pos);
            if (rest == '' || rest.length == 0) return;
            var matchText: string;
            if (!this.contextMode) {
                this.contextMode = this.syntax['root'] as LangSyntaxRoot['root']
            }
            var mode: ArrayOf<LangSyntaxRoot['root']> = this.contextMode.find(x => {
                var r = this.match(rest, x.match);
                if (typeof r != 'undefined') { matchText = r; return true }
                return false;
            });
            mode = Object.assign({}, mode);
            var beforeMode = (mode, token) => {
                if (typeof mode.action == 'function') {
                    var newMode = mode.action(this.contextToken);
                    if (typeof newMode != 'undefined') {
                        for (var n in newMode) {
                            if (typeof newMode[n] != 'undefined')
                                mode[n] = newMode[n];
                        }
                    }
                }
                if (mode.nextTurn && mode.nextTurn.startsWith('@')) {
                    this.contextMode = this.syntax[mode.nextTurn.replace('@', '')];
                    if (!this.contextMode) {
                        this.emit('error', new Error(`没有找到转向处理"${mode.nextTurn}"`), { col: token.pos, row: token.row }, token);
                    }
                    else { this.matchMode(); return true; }
                }
                if (mode.pop == true) {
                    if (this.contextToken.parent)
                        this.contextToken = this.contextToken.parent as any;
                    else {
                        this.emit('error', new Error(`没有找到字符"${token.value}"的启始字符`),
                            { col: token.pos, row: token.row }, token);
                    }
                }
            }
            var afterMode = (mode, token) => {
                if (mode.push == true) {
                    this.contextToken = token;
                }
                if (mode.next && mode.next.startsWith('@')) {
                    this.contextMode = this.syntax[mode.next.replace('@', '')];
                    if (!this.contextMode) {
                        throw 'not found turn :' + mode.next;
                    }
                }
            }
            if (matchText && mode) {

                var token = this.createToken();
                token.value = matchText;
                token.size = matchText.length;
                token.col = this.pos;
                token.row = this.row;
                token.name = mode.name;
                if (beforeMode(mode, token) == true) return;
                token.parent = this.contextToken;
                this.contextToken.childs.push(token);
                this.pos += matchText.length;
                afterMode(mode, token);
            }
            else {
                //如果什么都没匹配到，则需要查询match等于空的情况
                mode = this.contextMode.find(x => typeof x.match == 'undefined' ? true : false);
                if (mode && beforeMode(mode, undefined) == true) return;
                this.emit('error', new Error(`the code "${rest}" is not found tokernizer match at row ${this.row} col ${this.pos}`),
                    { col: this.pos, row: this.row });
            }
        }
        private match(code: string, match: string | string[] | RegExp | RegExp[]) {
            if (Array.isArray(match)) {
                /***排序，如果匹配多个时，先从长的文本串开始 */
                match.sort((x, y) => {
                    if (typeof x == 'string' && typeof y == 'string') {
                        if (x.length > y.length) return -1;
                        else return 1;
                    }
                    return 0;
                })
                for (var i = 0; i < match.length; i++) {
                    var m = this.match(code, match[i]);
                    if (typeof m != 'undefined') return m;
                }
                return undefined;
            }
            else if (match instanceof RegExp) {
                var r = code.match(match);
                if (r && r[0] && r.index == 0) return r[0];
            }
            else if (typeof match == 'string') {
                if (code.startsWith(match)) return match;
            }
            else return undefined;
        }
        private matchInvalid() {
            var invalidToken = this.createToken();
            invalidToken.col = this.pos;
            invalidToken.row = this.row;
            invalidToken.value = this.line.charAt(this.pos);
            invalidToken.name = 'invalid';
            this.emit('error', new Error('invalid token'), { col: this.pos, row: this.row, token: invalidToken });
            if (this.contextToken) { invalidToken.parent = this.contextToken; this.contextToken.childs.push(invalidToken) }
            this.pos += 1;
        }
        private nextLine() {
            if (this.lineIsEol) {
                while (true) {
                    if (this.row < this.lineCount - 1) {
                        //如果不是当前最后一行，需要填加一个行的token
                        var token = this.createToken();
                        token.value = '\n';
                        token.col = this.pos + 1;
                        token.row = this.row;
                        token.name = 'line';
                        token.size = token.value.length;
                        if (this.contextToken) {
                            token.parent = this.contextToken;
                            this.contextToken.childs.push(token);
                        }
                    }
                    if (this.lineCount == this.row + 1) return false;
                    this.row += 1;
                    this.line = this.lines[this.row];
                    this.pos = 0;
                    this.len = this.line.length;
                    //如果当前的行是空字符串，那么继续
                    if (this.line !== '') return true;
                }
            }
            return false;
        }
        private get lineIsEol(): boolean {
            return this.len <= this.pos;
        }
        private get rowIsEol(): boolean {
            return this.row == this.lines.length - 1;
        }
        private llegalTermination() {
            if (this.contextToken && this.contextToken.name != 'root') {
                this.emit('error', new Error(`not match context open:"${this.contextToken.value}" at row:${this.contextToken.row} col:${this.contextToken.col}`), { col: this.contextToken.col, row: this.contextToken.row, token: this.contextToken })
            }
        }
    }
    export interface Tokenizer {
        on(name: 'error', fn: (error: Error | string, pos?: { col: number, row: number }, token?: Token) => void);
    }
}