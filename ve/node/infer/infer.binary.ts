
namespace Ve.Lang {
    export var Infer$Binary: Accepter<InferFactory, void> = {
        $binary(express: BinaryExpression) {
            switch (express.kind) {
                case VeName.ASSIGN: //"=", 2)
                    this.accept(express.right);
                    if (typeof express.right.infer.expressType == typeof undefined) {
                        this.error(`无法确认运算符=右边的数据类型`);
                    }
                    else {
                        express.left.infer.requireExpressType = new VeArray(express.right.infer.expressType);
                        this.accept(express.left);
                        express.infer.expressType = express.right.infer.expressType
                    }
                    break;
                case VeName.ADD:
                    this.accept(express.left);
                    this.accept(express.right);
                    var leftTypeName = express.left.infer.expressType ? express.left.infer.expressType.name : '';
                    var rightTypeName = express.right.infer.expressType ? express.right.infer.expressType.name : '';
                    if (leftTypeName) leftTypeName = leftTypeName.toLowerCase();
                    if (rightTypeName) rightTypeName = rightTypeName.toLowerCase();
                    if (leftTypeName == 'string' || rightTypeName == 'string') {
                        express.infer.expressType = TypeExpression.createUnitType('string');
                    }
                    else if (leftTypeName == 'number' || rightTypeName == 'number') {
                        express.infer.expressType = TypeExpression.createUnitType('number');
                    }
                    else if (leftTypeName == 'int' || rightTypeName == 'int') {
                        express.infer.expressType = TypeExpression.createUnitType('int');
                    }
                    else {
                        express.infer.expressType = TypeExpression.createUnitType('string');
                    }
                    break;
                case VeName.SUB:// "-", 12)                                                    
                case VeName.MUL: //"*", 13)             
                case VeName.MOD:// "%", 13)                                                    
                case VeName.EXP:// "**", 14)                   
                case VeName.DIV:// "/", 13)
                case VeName.ASSIGN_ADD:// "+=", 2)                                             
                case VeName.ASSIGN_SUB:// "-=", 2)                                             
                case VeName.ASSIGN_MUL:// "*=", 2)                                             
                case VeName.ASSIGN_DIV:// "/=", 2)                                             
                case VeName.ASSIGN_MOD:// "%=", 2)                                             
                case VeName.ASSIGN_EXP: //"**=", 2)
                    express.left.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('int'), TypeExpression.createUnitType('number'));
                    express.right.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('int'), TypeExpression.createUnitType('number'));
                    this.accept(express.left);
                    this.accept(express.right);
                    var leftTypeName = express.left.infer.expressType ? express.left.infer.expressType.name : '';
                    var rightTypeName = express.right.infer.expressType ? express.right.infer.expressType.name : '';
                    if (leftTypeName) leftTypeName = leftTypeName.toLowerCase();
                    if (rightTypeName) rightTypeName = rightTypeName.toLowerCase();
                    if ((leftTypeName == 'int' || rightTypeName == 'number') && (rightTypeName == 'int' || rightTypeName == 'number')) {
                        if (leftTypeName == 'int' && rightTypeName == 'int') {
                            express.infer.expressType = TypeExpression.createUnitType('int');
                        }
                        else if (leftTypeName == 'number' || rightTypeName == 'number') {
                            express.infer.expressType = TypeExpression.createUnitType('number');
                        }
                    }
                    else {
                        this.error(`运算符${VeName[express.kind]}两边的数据类型为数字或整数`);
                        express.infer.expressType = TypeExpression.createUnitType('number');
                    }
                    break;
                case VeName.OR: //"||", 4)                                                     
                case VeName.AND: //"&&", 5)                              
                case VeName.XOR:// "&|", 7)
                case VeName.K_AND://   "and", KeyWordsType.operator);
                case VeName.K_OR:  // "or", KeyWordsType.operator);
                case VeName.K_XOR://   "xor", KeyWordsType.operator);
                    express.left.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('bool'));
                    express.right.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('bool'));
                    this.accept(express.left);
                    this.accept(express.right);
                    express.infer.expressType = TypeExpression.createUnitType('bool');
                    break;
                case VeName.K_EQ://   "equal", KeyWordsType.operator);
                case VeName.EQ:// "==", 9)                                                     
                case VeName.NE: //"!=", 9) 
                    this.accept(express.left);
                    express.right.infer.requireExpressType = new VeArray(express.left.infer.expressType);
                    this.accept(express.right);
                    express.infer.expressType = TypeExpression.createUnitType('bool');
                    break;
                case VeName.LT:
                case VeName.GT: //">", 10)                                                     
                case VeName.LTE:// "<=", 10)                                                   
                case VeName.GTE:// ">=", 10) 
                    express.left.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('int'), TypeExpression.createUnitType('number'));
                    express.right.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('int'), TypeExpression.createUnitType('number'));
                    this.accept(express.left);
                    this.accept(express.right);
                    express.infer.expressType = TypeExpression.createUnitType('bool');
                    break;
                case VeName.AS://   "as", KeyWordsType.operator);
                case VeName.IS://   "is", KeyWordsType.constant);  
                    break;
                case VeName.MATCH://  "match", KeyWordsType.operator);
                case VeName.CONTAIN://   "contain", KeyWordsType.operator);
                case VeName.STATR://   "start", KeyWordsType.operator);
                case VeName.END://   "end", KeyWordsType.operator);
                    express.left.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('string'));
                    express.right.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('string'));
                    this.accept(express.left);
                    this.accept(express.right);
                    express.infer.expressType = TypeExpression.createUnitType('bool');
                    break;
                default:
            }
        },
        $unary(express: UnaryExpression) {
            switch (express.kind) {
                case VeName.INC://"++", 0)                               
                case VeName.DEC://"--", 0) 
                    express.infer.expressType = TypeExpression.createUnitType('int');
                    express.exp.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('int'));
                    this.accept(express.exp);
                    break;
                case VeName.NOT://!
                    express.infer.expressType = TypeExpression.createUnitType('bool');
                    express.exp.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('bool'));
                    this.accept(express.exp);
                    break;
            }
        },
        $ternary(express: TernaryExpression) {
            express.where.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('bool'));
            this.accept(express.where);
            this.accept(express.trueCondition);
            express.falseCondition.infer.requireExpressType = new VeArray(express.trueCondition.infer.expressType);
            this.accept(express.falseCondition);
            express.infer.expressType = express.trueCondition.infer.expressType;
        }
    }

}