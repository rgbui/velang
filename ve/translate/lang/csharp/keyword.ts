namespace Ve.Lang.Transtate.csharp {
    // export var ifStatement: NodeTranstateTemplate = {
    //     type: StatementType.if,
    //     template: `if(@call(node.ifCondition)){@statement(node.ifStatement)}@for(var i=0;i<node.thenConditions.length;i++){
    //         else if(@call(node.thenConditions.eq(i))){@statement(node.thenConditions.eq(i))}
    //     }@if(node.elseStatement.length > 0){
    //          else{@statement(node.elseStatement)}
    //     }`
    // }
    // export var switchStatement: NodeTranstateTemplate = {
    //     type: StatementType.switch,
    //     template: `switch(@call(node.valueExpression)) { 
    //         @for(var i=0;i<node.caseStatements.length;i++){
    //              case @call(node.caseStatements.eq(i).value):
    //              @statement(node.caseStatements.eq(i).matchs)
    //              break;
    //         }
    //         @if(node.defaultStatement&&node.defaultStatement.length>0){
    //             default:
    //             @statement(node.defaultStatement)
    //         }
    //     }`
    // }
    // export var forStatement: NodeTranstateTemplate = {
    //     type: StatementType.for,
    //     template: `for(@call(node.initStatement);@call(node.condition);@call(nextStatement)){@statement(node.body)}`
    // }
    // export var whileStatement: NodeTranstateTemplate = {
    //     type: StatementType.while,
    //     template: `while(@call(node.condition)){@statement(node.body)}`
    // }
    // export var doWhileStatement: NodeTranstateTemplate = {
    //     type: StatementType.doWhile,
    //     template: `do{@statement(node.body)}while(@call(node.condition))`,
    // }
    // export var breakStatement: NodeTranstateTemplate = {
    //     type: StatementType.break,
    //     template: 'break;'
    // }
    // export var throwStatement: NodeTranstateTemplate = {
    //     type: StatementType.throw,
    //     template: `throw @call(node.expression)`
    // }
    // export var continueStatement: NodeTranstateTemplate = {
    //     type: StatementType.continue,
    //     template: `continue;`
    // }
    // export var returnStatement: NodeTranstateTemplate = {
    //     type: StatementType.return,
    //     template: `return @call(node.expression)`
    // }
    // export var tryCatchStatement: NodeTranstateTemplate = {
    //     type: StatementType.try,
    //     template: `try{@statement(node.tryStatement)}catch(@parameter(node.catchParameter)){@statement(node.catchStatement)}@if(node..finallyStatement.length > 0){
    //         {@statement(node.finallyStatement)}
    //     }`
    // }
}