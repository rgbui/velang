

namespace Ve.Lang {

    export class RazorMode implements Mode<Razor>{
        state: State<Razor>;
        startState(): State<Razor> {
            var root = new Razor();
            root.type = RazorType.fragment;
            var state: State<Razor> = new State<Razor>();
            state.root = root;
            state.context = root;
            this.state = state;
            return state;
        }
        token(stream: StringStream, state: State<Razor>): Razor {
            var match: Razor;
            var pos = stream.pos;
            match = this.walk(stream, state);
            if (match) {
                match.col = pos;
                if (match.value)
                    match.size = match.value.length;
                if (typeof stream.row != typeof undefined) match.row = stream.row;
                if (new VeArray(
                    RazorType.if,
                    RazorType.elseif,
                    RazorType.else,
                    RazorType.block,
                    RazorType.bracket,
                    RazorType.blockLeft,
                    RazorType.bracketLeft,
                    RazorType.for,
                    RazorType.while,
                    RazorType.lineText,
                    RazorType.helper,
                    RazorType.section,
                    RazorType.method,
                    RazorType.blockText,
                    RazorType.quote,
                ).exists(match.type)) {
                    state.context.append(match);
                    state.context = match;
                    state.current = null;
                }
                else if (new VeArray(
                    RazorType.blockRight,
                    RazorType.bracketRight,
                    RazorType.lineEnd,
                    RazorType.quoteEnd
                ).exists(match.type)) {
                    state.current = state.context;
                    state.context = state.context.parent;
                }
                else {
                    state.context.append(match);
                    state.current = match;
                }
                return match;
            }
        }
        tokenEnd(stream: StringStream, state: State<Razor>) {
            this.onInferRazorEnv();
        }
        walk(stream: StringStream, state: State<Razor>): Razor {
            var token: Razor = null;
            if ((token = this.matchEscape(stream, state))) return token;
            if ((token = this.matchStatement(stream, state))) return token;
            if ((token = this.matchELseStatement(stream, state))) return token;
            if ((token = this.matchBracket(stream, state))) return token;
            if ((token = this.matchBlock(stream, state))) return token;
            if ((token = this.matchMethod(stream, state))) return token;
            if ((token = this.matchValue(stream, state))) return token;
            if ((token = this.matchStringTextBlock(stream, state))) return token;
            if ((token = this.matchStringText(stream, state))) return token;
            if ((token = this.matchHelper(stream, state))) return token;
            if ((token = this.matchSection(stream, state))) return token;
            if ((token = this.matchTextBlock(stream, state))) return token;
            if ((token = this.matchQuote(stream, state))) return token;
            if ((token = this.matchClose(stream, state))) return token;
            if ((token = this.matchText(stream, state))) return token;
            return token;
        }
        private matchEscape(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@[@\}\)'"`]/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.escape;
                razor.value = text.substring(1);
                return razor;
            }
            text = stream.match(/^@(\{\{|\(\()/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.escape;
                if (text.indexOf('{') > -1)
                    razor.value = '{'
                else razor.value = '('
                return razor;
            }
        }
        private matchStatement(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@(if|while|for)[\s\n]*\(/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType[text.replace(/[\s@\(]/g, '')];
                return razor;
            }
        }
        private matchELseStatement(stream: StringStream, state: State<Razor>): Razor {
            if (state.current) {
                var prev = state.current.prevSearch(x => {
                    return !x.isWhiteText
                }, true);
                if (prev && prev.type == RazorType.blockLeft) {
                    prev = prev.prevSearch(x => !x.isWhiteText);
                    if (prev && new VeArray(RazorType.if, RazorType.elseif).exists(prev.type)) {
                        var text = stream.match(/^[\s]*else[\s\n]+if[\s\n]*\(/);
                        if (text) {
                            var razor: Razor = new Razor();
                            razor.type = RazorType.elseif;
                            return razor;
                        }
                        else {
                            text = stream.match(/^[\s]*else[\s\n]*\{/);
                            if (text) {
                                var razor: Razor = new Razor();
                                razor.type = RazorType.else;
                                return razor;
                            }
                        }
                    }
                }
            }
        }
        private matchBracket(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@[\s]*\(/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.bracket;
                return razor;
            }
        }
        private matchBlock(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@[\s]*\{/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.block;
                return razor;
            }
        }
        private matchValue(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@[\w\$](([\s]*\.[\s]*)?[\w\$]+)*/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.value;
                razor.text = text;
                razor.value = razor.text.replace(/[@]/g, '');
                return razor;
            }
        }
        private matchMethod(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@[\w\$](([\s\n]*\.[\s\n]*)?[\w\$]+)*[\s\n]*\(/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.method;
                razor.text = text;
                razor.value = razor.text.replace(/[\s@\(]/g, '');
                return razor;
            }
        }
        private matchStringTextBlock(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@:\{/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.blockText;
                return razor;
            }
        }
        private matchStringText(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@:/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.lineText;
                return razor;
            }
        }
        private matchHelper(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@helper[\s]+[\w\$]+[\s]*\(([\s]*[\w\$]+[\s]*\,)*([\s]*[\w\$]+[\s]*)?\)[\s]*\{/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.helper;
                razor.text = text;
                razor.value = text.replace(/(@helper|\{)/g, '');
                return razor;
            }
        }
        private matchSection(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^@section[\s]+[\w\$]+[\s]*\{/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.section;
                razor.text = text;
                razor.value = text.replace(/(@section|\{)/g, '');
                return razor;
            }
        }
        private matchTextBlock(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^\(/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.bracketLeft;
                razor.text = text;
                razor.value = razor.text;
                return razor;
            }
            text = stream.match(/^\{/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.blockLeft;
                razor.text = text;
                razor.value = razor.text;
                return razor;
            }
        }
        private matchQuote(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(new VeArray('\'', '"', '`'));
            if (text) {
                if (state.context && state.context.type == RazorType.quote && state.context.text == text) {
                    var razor: Razor = new Razor();
                    razor.type = RazorType.quoteEnd;
                    razor.text = text;
                    razor.value = text;
                    return razor;
                }
                else {
                    var razor: Razor = new Razor();
                    razor.type = RazorType.quote;
                    razor.text = text;
                    razor.value = text;
                    return razor;
                }
            }
        }
        private matchClose(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/^\}/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.blockRight;
                razor.text = text;
                razor.value = razor.text;
                return razor;
            }
            text = stream.match(/^\)/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.bracketRight;
                razor.text = text;
                razor.value = razor.text;
                return razor;
            }
            if (state.context && new VeArray(RazorType.lineText).exists(state.context.type)) {
                var text = stream.match(/^\n/);
                if (text) {
                    var razor: Razor = new Razor();
                    razor.type = RazorType.lineEnd;
                    razor.value = text;
                    razor.text = text;
                    return razor;
                }
            }
            else {
                var text = stream.match(/^[\n]+/);
                if (text) {
                    var razor: Razor = new Razor();
                    razor.type = RazorType.text;
                    razor.value = text;
                    razor.text = text;
                    return razor;
                }
            }
        }
        private matchText(stream: StringStream, state: State<Razor>): Razor {
            var text = stream.match(/[^@\(\)\{\}'"`\n]+/);
            if (text) {
                var razor: Razor = new Razor();
                razor.type = RazorType.text;
                razor.text = text;
                razor.value = text;
                return razor;
            }
        }
        onInferRazorEnv() {
            _.arrayJsonEach([this.state.root], 'childs', razor => {
                if (typeof razor.env == typeof undefined) {
                    switch (razor.type) {
                        case RazorType.if:
                        case RazorType.elseif:
                        case RazorType.for:
                        case RazorType.while:
                            razor.env = RazorEnviroment.code;
                            var nextBlock = razor.nextSearch(x => !x.isWhiteText);
                            if (nextBlock && nextBlock.type == RazorType.blockLeft) {
                                var ts = VeArray.asVeArray(razor.parent.childs).range(razor.index + 1, nextBlock.index - 1);
                                ts.each(t => {
                                    t.env = RazorEnviroment.code
                                });
                                nextBlock.env = RazorEnviroment.code;
                                nextBlock.contentEnv = RazorEnviroment.text;
                            }
                            break;
                        case RazorType.else:
                            razor.env = RazorEnviroment.text;
                            break;
                        case RazorType.block:
                        case RazorType.bracket:
                        case RazorType.method:
                        case RazorType.value:
                            razor.env = RazorEnviroment.code;
                            break;
                        case RazorType.blockLeft:
                        case RazorType.bracketLeft:
                            break;
                        case RazorType.lineText:
                        case RazorType.helper:
                        case RazorType.section:
                        case RazorType.blockText:
                        case RazorType.fragment:
                            razor.env = RazorEnviroment.text;
                            break;
                    }
                }
            })
            _.arrayJsonEach([this.state.root], 'childs', razor => {
                if (typeof razor.env == typeof undefined) {
                    var p = razor.closest(x => typeof x.env != typeof undefined || typeof x.contentEnv != typeof undefined);
                    if (p) {
                        if (typeof p.contentEnv != typeof undefined) razor.env = p.contentEnv;
                        else
                            razor.env = p.env;
                    }
                    else {

                    }
                }
            })
        }
    }
}

