namespace Ve.Lang.Transtate.nodejs {

    export var accepter$statement: Accepter<VisitorLange, void> = {
        $if(express: IfStatement) {
            LangRender.create(express, {
                template: `if(@call(node.ifCondition)){@statement(node.ifStatement)}@for(var i=0;i<node.thenConditions.length;i++){
            else if(@call(node.thenConditions.eq(i))){@statement(node.thenConditions.eq(i))}
        }@if(node.elseStatement.length > 0){
             else{@statement(node.elseStatement)}
        }`
            })
        },
        switch(express: SwitchStatement) {
            LangRender.create(express, {
                template: `switch(@call(node.valueExpression)) { 
        @for(var i=0;i<node.caseStatements.length;i++){
             case @call(node.caseStatements.eq(i).value):
             @statement(node.caseStatements.eq(i).matchs)
             break;
        }
        @if(node.defaultStatement&&node.defaultStatement.length>0){
            default:
            @statement(node.defaultStatement)
        }
    }`
            })
        },
        for(express: ForStatement) {
            LangRender.create(express, {
                template: `for(@call(node.initStatement);@call(node.condition);@call(nextStatement)){@statement(node.body)}`
            })
        },
        $try(express: TryStatement) {
            LangRender.create(express, {
                template: `if(@call(node.ifCondition)){@statement(node.ifStatement)}@for(var i=0;i<node.thenConditions.length;i++){
            else if(@call(node.thenConditions.eq(i))){@statement(node.thenConditions.eq(i))}
        }@if(node.elseStatement.length > 0){
             else{@statement(node.elseStatement)}
        }`
            })
        },
        while(express: WhileStatement) {
            this.accept(express.condition);
            express.body.each(s => this.accept(s));
            LangRender.create(express, {
                template: `while(@call(node.condition)){@statement(node.body)}`
            })
        },
        doWhile(express: DoWhileStatement) {
            LangRender.create(express, {
                template: `do{@statement(node.body)}while(@call(node.condition))`
            })
        },
        break(express: BreakStatement) {
            LangRender.create(express, {
                template: 'break'
            })
        },
        throw(express: ThrowStatement) {
            this.accept(express.expression);
            LangRender.create(express, {
                template: `throw @call(node.expression)`
            })
        },
        continue(express: ContinueStatement) {
            LangRender.create(express, {
                template: `continue;`
            })
        },
        return(express: ReturnStatement) {
            this.accept(express.expression);
            LangRender.create(express, {
                template: `return @call(node.expression)`
            })
        }
    }
}