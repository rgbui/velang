

namespace Ve.Lang.Run {

    export var Run$Binary: Accepter<RunVisitor, void> = {
        binary(express: BinaryExpression) {
            if (express.kind == VeName.ASSIGN) {
                this.accept(express.right);
            }
            else {
                this.accept(express.left);
                this.accept(express.right);
            }
            switch (express.kind) {
                case VeName.ASSIGN: //"=", 2)
                    express.runResult.value = express.right.runResult.value;
                    break;
                case VeName.ADD:
                    express.runResult.value = express.left.runResult.value + express.right.runResult.value;
                    break;
                case VeName.SUB:// "-", 12)  
                    express.runResult.value = express.left.runResult.value - express.right.runResult.value;
                    break;
                case VeName.MUL: //"*", 13) 
                    express.runResult.value = express.left.runResult.value * express.right.runResult.value;
                    break;
                case VeName.MOD:// "%", 13) 
                    express.runResult.value = express.left.runResult.value % express.right.runResult.value;
                    break;
                case VeName.EXP:// "**", 14)  
                    express.runResult.value = Math.pow(express.left.runResult.value, express.right.runResult.value);
                    break;
                case VeName.DIV:// "/", 13) 
                    express.runResult.value = express.left.runResult.value / express.right.runResult.value;
                    break;
                case VeName.ASSIGN_ADD:// "+=", 2) 
                    express.runResult.value = express.left.runResult.value = express.left.runResult.value + express.right.runResult.value;
                    break;
                case VeName.ASSIGN_SUB:// "-=", 2) 
                    express.runResult.value = express.left.runResult.value = express.left.runResult.value - express.right.runResult.value;
                    break;
                case VeName.ASSIGN_MUL:// "*=", 2) 
                    express.runResult.value = express.left.runResult.value = express.left.runResult.value * express.right.runResult.value;
                    break;
                case VeName.ASSIGN_DIV:// "/=", 2)  
                    express.runResult.value = express.left.runResult.value = express.left.runResult.value / express.right.runResult.value;
                    break;
                case VeName.ASSIGN_MOD:// "%=", 2)  
                    express.runResult.value = express.left.runResult.value = express.left.runResult.value % express.right.runResult.value;
                    break;
                case VeName.ASSIGN_EXP: //"**=", 2) 
                    express.runResult.value = express.left.runResult.value = Math.pow(express.left.runResult.value, express.right.runResult.value);
                    break;
                case VeName.OR: //"||", 4)  
                case VeName.K_OR:  // "or", KeyWordsType.operator);
                    express.runResult.value = express.left.runResult.value || express.right.runResult.value;
                    break;
                case VeName.AND: //"&&", 5) 
                case VeName.K_AND://   "and", KeyWordsType.operator);  
                    express.runResult.value = express.left.runResult.value && express.right.runResult.value;
                    break;
                case VeName.XOR:// "&|", 7)  
                case VeName.K_XOR://   "xor", KeyWordsType.operator);
                    express.runResult.value = express.left.runResult.value != express.right.runResult.value;
                    break;
                case VeName.K_EQ://   "equal", KeyWordsType.operator);
                case VeName.EQ:// "==", 9)   
                    express.runResult.value = express.left.runResult.value == express.right.runResult.value;
                    break;
                case VeName.NE: //"!=", 9) 
                    express.runResult.value = express.left.runResult.value != express.right.runResult.value;
                    break;
                case VeName.LT:
                    express.runResult.value = express.left.runResult.value < express.right.runResult.value;
                    break;
                case VeName.GT: //">", 10)    
                    express.runResult.value = express.left.runResult.value > express.right.runResult.value;
                    break;
                case VeName.LTE:// "<=", 10)   
                    express.runResult.value = express.left.runResult.value <= express.right.runResult.value;
                    break;
                case VeName.GTE:// ">=", 10) 
                    express.runResult.value = express.left.runResult.value >= express.right.runResult.value;
                    break;
                case VeName.AS://   "as", KeyWordsType.operator);
                    // express.runResult.value = express.left.runResult.value != express.right.runResult.value;
                    break;
                case VeName.IS://   "is", KeyWordsType.constant);

                    break;
                case VeName.MATCH://  "match", KeyWordsType.operator);
                    express.runResult.value = (express.left.runResult.value as string).match(express.right.runResult.value);
                    break;
                case VeName.CONTAIN://   "contain", KeyWordsType.operator);
                    express.runResult.value = (express.left.runResult.value as string).indexOf(express.right.runResult.value) > -1;
                    break;
                case VeName.STATR://   "start", KeyWordsType.operator);
                    express.runResult.value = (express.left.runResult.value as string).startsWith(express.right.runResult.value);
                    break;
                case VeName.END://   "end", KeyWordsType.operator);
                    express.runResult.value = (express.left.runResult.value as string).endsWith(express.right.runResult.value);
                    break;
                default:
            }
        },
        unary(express: UnaryExpression) {
            switch (express.kind) {
                case VeName.INC://"++", 0) 
                    this.accept(express.exp);
                    if (express.arrow == UnaryArrow.left) {
                        express.runResult.value = express.exp.runResult.value + 1;
                    }
                    else {
                        express.runResult.value = express.exp.runResult.value;
                    }
                    express.exp.runResult.value += 1;
                    break;
                case VeName.DEC://"--", 0) 
                    if (express.arrow == UnaryArrow.left) {
                        express.runResult.value = express.exp.runResult.value - 1;
                    }
                    else {
                        express.runResult.value = express.exp.runResult.value;
                    }
                    express.exp.runResult.value -= 1;
                    break;
                case VeName.NOT:
                    this.accept(express.exp);
                    express.runResult.value = !express.exp.runResult.value;
                    break;
            }
        },
        ternary(express: TernaryExpression) {
            this.accept(express.where);
            this.accept(express.trueCondition);
            this.accept(express.falseCondition);
            if (express.where.runResult.value) {
                express.runResult.value = express.trueCondition.runResult.value;
            }
            else {
                express.runResult.value = express.falseCondition.runResult.value;
            }
        }
    }
}