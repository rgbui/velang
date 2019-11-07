///<reference path='../../statement/Statement.Package.ts'/>

namespace Ve.Lang {
    export class TokenStatementParserDeclaration {
        parsePackageStatement(this: TokenStatementParser): PackageStatement {
            var ns = this.match(ParserRegex.package);
            if (ns && ns.length > 0) {
                var statement = new PackageStatement(this.parent);
                var names = ns.range(1, ns.findIndex(x => x.name == VeName.LBRACE) - 1);
                statement.name = names.map(x => x.value).join("");
                statement.body = new TokenStatementParser(ns.find(x => x.name == VeName.LBRACE), statement).parse();
                return statement;
            }
        }
        parseUseStatement(this: TokenStatementParser): UseStatement {
            var ns = this.match(ParserRegex.use);
            if (ns && ns.length > 0) {
                var statement = new UseStatement(this.parent);
                statement.name = ns.range(1, ns.findIndex(x => x.name == VeName.ASSIGN || x.name == VeName.SEMICOLON, ns.length) - 1).map(x => x.value).join("");
                if (ns.exists(x => x.name == VeName.ASSIGN)) {
                    var lastIndex = ns.findIndex(x => x.name == VeName.SEMICOLON, ns.length) - 1;
                    var startIndex = ns.findIndex(x => x.name == VeName.ASSIGN) + 1;
                    statement.localName = ns.range(startIndex, lastIndex).map(x => x.value).join("");
                }
                return statement;
            }
        }
        parseEnumStatement(this: TokenStatementParser): EnumStatement {
            var ns = this.match(ParserRegex.enum);
            if (ns && ns.length > 0) {
                var statement = new EnumStatement(this.parent);
                statement.modifiers = ns.range(0, ns.findIndex(x => x.name == VeName.ENUM) - 1).map(x => Modifier[x.value]);
                statement.name = ns.range(ns.findIndex(x => x.name == VeName.ENUM) + 1, ns.findIndex(x => x.name == VeName.LBRACE)).eq(0).value;
                statement.options = TokenParseData.parseEnumOptions(ns.find(x => x.name == VeName.LBRACE).childs) as VeArray<{ key: string, value: Constant }>;
                return statement;
            }
        }
        $parseAttribute(token: Token, parent: Statement): {
            name: string;
            args: VeArray<{
                key?: string;
                value: Constant;
            }>;
        } {
            var childs = token.childs;
            var ca: {
                name: string;
                args: VeArray<{
                    key?: string;
                    value: Constant;
                }>;
            } = { args: new VeArray } as any;
            ca.name = childs.range(0, childs.findIndex(x => x.name == VeName.LPAREN, childs.length) - 1).map(x => x.value).join("");
            if (childs.exists(x => x.name == VeName.LPAREN)) {
                var tokens = childs.find(x => x.name == VeName.LPAREN);
                tokens.childs.split(x => x.name == VeName.COMMA).each(ts => {
                    if (ts.exists(z => z.name == VeName.ASSIGN)) {
                        var key = ts.first().value;
                        var index = ts.findIndex(z => z.name == VeName.ASSIGN);
                        var value = TokenParseExpression.parseOneToken(ts.findAll((z, i) => i > index)) as Constant;
                        ca.args.push({ key, value });
                    }
                    else {
                        var value = TokenParseExpression.parseOneToken(ts) as Constant;
                        ca.args.push({ value });
                    }
                })
            }
            return ca;
        }
        $parseGeneric(token: Token, parent: Statement): VeArray<{ key: string }> {
            var ts = token.childs.split(x => x.name == VeName.COMMA);
            return ts.map(x => {
                var cg: { key: string } = {} as any;
                cg.key = x.eq(0).value;
                return cg;
            })
        }
        parseClassOrInterfaceStatement(this: TokenStatementParser): ClassOrIntrfaceStatement {
            var ns = this.match(ParserRegex.classOrInterface);
            if (ns && ns.length > 0) {
                var statement = new ClassOrIntrfaceStatement(this.parent);
                if (ns.exists(x => x.value == 'class')) statement.type = StatementType.class;
                else { statement.type = StatementType.interface; }
                if (ns.exists(x => x.name == VeName.LBRACK)) {
                    statement.attributes = ns.findAll(x => x.name == VeName.LBRACK).map(x => this.$parseAttribute(x, statement));
                }
                ns.removeAll(x => x.name == VeName.LBRACK || x.name == VeName.RBRACK);
                statement.name = ns.eq(ns.findIndex(x => x.name == VeName.CLASS || x.name == VeName.INTERFACE) + 1).value;
                statement.modifiers = ns.range(0, ns.findIndex(x => x.name == VeName.CLASS || x.name == VeName.INTERFACE) - 1).map(x => Modifier[x.value]);
                statement.type = ns.exists(x => x.name == VeName.CLASS) ? StatementType.class : StatementType.interface;
                if (ns.exists(x => x.name == VeName.LT))
                    statement.generics = this.$parseGeneric(ns.find(x => x.name == VeName.LT), statement);
                if (ns.exists(x => x.name == VeName.EXTENDS)) {
                    statement.extendName = ns.range(ns.findIndex(x => x.name == VeName.EXTENDS) + 1, ns.findIndex(x => x.name == VeName.LBRACE) - 1).map(x => x.value).join("");
                }
                try {
                    var st = new TokenStatementParser(ns.find(x => x.name == VeName.LBRACE), statement).parse() as VeArray<ClassProperty>;
                    statement.body = st;
                }
                catch (e) {
                    console.log(statement);
                    throw e;
                }
                return statement;
            }
        }
        parseMethodStatement(this: TokenStatementParser, ignoreClass?: boolean): ClassProperty {
            if (ignoreClass == true || (this.parent && (this.parent.type == StatementType.class || this.parent.type == StatementType.interface))) {
                var reg = ParserRegex.classMethod;
                if (this.parent.type == StatementType.interface)
                    reg = ParserRegex.interfaceMethod;
                var ns = this.match(reg);
                if (ns && ns.length > 0) {
                    var statement = new ClassProperty(this.parent);
                    statement.kind = ClassPropertyKind.method;
                    if (this.parent.type == StatementType.interface) statement.isInterface = true;
                    if (ns.exists(x => x.name == VeName.LBRACK)) {
                        statement.attributes = ns.findAll(x => x.name == VeName.LBRACK).map(x => this.$parseAttribute(x, statement));
                        ns.removeAll(x => x.name == VeName.LBRACK || x.name == VeName.RBRACK);
                    }
                    statement.modifiers = ns.range(0, ns.findIndex(x => x.type == TokenType.word) - 1).map(x => Modifier[x.value]);
                    statement.name = ns.find(x => x.type == TokenType.word || x.value == 'new').value;
                    if (ns.exists(x => x.name == VeName.LT))
                        statement.generics = this.$parseGeneric(ns.find(x => x.name == VeName.LT), statement);
                    statement.args = TokenParseData.parseParameter(ns.find(x => x.name == VeName.LPAREN).childs);
                    if (ns.exists(x => x.name == VeName.COLON)) {
                        var nsTs = ns.range(ns.findIndex(x => x.name == VeName.COLON) + 1, ns.findLastIndex(x => x.name == VeName.LBRACE, ns.length - 1) - 1);
                        statement.returnType = TokenParseData.parseType(nsTs);
                    }
                    var bodyToken = ns.findLast(x => x.name == VeName.LBRACE);
                    if (bodyToken) {
                        statement.body = new TokenStatementParser(ns.findLast(x => x.name == VeName.LBRACE).childs, statement).parse();
                        statement.isInterface = false;
                    }
                    return statement
                }
            }
            return null;
        }
        parsePropertyStatement(this: TokenStatementParser, ignoreClass?: boolean): ClassProperty {
            if (ignoreClass == true || (this.parent && (this.parent.type == StatementType.class || this.parent.type == StatementType.interface))) {
                var ns = this.match(ParserRegex.classProperty);
                if (ns && ns.length > 0) {
                    var statement = new ClassProperty(this.parent);
                    statement.kind = ClassPropertyKind.prop;
                    if (ns.exists(x => x.name == VeName.LBRACK)) {
                        statement.attributes = ns.findAll(x => x.name == VeName.LBRACK).map(x => this.$parseAttribute(x, statement));
                        ns.removeAll(x => x.name == VeName.LBRACK || x.name == VeName.RBRACK);
                    }
                    statement.modifiers = ns.range(0, ns.findIndex(x => x.type == TokenType.word) - 1).map(x => Modifier[x.value]);
                    statement.name = ns.find(x => x.type == TokenType.word).value;
                    if (ns.exists(x => x.name == VeName.COLON)) {
                        var nsTs = ns.range(ns.findIndex(x => x.name == VeName.COLON) + 1, ns.findIndex(x => x.name == VeName.ASSIGN || x.name == VeName.SEMICOLON, ns.length) - 1);
                        statement.propType = TokenParseData.parseType(nsTs);
                    }
                    if (ns.exists(x => x.name == VeName.ASSIGN))
                        statement.value = new TokenParseExpress(ns.range(ns.findIndex(x => x.name == VeName.ASSIGN) + 1, ns.findIndex(x => x.name == VeName.SEMICOLON, ns.length) - 1), statement).parse() as Constant;
                    return statement;
                }
            }
            return null;
        }
        parseFieldStatement(this: TokenStatementParser, ignoreClass?: boolean): ClassProperty {
            if (ignoreClass == true || (this.parent && (this.parent.type == StatementType.class || this.parent.type == StatementType.interface))) {
                var ns = this.match(ParserRegex.classField);
                if (ns && ns.length > 0) {
                    var statement = new ClassProperty(this.parent);
                    statement.kind = ClassPropertyKind.field;
                    if (ns.exists(x => x.name == VeName.LBRACK)) {
                        statement.attributes = ns.findAll(x => x.name == VeName.LBRACK).map(x => this.$parseAttribute(x, statement));
                        ns.removeAll(x => x.name == VeName.LBRACK || x.name == VeName.RBRACK);
                    }
                    statement.modifiers = ns.range(0, ns.findIndex(x => x.type == TokenType.word) - 1).map(x => Modifier[x.value]);
                    statement.name = ns.find(x => x.type == TokenType.word).value;
                    if (ns.exists(x => x.name == VeName.COLON)) {
                        var rangeTs = ns.range(ns.findIndex(x => x.name == VeName.COLON) + 1, ns.findIndex(x => x.name == VeName.LBRACE) - 1);
                        statement.propType = TokenParseData.parseType(rangeTs);
                    }
                    var b = ns.find(x => x.name == VeName.LBRACE);
                    if (b.childs.exists(x => x.name == VeName.GET)) {
                        statement.get = new TokenStatementParser(b.childs.eq(b.childs.findIndex(x => x.name == VeName.GET) + 1), statement).parse();
                    }
                    else if (b.childs.exists(x => x.name == VeName.SET)) {
                        statement.set = new TokenStatementParser(b.childs.eq(b.childs.findIndex(x => x.name == VeName.SET) + 1), statement).parse();
                    }
                    return statement;
                }
            }
            return null;
        }
        parseFunStatement(this: TokenStatementParser): FunStatement {
            if (this.parent && (this.parent.type == StatementType.class || this.parent.type == StatementType.interface || this.parent.type == StatementType.enum)) return null;
            var ns = this.match(ParserRegex.fun);
            if (ns && ns.length > 0) {
                var statement = new FunStatement(this.parent);
                statement.modifiers = ns.range(0, ns.findIndex(x => x.name == VeName.FUN) - 1).map(x => Modifier[x.value]);
                statement.name = ns.find(x => x.type == TokenType.word).value;
                if (ns.exists(x => x.name == VeName.LT))
                    statement.generics = this.$parseGeneric(ns.find(x => x.name == VeName.LT), statement);
                statement.args = TokenParseData.parseParameter(ns.find(x => x.name == VeName.LPAREN).childs);
                if (ns.exists(x => x.name == VeName.COLON)) {
                    var returnTs = ns.range(ns.findIndex(x => x.name == VeName.COLON), ns.findLastIndex(x => x.name == VeName.LBRACE, ns.length - 1) - 1);
                    statement.returnType = TokenParseData.parseType(returnTs);
                }
                if (ns.exists(x => x.name == VeName.LBRACE))
                    statement.body = new TokenStatementParser(ns.find(x => x.name == VeName.LBRACE).childs, statement).parse();
                return statement
            }
            return null;
        }
        parseVariableStatement(this: TokenStatementParser): VeArray<Statement> {
            var ns = this.match(ParserRegex.variable);
            if (ns && ns.length > 0) {
                var isConst = ns.exists(x => x.name == VeName.CONST);
                ns.removeAll(x => x.name == VeName.DEF || x.name == VeName.CONST || x.name == VeName.SEMICOLON);
                var exps: VeArray<Statement> = new VeArray();
                ns.split(x => x.name == VeName.COMMA).each(nr => {
                    var variable: DeclareVariable = new DeclareVariable();
                    variable.name = nr.eq(0).value;
                    variable.isReadonly = isConst ? true : false;
                    if (nr.length > 1) {
                        if (nr.eq(1).name == VeName.COLON) {
                            var rs = nr.range(2, nr.findIndex(x => x.name == VeName.ASSIGN, nr.length) - 1)
                            variable.variableType = TokenParseData.parseType(rs);
                        }
                        if (nr.exists(x => x.name == VeName.ASSIGN)) {
                            var rs = nr.range(nr.findIndex(x => x.name == VeName.ASSIGN) + 1, nr.length);
                            variable.value = new TokenParseExpress(rs, variable).parse();
                        }
                    }
                    exps.push(variable);
                })
                return exps;
            }
        }
        parseExpression(this: TokenStatementParser): Expression {
            var ns = this.match(ParserRegex.statement);
            if (ns && ns.length > 0) {
                return new TokenParseExpress(ns, this.parent).parse();
            }
        }
    }
}