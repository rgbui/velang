
///<reference path='infer.binary.ts'/>
///<reference path='infer.objectReferenceProperty.ts'/>
///<reference path='infer.data.ts'/>
///<reference path='infer.statement.ts'/>
///<reference path='../../util/common.ts'/>
///<reference path='../ast.visitor.ts'/>



namespace Ve.Lang {
    export enum StatementReferenceKind {
        DeclareVariable,
        DeclareFun,
        FunArgs,
        currentClassMethodArgs,
        outerClass,
        outerClassProperty
    }
    export class StatementReference {
        constructor(kind?: StatementReferenceKind, statement?: Statement) {
            if (typeof kind != typeof undefined)
                this.kind = kind;
            if (typeof statement != typeof undefined)
                this.referenceStatement = statement;
        }
        public kind: StatementReferenceKind
        public referenceStatement: Statement;
        public target: any;
    }
    /**
     * 
     * 对当前的节点类型进行检测与推断
     * 
     **/

    export var Infer: Accepter<InferFactory, void> = {
        declareVariable(this: AstVisitor<void>, express: DeclareVariable) {
            if (typeof express.infer.expressType == typeof undefined) {
                if (typeof express.variableType != typeof undefined) {
                    express.infer.expressType = express.variableType;
                }
                else {
                    if (typeof express.value != typeof undefined) {
                        this.accept(express.value);
                        if (typeof express.value.infer.expressType != typeof undefined) {
                            express.infer.expressType = express.value.infer.expressType;
                        }
                        else {
                            this.error(`无法取得声明的变量${DeclareVariable.name}表达式类型`);
                        }
                    }
                    else {
                        this.error(`无法确定声明的变量${DeclareVariable.name}类型`);
                    }
                }
            }
            this.next(express);
        },
        /**查询数组的引用来源 */
        arrayIndex(this: AstVisitor<void>, express: ArrayIndexExpression) {
            if (typeof express.name == 'string' && typeof express.infer.referenceStatement == typeof undefined) {
                var reference = Statement.search(express, express.name);
                if (reference) express.infer.referenceStatement = reference;
            }
            express.indexExpress.infer.requireExpressType = new VeArray(TypeExpression.createUnitType('int'));
        },
        /**查询变量的引用来源* */
        variable(this: AstVisitor<void>, express: Variable) {
            var reference = Statement.search(express, express.name);
            if (reference)
            {
                express.infer.referenceStatement = reference;
                if (typeof express.infer.expressType == typeof undefined) {
                    switch (express.infer.referenceStatement.kind) {
                        case StatementReferenceKind.FunArgs:
                        case StatementReferenceKind.currentClassMethodArgs:
                            var target = express.infer.referenceStatement.target as Parameter;
                            express.infer.expressType = target.parameterType || (target.default ? target.default.valueType : undefined);
                            if (typeof express.infer.expressType == typeof undefined) {
                                this.error(`${(express.infer.referenceStatement.referenceStatement as FunStatement | ClassProperty).name}方法参数${target.key}没有声明类型`);
                            }
                            break;
                        case StatementReferenceKind.outerClassProperty:
                            var cp: ClassProperty = express.infer.referenceStatement.referenceStatement as ClassProperty;
                            express.infer.expressType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                            if (typeof express.infer.expressType == typeof undefined) {
                                this.error(`${(express.infer.referenceStatement.referenceStatement as FunStatement | ClassProperty).name}方法参数${target.key}没有声明类型`);
                            }
                            break;
                    }
                }
            }
            else {
                this.error(`变量${express.name}没有声明`);
            }
        }
    }
    applyExtend(Infer, Infer$Statement, Infer$Binary, Infer$ObjectReferenceProperty, Infer$Data)

    export class InferFactory extends AstVisitor<void>{
        accepter = Infer;
    }
}