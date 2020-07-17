

///<reference path='../../token/token.ts'/>
///<reference path='../../util/list.ts'/>
///<reference path='../../util/common.ts'/>
///<reference path='statement/statement.parser.class.ts'/>
///<reference path='statement/statement.parser.declare.ts'/>
///<reference path='statement/statement.parser.statement.ts'/>
///<reference path='statement/statement.parser.common.ts'/>
///<reference path='statement/statement.parser.util.ts'/>
///<reference path='express.parser.ts'/>
///<reference path='express/express.parser.common.ts'/>


namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    export class StatementParser extends Util.BaseEvent {
        private tokens: List<Token> = new List;
        private nodes: List<Node> = new List;
        private syntax: LangSyntax;
        syntaxContext: string = 'root';
        private pos: number = 0;
        constructor() {
            super();
            this.load(veStatementSyntax);
        }
        private load(syntax: LangSyntax) {
            this.syntax = syntax;
        }
        onError(error: string | Error, token?: Token) {
            this.isErrored = true;
            var errorToken = token || this.currentToken || this.prevToken;
            if (!errorToken) {
                this.emit('error', error);
            }
            else {
                this.emit('error', error, { col: errorToken.col, row: errorToken.row }, errorToken);
            }
        }
        import(tokens: List<Token>) {
            this.tokens = tokens;
        }
        parse(tokens: List<Token>) {
            this.import(tokens);
            this.next();
            return this.nodes;
        }
        /***执行下一个语句 */
        next(actionName?: string) {
            while (true) {
                var index = this.index;
                if (this.eol) { this.end(); break; }
                var node = this.nextOne(actionName);
                if (node) this.append(node);
                if (this.eol) { this.end(); break; }
                if (index == this.index) {
                    //说明一个也没有匹配到，说明停止走动了，
                    console.warn(this.restValues, this.syntaxContext, this.restTokens);
                    this.onError(new Error('not match statement'));
                }
            }
        }
        nextOne(actionName?: string) {
            if (typeof actionName == 'undefined') {
                var rest = this.getFlags();
                var matchText: string;
                var match = (this.syntax[this.syntaxContext] as LangSyntaxRoot['root']).find(x => {
                    if (typeof x.match != 'undefined') {
                        var r = this.matchText(rest, x.match);
                        if (typeof r != 'undefined') { matchText = r; return true; }
                    }
                });
                /***如果没有匹配，则直接取没有match的 */
                if (typeof match == 'undefined') {
                    match = (this.syntax[this.syntaxContext] as LangSyntaxRoot['root']).find(x => typeof x.match == 'undefined');
                }
                if (match) {
                    actionName = match.name;
                }
            }
            if (typeof this['$' + actionName] == 'function') actionName = '$' + match.name;
            if (typeof this[actionName] == 'function') {
                var index = this.index;
                var node = this[actionName]();
                if (index == this.index) {
                    console.log(actionName, this.restValues, this.restFlags);
                    this.onError(new Error('the statement not eat tokens'))
                }
                if (!node && actionName != 'blank') {
                    console.log(actionName, 'not return node...');
                }
                return node;
            }
            else {
                if (this.eol) return;
                console.trace(this.syntaxContext, this.restValues, this.restFlags, actionName);
                this.onError(new Error('not found parse name:' + actionName))
            }
        }
        eat(match: string | RegExp | (string | RegExp)[]): List<Token> {
            var fgs = this.getFlags();
            var matchText = this.matchText(fgs, match);
            if (matchText) {
                var tokens = this.matchTokens(matchText);
                this.pos += tokens.length;
                return tokens;
            }
            return null;
        }
        eatBlockOrStatement(): List<Statement> {
            var result;
            if (this.match(getStatementRegex('block'))) result = this.TM.pickStatementFromBlockOfStatement(this.eat(getStatementRegex('block')));
            else {
                this.eatBlank();
                result = this.nextOne();
            }
            if (!result) result = new List;
            if (!(result instanceof List)) result = new List(result);
            return result;
        }
        eatBlank() {
            return this.eat(/@blank+/);
        }
        eatEmptyStatement() {
            this.eat(/@blank*;@blank*/);
        }
        eatOne() {
            var token = this.currentToken;
            this.pos += 1;
            return token;
        }
        match(match: string | RegExp | (string | RegExp)[]): boolean {
            var fgs = this.getFlags();
            var matchText = this.matchText(fgs, match);
            return matchText ? true : false;
        }
        end() {
            if (this.nodes.exists(x => x instanceof PackageStatement)) {
                var pa = this.nodes.find(x => x instanceof PackageStatement);
                var nodes = this.nodes.findAll(x => !(x instanceof PackageStatement));
                pa.set('content', nodes);
                this.nodes = new List(pa);
            }
        }
        append(node: Statement | List<Statement>) {
            if (node instanceof List) node.each(n => {
                this.nodes.append(n);
            })
            else this.nodes.append(node);
        }
        range(start: number, end?: number) {
            return this.tokens.range(start, end);
        }
        /**
         * @param pos 如果为正的，将向前滚，如果负的，将向后滚
         * */
        move(pos: number) {
            this.pos += pos;
        }
        back(pos: number) {
            this.move(0 - pos);
        }
        get index() {
            return this.pos;
        }
        get prevToken() {
            return this.tokens.eq(this.pos - 1);
        }
        get currentToken() {
            return this.tokens.eq(this.pos);
        }
        get restTokens(): List<Token> {
            return this.tokens.range(this.pos);
        }
        get restFlags(): string {
            return this.restTokens.toArray(x => x.flag).join("");
        }
        get restValues(): string {
            return this.restTokens.map(r => r.value).join("");
        }
        isErrored: boolean = false;
        get eol() {
            return this.isErrored == true || this.pos >= this.tokens.length;
        }
        private matchTokens(matchText: string): List<Token> {
            var str = '';
            var tokens: List<Token> = new List;
            for (var i = this.pos; i < this.tokens.length; i++) {
                str += this.tokens.eq(i).flag;
                tokens.push(this.tokens.eq(i));
                if (str == matchText) {
                    break;
                }
            }
            return tokens;
        }
        private matchText(code: string, match: string | RegExp | (string | RegExp)[]) {
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
                    var m = this.matchText(code, match[i]);
                    if (typeof m != 'undefined') return m;
                }
                return undefined;
            }
            else if (match instanceof RegExp) {
                var r = code.match(getLangSyntaxRegex(veStatementSyntax, match));
                if (r && r[0] && r.index == 0) return r[0];
            }
            else if (typeof match == 'string') {
                if (match.startsWith('@')) {
                    var sn = this.syntax[match.replace('@', '')];
                    if (sn) {
                        return this.matchText(code, sn);
                    }
                }
                if (code.startsWith(match)) return match;
            }
        }
        private getFlags() {
            var str = '';
            for (var i = this.pos; i < this.tokens.length; i++) {
                str += this.tokens.eq(i).flag;
            }
            return str;
        }
        createParser() {
            var parser = new StatementParser();
            var self = this;
            parser.on('error', function () {
                self.emit('error', ...arguments);
            });
            return parser;
        }
        get TM() {
            var tm = new TokenMatch();
            var self = this;
            tm.on('error', function () {
                self.emit('error', ...arguments);
            });
            return tm;
        }
    }

    export interface StatementParser {
        on(name: 'error', fn: (error: string | Error, pos?: { col: number, row: number }, token?: Token) => void);
    }
    export interface StatementParser extends StatementParser$Class { }
    Util.Inherit(StatementParser, StatementParser$Class);

    export interface StatementParser extends StatementParser$Declare { }
    Util.Inherit(StatementParser, StatementParser$Declare);

    export interface StatementParser extends StatementParser$Statement { }
    Util.Inherit(StatementParser, StatementParser$Statement);

    export interface StatementParser extends StatementParser$Common { }
    Util.Inherit(StatementParser, StatementParser$Common);

    export interface StatementParser extends StatementParser$Util { }
    Util.Inherit(StatementParser, StatementParser$Util);

    export interface StatementParser extends StatementParser$Express { }
    Util.Inherit(StatementParser, StatementParser$Express);

    export interface StatementParser extends StatementParser$ExpressCommon { }
    Util.Inherit(StatementParser, StatementParser$ExpressCommon);
}