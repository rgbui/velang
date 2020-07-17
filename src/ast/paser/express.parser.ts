

namespace Ve.Lang {
    import List = Util.List;
    export type ExpressTreeNode = {
        op: OperatorPrecedence,
        operator: List<Token>,
        leftExpress?: Express,
        leftUnitExpress?: List<Express>,
        rightExpress?: Express,
        rightUnitExpress?: List<Express>
    }
    export class StatementParser$Express {
        express(this: StatementParser) {
            return this.nextExpress();
        }
        eatExpressUnit(this: StatementParser) {
            this.eatBlank();
            var unit = this.commonUnitExpress();
            if (unit) return unit;
            var af = this.arrowFun();
            if (af) return af;
            af = this.funExpress();
            if (af) return af;
        }
        eatExpressSymbol(this: StatementParser) {
            this.eatBlank();
            var index = this.index;
            var op = veOperatorPrecedences.find(x => {
                if (x.match && this.eat(x.match)) return true;
            });
            if (op) {
                return {
                    operator: this.range(index, this.index - 1),
                    op
                }
            }
        }
        nextExpress(this: StatementParser) {
            var es: List<any> = new List();
            while (true) {
                var unit = this.eatExpressUnit();
                if (unit) { es.push(unit); continue; }
                var expressSymbol = this.eatExpressSymbol();
                if (expressSymbol) { es.push(expressSymbol); continue; }
                break;
            }
            var index = 0;
            function getAdjoin() {
                var leftExpress: List<Express> = new List();
                var rightExpress: List<Express> = new List();
                var operator: {
                    operator: List<Token>;
                    op: OperatorPrecedence;
                }
                var i = index;
                for (; i < es.length; i++) {
                    if (es.eq(i) instanceof Node) {
                        if (operator) rightExpress.push(es.eq(i))
                        else leftExpress.push(es.eq(i))
                    }
                    else if (!operator) operator = es.eq(i)
                    else break;
                }
                if (leftExpress.length > 1) {
                    //连续两个unit表达式（中间没有操作符进行连接，这应该是个错误）
                    console.log(this.units);
                    throw new Error('the unit express not found operator');
                }
                if (rightExpress.length > 1) {
                    //连续两个unit表达式（中间没有操作符进行连接，这应该是个错误）
                    console.log(this.units);
                    throw new Error('the unit express not found operator');
                }
                return {
                    operator,
                    lefts: leftExpress,
                    rights: rightExpress,
                    start: index,
                    end: i
                }
            }
            function backOperator(index) {
                var op;
                for (var i = index; i >= 0; i--) {
                    var e = es.eq(i);
                    if (e instanceof Node) continue;
                    else if (!op) op = e;
                    else break;
                }
                return i + 1;
            }
            if (es.length == 0) return;
            while (true) {
                var left = getAdjoin();
                index = left.end;
                var right = getAdjoin();
                if (!right.operator && !left.operator && left.lefts) {
                    break;
                }
                else if (!right.operator && left.operator) {
                    var newExp = this.parseOperatorExpress(left.operator, { leftExpress: left.lefts.first(), rightExpress: left.rights.first() });
                    var at = es.findIndex(x => x == left.operator);
                    es.insertAt(at, newExp);
                    es.removeAll(x => x == left.operator || left.lefts.exists(z => z == x) || left.rights.exists(z => z == x));
                    index = backOperator(es.findIndex(x => x == newExp) - 1);
                }
                else {
                    if (left.operator.op.name == '?:' && left.operator.op.match == '?' && right.operator.op.name == '?:' && right.operator.op.match == ':') {
                        /**
                         * 三元运算符
                         */

                        var newExp = this.parseTernary(left, right);
                        var at = es.findIndex(x => x == left.operator);
                        es.insertAt(at, newExp);
                        es.removeAll(x => x == left.operator || left.lefts.exists(z => z == x) || left.rights.exists(z => z == x));
                        es.removeAll(x => x == right.operator || right.lefts.exists(z => z == x) || right.rights.exists(z => z == x));
                        index = backOperator(es.findIndex(x => x == newExp) - 1);
                    }
                    else if (this.comparePrecedence([left.operator.op, right.operator.op])) {
                        /**
                        * 左边优先级较高，左边变成express
                        * a+b+c
                        * g+c
                         */
                        var newExp = this.parseOperatorExpress(left.operator, { leftExpress: left.lefts.first(), rightExpress: left.rights.first() });
                        var at = es.findIndex(x => x == left.operator);
                        es.insertAt(at, newExp);
                        es.removeAll(x => x == left.operator || left.lefts.exists(z => z == x) || left.rights.exists(z => z == x));
                        //退到此时right运算符前面的一个运算符
                        index = backOperator(es.findIndex(x => x == newExp) - 1);
                    }
                    else {
                        /**
                         * 右边较高，
                         * !!!!!!a     
                        */
                        /**
                         * 自动跳到下一个
                         */
                        index = es.findIndex(x => x == left.operator) + 1;
                    }
                }
            }
            return es.eq(0) as Express;
        }
        /**
         * 
         * 逗号分割表达式 
         * 
         * */
        commasExpress(this: StatementParser) {
            var exps: List<Express> = new List;
            while (true) {
                var exp = this.nextExpress();
                if (exp) {
                    exps.push(exp);
                }
                var commas = this.eat(/@blank*\,@blank*/);
                if (commas) continue;
                else break;
            }
            return exps;
        }
        private expressTrees: List<ExpressTreeNode>;
        private units: List<Express>;
        private commonUnitExpress(this: StatementParser): Express {
            this.eatBlank();
            var tokens = this.eat(/number|true|false|this|super|null|@word@blank*(\<\>)?|("'@word?)/);
            if (tokens) return this.parseCommonUnit(tokens);
            return null;
        }
        private parseCommonUnit(this: StatementParser, tokens: List<Token>): Express {
            var token = tokens.first();
            if (token.flag == "\"") {
                var quoteToken = tokens.first();
                var quoteTokenUnit = tokens.eq(2);
                var typeName = 'string';
                if (quoteTokenUnit) typeName = quoteTokenUnit.value;
                if (quoteToken) {
                    if (quoteToken.childs.exists(x => x.flag == '@{' || x.flag == 'variable')) {
                        //说明上面是string.template
                        var cte = new StringTemplateExpress();
                        cte.ref(quoteToken);
                        var strings: List<Constant | NameCall | Express> = new List;
                        quoteToken.childs.each(ch => {
                            if (ch.flag == '}') return;
                            if (ch.flag == '@{') {
                                strings.push(this.TM.express(ch.childs));
                            }
                            else if (ch.flag == 'variable') {
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
            else if (token.flag == 'number') {
                //数字
                var cs = new Constant();
                var numberToken = tokens.first();
                cs.ref(numberToken);
                cs.value = numberToken.value.match(/\d+((\.|。)\d+)?([eE][\-+]?\d+)?/)[0];
                var typeName = numberToken.value.replace(cs.value, '');
                cs.value = parseFloat(numberToken.value);
                if (!typeName) {
                    if (cs.value.toString().indexOf('.') > -1) typeName = 'number'
                    else typeName = 'int'
                }
                cs.constantType = TypeExpress.create({ name: typeName });
                return cs;
            }
            else if (token.flag == 'true' || token.flag == 'false') {
                //是否
                var con = new Constant();
                con.ref(tokens.find(x => x.flag == 'true' || token.flag == 'false'));
                con.value = tokens.exists(x => x.flag == 'true') ? true : false;
                con.constantType = TypeExpress.create({ name: 'bool' });
                return con;
            }
            else if (token.flag == 'null') {
                //空值
                var con = new Constant();
                con.ref(tokens.find(x => x.flag == 'null'));
                con.value = null;
                con.constantType = TypeExpress.create({ name: 'Null' });
                return con;
            }
            else if (token.flag == 'this') {
                var call = new ThisCall();
                call.ref(tokens.find(x => x.flag == 'this'));
                return call;
            }
            else if (token.flag == 'super') {
                var ca = new SuperCall();
                ca.ref(tokens.find(x => x.flag == 'super'));
                return ca;
            }
            else if (token.flag == 'word' || token.flag == 'type') {
                //变量名或类型名
                var nc = new NameCall();
                nc.ref(tokens.find(token => token.flag == 'word' || token.flag == 'type'));
                nc.name = tokens.first().value;
                var tg = tokens.find(x => x.flag == '<');
                if (tg) {
                    nc.implementGeneric = new List<TypeExpress>();
                    var gs = tg.childs.split(x => x.flag == ',');
                    gs.each(dss => {
                        nc.implementGeneric.push(this.TM.typeExpress(dss));
                    })
                }
                return nc;
            }
            return null;
        }
        private parseOperatorExpress(this: StatementParser, treeNode: ExpressTreeNode, extendTreeNode: Partial<ExpressTreeNode>): Express {
            var node = Util.Extend(treeNode, extendTreeNode);
            let operand = node.op.operand;
            let leftIsExists = node.leftExpress || node.leftUnitExpress && node.leftUnitExpress.length > 0;
            let rightIsExists = node.rightExpress || node.rightUnitExpress && node.rightUnitExpress.length > 0;
            let getLeftExpress = () => leftIsExists ? (node.leftExpress ? node.leftExpress : node.leftUnitExpress.last()) : null;
            let getRightExpress = () => rightIsExists ? (node.rightExpress ? node.rightExpress : node.rightUnitExpress.first()) : null;
            let op = node.op;
            let operator = node.operator;
            if (typeof operand == 'undefined') {
                /***括号["(","[","{"]*/
                return this.parseBracket(operator, op, getLeftExpress());
            }
            else {
                if (op.name == '-') {
                    //'-'比较特殊，需要判断前面有没有货，决定是负号还是减号
                    if (leftIsExists) operand = 2;
                    else operand = 1;
                }
                if (operand == 1) {
                    //单元运算符
                    if (op.name == '++' || op.name == '--') {
                        //如果左边有货，那么就是++i
                        if (leftIsExists) return this.parseUnary(operator, op, getLeftExpress(), null);
                        //如果右边有货i++
                        else return this.parseUnary(operator, op, null, getRightExpress())
                    }
                    else return this.parseUnary(operator, op, getLeftExpress(), getRightExpress());
                }
                else if (operand == 2) {
                    //二元运算符
                    return this.parseBinary(operator, op, getLeftExpress(), getRightExpress());
                }
                else if (operand == 3) {
                    //三元运算符
                    // return this.parseTernary(operator, op, getLeftExpress(), getRightExpress());
                }
            }
            console.log('not found ', node);
            return null;
        }
        /***三元运算符 */
        private parseTernary(this: StatementParser, left: {
            operator: {
                operator: List<Token>;
                op: OperatorPrecedence;
            };
            lefts: List<Express>;
            rights: List<Express>;
        }, right: {
            operator: {
                operator: List<Token>;
                op: OperatorPrecedence;
            };
            lefts: List<Express>;
            rights: List<Express>;
        }): Express {
            // var token = operator.eq(0);
            /**
             * ?:是所有基本运算符中优先级最低的，所以最终会相爱在一起 
             * */
            var te = new TernaryExpress();
            te.ref(left.operator.operator);
            te.set('condition', left.lefts.first());
            te.set('trueExpress', left.rights.first());
            te.set('falseExpress', right.rights.first())
            return te;
        }
        /***单元运算符 */
        private parseUnary(this: StatementParser, operator: List<Token>, op: OperatorPrecedence, left: Express, right: Express): Express {
            if (left == null && right == null) {
                this.onError(new Error(`单目运算符${op.name}使用错误`), operator.eq(0));
                return;
            }
            switch (op.name) {
                case '@':
                    var at = new AtExpress();
                    at.ref(operator);
                    at.set('at', right);
                    return at;
                    break;
                case '-':
                    if (left instanceof Constant && left.isNumber) {
                        left.value = (0 - left.value);
                        return left;
                    }
                    else {
                        var un = new UnaryExpress();
                        un.ref(operator);
                        un.operator = op.name;
                        un.set('express', left ? left : right);
                        un.direction = left ? true : false;
                        return un;
                        break;
                    }
                case '++':
                case '--':
                case '!':
                    var un = new UnaryExpress();
                    un.ref(operator);
                    un.operator = op.name;
                    un.set('express', left ? left : right);
                    un.direction = left ? true : false;
                    return un;
                    break;
                case '...':
                    var sp = new SpreadExpress();
                    sp.ref(operator);
                    sp.set('express', right);
                    return sp;
                    break;
                case 'new':
                    var nc = new NewCallExpress();
                    nc.ref(operator);
                    nc.set('caller', right);
                    return nc;
                case '~~':
                    var co = new Constant();
                    nc.ref(operator);
                    co.value = null;
                    if (right instanceof NameCall) co.constantType = TypeExpress.create({ name: right.name });
                    return co;
                    break;
            }
            return null;
        }
        /****二元运算符 */
        private parseBinary(this: StatementParser, operator: List<Token>, op: OperatorPrecedence, left: Express, right: Express): Express {
            if (left == null || right == null) {
                this.onError(new Error(`二元运算符${op.name}使用错误`), operator.first());
                return;
            }
            switch (op.name) {
                case "+=":
                case '-=':
                case '*=':
                case '**=':
                case '/=':
                case '&&=':
                case '||=':
                case '%=':
                    var assign = new AssignExpress();
                    assign.ref(operator);
                    assign.set('left', left);
                    assign.set('right', right);
                    assign.operator = op.name;
                    return assign;
                    break;
                case '+':
                case '-':
                case '&&':
                case '||':
                case '*':
                case '**':
                case '%':
                case '/':
                case '??':
                case 'as':
                case 'is':
                case 'and':
                case 'xor':
                case 'or':
                case 'nas':
                case 'nis':
                case 'nand':
                case 'nxor':
                case 'nor':
                case '..':
                case '>':
                case '<':
                case '>=':
                case '<=':
                case '!=':
                case '==':
                    var binary = new BinaryExpress();
                    binary.ref(operator);
                    binary.set('left', left);
                    binary.set('right', right);
                    binary.operator = op.name;
                    return binary;
                    break;
                case '.':
                case '?.':
                    var oa = new ObjectCallExpress();
                    oa.ref(operator);
                    oa.set('caller', left);
                    oa.set('key', right);
                    oa.operator = op.name;
                    return oa;
                    break;
            }
            return null;
        }
        /****括号运算，有left的说明是某个调用（如方法，否则为括号运算符） */
        private parseBracket(this: StatementParser, operator: List<Token>, op: OperatorPrecedence, left: Express): Express {
            if (!operator.eq(1)) {
                this.onError(new Error(`没有找到符号${op.name}的另一伴`), operator.first())
                return;
            }
            if (op.name == '[') {
                if (left) {
                    var ac = new ArrayCallExpress();
                    ac.ref(operator.find(x => x.flag == '['));
                    ac.set('caller', left);
                    ac.set('arrayIndex', this.TM.express(operator.first().childs));
                    return ac;
                }
                else {
                    return this.TM.dataExpress(new List(operator.first()));
                }
            }
            else if (op.name == '(') {
                if (left) {
                    var oe = new MethodCallExpress();
                    oe.ref(operator.find(x => x.flag == '('));
                    oe.set('caller', left);
                    oe.set('argements', operator.first().childs.split(x => x.flag == ',').toArray(x => this.TM.express(x)));
                    return oe;
                }
                else {
                    var be = new BracketExpress();
                    be.ref(operator.find(x => x.flag == '('));
                    be.set('express', this.TM.express(operator.first().childs));
                    return be;
                }
            }
            else if (op.name == '{') {
                if (!left) {
                    try {

                        return this.TM.dataExpress(new List(operator.first()));
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                }
            }
            return null;
        }
        /**
         * 优先级比较
         */
        private comparePrecedence(this: StatementParser, nearSymbols: [OperatorPrecedence, OperatorPrecedence]): boolean {
            let [leftOperatorPrecedence, rightOperatorPrecedence] = nearSymbols;
            if (leftOperatorPrecedence.name == rightOperatorPrecedence.name) {
                /**感叹运算符可以叠加 */
                if (leftOperatorPrecedence.operand == 1 && new List('!').exists(leftOperatorPrecedence.name)) return false;
                return true;
            }
            return leftOperatorPrecedence.precedence >= rightOperatorPrecedence.precedence;
        }
    }
}