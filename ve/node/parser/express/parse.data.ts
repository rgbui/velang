namespace Ve.Lang {
    export class TokenParseData {
        /**
         * 解析方法的实参var c=ab(1,2,3,x+y);
         * @param this 
         * @param tokens 
         * 
         */
        static parseArguments(tokens: VeArray<Token>) {
            var ts = tokens.split(x => x.name == VeName.COMMA);
            var args: VeArray<Expression> = new VeArray;
            ts.each(t => {
                var exp = new TokenParseExpress(t).parse();
                args.push(exp);
            })
            return args;
        }
        /**
         * 解析形参
         * @param this 
         * @param tokens 
         * 
         */
        static parseParameter(tokens: VeArray<Token>): VeArray<Parameter> {
            var ts = tokens.split(x => x.name == VeName.COMMA);
            var args: VeArray<Parameter> = new VeArray();
            ts.each(t => {
                var pe: { key: string, default?: Constant, isParameter?: boolean, parameterType: TypeExpression } = {} as any;
                if (t.exists(x => x.name == VeName.ELLIPSIS)) { pe.isParameter = true; t.remove(x => x.name == VeName.ELLIPSIS) };
                pe.key = (t.eq(0) as Token).value;
                if (t.exists(x => x.name == VeName.COLON)) {
                    var typeTs = t.range(t.findIndex(x => x.name == VeName.COLON) + 1, t.findIndex(x => x.name == VeName.ASSIGN, t.length));
                    pe.parameterType = this.parseType(typeTs);
                }
                if (t.exists(x => x.name == VeName.ASSIGN)) {
                    pe.default = new TokenParseExpress(t.range(t.findIndex(x => x.name == VeName.ASSIGN) + 1, t.length)).parse() as Constant;
                }
                var arg = new Parameter();
                for (var n in pe) arg[n] = pe[n];
                args.push(arg);
            })
            return args;
        }
        /**
         * 解板数据类型
         * @param this 
         * @param tokens 
         * 
         */
        static parseType(tokens: VeArray<Token>): TypeExpression {
            var typeExpression: TypeExpression = new TypeExpression();
            if (tokens.exists(x => x.name == VeName.LBRACE) && tokens.exists(x => x.name == VeName.LBRACK)) {
                //{}[]
                typeExpression.unionType = TypeExpression.createUnitType('Array');
                typeExpression.kind = TypeKind.union;
                typeExpression.generics.push(this.parseType(new VeArray(tokens.eq(0))));
                return typeExpression;
            }
            else if (tokens.exists(x => x.name == VeName.LBRACE)) {
                // 纯碎的大括号
                typeExpression.kind = TypeKind.object;
                tokens.find(x => x.name == VeName.LBRACE).childs.split(x => x.name == VeName.COMMA).each(ts => {
                    var key = ts.eq(0).value;
                    var type;
                    if (ts.exists(x => x.name == VeName.COLON)) {
                        var v = ts.range(ts.findIndex(x => x.name == VeName.COLON) + 1, ts.length);
                        type = this.parseType(v);
                    }
                    typeExpression.props.push({ key, type });
                })
                return typeExpression;
            }
            else if (tokens.exists(x => x.name == VeName.LBRACK)) {
                //中括号，前面应该有数据类型
                var index = tokens.findIndex(x => x.name == VeName.LBRACK);
                typeExpression.unionType = TypeExpression.createUnitType('Array');
                typeExpression.kind = TypeKind.union;
                typeExpression.generics.push(this.parseType(tokens.findAll((x, i) => i < index)));
                return typeExpression;
            }
            else if (tokens.exists(x => x.name == VeName.ARROW)) {
                //说明是函数类型
                var index = tokens.findIndex(x => x.name == VeName.ARROW);
                typeExpression.kind = TypeKind.fun;
                tokens.find(x => x.name == VeName.LPAREN).childs.split(x => x.name == VeName.COMMA).each(ts => {
                    var key = ts.eq(0).value;
                    if (ts.exists(x => x.name == VeName.COLON)) {
                        var v = ts.range(ts.findIndex(x => x.name == VeName.COLON) + 1, ts.length);
                        var type = this.parseType(v);
                    }
                    typeExpression.args.push({ key, type: type });
                })
                typeExpression.returnType = this.parseType(tokens.findAll((x, i) => i > index));
                return typeExpression;
            }
            else if (tokens.exists(x => x.name == VeName.SPLIIT)) {
                typeExpression.kind = TypeKind.dic;
                tokens.find(x => x.name == VeName.SPLIIT).childs.split(x => x.name == VeName.COMMA).each(ts => {
                    var key = ts.eq(0).value, value;
                    if (ts.exists(x => x.name == VeName.ASSIGN)) {
                        var vs = ts.range(ts.findIndex(x => x.name == VeName.COLON) + 1, ts.length);
                        if (vs.length == 1) {
                            value = vs.first().value;
                            var v = parseInt(value);
                            if (!isNaN(v)) value = v;
                        }
                    }
                    if (!typeExpression.options.exists(x => x.key == key))
                        typeExpression.options.push({ key, value: typeof value != typeof undefined ? value : undefined });
                })
                return typeExpression;
            }
            else if (tokens.length > 0) {
                typeExpression.kind = TypeKind.unit;
                typeExpression.name = tokens.map(x => {
                    if (x instanceof Token) {
                        if (x.name == VeName.PERIOD) return '.';
                        else return x.value;
                    }
                }).join("");
                return typeExpression;
            }
        }
        static parsePropertys(tokens: VeArray<Token>): VeArray<{ key: string, value: Expression }> {
            var tns = tokens.split(x => x.name == VeName.COMMA);
            var opes: VeArray<{ key: string, value: Expression }> = new VeArray();
            tns.each(tt =>{
                var ope: { key: string, value: Expression } = {} as any;
                ope.key = (tt[0] as Token).value;
                ope.value = new TokenParseExpress(tt.range(tt.findIndex(x => x.name == VeName.COLON) + 1, tt.length)).parse();
                opes.push(ope);
            })
            return opes;
        }
        static parseEnumOptions(tokens: VeArray<Token>): VeArray<{ key: string, value: Expression }> {
            var tns = tokens.split(x => x.name == VeName.COMMA);
            var opes: VeArray<{ key: string, value: Expression }> = new VeArray();
            tns.each(tt => {
                var ope: { key: string, value: Expression } = {} as any;
                ope.key = (tt[0] as Token).value;
                ope.value = TokenParseExpression.parseOneToken(tt.range(tt.findIndex(x => x.name == VeName.ASSIGN) + 1, tt.length));
                opes.push(ope);
            })
            return opes;
        }
    }
}