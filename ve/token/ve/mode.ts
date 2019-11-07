/// <reference path='token.ts'/>
/// <reference path='../base/stringStream.ts'/>
/// <reference path='../../syntax/ve.syntax.ts'/>

namespace Ve.Lang {
    const NewLine = '\n';
    export class VeMode implements Mode<Token> {
        state: State<Token>;
        root: Token;
        isIgnoreLineBreaks: boolean = true;
        isIgnoreWhiteSpace: boolean = true;
        constructor(options?: {
            isIgnoreLineBreaks?: boolean;
            isIgnoreWhiteSpace?: boolean
        }) {
            if (typeof options == 'object') for (var n in options) this[n] = options[n];
        }
        startState(): State<Token> {
            var root = new Token(TokenType.program);
            var state = new State<Token>();
            state.root = root;
            state.context = root;
            this.root = root;
            return state;
        }
        token(stream: StringStream, state: State<Token>): Token {
            var pos = stream.pos;
            var token = this.walk(stream, state);
            if (token) {
                token.col = pos;
                token.size = stream.pos - pos;
                if (typeof stream.row != typeof undefined) token.row = stream.row;
                if (token.type == TokenType.block) {
                    state.context.append(token);
                    state.context = token;
                    state.current = null;
                }
                else if (token.type == TokenType.closeBlock) {
                    state.context = state.context.parent;
                    state.context.append(token);
                    state.current = token;
                } else {
                    state.context.append(token);
                    state.current = token;
                }
                return token;
            }
        }
        tokenStart(stream: StringStream, state: State<Token>) {
            var isAdd: boolean = false;
            if (state && state.current && state.current.isRowspan) {
                if (state.current.rowSpanToken.type == TokenType.string) {
                    //前面应该有一个换行符，如果处于文本换行中
                    if (state.current.type == TokenType.string) {
                        //如果是文本，则直接把换行符加进去
                        state.current.value = state.current.value + NewLine;
                        state.current.size += NewLine.length;
                        isAdd = true;
                    }
                    else if (state.current.type == TokenType.closeBlock) {
                        //如果是@{},则新增一个换行符
                        var token = new Token(TokenType.string);
                        token.value = NewLine;
                        token.row = stream.row;
                        token.col = 0;
                        token.size = token.value.length;
                        token.rowSpanToken = state.current.rowSpanToken;
                        state.current.parent.append(token);
                        state.current = token;
                        isAdd = true;
                    }
                }
            }
            if (isAdd == false && state && (state.current || state.context.type != TokenType.program) && this.isIgnoreLineBreaks != true) {
                var token = new Token(TokenType.newLine);
                token.value = NewLine;
                token.row = stream.row;
                token.col = 0;
                token.size = NewLine.length;
                if (state.current) {
                    if (state.current.rowSpanToken) token.rowSpanToken = state.current.rowSpanToken;
                    state.current.parent.append(token);
                }
                else state.context.append(token);
                state.current = token;
            }
        }
        tokenEnd(stream: StringStream, state: State<Token>) {

        }
        walk(stream: StringStream, state: State<Token>): Token {
            var token = null;
            if (state.current && state.current.isRowspan) {
                if (state.current.rowSpanToken.type == TokenType.comment) {
                    if ((token = this.matchRowspanComment(stream, state))) return token;
                }
                if (state.current.rowSpanToken.type == TokenType.string) {
                    if ((token = this.matchStringBlock(stream, state))) return token;
                    if ((token = this.matchString(stream, state))) return token;
                }
            }
            else {
                var es = stream.eatSpace();
                if (typeof es == 'string') {
                    if (this.isIgnoreWhiteSpace == false) {
                        var whiteToken = new Token(TokenType.whiteSpace);
                        whiteToken.value = es;
                        return whiteToken;
                    }
                    return;
                }
            }
            if (state.context && state.context.type == TokenType.block) {
                if (state.context.value == VeSyntax.get(VeName.STRING_LBRACE).string) {
                    if ((token = this.matchStringBlock(stream, state))) return token;
                }
                if (state.context.value == VeSyntax.get(VeName.SPLIIT).string) {
                    if ((token = this.mathEnum(stream, state))) return token;
                }
                if ((token = this.matchBlock(stream, state))) return token;
            }
            if ((token = this.matchKeyWords(stream, state))) return token;
            if ((token = this.matchComment(stream, state))) return token;
            if ((token = this.matchRowspanComment(stream, state))) return token;
            if ((token = this.matchUnit(stream, state))) return token;
            if ((token = this.matchStringBlock(stream, state))) return token;
            if ((token = this.matchString(stream, state))) return token;
            if ((token = this.matchDoubleOperators(stream, state))) return token;
            if ((token = this.mathEnum(stream, state))) return token;
            if ((token = this.matchBlock(stream, state))) return token;
            if ((token = this.matchNegativeNumber(stream, state))) return token;
            if ((token = this.matchOperators(stream, state))) return token;
            if ((token = this.matchNumber(stream, state))) return token;
            if ((token = this.matchWord(stream, state))) return token;
            return token;
        }
        private matchKeyWords(stream: StringStream, state: State<Token>): Token | null {
            var token = null;
            var text = stream.match(VeSyntax.getKeyWords().map(x => x.string), VeSyntax.notWord);
            if (text) {
                token = new Token(TokenType.keyWord);
                token.name = VeSyntax.getKeyWords().find(x => x.string == text).name;
                token.value = text;
            }
            return token;
        }
        private matchComment(stream: StringStream, state: State<Token>): Token | null {
            var token = null;
            var text = stream.match(VeSyntax.getAll(VeName.COMMENT).map(x => x.string));
            if (text) {
                token = new Token(TokenType.comment);
                token.name = VeName.COMMENT;
                token.value = text + stream.skipToEnd();
            }
            return token;
        }
        private matchRowspanComment(stream: StringStream, state: State<Token>): Token | null {
            var token: Token = null;
            var text: string = null;
            var restText = '';
            if (state.current && state.current.isRowspan && state.current.rowSpanToken.type == TokenType.comment) {
                text = '';
                var lang: language = state.current.rowSpanToken.lang;
                var mtext = stream.match(VeSyntax.get(VeName.COMMENT_CLOSEBLOCK, state.current.rowSpanToken.lang).string);
                if (mtext) restText = mtext;
            }
            else {
                text = stream.match(VeSyntax.getAll(VeName.COMMENT_BLOCK).map(x => x.string));
                if (text) {
                    var lang: language = VeSyntax.find(x => x.string == text).lang;
                    restText = stream.till(VeSyntax.get(VeName.COMMENT_CLOSEBLOCK, lang).string, true);
                }
            }
            if (text != null) {
                token = new Token(TokenType.comment);
                if (restText) {
                    //说明当前行就找到了
                    token.value = text + restText;
                    if (state.current && state.current.rowSpanToken)
                        token.clearRowSpan(state.current.rowSpanToken);
                }
                else {
                    //当前行没有找到
                    token.value = text + stream.skipToEnd();
                    if (text) {
                        var lang: language = VeSyntax.find(x => x.string == text).lang;
                        token.lang = lang;
                    }
                    token.rowSpanToken = state.current && state.current.rowSpanToken ? state.current.rowSpanToken : token;
                }
            }
            return token;
        }
        private matchStringBlock(stream: StringStream, state: State<Token>): Token | null {
            var token = null;
            if (state.context) {
                if (state.context.type == TokenType.block) {
                    if (state.context.value == VeSyntax.get(VeName.STRING_LBRACE).string) {
                        //说明处于@{环境中，判断是否}退出
                        var text = stream.match(VeSyntax.get(VeName.RBRACE).string);
                        if (text) {
                            token = new Token(TokenType.closeBlock);
                            token.value = text;
                            token.name = VeName.RBRACE;
                            if (state.context.rowSpanToken) token.rowSpanToken = state.context.rowSpanToken;
                            return token;
                        }
                    }
                }
            }
            //下面是判断@{开头，判断前面是否是string或@{}
            if (state.current) {
                var is = false;
                if (state.current.type == TokenType.string) {
                    //说明前面是string
                    is = true;
                }
                else if (state.current.type == TokenType.closeBlock) {
                    //有可能是},那么确认prev==@{
                    var prev = state.current.prev();
                    if (prev && prev.type == TokenType.block && prev.value == VeSyntax.get(VeName.STRING_LBRACE).string) {
                        is = true;
                    }
                }
                if (is) {
                    var text = stream.match(VeSyntax.get(VeName.STRING_LBRACE).string);
                    if (text) {
                        token = new Token(TokenType.block);
                        token.value = text;
                        token.name = VeName.STRING_LBRACE;
                        if (state.current.rowSpanToken) token.rowSpanToken = state.current.rowSpanToken;
                        return token;
                    }
                }
            }
            return token;
        }
        private matchString(stream: StringStream, state: State<Token>): Token | null {

            var token: Token = null;
            var text: string = null;
            var restText = null;
            var self = this;
            var isStringBlock = false;
            var quoteRs = VeSyntax.getOperators().findAll(x => x.type.exists(SymbolType.quote)).map(x => x.string);
            var isRow = false;
            function quoteMap(quoteText: string): VeArray<string> {
                var qs: VeArray<string> = new VeArray();
                if (quoteText == '‘' || quoteText == '’') { qs.push('‘'); qs.push('’') }
                else if (quoteText == '“' || quoteText == '”') { qs.push('“'); qs.push('”') }
                else if (quoteText) qs.push(quoteText);
                return qs;
            }
            if (state.current && state.current.isRowspan && state.current.rowSpanToken.type == TokenType.string) {
                text = state.current.rowSpanToken.stringQuote;
                isStringBlock = true;
                isRow = true;
            }
            else {
                text = stream.match(quoteRs);
            }
            if (text != null) {
                if (stream.startWith(VeSyntax.get(VeName.STRING_LBRACE).string)) {
                    // '@{}直接这样
                    restText = '';
                    isStringBlock = true;
                }
                else {
                    restText = stream.till(VeSyntax.get(VeName.STRING_LBRACE).string, false, function (str) {
                        var last = str[str.length - 1];
                        if (typeof last == 'string') {
                            if (
                                last == VeSyntax.get(VeName.ESCAPTE).string
                                ||
                                last == VeSyntax.get(VeName.ESCAPTE, language.zh).string
                            )
                                return false;
                        }
                    })
                    if (!restText) {
                        var quoteText = text ? text : state.current.rowSpanToken.stringQuote;
                        var qs: VeArray<string> = quoteMap(quoteText);
                        restText = stream.till(qs, true, function (str) {
                            var last = str[str.length - 1];
                            var lastSecond = str[str.length - 2];
                            if (typeof last == 'string' && typeof lastSecond == 'string') {
                                if (qs.exists(last)
                                    &&
                                    (
                                        lastSecond == VeSyntax.get(VeName.ESCAPTE).string
                                        ||
                                        lastSecond == VeSyntax.get(VeName.ESCAPTE, language.zh).string
                                    )
                                ) return false;
                            }
                        })
                        if (restText) isStringBlock = false;
                    }
                    else isStringBlock = true;
                    if (!restText) restText = null;
                }
            }
            if (text != null) {
                token = new Token(TokenType.string);
                if (restText != null) {
                    //说明当前行就找到了
                    token.value = (isRow ? "" : text) + restText;
                    token.stringQuote = text;
                    var qs: VeArray<string> = quoteMap(token.stringQuote);
                    token.stringValue = qs.exists(x => restText.endsWith(x)) ? restText.substring(0, restText.length - 1) : restText;
                    if (isStringBlock) {
                        token.rowSpanToken = state.current && state.current.isRowspan ? state.current.rowSpanToken : token;
                    }
                    else if (state.current && state.current.isRowspan) {
                        token.clearRowSpan(state.current.rowSpanToken);
                    }
                }
                else {
                    //当前行没有找到
                    var endText = stream.skipToEnd();
                    token.value = (isRow ? "" : text) + endText;
                    token.stringValue = endText;
                    token.stringQuote = text;
                    token.rowSpanToken = state.current && state.current.rowSpanToken ? state.current.rowSpanToken : token;
                }
            }
            return token;
        }
        private matchBlock(stream: StringStream, state: State<Token>): Token | null {

            var token = null;
            if (state.context) {
                if (state.context.type == TokenType.block) {
                    //说明处于block开始中，判断是否closeBlock
                    var mb = VeSyntax.getBlocks().find(x => x.eq(0).string == state.context.value);
                    if (mb) {
                        var text = stream.match(mb.eq(1).string);
                        if (text) {
                            token = new Token(TokenType.closeBlock);
                            token.value = text;
                            token.name = mb.eq(1).name;
                            return token;
                        }
                    }
                }
            }
            var text = stream.match(VeSyntax.getBlocks().map(x => x.eq(0).string));
            if (text) {
                //判断是<开始，但问题在于<有可能是小于号
                /*
                 * 1. class a<T,U>
                 * 2. fun a<T>
                 * 3. a<T>(){context:interface|class} 这种情况只能定义类方法时，才会出现的               
                 * 
                 * 小于号的情况,小于号前后都是值
                 * 5.a<b
                 * 6.a()<b
                 * 7.a[0]<b
                 * 8.(a+b)<b
                 * 9. ve.extend<string,U>();
                 * 10. def a=b<c,d=g>d;
                 * 11. b<c&&g>d
                 * 主要的判断依据在于，需要判断清楚泛型方法和逻辑运算的区别
                 */
                if (text == '<' || text == '《') {
                    var isGen = false;
                    if (state && state.current.type == TokenType.word) {
                        if (state && state.current.prev() && new VeArray("fun", 'class', 'interface').exists(state.current.prev().value)) {
                            //1 和2 两种情况
                            isGen = true;
                        }
                        else if (state && state.context.parent && state.context.prevAll().exists(x => x.value == 'interface' || x.value == 'class')) {
                            //说明是类里面 ,情况3
                            isGen = true;
                        }
                        else {
                            //主要的判断依据在于，需要判断清楚泛型方法和逻辑运算的区别,方法后面必须有小括号
                            var unit = VeSyntax.unit;
                            var wu = `${unit}([\\\s]*\\\.[\\\s]*${unit})*`;
                            var regex = `^(${wu}([\\\s]*,[\\\s]*${wu})*)?>[\\\s]*\\\([^\\\)]*\\\)`;
                            // console.log(new RegExp(regex), stream.rest(), stream.rest().match(new RegExp(regex)));
                            var genText = stream.match(new RegExp(regex));
                            // console.log(genText);
                            if (genText) {
                                isGen = true;
                                stream.backUp(genText.length)
                            }
                        }
                    }
                    if (isGen == false) {
                        stream.backUp(1);
                        return token;
                    }
                }
                token = new Token(TokenType.block);
                token.value = text;
                token.name = VeSyntax.getBlocks().find(x => x.eq(0).string == text).eq(0).name;
            }
            return token;
        }
        private matchNegativeNumber(stream: StringStream, state: State<Token>): Token | null {
            if (state.current && state.current.type == TokenType.word) return;
            /***
             * 
             * 匹配负数，主要是与减号做区分，判断依据是前面的不能为word,否则视为数据运算
             * 
             */
            var token = null;
            var text = stream.match(VeSyntax.negativeNumber);
            if (text) {
                token = new Token(TokenType.number);
                token.value = text;
            }
            return token;
        }
        private matchNumber(stream: StringStream, state: State<Token>): Token | null {
            var token = null;
            var text = stream.match(VeSyntax.number);
            if (text) {
                token = new Token(TokenType.number);
                token.value = text;
            }
            return token;
        }
        private matchDoubleOperators(stream: StringStream, state: State<Token>): Token | null {
            //操作符长度大于2,注意包括一些关键字操作符(new)
            var token = null;
            var text = stream.match(VeSyntax.getOperators().findAll(x => x.string.length >= 2 && !x.type.exists(SymbolType.keyWord)).map(x => x.string));
            if (!text) {
                var ops = VeSyntax.getOperators().findAll(x => x.string.length >= 2 && x.type.exists(SymbolType.keyWord));
                text = stream.match(ops.map(x => x.string), VeSyntax.notWord);
            }
            if (text) {
                token = new Token(TokenType.operator);
                token.value = text;
                token.name = VeSyntax.getOperators().find(x => x.string == token.value).name;
            }
            return token;
        }
        private matchOperators(stream: StringStream, state: State<Token>): Token | null {
            var token = null;
            var text = stream.match(VeSyntax.getOperators().findAll(x => x.string.length == 1).map(x => x.string));
            if (text) {
                token = new Token(TokenType.operator);
                token.value = text;
                token.name = VeSyntax.getOperators().find(x => x.string == token.value).name;
            }
            return token;
        }
        private matchWord(stream: StringStream, state: State<Token>): Token | null {
            var token = null;
            var text = stream.match(VeSyntax.word);
            if (text) {
                token = new Token(TokenType.word);
                token.value = text;
            }
            return token;
        }
        private matchUnit(stream: StringStream, state: State<Token>): Token | null {
            var token: Token = null;
            var char = '/';
            if (stream.startWith(char)) {
                var text = '';
                text += stream.next();
                var str = stream.till(char, true, function (str) {
                    if (str.endsWith('\\/')) {
                        return false;
                    }
                    return true;
                })
                if (str) {
                    text += str;
                    var word = stream.match(VeSyntax.word);
                    if (word) {
                        token = new Token(TokenType.unit);
                        token.value = text.substring(1, text.length - 1);
                        token.unit = word;
                        return token;
                    }
                }
                stream.backUp(text.length);

            }
        }
        private mathEnum(stream: StringStream, state: State<Token>): Token | null {
            var token = null;
            var char = '|';
            if (state.context) {
                if (state.context.type == TokenType.block) {
                    if (state.context.value == char) {
                        var mb = stream.match(char)
                        if (mb) {
                            token = new Token(TokenType.closeBlock);
                            token.value = mb;
                            token.name = VeName.SPLIIT;
                            return token;
                        }
                    }
                }
            }
            var text = stream.match(char);
            if (text) {
                token = new Token(TokenType.block);
                token.value = text;
                token.name = VeName.SPLIIT;
            }
            return token;
        }
        onTraverse(fx: (token: Token) => void) {
            function traverse(token: Token) {
                fx(token);
                token.childs.each(x => traverse(x));
            }
            traverse(this.root);
        }
        revise() {
            let rv = (token: Token) => {
                //对当前的token类型进行修正
                //部分keyword在某些场景下并非是keyword，更多是的word
                switch (token.type) {
                    case TokenType.keyWord:
                        if (token.value == 'null') {
                            token.type = TokenType.null;
                            token.name = VeName.NULL_LITERAL;
                        }
                        else if (new VeArray("true", 'false', '是', '否').exists(token.value)) {
                            token.type = TokenType.bool;
                            if (token.value == 'true') token.name = VeName.TRUE_LITERAL;
                            else token.name = VeName.FALSE_LITERAL;
                        }
                        else if (new VeArray("get", 'set').exists(token.value)) {
                            //判断是不是处于类下面的get,set
                            if (!(token.parent && token.parent.parent && token.parent.parent.prevAll().exists(x => x.value == 'class'))) {
                                token.type = TokenType.word;
                                delete token.name;
                            }
                        }
                        else if (token.value == 'value') {
                            var setToken = token.closest(x => x.prevAll().exists(x => x.value == 'set'));
                            if (!setToken) {
                                token.type = TokenType.word;
                                delete token.name;
                            }
                        }
                        break;
                    case TokenType.string:
                        if (typeof token.stringValue != typeof undefined) {
                            token.wholeValue = token.value;
                            token.value = token.stringValue;
                        }
                        break;
                }
            }
            this.onTraverse(x => rv(x));
        }
    }
}