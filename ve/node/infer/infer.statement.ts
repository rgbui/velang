


namespace Ve.Lang {
    export var Infer$Statement: Accepter<InferFactory,void> = {
        return(statement: ReturnStatement) {
            this.accept(statement.expression);
            statement.infer.expressType = statement.expression.infer.expressType;
            this.next(statement);
        },
        continue(statement: ContinueStatement) {
            this.next(statement);
        },
        break(statement: BreakStatement) {
            this.next(statement);
        },
        context(statement: ClassContext) {
            if (statement.name == 'this') {
                statement.infer.expressType = TypeExpression.createUnitType((statement.closest(x => x instanceof ClassOrIntrfaceStatement) as ClassOrIntrfaceStatement).fullName);
            }
            else if (statement.name == 'super') {
                statement.infer.expressType = TypeExpression.createUnitType((statement.closest(x => x instanceof ClassOrIntrfaceStatement) as ClassOrIntrfaceStatement).fullName);
            }
        },
        if(statement: IfStatement) {
            this.accept(statement.ifCondition);
            statement.ifStatement.each(s => this.accept(s));
            statement.thenConditions.each((c, i) => {
                this.accept(c);
                statement.thenStatements.eq(i).each(s => this.accept(s));
            })
            statement.elseStatement.each(s => this.accept(s));
            this.next(statement);
        },
        for(statement: ForStatement) {
            this.accept(statement.initStatement);
            this.accept(statement.condition);
            this.accept(statement.next);
            statement.body.each(s => this.accept(s));
            this.next(statement);
        },
        while(statement: WhileStatement) {
            this.accept(statement.condition);
            statement.body.each(b => this.accept(b));
            this.next(statement);
        },
        doWhile(statement: DoWhileStatement) {
            statement.body.each(b => this.accept(b));
            this.accept(statement.condition);
            this.next(statement);
        },
        fun(statement: FunStatement) {
            statement.body.each(st => this.accept(st));
        },
        switch(statement: SwitchStatement) {
            this.accept(statement.valueExpression);
            statement.caseStatements.each(ca => {
                this.accept(ca.value);
                ca.matchs.each(m => this.accept(m));
            })
            statement.defaultStatement.each(d => this.accept(d));
            this.next(statement);
        },
        try(statement: TryStatement) {
            statement.tryStatement.each(t => this.accept(t));
            statement.catchStatement.each(s => this.accept(s));
            statement.finallyStatement.each(f => this.accept(f));
        },
        use(statement: UseStatement) {

        },
        package(statement: PackageStatement) {
            statement.body.each(b => this.accept(b));
        },
        class(statement: ClassOrIntrfaceStatement) {
            statement.body.each(b => this.accept(b));
        },
        classProperty(statement: ClassProperty) {
            statement.body.each(b => this.accept(b));
            statement.get.each(b => this.accept(b));
            statement.set.each(b => this.accept(b));
        }
    }
}