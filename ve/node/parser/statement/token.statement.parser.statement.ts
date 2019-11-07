
namespace Ve.Lang {

    export class TokenStatementParserStatement {

        parseIf(this: TokenStatementParser): Statement | null {
            var ns = this.match(ParserRegex.if);
            if (VeArray.isVeArray(ns) && ns.length > 0) {
                var ifStatement = new IfStatement();
                ifStatement.parent = this.parent;
                ifStatement.ifCondition = new TokenParseExpress(ns.eq(1).childs, ifStatement).parse();
                if (ns.eq(3).type == TokenType.block) {
                    ifStatement.ifStatement = new TokenStatementParser(ns.eq(3).childs, ifStatement).parse();
                }
                else {
                    ns.removeAll((item, i) => i <= 2);
                    var exp = new TokenParseExpress(ns, ifStatement).parse();
                    if (exp)
                        ifStatement.ifStatement = new VeArray(exp);
                }
                while (true) {
                    var thenNs = this.match(ParserRegex.else_if);
                    if (VeArray.isVeArray(thenNs) && thenNs.length > 0) {
                        var thenCondition = new TokenParseExpress(thenNs.eq(2).childs, ifStatement).parse();
                        var thenStatement = new VeArray<Statement>();
                        if (thenNs.eq(4).type == TokenType.block) {
                            thenStatement = new TokenStatementParser(thenNs.eq(4).childs, ifStatement).parse();
                        }
                        else {
                            thenNs.removeAll((item, i) => i <= 3);
                            var thenExp = new TokenParseExpress(thenNs, ifStatement).parse();
                            if (thenExp)
                                thenStatement = new VeArray(thenExp);
                        }
                        ifStatement.appendThen(thenCondition, thenStatement);
                    }
                    else { break; }
                }
                var elseNs = this.match(ParserRegex.else);
                if (VeArray.isVeArray(elseNs) && elseNs.length > 0) {
                    if (elseNs.eq(1).type == TokenType.block) {
                        ifStatement.elseStatement = new TokenStatementParser(elseNs.eq(1).childs, ifStatement).parse();
                    }
                    else {
                        elseNs.removeAll((item, i) => i <= 0);
                        var exp = new TokenParseExpress(elseNs, ifStatement).parse();
                        if (exp)
                            ifStatement.elseStatement = new VeArray(exp);
                    }
                }
                return ifStatement;
            }
        }
        parseWhile(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.while);
            if (ns && ns.length > 0) {
                var whileStatement: WhileStatement = new WhileStatement(this.parent);
                whileStatement.condition = new TokenParseExpress(ns.eq(1), whileStatement).parse();
                if (ns.eq(3).type == TokenType.block) {
                    whileStatement.body = new TokenStatementParser(ns.eq(3).childs, whileStatement).parse();
                }
                else {
                    ns.removeAll((item, i) => i <= 2);
                    whileStatement.body = new TokenStatementParser(ns, whileStatement).parse();
                }
                return whileStatement;
            }
        }
        parseDoWhile(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.do_while);
            if (ns && ns.length > 0) {
                var whileStatement: DoWhileStatement = new DoWhileStatement(this.parent);
                var whileIndex = ns.findIndex(x => x.type == TokenType.keyWord && x.name == VeName.WHILE);
                whileStatement.condition = new TokenParseExpress(ns.eq(whileIndex + 1), whileStatement).parse();
                ns.removeAll((x, i) => i >= whileIndex);
                if (ns.eq(1).type == TokenType.block) {
                    whileStatement.body = new TokenStatementParser(ns.eq(1), whileStatement).parse();
                }
                else {
                    ns.removeAll((item, i) => i <= 1);
                    whileStatement.body = new TokenStatementParser(ns, whileStatement).parse();
                }
                return whileStatement;
            }
        }
        parseFor(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.for);
            if (ns && ns.length > 0) {
                var forStatement: ForStatement = new ForStatement();
                forStatement.parent = this.parent;
                var ses = new TokenStatementParser(ns.eq(1), forStatement).parse();
                if (ses.length == 3) {
                    forStatement.initStatement = ses.eq(0);
                    forStatement.condition = ses.eq(1);
                    forStatement.nextStatement = ses.eq(2);
                }
                else {
                    throw 'for format error....'
                }
                if (ns.eq(3).type == TokenType.block) {
                    forStatement.body = new TokenStatementParser(ns.eq(3), forStatement).parse();
                }
                else {
                    ns.removeAll((item, i) => i <= 2);
                    var exp = new TokenParseExpress(ns, forStatement).parse();
                    if (exp) forStatement.body = new VeArray(exp);
                }
                return forStatement;
            }
        }
        parseTry(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.try);
            if (ns && ns.length > 0) {
                var tryStatement = new TryStatement(this.parent);
                tryStatement.tryStatement = new TokenStatementParser(ns.eq(1).childs, tryStatement).parse();
                if (ns.exists(x => x.name == VeName.CATCH)) {
                    var c = ns.findIndex(x => x.name == VeName.CATCH);
                    tryStatement.catchParameter = TokenParseData.parseParameter(ns.eq(c + 1).childs);
                    tryStatement.catchStatement = new TokenStatementParser(ns.eq(c + 2).childs, tryStatement).parse();
                }
                if (ns.exists(x => x.name == VeName.FINALLY)) {
                    tryStatement.finallyStatement = new TokenStatementParser(ns.findSkip(x => x.name == VeName.FINALLY, 1).childs, tryStatement).parse();
                }
                return tryStatement;
            }
        }
        parseSwitch(this: TokenStatementParser) {
            /****
             * case A.B:
             * case C.D:
             * case G.F:
             * break;
             * * */
            var ns = this.match(ParserRegex.switch);
            if (ns && ns.length > 0) {
                var swStatement: SwitchStatement = new SwitchStatement();
                swStatement.parent = this.parent;
                swStatement.valueExpression = new TokenParseExpress(ns.eq(1).childs, this.parent).parse();
                var bs = ns.eq(3).childs;
                if (bs.length > 0) {
                    if (bs instanceof VeArray) {
                        var index = 0;
                        while (true) {
                            if (index >= bs.length) break;
                            var ma = bs.match(ParserRegex.case, this.getFlag, index);
                            if (ma && ma.length > 0) {
                                index += ma.length;
                                var caseIndex = ma.findIndex(x => x.name == VeName.COLON);
                                if (ma.eq(0).name == VeName.CASE) {
                                    var valueExpression = new TokenParseExpress(ma.range(1, caseIndex - 1), swStatement).parse();
                                    var matchStatement = new TokenStatementParser(ma.range(caseIndex + 1, ma.length), swStatement).parse();
                                    swStatement.appendCaseStatement(valueExpression, matchStatement);
                                }
                                else if (ma.eq(0).name == VeName.DEFAULT) {
                                    swStatement.defaultStatement = new TokenStatementParser(ma.range(caseIndex + 1, ma.length), swStatement).parse();
                                }
                            }
                            else {
                                //如果没有匹配的，则认为switch语句语法有问题
                                break;
                            }
                        }
                    }
                }
                return swStatement;
            }
        }
        parseReturn(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.return);
            if (ns && ns.length > 0) {
                var returnStatement: ReturnStatement = new ReturnStatement();
                returnStatement.parent = this.parent;
                ns.removeAll((x, i) => i == 0 || x.name == VeName.SEMICOLON);
                if (ns.length == 0) {
                    throw 'return error;not found return value....';
                }
                returnStatement.expression = new TokenParseExpress(ns, returnStatement).parse();
                return returnStatement;
            }
        }
        parseThrow(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.throw);
            if (ns && ns.length > 0) {
                var throwStatement: ThrowStatement = new ThrowStatement();
                throwStatement.parent = this.parent;
                ns.removeAll((x, i) => i == 0 || x.name == VeName.SEMICOLON);
                if (ns.length == 0) {
                    throw 'throw error;not found throw value....';
                }
                throwStatement.expression = new TokenParseExpress(ns, throwStatement).parse();
                return throwStatement;
            }
        }
        parseBreak(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.break);
            if (ns && ns.length > 0) {
                return new BreakStatement();
            }
        }
        parseContinue(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.return);
            if (ns && ns.length > 0) {
                return new ContinueStatement();
            }
        }
        parseEmptyStatement(this: TokenStatementParser) {
            var ns = this.match(ParserRegex.emptyStatement);
            if (ns && ns.length > 0) {
                return null;
            }
            return null;
        }
    }
}