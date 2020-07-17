

namespace Ve.Lang {
    import List = Util.List;
    export class StatementParser$Statement {
        $if(this: StatementParser) {
            var ifStatement = new IFStatement();
            /****
            * 
            *  if()  express;?|{ }
            *  [ else if()  express;?|{ } ]...
            *  else  express;?|{ }
            * 
            */
            var ifConditionTokens = this.eat(getStatementRegex('if.condition'));
            ifStatement.ref(ifConditionTokens.find(x => x.flag == 'if'));
            ifStatement.set('ifCondition', this.TM.pickExpressFromBracketOfStatement(ifConditionTokens));
            ifStatement.set('ifContent', this.eatBlockOrStatement());
            var elseIfConditions: List<Express> = new List;
            var elseIfContens: List<(List<Statement>) | Statement> = new List;
            while (true) {
                var index = this.index;
                if (this.match(getStatementRegex('if.elseCondition'))) {
                    var ifElseTokens = this.eat(getStatementRegex('if.elseCondition'));
                    elseIfConditions.push(this.TM.pickExpressFromBracketOfStatement(ifElseTokens));
                    elseIfContens.push(this.eatBlockOrStatement());
                }
                else break;
                if (index == this.index) {
                    throw new Error('else if match over time');
                }
            };
            ifStatement.set('elseIFConditions', elseIfConditions);
            ifStatement.set('elseIFContents', elseIfContens);
            if (this.match(getStatementRegex('if.else'))) {
                this.eat(getStatementRegex('if.else'));
                ifStatement.set('elseContent', this.eatBlockOrStatement());
            }
            return ifStatement;
        }
        $for(this: StatementParser) {
            var forStatement = new ForStatement();
            var conditionTokens = this.eat(getStatementRegex('for.condition'));
            forStatement.ref(conditionTokens);
            var brakctToken = conditionTokens.find(x => x.flag == '(');
            var ts = brakctToken.childs.split(x => x.flag == ';');
            ts.each((ds, i) => {
                if (i == 0) {
                    forStatement.set('init', this.TM.statement(ds));
                }
                else if (i == 2) {
                    forStatement.set('condition', this.TM.express(ds));
                }
                else if (i == 1) {
                    forStatement.set('post', this.TM.statement(ds));
                }
            })
            /***content */
            var bs = this.eatBlockOrStatement();
            forStatement.set('content', bs);
            return forStatement;
        }
        $while(this: StatementParser) {
            var whileStatement = new WhileStatement();
            var conditionTokens = this.eat(getStatementRegex('while.condition'));
            whileStatement.ref(conditionTokens.find(x => x.flag == 'while'));
            var brakctToken = conditionTokens.find(x => x.flag == '(');
            whileStatement.set('condition', this.TM.express(brakctToken.childs));
            whileStatement.set('content', this.eatBlockOrStatement());
            return whileStatement;
        }
        $when(this: StatementParser) {
            /****
            * when{
            *    express*->express;?|{ },
            *    ...
            *    default -> express;?|{ },
            * }
            * 
            */
            var whenStatement = new WhenStatement();
            var tokens = this.eat(getStatementRegex('when.statement'));
            whenStatement.ref(tokens.find(x => x.flag == 'when'));
            var brakctToken = tokens.find(x => x.flag == '{');
            var caseParser = this.createParser();
            caseParser.import(brakctToken.childs);
            var ws: List<{ value: List<Express>, content: List<Statement> }> = new List;
            while (true) {
                if (caseParser.eol) break;
                if (caseParser.match(/((?!\-\>).)+/)) {
                    var exps = caseParser.eat(/((?!\-\>).)+/);
                    var wv = { value: new List<Express>(), content: new List<Statement>() };
                    if (exps.exists(x => x.flag == 'default')) wv.value = new List();
                    else wv.value = exps.split(x => x.flag == ',').toArray(t => this.TM.express(t));
                    caseParser.eat(/\-\>/);
                    wv.content = caseParser.eatBlockOrStatement();
                    ws.push(wv);
                }
                else break;
            }
            whenStatement.set('whens', ws);
            return whenStatement;
        }
        $switch(this: StatementParser) {
            /***
             * switch(express){
             *    case express : express;?|{}
             *    default : express;?|{ }
             * }
             * 
             */
            var switchStatement = new SwitchStatement();
            var tokens = this.eat(getStatementRegex('switch.statement'));
            switchStatement.ref(tokens.find(x => x.flag == 'switch'));
            var brakctToken = tokens.find(x => x.flag == '(');
            switchStatement.set('value', this.TM.express(brakctToken.childs));
            var contentToken = tokens.find(x => x.flag == '{');
            var caseParser = this.createParser();
            caseParser.import(contentToken.childs);
            var ws: List<{ case: List<Express>, content: List<Statement> }> = new List;
            while (true) {
                if (caseParser.eol) break;
                if (caseParser.match(/@blank*case((?!:).)+/)) {
                    caseParser.eat(/@blank*case/);
                    var tokens = caseParser.eat(/((?!:).)+/);
                    var wv = { case: new List<Express>(), content: new List<Statement>() };
                    var parser = this.createParser();
                    parser.import(tokens);
                    wv.case = parser.commasExpress();
                    caseParser.eat(/@blank*\:@blank*/);
                    var contentTokens = caseParser.eat(/((?!case|default).)+/);
                    if (contentTokens) {
                        wv.content = this.TM.statement(contentTokens);
                    }
                    ws.push(wv);
                }
                else if (caseParser.match(/@blank*default@blank*\:/)) {
                    caseParser.eat(/@blank*default@blank*\:/);
                    var contentTokens = caseParser.eat(/((?!case|default).)+/);
                    if (contentTokens) {
                        switchStatement.set('default', this.TM.statement(contentTokens));
                    }
                }
                else break;
            }
            switchStatement.set('cases', ws);
            return switchStatement;
        }
        $try(this: StatementParser) {
            var tryStatement = new TryStatement();
            var tryTokens = this.eat(getStatementRegex('try.name'));
            tryStatement.ref(tryTokens.find(x => x.flag == 'try'));
            tryStatement.set('try', this.eatBlockOrStatement());
            var catchs: List<{ paramete?: Parameter, content: List<Statement> }> = new List;
            while (true) {
                var catchParameter = this.eat(getStatementRegex('try.catch'));
                if (catchParameter) {
                    catchs.push({
                        paramete: this.TM.parameters(catchParameter.find(x => x.flag == '(').childs).first(),
                        content: this.eatBlockOrStatement()
                    })
                }
                else break;
            }
            tryStatement.set('catchs', catchs);
            if (this.match(getStatementRegex('try.finally'))) {
                this.eat(getStatementRegex('try.finally'));
                tryStatement.set('finally', this.eatBlockOrStatement());
            }
            return tryStatement;
        }
        $break(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.break'));
            var b = new BreadkStatement();
            b.ref(tokens.find(x => x.flag == 'break'));
            return b;
        }
        $continue(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.continue'));
            var c = new ContinueStatement();
            c.ref(tokens.find(x => x.flag == 'continue'));
            return c;
        }
        $return(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.return'));
            var returnS = new ReturnStatement();
            returnS.ref(tokens.find(x => x.flag == 'return'));
            var exp=this.nextExpress();
            returnS.set('result', exp);
            return returnS;
        }
        $throw(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.throw'));
            var throwS = new ThrowStatement();
            throwS.ref(tokens.find(x => x.flag == 'throw'));
            throwS.set('throw', this.nextExpress());
            return throwS;
        }
    }
}



