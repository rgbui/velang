
namespace Ve.Lang {

    /**
     * 操作符也可以是关键词 as is
     * 
     */

    /***
     * 三元运算符
     */
    export class TernaryExpress extends Express {
        type = NodeType.ternary;
        trueExpress: Express;
        falseExpress: Express;
        condition: Express;
        inferType() {
            /**
             * 如果trueExpress类型继承于falseExpress类型，那么返回的类型falseExpress
             *  */

            if (TypeExpress.typeIsEqual(this, this.trueExpress.inferType(), this.falseExpress.inferType(), true)) return this.falseExpress.inferType();
            else return this.trueExpress.inferType();
        }
    }
    /***
     * 一元运算符
     */
    export class UnaryExpress extends Express {
        type = NodeType.unary;
        operator: string;
        express: Express;
        /*运算方向，向左为true !true */
        direction: boolean = true;
        inferType() {
            return this.express.inferType();
        }
    }
    /****特指小括号 */
    export class BracketExpress extends Express {
        type = NodeType.bracket;
        express: Express;
        inferType() {
            return this.express.inferType();
        }
    }
    /***
     * 二元运算符
     */
    export class BinaryExpress extends Express {
        type = NodeType.binary;
        operator: string;
        left: Express;
        right: Express;
        inferType() {
            var it = this.cache('inferType');
            if (it) return it;
            var op = InferType.InferTypeOperatorBinaryExpress(this);
            if (!op) console.log(`not found binary express,operator:${this.operator}`, this.left, this.right);
            it = op.returnType;
            this.cache('inferType', it);
            return it;
        }
    }
    export class AssignExpress extends Express {
        type = NodeType.assign;
        operator: string;
        left: Express;
        right: Express;
        inferType() {
            return this.left.inferType();
        }
    }
    export class SpreadExpress extends Express {
        type = NodeType.spread;
        express: Express;
        inferType() {
            return this.express.inferType();
        }
    }
}