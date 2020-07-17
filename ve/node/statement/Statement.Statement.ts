namespace Ve.Lang {
    export class IfStatement extends Statement {
        private $ifCondition: Expression;
        get ifCondition(): Expression {
            return this.$ifCondition;
        }
        set ifCondition(val: Expression) {
            this.$ifCondition = val;
            this.append(this.$ifCondition);
        }
        private $ifStatement: VeArray<Statement>;
        get ifStatement(): VeArray<Statement> {
            return this.$ifStatement;
        }
        set ifStatement(val: VeArray<Statement>) {
            this.$ifStatement = val;
            this.append(this.$ifStatement);
        }
        private $elseStatement: VeArray<Statement>;
        get elseStatement(): VeArray<Statement> {
            return this.$elseStatement;
        }
        set elseStatement(val: VeArray<Statement>) {
            this.$elseStatement = val;
            this.append(this.$elseStatement);
        }
        thenConditions: VeArray<Statement> = new VeArray;
        thenStatements: VeArray<VeArray<Statement>> = new VeArray<VeArray<Statement>>();
        constructor() {
            super();
        }
        appendThen(exp: Expression, statement: VeArray<Statement>) {
            this.append(exp);
            this.append(statement);
            this.thenConditions.push(exp);
            this.thenStatements.push(statement);
        }
        public type = StatementType.if;
    }
    export class ForStatement extends Statement {
        private $condition: Statement;
        get condition(): Statement {
            return this.$condition;
        }
        set condition(val: Statement) {
            this.$condition = val;
            this.append(this.$condition);
        }
        private $nextStatement: Statement;
        get nextStatement(): Statement {
            return this.$nextStatement;
        }
        set nextStatement(val: Statement) {
            this.$nextStatement = val;
            this.append(this.$nextStatement);
        }
        private $initStatement: Statement;
        get initStatement(): Statement {
            return this.$initStatement;
        }
        set initStatement(val: Statement) {
            this.$initStatement = val;
            this.append(this.$initStatement);
        }
        private _body: VeArray<Statement> = new VeArray();
        public get body(): VeArray<Statement> {
            return this._body;
        }
        public set body(value: VeArray<Statement>) {
            this._body = value;
            this.append(value);
        }
        public type = StatementType.for;
    }
    export class ReturnStatement extends Statement {
        private $expression: Expression;
        get expression(): Expression {
            return this.$expression;
        }
        set expression(val: Expression) {
            this.$expression = val;
            this.append(this.$expression);
        }
        public type = StatementType.return;
    }
    export class ThrowStatement extends Statement {
        private $expression: Expression;
        get expression(): Expression {
            return this.$expression;
        }
        set expression(val: Expression) {
            this.$expression = val;
            this.append(this.$expression);
        }
        public type = StatementType.throw;
    }
    export class BreakStatement extends Statement {
        public type = StatementType.break;
    }
    export class ContinueStatement extends Statement {
        public type = StatementType.continue;
    }
    export class SwitchStatement extends Statement {
        caseStatements: VeArray<{ value: Expression, matchs: VeArray<Statement> }> = new VeArray();
        appendCaseStatement(value: Expression, matchs: VeArray<Statement>) {
            this.append(value);
            this.append(matchs);
            this.caseStatements.push({ value, matchs });
        }
        private $valueExpression: Expression;
        get valueExpression(): Expression {
            return this.$valueExpression;
        }
        set valueExpression(val: Expression) {
            this.$valueExpression = val;
            this.append(this.$valueExpression);
        }
        private $defaultStatement: VeArray<Statement>;
        get defaultStatement(): VeArray<Statement> {
            return this.$defaultStatement;
        }
        set defaultStatement(val: VeArray<Statement>) {
            this.$defaultStatement = val;
            this.append(this.$defaultStatement);
        }
        public type = StatementType.switch;
    }
    export class TryStatement extends Statement {
        private _tryStatement: VeArray<Statement> = new VeArray();
        public get tryStatement(): VeArray<Statement> {
            return this._tryStatement;
        }
        public set tryStatement(value: VeArray<Statement>) {
            this._tryStatement = value;
        }
        private _catchStatement: VeArray<Statement> = new VeArray();
        public get catchStatement(): VeArray<Statement> {
            return this._catchStatement;
        }
        public set catchStatement(value: VeArray<Statement>) {
            this._catchStatement = value;
        }
        public catchParameter: VeArray<Parameter> = new VeArray();
        private _finallyStatement: VeArray<Statement> = new VeArray();
        public get finallyStatement(): VeArray<Statement> {
            return this._finallyStatement;
        }
        public set finallyStatement(value: VeArray<Statement>) {
            this._finallyStatement = value;
        }
        public type = StatementType.try;
    }
    export class WhileStatement extends Statement {
        private $condition: Expression;
        get condition(): Expression {
            return this.$condition;
        }
        set condition(val: Expression) {
            this.$condition = val;
            this.append(this.$condition);
        }
        private _body: VeArray<Statement> = new VeArray();
        public get body(): VeArray<Statement> {
            return this._body;
        }
        public set body(value: VeArray<Statement>) {
            this._body = value;
            this.append(value);
        }
        public type = StatementType.while;
    }
    export class DoWhileStatement extends Statement {
        private $condition: Expression;
        get condition(): Expression {
            return this.$condition;
        }
        set condition(val: Expression) {
            this.$condition = val;
            this.append(this.$condition);
        }
        private _body: VeArray<Statement> = new VeArray();
        public get body(): VeArray<Statement> {
            return this._body;
        }
        public set body(value: VeArray<Statement>) {
            this._body = value;
            this.append(value);
        }
        public type = StatementType.doWhile;
    }
}