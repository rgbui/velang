
namespace Ve.Lang {
    export enum CodeMode {
        code,
        data,
        express
    }
    const NEWLINE = '\n';
    const TABCHAR = '\t';
    export class TokenFormat {
        private chineseOperatorIsReplaceEnglish: boolean;
        private chineseBoolIsReplaceEnglish: boolean;
        private chineseKeyWordIsReplaceEnglish: boolean;
        private chineseQuoteIsReplaceEnglish: boolean;
        private codeMode: CodeMode;
        constructor(options: {
            codeMode: CodeMode,
            chineseOperatorIsReplaceEnglish?: boolean;
            chineseBoolIsReplaceEnglish?: boolean;
            chineseKeyWordIsReplaceEnglish?: boolean;
            chineseQuoteIsReplaceEnglish?: boolean;
        }) {
            for (var n in options) this[n] = options[n];
        }
        format(to: Token): string {
            if (this.codeMode == CodeMode.code) {
                return this.codeFormat(to);
            }
            else if (this.codeMode == CodeMode.data) {
                return this.dataFormat(to);
            }
        }
        private codeFormat(to: Token, deep?: number): string {
            if (typeof deep == typeof undefined) deep = 0;
            var html = '';
            to.childs.each((token, index) => {
                var before = to.childs.eq(index - 1);
                if (before) {
                    if (new VeArray(TokenType.keyWord, TokenType.bool, TokenType.null, TokenType.operator, TokenType.word).exists(before.type)
                        &&
                        new VeArray(TokenType.keyWord, TokenType.number, TokenType.null, TokenType.operator, TokenType.word).exists(token.type)
                    ) {
                        var is = false;
                        if (before.type == TokenType.operator) {
                            if (!new VeArray(VeName.IS, VeName.AS,  VeName.NOT, VeName.CONTAIN, VeName.STATR, VeName.MATCH, VeName.END).exists(before.name)) {
                                is = true;
                            }
                        }
                        if (token.type == TokenType.operator) {
                            if (!new VeArray(VeName.IS, VeName.AS,  VeName.NOT, VeName.CONTAIN, VeName.STATR, VeName.MATCH, VeName.END).exists(token.name)) {
                                is = true;
                            }
                        }
                        if (is == false)
                            html += ' ';
                    }
                }
                switch (token.type) {
                    case TokenType.keyWord:
                        if (this.chineseKeyWordIsReplaceEnglish == true)
                            html += VeSyntax.get(token.name, language.en).string;
                        else html += token.value;
                        break;
                    case TokenType.bool:
                        if (this.chineseBoolIsReplaceEnglish == true)
                            html += VeSyntax.get(token.name, language.en).string;
                        else html += token.value;
                        break;
                    case TokenType.number:
                    case TokenType.null:
                    case TokenType.word:
                        html += token.value;
                        break;
                    case TokenType.separator:
                    case TokenType.operator:
                        if (this.chineseOperatorIsReplaceEnglish == true)
                            html += VeSyntax.get(token.name, language.en).string;
                        else html += token.value;
                        break;
                    case TokenType.string:
                        html += token.value;
                        break;
                    case TokenType.comment:
                        html += token.value;
                        break;
                    case TokenType.block:
                        if (token.name == VeName.LBRACE) {
                            html += token.value;
                            html += this.codeFormat(token, deep + 1);
                        }
                        else {
                            html += token.value;
                            html += this.codeFormat(token, deep + 1);
                        }
                        break;
                    case TokenType.closeBlock:
                        if (before && before.name == VeName.LBRACE) {
                            if (before.childs.last() && before.childs.last().type != TokenType.newLine) {
                                html += NEWLINE;
                            }
                            html += this.getNumberChar(TABCHAR, deep);
                        }
                        if (this.chineseOperatorIsReplaceEnglish == true)
                            html += VeSyntax.get(token.name, language.en).string;
                        else html += token.value;
                        break;
                    case TokenType.program:
                        break;
                    case TokenType.newLine:
                        if (to.childs.length - 1 == index) html += NEWLINE;
                        else
                            html += NEWLINE + this.getNumberChar(TABCHAR, deep);
                        break;
                }
            })
            return html;
        }
        private getNumberChar(char: string, num: number): string {
            var str = '';
            for (var i = 0; i < num; i++) {
                str += char;
            }
            return str;
        }
        private dataFormat(token: Token, deep?: number): string {
            if (typeof deep == typeof undefined) deep = 0;
            var html = '';
            switch (token.type) {
                case TokenType.keyWord:
                    if (this.chineseKeyWordIsReplaceEnglish == true)
                        html += VeSyntax.get(token.name, language.en).string;
                    else html += token.value;
                    break;
                case TokenType.bool:
                    if (this.chineseBoolIsReplaceEnglish == true)
                        html += VeSyntax.get(token.name, language.en).string;
                    else html += token.value;
                    break;
                case TokenType.number:
                case TokenType.null:
                case TokenType.word:
                    html += token.value;
                    break;
                case TokenType.separator:
                case TokenType.operator:
                    if (this.chineseOperatorIsReplaceEnglish == true)
                        html += VeSyntax.get(token.name, language.en).string;
                    else html += token.value;
                    break;
                case TokenType.string:
                    if (this.chineseQuoteIsReplaceEnglish == true) {
                        var v = token.value;
                        if (token.stringQuote == '’' || token.stringQuote == '‘') {
                            v = token.value.substring(1, token.value.length - 2);
                            v = v.replace(/(#|\\)(’|‘)/g, function (_$, $1, $2) { return $2; })
                            v = v.replace(/'/g, "\\'");
                            v = `'${v}'`
                        }
                        else if (token.stringQuote == '“' || token.stringQuote == '”') {
                            v = token.value.substring(1, token.value.length - 2);
                            v = v.replace(/(#|\\)(“|”)/g, function (_$, $1, $2) { return $2; });
                            v = v.replace(/"/g, "\\\"");
                            v = `"${v}"`
                        }
                        html += v;
                    }
                    else {
                        html += token.value;
                    }
                    break;
                case TokenType.comment:
                    html += token.value;
                    break;
                case TokenType.block:
                    if (token.name == VeName.LBRACE) {
                        html += this.getNumberChar(TABCHAR, deep);
                        html += token.value;
                        html += NEWLINE;
                        html += token.childs.map(c => {
                            var str = this.getNumberChar(TABCHAR, deep + 1) + this.codeFormat(c);
                            return str;
                        }).join(NEWLINE);
                        html += NEWLINE + this.getNumberChar(TABCHAR, deep) + '}';
                    }
                    else {
                        if (this.chineseOperatorIsReplaceEnglish == true)
                            html += VeSyntax.get(token.name, language.en).string;
                        else html += token.value;
                        html += token.childs.map(c => this.dataFormat(c)).join("");
                        var closeText = '';
                        if (token.value == '【') closeText = '】'
                        else if (token.value == '《') closeText = '>'
                        else if (token.value == '[') closeText = ']'
                        else if (token.value == '<') closeText = '>'
                        else if (token.value == '@{') closeText = '}'
                        else if (token.value == '{') closeText = '}'
                        if (this.chineseOperatorIsReplaceEnglish == true) {
                            var vs = VeSyntax.find(x => x.string == closeText);
                            var ve = VeSyntax.get(vs.name);
                            html += ve.string;
                        }
                        else html += closeText;
                    }
                    break;
                case TokenType.closeBlock:
                    break;
                case TokenType.program:
                    break;
                case TokenType.newLine:
                    break;
            }

            return html;
        }
    }
}