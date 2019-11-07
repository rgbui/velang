
///<reference path='./parse.data.ts'/>
///<reference path='./parse.expression.ts'/>
///<reference path='../../../util/common.ts'/>
namespace Ve.Lang {
    export class TokenParseExpress {
        tokens: VeArray<Token>;
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
            if (typeof parent != typeof undefined) this.parent = parent;
            TokenStatementParser.prototype.preteatment.apply(this, []);
            //过滤掉new操作符，它里把构造函数默认成静态函数，无需new
            this.tokens.removeAll(x => x.name == VeName.NEW);
        }
        getLeftAndRightOpertors() {
            var json: any = { left: new VeArray, right: new VeArray };
            var self = this;
            var getOperator = (startToken) => {
                var ve = new VeArray();
                if (startToken) {
                    var moveIndex = self.tokens.findIndex(startToken);
                    ve.push(startToken);
                    if (startToken.type == TokenType.block) {
                        //(){}<>[]成双成对的出现
                        moveIndex += 1;
                        ve.push(self.tokens.eq(moveIndex));
                    }
                    if (startToken.name == VeName.LT && startToken.type == TokenType.block) {
                        //可能是泛型方法
                        if (this.tokens.eq(moveIndex + 1) && this.tokens.eq(moveIndex + 1).name == VeName.LPAREN) {
                            ve.append(this.tokens.eq(moveIndex + 1));
                            ve.append(this.tokens.eq(moveIndex + 2));
                        }
                    }
                    else if (startToken.name == VeName.CONDITIONAL) {
                        //如果是 ?: 三元运算符，那么 ?: 中间只能隔一个，才视为做为一个整体运算，否则中间的应该没有完全的运算完成
                        //三元运算符优先级较低
                        if (this.tokens.eq(moveIndex + 2) && this.tokens.eq(moveIndex + 2).name == VeName.COLON) {
                            ve.append(this.tokens.eq(moveIndex + 1));
                            ve.append(this.tokens.eq(moveIndex + 2));
                        }
                    }
                    else if (startToken.name == VeName.LPAREN) {
                        /***如果是小括号，则判断是否可能为箭头函数，如果是，则直接命中*/
                        var ms = self.tokens.match(ParserRegex.fun_arrow_statement, TokenStatementParser.prototype.getFlag, moveIndex - 1);
                        //  console.log(ParserRegex.fun_arrow_statement,self.tokens);
                        if (ms && ms.length > 0) {
                            ms.each((m, i) => {
                                if (i > 0) ve.append(m);
                            })
                        }
                        moveIndex += ms.length - 1;
                    }
                    else if (startToken.name == VeName.ARROW) {
                        //单纯的箭头函数
                        var ms = self.tokens.match(ParserRegex.block_or_statement, TokenStatementParser.prototype.getFlag, moveIndex);
                        if (ms && ms.length > 0) {
                            ms.each((m, i) => {
                                if (i > 0) ve.append(m);
                            })
                        }
                        moveIndex += ms.length - 1;
                    }
                    else if (startToken.name == VeName.PERIOD) {
                        //如果有连续的点，则算一个
                        while (true) {
                            if (self.tokens.eq(moveIndex + 1) instanceof Token && self.tokens.eq(moveIndex + 1).type == TokenType.word) {
                                if (self.tokens.eq(moveIndex + 2) instanceof Token && self.tokens.eq(moveIndex + 2).name == VeName.PERIOD) {
                                    ve.append(self.tokens.eq(moveIndex + 1));
                                    ve.append(self.tokens.eq(moveIndex + 2));
                                    moveIndex += 2;
                                    continue;
                                }
                            }
                            break;
                        }
                    }
                }
                ve.removeAll(x => x ? false : true);
                return ve;
            }
            var isOp = (x: Token) => (x.type == TokenType.operator || x.type == TokenType.block || (x.type == TokenType.keyWord && new VeArray('new').exists(x.value)));
            json.left = getOperator(this.tokens.find(x => x instanceof Token && isOp(x)));
            json.right = getOperator(this.tokens.find(x => x instanceof Token && !json.left.exists(x) && isOp(x)))
            return json;
        }
        parse(onlyOnce?: boolean): Expression {
            var LR = this.getLeftAndRightOpertors();
            if (LR.left.length > 0 && LR.left.first().name == VeName.COMMA) {
                //逗号的运算级最低，所以一次性的处理完。               
                throw '逗号不应该出现在这里'
            }
            if (LR.right.exists(x => x ? false : true)) {
                console.log(LR);
            }
            if (LR.right.length > 0) {
                var pickOpName = (r) => {
                    if (r.exists(x => x.name == VeName.LT) && r.exists(x => x.name == VeName.LPAREN)) {
                        //提升一些运算符的优先级
                        r.find(x => x.name == VeName.LPAREN).name;
                    }
                    return r.eq(0).name;
                }
                var leftOp = VeSyntax.getOperators().find(x => x.name == pickOpName(LR.left));
                var rightOp = VeSyntax.getOperators().find(x => x.name == pickOpName(LR.right));
                var comparePrecedence = leftOp.precedence < rightOp.precedence;
                if (leftOp.precedence == rightOp.precedence) {
                    //相同的优先级，判断运算顺序是从左到右，还是从右到左
                    if (rightOp.direction == OperatorDirection.right)
                        comparePrecedence = true;
                    else comparePrecedence = false;
                }
                if (comparePrecedence) {
                    //等后面的运算完再结合,先算的precedence值更大
                    ////a+b*2; 先算b*2
                    ////a*(b+2)
                    var LeftIndex = this.tokens.findIndex(x => x == LR.left.last());
                    var rightExpression = new TokenParseExpress(this.tokens.findAll((x, i) => i > LeftIndex), this.parent).parse(true);
                    this.tokens.removeAll((x, i) => i > LeftIndex);
                    var ns = new VeArray<Token | Statement>();
                    ns.append(this.tokens);
                    if (!rightExpression) {
                        console.log(LR, this.tokens);
                        throw 'right expression is not null;error';
                    }
                    ns.append(rightExpression);
                    if (onlyOnce == true) return ns as any;
                    else
                        return new TokenParseExpress(<any>ns, this.parent).parse();
                }
                else {
                    // a+b-c; 先算a+b
                    var rightIndex = this.tokens.findIndex(x => x == LR.right.first());
                    var leftExpression = new TokenParseExpress(this.tokens.findAll((x, i) => i < rightIndex), this.parent).parse();
                    if (!leftExpression) {
                        console.log(LR, this.tokens);
                        throw 'left expression is not null;error';
                    }
                    this.tokens.removeAll((x, i) => i < rightIndex);
                    var ns = new VeArray<Token | Statement>();
                    ns.append(leftExpression);
                    ns.append(this.tokens);
                    if (onlyOnce == true) return ns as any;
                    else
                        return new TokenParseExpress(<any>ns, this.parent).parse();
                }
            }
            else {
                //只有自身的
                return TokenParseExpress.parseExpression(this.tokens);
            }
        }
        static parseExpression(ts: VeArray<Statement | Token>): Expression {
            if (!ts) {
                console.trace(ts);
            }
            ts.removeAll(x => x.type == TokenType.comment || x.type == TokenType.newLine);
            var token = ts.find(x => x instanceof Token && (x.type == TokenType.operator || x.type == TokenType.block))
            if (token instanceof Token) {
                switch (token.name) {
                    case VeName.LPAREN://"(", 0)    // case VeName.RPAREN://")", 0) 
                        if (ts.exists(x => x instanceof Token && x.name == VeName.ARROW)) {
                            return TokenParseExpression.parseArrowMethod(ts);
                        }
                        else {
                            var first = ts.eq(0);
                            if (first instanceof Token && first.name == VeName.LPAREN) {
                                //说明是小括号运算符
                                return new TokenParseExpress(first.childs).parse();
                            }
                            else {
                                //小括号前面有东西，说明是方法
                                return TokenParseExpression.parseMethod(ts);
                            }
                        }
                    case VeName.LBRACK: //"[", 0)     // case VeName.RBRACK: //"]", 0)  
                        var first = ts.eq(0);
                        if (first instanceof Token && first.name == VeName.LBRACK) {
                            //说明是纯数组了
                            return TokenParseExpression.parseArray(ts);
                        }
                        else {
                            //数组前有其它东西
                            return TokenParseExpression.parseArrayIndex(ts);
                        }
                    case VeName.LBRACE:// "{", 0)      // case VeName.RBRACE://"}", 0)    
                        return TokenParseExpression.parseObject(ts);
                    case VeName.COLON://":", 0)  
                        // return this.parseCOLONExpression(ts);
                        console.trace(ts);
                        throw ':操作符不应该出现在这里'
                    case VeName.PERIOD://".", 0)
                    case VeName.NULL_PERIOD://"?."   
                        return TokenParseExpression.parsePropertyReference(ts);
                    case VeName.ELLIPSIS://"...", 0) 
                        throw ("'...'操作符不应该出现在这里")
                    case VeName.CONDITIONAL:// "?", 3) 
                        return TokenParseExpression.parseTernaryOperator(ts);
                    case VeName.COMMA:// ",", 1);
                        throw ("逗号不应该出现在这")
                    case VeName.NEW:
                        throw ("new不应该出现在这")
                    case VeName.ARROW: //"=>", 0)  
                        return TokenParseExpression.parseArrowMethod(ts);
                    case VeName.ASSIGN: //"=", 2)                       
                    case VeName.ASSIGN_ADD:// "+=", 2)                                             
                    case VeName.ASSIGN_SUB:// "-=", 2)                                             
                    case VeName.ASSIGN_MUL:// "*=", 2)                                             
                    case VeName.ASSIGN_DIV:// "/=", 2)                                             
                    case VeName.ASSIGN_MOD:// "%=", 2)                                             
                    case VeName.ASSIGN_EXP: //"**=", 2)
                    case VeName.OR: //"||", 4)                                                     
                    case VeName.AND: //"&&", 5)                              
                    case VeName.XOR:// "^", 7)                               
                    case VeName.ADD:// "+", 12)                                                    
                    case VeName.SUB:// "-", 12)                                                    
                    case VeName.MUL: //"*", 13)                                                    
                    case VeName.DIV:// "/", 13)                                                    
                    case VeName.MOD:// "%", 13)                                                    
                    case VeName.EXP:// "**", 14)   
                    case VeName.EQ:// "==", 9)                                                     
                    case VeName.NE: //"!=", 9)                                                
                    case VeName.GT: //">", 10)                                                     
                    case VeName.LTE:// "<=", 10)                                                   
                    case VeName.GTE:// ">=", 10)  
                    case VeName.AS://   "as", KeyWordsType.operator);
                    case VeName.IS://   "is", KeyWordsType.constant);
                    case VeName.MATCH://  "match", KeyWordsType.operator);
                    case VeName.CONTAIN://   "contain", KeyWordsType.operator);
                    case VeName.STATR://   "start", KeyWordsType.operator);
                    case VeName.END://   "end", KeyWordsType.operator);
                    case VeName.K_EQ://   "equal", KeyWordsType.operator);
                    case VeName.K_AND://   "and", KeyWordsType.operator);
                    case VeName.K_OR:  // "or", KeyWordsType.operator);
                    case VeName.K_XOR://   "xor", KeyWordsType.operator);
                        return TokenParseExpression.parseBinaryExpression(ts);
                    case VeName.LT: //"<", 10) 
                        if (ts.exists(t => t instanceof Token && t.name == VeName.LPAREN)) {
                            return TokenParseExpression.parseMethod(ts);
                        }
                        else
                            return TokenParseExpression.parseBinaryExpression(ts);
                    case VeName.INC://"++", 0)                                                    
                    case VeName.DEC://"--", 0) 
                    case VeName.NOT://!
                        // case VeName.TYPEOF://   "typeof", KeyWordsType.operator);
                        // case VeName.NAMEOF://   "nameof", KeyWordsType.operator);
                        return TokenParseExpression.parseUnaryExpression(ts);
                }
            }
            ts.removeAll(x => x.name == VeName.SEMICOLON);
            if (ts.length == 1) {
                if (ts[0] instanceof Expression) return ts[0] as Expression;
                var exp = TokenParseExpression.parseOneToken(ts);
                return exp;
            }
            else {
                console.trace(ts);
                throw '表达式最终只能生成一个节点，不可能有多个节点或空节点'
            }
        }
    }
}