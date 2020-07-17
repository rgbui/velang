namespace Ve.Lang {
    import List = Util.List;
    export class StatementParser$Util {

        /****匹配方法返回类型和方法体 */
        matchFunTypeAndBody(this: StatementParser) {
            /****返回类型和方法体需要加以区分处理 */
            var returnType: TypeExpress;
            var content: List<Statement>;
            if (this.match(/@blank*\:/)) {
                this.eat(/@blank*\:/);
                //说明有类型
                returnType = this.$type();
            }
            /****fun content */
            if (this.match(/@blank*\{\}/)) {
                var tokens = this.eat(/@blank*\{\}/);
                var contentToken = tokens.find(x => x.flag == '{');
                content = this.TM.statement(contentToken.childs);
            }
            return { returnType, content }
        }
        decorateAndModify(this: StatementParser, tokens: List<Token>, statement: Statement) {
            var decorateTokens = this.TM.matchAll(getStatementRegex('decorate'), tokens);
            if (decorateTokens) {
                var decorates: List<DecorateStatement> = new List;
                decorateTokens.each(d => {
                    var node = this.TM.decorate(d);
                    decorates.push(node);
                    tokens = tokens.subtract(d);
                });
                statement.set('decorates', decorates);
            }
            var modifyTokens = this.TM.matchAll(getStatementRegex('modify'), tokens);
            if (modifyTokens) {
                var modifys: List<Modify> = new List;
                modifyTokens.each(d => {
                    d.each(dd => {
                        if (typeof Modify[dd.value] != 'undefined') {
                            var dv = dd.value as any;
                            modifys.push((Ve.Lang as any)['Modify'][dv]);
                        }
                    });
                    tokens = tokens.subtract(d);
                });
                (statement as any).modifys = modifys;
            }
            var genericTokens = this.TM.match(getStatementRegex('generic'), tokens);
            if (genericTokens) {
                var gs = this.TM.generics(genericTokens.find(x => x.flag == '<').childs);
                if (gs) {
                    statement.set('generics', gs);
                }
                tokens = tokens.subtract(genericTokens);
            }
            return tokens;
        }
    }
}