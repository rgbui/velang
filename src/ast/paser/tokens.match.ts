namespace Ve.Lang {
    import List = Util.List;
    function matchFlag(code: String, match: string | RegExp | (string | RegExp)[]) {
        if (Array.isArray(match)) {
            for (var i = 0; i < match.length; i++) {
                var r = matchFlag(code, match[i]);
                if (typeof r != 'undefined') return r;
            }
        }
        else if (typeof match == 'string') {
            if (code.includes(match)) return match;
        }
        else if (match instanceof RegExp) {
            var ma = code.match(getLangSyntaxRegex(veStatementSyntax, match));
            if (ma && ma[0]) return ma[0];
        }
    }
    export class TokenMatch extends Ve.Lang.Util.BaseEvent {
        pickExpressFromBracketOfStatement(tokens: List<Token>): Express {
            var bracket = tokens.find(x => x.flag == '(');
            if (bracket) {
                return this.express(bracket.childs);
            }
            return null;
        }
        pickStatementFromBlockOfStatement(tokens: List<Token>) {
            var bracket = tokens.find(x => x.flag == '{');
            if (bracket) {
                return this.statement(bracket.childs);
            }
            return null;
        }
        statement(tokens: List<Token>) {
            var parser = this.createParser();
            return parser.parse(tokens);
        }
        express(tokens: List<Token>) {
            var parser = this.createParser();
            parser.import(tokens);
            return parser.nextExpress();
        }
        /****tokens */
        /***
           * 判断是否存匹配
           */
        isMatch(match: string | RegExp | (string | RegExp)[], tokens: List<Token>) {
            var tokenText = tokens.map(t => t.flag).join(""); var matchText = matchFlag(tokenText, match);
            if (matchText) {
                return true;
            }
            return false;
        }
        /***获取匹配的token数量 */
        match(match: string | RegExp | (string | RegExp)[], tokens: List<Token>) {
            var start: number = 0;
            var tokenText = tokens.map(t => t.flag).join("");
            var matchText = matchFlag(tokenText, match);
            //console.log(tokens, match,tokenText,matchText);
            var rest = tokenText;
            if (matchText) {
                while (true) {
                    if (rest.startsWith(matchText)) {
                        break;
                    }
                    else {
                        rest = rest.substring((tokens.eq(start).flag).length);
                        start += 1;
                    }
                }
                rest = '';
                var ts: List<Token> = new List;
                for (var i = start; i < tokens.length; i++) {
                    rest += tokens.eq(i).flag;
                    ts.push(tokens.eq(i));
                    if (rest == matchText) {
                        break;
                    }
                };
                return ts;
            }
            else {
                return null;
            }
        }
        matchAll(match: string | RegExp | (string | RegExp)[], tokens: List<Token>) {
            var ts: List<List<Token>> = new List;
            tokens = tokens.toArray(t => t);
            while (true) {
                var ms = this.match(match, tokens);
                if (ms) {
                    ts.push(ms);
                    tokens = tokens.subtract(ms);
                }
                else break;
            }
            return ts;
        }
        /***
         * 过滤(是过滤所有)
         */
        filter(match: string | RegExp | (string | RegExp)[], tokens: List<Token>) {
            var ts = this.matchAll(match, tokens);
            ts.each(t => {
                tokens = tokens.subtract(t);
            });
            return tokens;
        }
        /***
         * 解析类型
         */
        typeExpress(tokens: List<Token>) {
            /****
             * 
             * {}[]
             * word[]
             */
            if (tokens.exists(x => x.flag == '->')) {
                var brakectIndex = tokens.findIndex(x => x.flag == '(');
                var arrowIndex = tokens.findIndex(x => x.flag == '->');
                var tp = new TypeExpress();
                tp.ref(tokens);
                tp.args = tokens.eq(brakectIndex).childs.split(x => x.flag == ',').toArray(x => {
                    var sp = x.findIndex(x => x.flag == ':');
                    if (sp < 0) sp = x.length;
                    return {
                        key: x.range(0, sp).toArray(x => x.value).join("").trim(),
                        type: x.exists(x => x.flag == ':') ? this.typeExpress(x.range(sp + 1, x.length)) : TypeExpress.create({ name: 'any' })
                    }
                });
                tp.returnType = this.typeExpress(tokens.range(arrowIndex + 1));
                return tp;
            }
            else if (tokens.exists(x => x.flag == '[')) {
                var tp = new TypeExpress();
                tp.ref(tokens);
                var index = tokens.findLastIndex(x => x.flag == '[');
                tokens = tokens.removeAll((x, i) => i >= index);
                tp.generics = new List(this.typeExpress(tokens));
                tp.unionType = TypeExpress.create({ name: 'Array' });
                return tp;
            }
            else if (tokens.exists(x => x.flag == '(')) {
                return this.typeExpress(tokens.find(x => x.flag == '(').childs);
            }
            else if (tokens.exists(x => x.flag == '{')) {
                var tp = new TypeExpress();
                tp.ref(tokens);
                var contentToken = tokens.find(x => x.flag == '{');
                var ts = contentToken.childs.split(x => x.flag == ',');
                tp.props = new List();
                ts.each(tk => {
                    var tas = tk.split(x => x.flag == ':');
                    var key = tas.eq(0).find(x => x.flag == 'word' || x.flag == 'type').value;
                    var valueType = this.typeExpress(tas.eq(1));
                    tp.props.push({ key, type: valueType });
                });
                return tp;
            }
            else if (tokens.exists(x => x.flag == '<')) {
                var name = this.match(/@namespace/, tokens).map(t => t.value).join('').trim().replace(/[ \t]/g, '');
                var tp = new TypeExpress();
                tp.ref(tokens);
                tp.unionType = TypeExpress.create({ name });
                var gs = this.match(/\</, tokens).eq(0);
                tp.generics = gs.childs.split(x => x.flag == ',').toArray(m => this.typeExpress(m));
                return tp;
            }
            else {
                var tp = new TypeExpress();
                tp.ref(tokens);
                var wordTypes = this.match(/@namespaceType/, tokens);
                if (!wordTypes) {
                    console.trace(tokens, tokens.map(t => t.flag).join(""), "||", tokens.map(x => x.value).join(""))
                }
                tp.name = wordTypes.map(x => x.value).join("").trim().replace(/[ \t]/g, '');
                return tp;
            }
        }
        /****
        * 解析数据
        */
        dataExpress(tokens: List<Token>) {
            if (tokens.exists(x => x.flag == '[')) {
                var ae = new ArrayExpress();
                ae.ref(tokens.find(x => x.flag == '['));
                var ts = tokens.find(x => x.flag == '[').childs.split(x => x.flag == ',');
                ts.each(ds => {
                    var exp = this.express(ds);
                    ae.append(exp);
                    ae.items.push(exp);
                })
                return ae;
            }
            else if (tokens.exists(x => x.flag == '{')) {
                var oe = new ObjectExpress();
                oe.ref(tokens.find(x => x.flag == '{'));
                var ts = tokens.find(x => x.flag == '{').childs.split(x => x.flag == ',');
                ts.each(ds => {
                    if (ds.exists(x => x.flag == ':')) {
                        var i = ds.findIndex(x => x.flag == ':');
                        var dss = new List(ds.range(0, i - 1), ds.range(i + 1, ds.length));
                        var keyTokens = dss.eq(0);
                        var key: string;
                        if (keyTokens.exists(x => x.flag == '"')) {
                            key = keyTokens.find(x => x.flag == '"').childs.eq(0).value;
                        }
                        else {
                            key = this.match(/@word/, dss.eq(0)).eq(0).value;
                        }
                        var value = this.express(dss.eq(1));
                        oe.append(value);
                        oe.items.push({ key, value });
                    }
                    else if (ds.exists(x => x.flag == '(')) {
                        var dgs = this.match(/@blank*@word@blank*\(\)@blank*/, ds);
                        var key = this.match(/@word/, dgs).eq(0).value;
                        var af = new AnonymousFunExpress();
                        af.set('parameters', this.parameters(dgs.find(x => x.flag == '(').childs));
                        var parser = this.createParser();
                        parser.import(ds.range(ds.findIndex(x => x === dgs.last()) + 1));
                        var rc = parser.matchFunTypeAndBody();
                        af.returnType = rc.returnType;
                        af.set('content', rc.content);
                        oe.append(af);
                        oe.items.push({ key, value: af });
                    }
                    else {
                        var exp = this.express(ds);
                        oe.append(exp);
                        oe.items.push({ key: this.match(/@word/, ds).eq(0).value, value: exp });
                    }
                });
                return oe;
            }
            else {
                if (tokens.exists(x => x.flag == '"')) {
                    var quoteToken = tokens.find(x => x.name.endsWith('.open') && x.name.startsWith('string.'));
                    var quoteTokenUnit = quoteToken.next.next;
                    var typeName = 'string';
                    if (quoteTokenUnit && (quoteTokenUnit.flag == 'word' || quoteTokenUnit.flag == 'type')) typeName = quoteTokenUnit.value;
                    if (quoteToken) {
                        if (quoteToken.childs.exists(x => x.flag == '@{' || x.name == 'string.variable')) {
                            //说明上面是string.template
                            var cte = new StringTemplateExpress();
                            cte.ref(quoteToken);
                            var strings: List<Constant | NameCall | Express> = new List;
                            quoteToken.childs.each(ch => {
                                if (ch.flag == '}') return;
                                if (ch.flag == '@{') {
                                    strings.push(this.express(ch.childs));
                                }
                                else if (ch.name == 'string.variable') {
                                    var nc = new NameCall();
                                    nc.ref(ch);
                                    nc.name = ch.value;
                                    if (nc.name.startsWith('@')) nc.name = nc.name.substring(1);
                                    strings.push(nc);
                                }
                                else {
                                    var constant = new Constant();
                                    constant.ref(ch);
                                    constant.constantType = TypeExpress.create({ name: 'string' });
                                    constant.value = ch.value;
                                    strings.push(constant);
                                }
                            });
                            cte.set('strings', strings);
                            cte.stringType = TypeExpress.create({ name: typeName });
                            return cte;
                        }
                        else {
                            //下面是纯字符串
                            var str = quoteToken.childs.toArray(x => x.value).join("");
                            var constant = new Constant();
                            constant.ref(quoteToken);
                            constant.constantType = TypeExpress.create({ name: typeName });
                            constant.value = str;
                            return constant;
                        }
                    }
                }
                else if (tokens.exists(x => x.flag == 'number')) {
                    var numberToken = tokens.find(x => x.flag == 'number');
                    var cs = new Constant();
                    cs.ref(numberToken);
                    cs.value = numberToken.value.match(/\d+([\.。]\d+)?([eE][\-+]?\d+)?/)[0];
                    var typeName = numberToken.value.replace(cs.value, '');
                    cs.value = parseFloat(numberToken.value);
                    if (!typeName) {
                        if (cs.value.toString().indexOf('.') > -1) typeName = 'number'
                        else typeName = 'int'
                    }
                    cs.constantType = TypeExpress.create({ name: typeName });
                    return cs;
                }
                else if (tokens.exists(x => x.flag == 'true' || x.flag == 'false')) {
                    var cs = new Constant();
                    cs.ref(tokens.find(x => x.flag == 'true' || x.flag == 'false'));
                    cs.value = tokens.exists(x => x.flag == 'true') ? true : false;
                    cs.constantType = TypeExpress.create({ name: 'bool' });
                    return cs;
                }
                else if (tokens.exists(x => x.flag == 'null')) {
                    var cs = new Constant();
                    cs.ref(tokens.find(x => x.flag == 'null'));
                    cs.value = null;
                    cs.constantType = TypeExpress.create({ name: 'Null' });
                    return cs;
                }
                else if (tokens.exists(x => x.flag == '~~')) {
                    var cs = new Constant();
                    cs.ref(tokens.find(x => x.flag == '~~'));
                    cs.value = null;
                    cs.constantType = TypeExpress.create({ name: tokens.find(x => x.flag == 'word' || x.flag == 'type').value });
                    return cs;
                }
            }
        }
        decorate(tokens: List<Token>) {
            var dc = new DecorateStatement();
            dc.ref(tokens.find(x => x.flag == '#'));
            dc.name = this.match(/@namespace/, tokens).toArray(x => x.value).join("");
            var br = tokens.find(x => x.flag == '(');
            if (br) {
                dc.arguments = new List();
                var ts = br.childs.split(x => x.flag == ',');
                ts.each(ds => {
                    if (ds.exists(x => x.flag == '=')) {
                        var index = ds.findIndex(x => x.flag == '=')
                        dc.arguments.push(this.dataExpress(ds.range(index + 1, ds.length)));
                    }
                    else {
                        dc.arguments.push(this.dataExpress(ds));
                    }
                })
            }
            return dc;
        }
        generics(tokens: List<Token>) {
            var gs: List<Generic> = new List;
            var ws = this.matchAll(/@namespace/, tokens);
            ws.each(wd => {
                var gc = new Generic();
                gc.name = wd.map(x => x.value).join("").trim().replace(/[ \t]/, '');
                gs.push(gc);
            })
            return gs;
        }
        parameters(tokens: List<Token>) {
            /***
            *  a:string='eeee',c:bool=false,g?:bool=true,...args:string[]
            */
            var ps: List<Parameter> = new List;
            var ts = tokens.split(x => x.flag == ',');
            ts.each(ds => {
                var pa = new Parameter();
                ps.push(pa);
                if (ds.exists(x => x.flag == '=')) {
                    var valueTokens = this.match(/\=.*$/, ds);
                    ds = ds.subtract(valueTokens);
                    valueTokens = this.filter('=', valueTokens);
                    pa.default = this.dataExpress(valueTokens);
                }
                if (ds.exists(x => x.flag == ':')) {
                    var typeTokens = this.match(/\:.*$/, ds);
                    ds = ds.subtract(typeTokens);
                    typeTokens = this.filter(':', typeTokens);
                    pa.valueType = this.typeExpress(typeTokens);
                }
                if (ds.exists(x => x.flag == '?')) pa.optional = true;
                if (ds.exists(x => x.flag == '...')) pa.rest = true;
                var nameToken = this.match(/@word|this/, ds).eq(0);
                pa.ref(nameToken);
                pa.name = nameToken.value;

            })
            return ps;
        }
        private createParser() {
            var parser = new StatementParser();
            var self = this;
            parser.on('error', function () {
                self.emit('error', ...arguments);
            });
            return parser;
        }
    }
}