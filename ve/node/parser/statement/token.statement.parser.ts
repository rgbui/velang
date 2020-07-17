
///<reference path='token.statement.parser.declaration.ts'/>
///<reference path='token.statement.parser.statement.ts'/>



namespace Ve.Lang {
    export class TokenStatementParser {
        tokens: VeArray<Token>;
        index: number = 0;
        parent: Statement;
        constructor(token: Token | VeArray<Token>, parent?: Statement) {
            if (!token) {
                return;
            }
            if (token instanceof Token) {
                this.tokens = token.childs.copy();
            }
            else if (token instanceof VeArray) this.tokens = token.copy();
            if (!this.tokens) console.trace(token);
            if (typeof parent != typeof undefined)
                this.parent = parent;
            this.preteatment();
        }
        /****预览处理*/
        public preteatment() {
            //在语法树解析中，需要先删除掉注释
            this.tokens.removeAll(x => x.type == TokenType.comment || x.type == TokenType.newLine);
            //在语法树中，遇到文本模板'ee@{}ee'这种，则直接将其转换成'ee'+()+'ee'，然后再处理          
            for (var i = this.tokens.length - 1; i >= 0; i--) {
                var token = this.tokens.eq(i);
                if (token.type == TokenType.block && token.name == VeName.STRING_LBRACE) {
                    var tokenClose = this.tokens.eq(i + 1);
                    var blockToken = new Token(TokenType.block, { value: "(", name: VeName.LPAREN, col: token.col, size: 1, row: token.row });
                    token.childs.each(t => blockToken.append(t));
                    var blockCloseToken: Token = new Token(TokenType.closeBlock, { name: VeName.RPAREN, value: ")", col: tokenClose.col, size: 1, row: tokenClose.row });
                    this.tokens.splice(
                        i,
                        2,
                        new Token(TokenType.operator, { value: "+", name: VeName.ADD }),
                        blockToken,
                        blockCloseToken,
                        new Token(TokenType.operator, { value: "+", name: VeName.ADD })
                    );
                }
            }
            //遇到两个连续的文本，则需要合并，产生这样的原因是因为解析token先分行导致的
            var ns = new VeArray<Token>();
            var i = 0;
            for (i; i < this.tokens.length; i++) {
                var token = this.tokens.eq(i);
                if (token.type == TokenType.string) {
                    if (this.tokens.eq(i + 1) && this.tokens.eq(i + 1).type == TokenType.string) {
                        var text = token.value;
                        var n = 1;
                        while (true) {
                            var t = this.tokens.eq(i + n);
                            if (t.type == TokenType.string) {
                                text += t.value;
                                n += 1;
                            }
                            else break;
                        }
                        ns.push(new Token(TokenType.string, { value: text, row: token.row, col: token.col, size: text.length }));
                        i += n;
                        continue;
                    }
                    else ns.push(token);
                }
                else ns.push(token);
            }
            this.tokens = ns;
        }
        get current(): Token {
            return this.tokens.eq(this.index);
        }
        next(predicate?: number | ((token: Token) => boolean)): Token {
            if (typeof predicate == typeof undefined) { return this.tokens.eq(this.index + 1) }
            else if (typeof predicate == 'number') {
                return this.tokens.eq(this.index + predicate);
            }
            else {
                return this.nextAll().find(predicate);
            }
        }
        findIndex(predicate: Token | ((token: Token, pos?: number) => boolean)): number {
            return this.tokens.findIndex(predicate);
        }
        eq(at: number) {
            return this.tokens.eq(at);
        }
        nextAll(): VeArray<Token> {
            return this.tokens.map((x, i) => {
                if (i >= this.index) { return x }
                else return undefined;
            })
        }
        match(pattern: RegExp | string, getFlag?: (Token: Token) => string, ignoreSkip?: boolean) {
            var nextAll = this.nextAll();
            if (typeof getFlag == typeof undefined) getFlag = this.getFlag;
            var nextFlags = nextAll.map(x => getFlag(x)).join("");
            if (typeof pattern == 'string') pattern = new RegExp(pattern);
            var match = nextFlags.match(pattern);
            if (match && match.index == 0) {
                var matchText = match[0];
                var ns = new VeArray<Token>();
                var nt = '';
                for (var i = 0; i < nextAll.length; i++) {
                    nt += getFlag(nextAll.eq(i));
                    ns.push(nextAll.eq(i));
                    if (nt == matchText) {
                        break;
                    }
                }
                if (ignoreSkip != true)
                    this.index += ns.length;
                return ns;
            }
        }
        get eol(): boolean {
            return this.index >= this.tokens.length;
        }
        rest(): VeArray<Token> {
            return this.tokens.range(this.index, this.tokens.length);
        }
        skip(pos?: number): void {
            if (typeof pos == typeof undefined) {
                pos = 1;
            }
            this.index += 1;
        }
        skipToEnd() {
            this.index = this.tokens.length;
        }
        backUp(pos?: number) {
            if (typeof pos == typeof undefined) pos = 1;
            this.index -= pos;
        }
        getFlagText(): string {
            return this.nextAll().map(x => {
                var f = this.getFlag(x);
                return f;
            }).join("");
        }
        getNextValue(): string {
            return this.nextAll().map(x => x.value).join("");
        }
        getFlag(token: Token): string {
            if (!token) {
                console.trace(token);
                return '';
            }
            //如果不是Token，则替换成nt
            if (!(token instanceof Token)) return 'nt';
            if (token.type == TokenType.keyWord) {
                //if (VeSyntax.get(token.name, language.en).string != token.value) console.log(VeSyntax.get(token.name, language.en).string, token.value);
                return VeSyntax.get(token.name, language.en).string;
            }
            else if (token.type == TokenType.operator) {
                // if (VeSyntax.get(token.name, language.en).string != token.value) console.log(VeSyntax.get(token.name, language.en).string, token.value);
                return VeSyntax.get(token.name, language.en).string;
            }
            else if (token.type == TokenType.block) {
                // if (VeSyntax.get(token.name, language.en).string != token.value) console.log(VeSyntax.get(token.name, language.en).string, token.value);
                return VeSyntax.get(token.name, language.en).string;
            }
            else if (token.type == TokenType.closeBlock) {
                // if (VeSyntax.get(token.name, language.en).string != token.value) console.log(VeSyntax.get(token.name, language.en).string, token.value);
                return VeSyntax.get(token.name, language.en).string;
            }
            else if (token.type == TokenType.bool) return TokenType[TokenType.word];
            else if (token.type == TokenType.string) return TokenType[TokenType.word];
            else if (token.type == TokenType.null) return TokenType[TokenType.word];
            else if (token.type == TokenType.number) return TokenType[TokenType.word];
            else if (token.type == TokenType.word) return TokenType[TokenType.word];
            else if (token.type == TokenType.unit) return TokenType[TokenType.word];
            else if (token.type == TokenType.program) return TokenType[TokenType.program];
        }
        getNextFlag(): string {
            var nextAll = this.nextAll();
            var nextFlags = nextAll.map(x => this.getFlag(x)).join("");
            return nextFlags;
        }
        parse(): VeArray<Statement> {
            var ve: VeArray<Statement> = new VeArray();
            var t = new Date();
            while (!this.eol) {
                var flagText = this.getNextFlag();
                var statement: Statement | VeArray<Statement> = null;
                if (!statement) statement = this.parseEmptyStatement();
                if (!statement) statement = this.parsePackageStatement();
                if (!statement) statement = this.parseUseStatement();
                if (!statement) statement = this.parseClassOrInterfaceStatement();
                if (!statement) statement = this.parseEnumStatement();
                if (!statement) statement = this.parseMethodStatement();
                if (!statement) statement = this.parseFieldStatement();
                if (!statement) statement = this.parsePropertyStatement();

                if (!statement) statement = this.parseVariableStatement();
                if (!statement) statement = this.parseFunStatement();
                if (!statement) statement = this.parseIf();
                if (!statement) statement = this.parseDoWhile();
                if (!statement) statement = this.parseWhile();
                if (!statement) statement = this.parseFor();
                if (!statement) statement = this.parseSwitch();
                if (!statement) statement = this.parseTry();
                if (!statement) statement = this.parseReturn();
                if (!statement) statement = this.parseThrow();
                if (!statement) statement = this.parseBreak();
                if (!statement) statement = this.parseContinue();
                if (!statement) statement = this.parseExpression();
                //console.log('willFlag', flagText, statement);
                if (statement) ve.append(statement)
                if (new Date().getTime() - t.getTime() > 2e3) {
                    console.trace('over timer....');
                    throw 'over time....'
                }
            }
            return ve;
        }
        parseAndSave(): void {
            var r = this.parse();
            this.parent.append(r);
        }
    }
    export interface TokenStatementParser extends TokenStatementParserDeclaration { }
    applyMixins(TokenStatementParser, TokenStatementParserDeclaration);
    export interface TokenStatementParser extends TokenStatementParserStatement { }
    applyMixins(TokenStatementParser, TokenStatementParserStatement);
}