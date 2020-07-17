namespace Ve.Lang {
    import List = Util.List;
    export class StatementParser$Common {

        block(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.block'));
            var bs = new BlockStatement();
            var bracket = tokens.find(x => x.flag == '{');
            bs.ref(bracket);
            if (bracket) bs.set('content', this.TM.statement(bracket.childs));
            return bs;
        }
        /***提取空白符*/
        blank(this: StatementParser) {
            this.eatBlank();
        }
        /****吃掉空白的语句 */
        emptyStatement(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.emptyStatement'));
            var es = new EmptyStatement();
            es.ref(tokens);
            return es;
        }
    }
}