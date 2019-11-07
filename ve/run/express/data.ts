
namespace Ve.Lang.Run {

    export var Run$Data: Accepter<RunVisitor, void> = {
        constant(express: Constant) {
            var name = express.infer.expressType.name.toLowerCase();
            if (name == 'string' || name == 'number' || name == 'bool') {
                express.runResult.value = express.value;
            }
            else {
                express.runResult.value = { __$type: name, value: express.value };
            }
        },
        arrowMethod(express: ArrowMethodExpression) {
            express.returnType.runResult.value = { __$type: 'fun', caller: express };
        },
        array(express: ArrayExpression) {
            express.args.each(arg => this.accept(arg));
            express.runResult.value = express.args.map(arg => arg.runResult.value);
        },
        Object(express: ObjectExpression) {
            express.propertys.each(pro => this.accept(pro.value));
            express.runResult.value = {};
            express.propertys.each(pro => {
                express.runResult.value[pro.key] = pro.value.runResult.value;
            })
        },
        arrayIndex(node: ArrayIndexExpression) {
            this.accept(node.indexExpress);
        },
        declareVariable(express: DeclareVariable) {
            if (express.value) {
                this.accept(express.value);
                express.runResult.value = express.value.runResult.value;
            }
        },
        /**查询变量的引用来源* */
        variable(express: Variable)
        {
            if (typeof express.infer.referenceStatement != typeof undefined) {
                switch (express.infer.referenceStatement.kind) {
                    case StatementReferenceKind.FunArgs:
                    case StatementReferenceKind.currentClassMethodArgs:
                        /****获取当前参数的值*/
                        express.runResult.value = express.infer.referenceStatement.target.runResult.value;
                        break;
                    case StatementReferenceKind.outerClassProperty:
                        /***静态方法属性 */
                        var cp: ClassProperty = express.infer.referenceStatement.referenceStatement as ClassProperty;
                        if (cp.value) {
                            this.accept(cp.value);
                            express.runResult.value = cp.value.runResult.value;
                        }
                        else {
                            express.runResult.value = null;
                        }
                        break;
                }
            }

        }
    }
}