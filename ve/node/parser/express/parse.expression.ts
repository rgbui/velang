namespace Ve.Lang {
    export class TokenParseExpression {
        static parseBinaryExpression(ts: VeArray<Statement | Token>): Expression {
            var index = ts.findIndex(x => x instanceof Token && x.type == TokenType.operator);
            var left: Expression = TokenParseExpress.parseExpression(ts.range(0, index - 1));
            var right: Expression = TokenParseExpress.parseExpression(ts.range(index + 1, ts.length));
            var binaryExpression = new BinaryExpression();
            binaryExpression.kind = (ts.eq(index) as Token).name;
            binaryExpression.left = left;
            binaryExpression.right = right;
            return binaryExpression;
        }
        static parseUnaryExpression(ts: VeArray<Statement | Token>): Expression {
            var index = ts.findIndex(x => x instanceof Token && x.type == TokenType.operator);
            var left: Expression, right: Expression;
            var unaryExpression = new UnaryExpression();
            if (index > 0) {
                left = TokenParseExpress.parseExpression(new VeArray(ts.find((x, i) => i < index)));
                unaryExpression.arrow = UnaryArrow.right;
            }
            else {
                right = TokenParseExpress.parseExpression(new VeArray(ts.find((x, i) => i >= index)));
                unaryExpression.arrow = UnaryArrow.left;
            }
            unaryExpression.kind = (ts.eq(index) as Token).name;
            unaryExpression.exp = left ? left : right;
            return unaryExpression;
        }
        static parseTernaryOperator(ts: VeArray<Statement | Token>): Expression {
            var ternaryExpression = new TernaryExpression();
            var wi = ts.findIndex(x => x instanceof Token && x.name == VeName.CONDITIONAL);
            var ti = ts.findIndex(x => x instanceof Token && x.name == VeName.COLON);
            ternaryExpression.where = TokenParseExpress.parseExpression(ts.range(0, wi - 1));
            ternaryExpression.trueCondition = TokenParseExpress.parseExpression(ts.range(wi + 1, ti - 1));
            ternaryExpression.falseCondition = TokenParseExpress.parseExpression(ts.range(ti + 1, ts.length - 1));
            return ternaryExpression;
        }
        static parsePropertyReference(ts: VeArray<Statement | Token>): PropertyExpression {
            var propertyExpression: PropertyExpression = new PropertyExpression();
            ts.removeAll(x => x.name == VeName.PERIOD);
            propertyExpression.propertys = ts.map(x => {
                if (x instanceof Token) {
                    if (x.type == TokenType.word) {
                        return x.value as any;
                    }
                    else {
                        return this.parseOneToken(new VeArray(x));
                    }
                }
                else if (x instanceof Statement) return x;
            })
            return propertyExpression;
        }
        static parseArray(ts: VeArray<Statement | Token>): Expression {
            var arrayExpression: ArrayExpression = new ArrayExpression();
            arrayExpression.args = TokenParseData.parseArguments((ts.eq(0) as Token).childs);
            return arrayExpression;
        }
        static parseArrayIndex(ts: VeArray<Statement | Token>): Expression {
            var ai: ArrayIndexExpression = new ArrayIndexExpression();
            var first = ts.eq(0);
            if (first instanceof Token) {
                ai.name = first.value;
            }
            else {
                ai.name = first as any;
            }
            ai.indexExpress = new TokenParseExpress((ts.find(x => x instanceof Token && x.name == VeName.LBRACK) as Token).childs).parse();
            return ai;
        }
        static parseObject(ts: VeArray<Statement | Token>): ObjectExpression {
            var oe = new ObjectExpression();
            var tms = (ts.eq(0) as Token).childs;
            oe.propertys = TokenParseData.parsePropertys(tms);
            return oe;
        }
        static parseMethod(ts: VeArray<Statement | Token>): Expression {
            var callMethod: CallMethodExpression = new CallMethodExpression();
            var first = ts.eq(0);
            if (first instanceof Token) {
                callMethod.name = first.value;
            }
            else if (first instanceof Expression) {
                callMethod.name = first;
            }
            var t = ts.find(x => x instanceof Token && x.name == VeName.LPAREN);
            callMethod.args = TokenParseData.parseArguments((t as Token).childs);
            if (ts.exists(x => x.name == VeName.LT)) {
                (ts.find(x => x instanceof Token && x.name == VeName.LT) as Token).childs.split(x => x.name == VeName.COMMA).each(tt => {
                    var type = TokenParseData.parseType(tt);
                    callMethod.generics.push({ type });
                })
            }
            return callMethod;
        }
        static parseArrowMethod(ts: VeArray<Statement | Token>): ArrowMethodExpression {
            var ame: ArrowMethodExpression = new ArrowMethodExpression();
            var arrowIndex = ts.findIndex(x => x instanceof Token && x.name == VeName.ARROW);
            if (ts.exists((x, i) => i < arrowIndex && x instanceof Token && x.name == VeName.LPAREN)) {
                ame.args = TokenParseData.parseParameter((ts.find((x, i) => i < arrowIndex && x instanceof Token && x.name == VeName.LPAREN) as Token).childs);
            }
            else {
                ame.args = TokenParseData.parseParameter(new VeArray(ts.eq(0) as Token));
            }
            if (ts.exists((x, i) => i < arrowIndex && x instanceof Token && x.name == VeName.COLON)) {
                ame.returnType = TokenParseData.parseType(ts.range(ts.findIndex((x, i) => i < arrowIndex && x instanceof Token && x.name == VeName.COLON) + 1, arrowIndex - 1) as VeArray<Token>);
            }
            var last = ts.findAll((x, i) => i > arrowIndex);
            if (last.length == 1 && last instanceof Token && last.name == VeName.LBRACE) {
                ame.body = new TokenStatementParser(last.childs).parse();
            }
            else {
                ame.body.append(new TokenParseExpress(last as VeArray<Token>).parse());
            }
            return ame;
        }
        static parseOneToken(ts: VeArray<Statement | Token>): Expression {
            if (ts.length == 1 && ts[0] instanceof Token) {
                var token = ts[0] as Token;
                if (token.type == TokenType.number) {
                    var constant = new Constant();
                    if (/^\-?[\d]+$/g.test(token.value)) {
                        constant.value = parseInt(token.value);
                        constant.valueType = new TypeExpression(TypeKind.unit, { name: 'int' });
                    }
                    else {
                        constant.value = parseFloat(token.value);
                        constant.valueType = new TypeExpression(TypeKind.unit, { name: 'number' });
                    }
                    return constant;
                }
                if (token.type == TokenType.unit) {
                    var constant = new Constant();
                    constant.valueType = new TypeExpression(TypeKind.unit, { name: token.unit });
                    constant.value = token.value;
                    return constant;
                }
                else if (token.type == TokenType.null) {
                    var constant = new Constant();
                    constant.valueType = new TypeExpression(TypeKind.unit, { name: 'null' });
                    constant.value = null;
                    return constant;
                }
                else if (token.type == TokenType.string) {
                    var constant = new Constant();
                    constant.valueType = new TypeExpression(TypeKind.unit, { name: 'string' });
                    constant.value = token.value;
                    return constant;
                }
                else if (token.type == TokenType.bool) {
                    var constant = new Constant();
                    constant.valueType = new TypeExpression(TypeKind.unit, { name: 'bool' });
                    if (token.value == 'true') constant.value = true;
                    else constant.value = false;
                    return constant;
                }
                else if (token.type == TokenType.word) {
                    var variable = new Variable();
                    variable.type = StatementType.variable;
                    variable.name = token.value;
                    return variable;
                }
                else if (token.type == TokenType.keyWord && (token.value == 'this' || token.value == 'super')) {
                    var cc = new ClassContext();
                    cc.name = token.value;
                    return cc;
                }
            }
            return null;
        }
    }
}