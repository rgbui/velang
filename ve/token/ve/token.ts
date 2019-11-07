/// <reference path="../../util/array.ts" />

namespace Ve.Lang {

    export enum TokenType {
        program,
        keyWord,
        //(,[,{,<
        block,
        //),],},>
        closeBlock,
        operator,
        number,
        string,
        word,
        comment,
        separator,
        bool,
        null,
        newLine,
        unit,
        whiteSpace
    }
    export class Token {
        col: number;
        size: number;
        row: number;
        value: string;
        stringValue: string;
        stringQuote: string;
        wholeValue:string;
        parent: Token;
        childs: VeArray<Token>;
        type: TokenType;
        name: VeName;
        lang: language;
        unit?: string;
        _rowSpanToken: Token;
        get typeString() {
            return TokenType[this.type];
        }
        get nameString() {
            return VeName[this.name];
        }
        static isConstantType(token: Token): boolean {
            return new VeArray(TokenType.bool, TokenType.null, TokenType.string, TokenType.number).exists(token.type);
        }
        constructor(tokenType: TokenType, options?: any) {
            this.childs = new VeArray();
            this.type = tokenType;
            if (typeof options == 'object') {
                for (var n in options) {
                    this[n] = options[n];
                }
            }
        }
        append(token: Token | VeArray<Token>) {
            if (token instanceof VeArray) {
                token.each(t => { this.childs.push(t); t.parent = this });
            }
            else {
                token.parent = this;
                this.childs.push(token);
            }
        }
        prev(pos?: number): Token | null {
            if (typeof pos == typeof undefined) {
                pos = this.index - 1;
            }
            return this.parent.childs.eq(pos);
        }
        prevAll(fx?: any): VeArray<Token> {
            if (!this.parent) {
                if (this.type != TokenType.program) {
                    console.log(this);
                }
                return new VeArray();
            }
            var ps = this.parent.childs.findAll((x, i) => i < this.index);
            if (typeof fx == 'function') return ps.findAll(fx);
            else return ps;
        }
        next(pos?: number): Token | null {
            if (typeof pos == typeof undefined) {
                pos = this.index + 1;
            }
            return this.parent.childs.eq(pos);
        }
        nextAll(fx?: any): VeArray<Token> {
            var ps = this.parent.childs.findAll((x, i) => i > this.index);
            if (typeof fx == 'function') return ps.findAll(fx);
            else return ps;
        }
        get index(): number {
            if (this.parent) {
                return this.parent.childs.findIndex(x => x == this);
            }
            else return -1;
        }
        //双引号和注释会跨行
        get isRowspan(): boolean {
            return typeof this._rowSpanToken != typeof undefined;
        }
        get rowSpanToken(): Token {
            return this._rowSpanToken;
        }
        set rowSpanToken(value: Token) {
            this._rowSpanToken = value;
        }
        clearRowSpan(rowSpanToken) {
            if (this.isRowspan) {
                if (this._rowSpanToken == rowSpanToken) {
                    delete this._rowSpanToken;
                }
            }
            if (this.parent)
                this.parent.childs.findAll(x => x._rowSpanToken == rowSpanToken).each(x => { delete x._rowSpanToken; });
        }
        closest(fx: (token: Token) => boolean): Token | null {
            if (fx(this) == true) return this;
            var t = this.parent;
            while (true) {
                if (t && fx(t) == true) return t;
                else {
                    if (!t.parent) return null;
                    t = t.parent;
                }
            }
        }
        parents(fx: (token: Token) => boolean): VeArray<Token> {
            var t = this.parent;
            var list = new VeArray<Token>();
            while (true) {
                if (!t) return list;
                else {
                    if (fx(t) == true) list.push(t);
                    t = t.parent;
                }
            }
        }
        each(predict: (token: Token) => void) {
            predict(this);
            if (this.childs.length > 0) {
                this.childs.eachReverse(x => x.each(predict));
            }
        }
        parentsUntil(fx: (token: Token) => boolean): VeArray<Token> {
            var t = this.parent;
            var list = new VeArray<Token>();
            while (true) {
                if (!t) return list;
                else {
                    if (fx(t) == true) list.push(t);
                    else return list;
                    t = t.parent;
                }
            }
        }
        get() {
            var json: any = {};
            json.type = this.type;
            json.name = this.name;
            json.col = this.col;
            json.size = this.size;
            json.row = this.row;
            json.value = this.value;
            json.childs = this.childs.map(x => x.get());
            return json;
        }
        getValue() {
            return (this.value || '') + this.childs.map(x => x.getValue()).join("");
        }
        getWrapper(wp: (token: Token, childsTemplate: string) => string) {
            var cs = this.childs.map(c => {
                let result = c.getWrapper(wp);
                return result;
            }).join("");
            var result = wp(this, cs);
            return result;
        }
    }
}
