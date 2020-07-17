///<reference path='../statement/Statement.ts'/>

namespace Ve.Lang {

    export class BinaryExpression extends Expression {
        public kind: VeName;
        public type: StatementType = StatementType.binary;
        private $left: Expression;
        get left(): Expression {
            return this.$left;
        }
        set left(val: Expression) {
            this.$left = val;
            this.append(this.$left);
        }
        private $right: Expression;
        get right(): Expression {
            return this.$right;
        }
        set right(val: Expression) {
            this.$right = val;
            this.append(this.$right);
        }
    }
    export enum UnaryArrow {
        left, right
    }
    export class UnaryExpression extends Expression {
        public kind: VeName;
        public arrow: UnaryArrow = UnaryArrow.right;
        public type: StatementType = StatementType.unary;
        private $exp: Expression;
        get exp(): Expression {
            return this.$exp;
        }
        set exp(val: Expression) {
            this.$exp = val;
            this.append(this.$exp);
        }
    }

    /*
     * 基本的数据变量
     * A: 'string'
     * B: null
     * C: number
     * D: true/false
     * 
     **/
    export class Constant extends Expression {
        public value: any;
        public type: StatementType = StatementType.constant;
        public valueType: TypeExpression;
    }
    export class TernaryExpression extends Expression {
        public name: VeName;
        public type: StatementType = StatementType.ternary;
        private _where: Expression;
        public get where(): Expression {
            return this._where;
        }
        public set where(value: Expression) {
            this._where = value;
            this.append(value);
        }
        private _trueCondition: Expression;
        public get trueCondition(): Expression {
            return this._trueCondition;
        }
        public set trueCondition(value: Expression) {
            this._trueCondition = value; this.append(value);
        }
        private _falseCondition: Expression;
        public get falseCondition(): Expression {
            return this._falseCondition;
        }
        public set falseCondition(value: Expression) {
            this._falseCondition = value; this.append(value);
        }
    }
    export class ArrayIndexExpression extends Expression {
        private _name: string | PropertyExpression;
        public get name(): string | PropertyExpression {
            return this._name;
        }
        public set name(value: string | PropertyExpression) {
            this._name = value;
            if (value instanceof Expression) this.append(value);
        }
        private _indexExpress: Expression;
        public get indexExpress(): Expression {
            return this._indexExpress;
        }
        public set indexExpress(value: Expression) {
            this._indexExpress = value;
        }
        public type = StatementType.arrayIndex;
    }
    export class Variable extends Expression {
        name: string;
        public type = StatementType.variable;
    }
    export class ArrowMethodExpression extends Expression {
        public args: VeArray<Parameter> = new VeArray();
        public type = StatementType.arrowMethod;
        public returnType: TypeExpression
        public body: VeArray<Statement> = new VeArray();
    }
    export class ArrayExpression extends Expression {
        private _args: VeArray<Expression> = new VeArray();
        public get args(): VeArray<Expression> {
            return this._args;
        }
        public set args(value: VeArray<Expression>) {
            this._args = value;
            this.append(value);
        }
        public type = StatementType.array;
    }
    export class ObjectExpression extends Expression {
        private _propertys: VeArray<{ key: string, value: Expression }> = new VeArray();
        public get propertys(): VeArray<{ key: string, value: Expression }> {
            return this._propertys;
        }
        public set propertys(value: VeArray<{ key: string, value: Expression }>) {
            this._propertys = value;
            value.each(v => {
                this.append(v.value);
            })
        }
        public type: StatementType = StatementType.Object;
    }
    export class Parameter extends Expression {
        key: string;
        default?: Constant;
        isParameter?: boolean;
        parameterType: TypeExpression;
        public type: StatementType = StatementType.parameter;
    }
}