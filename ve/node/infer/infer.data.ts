
namespace Ve.Lang {


    export var Infer$Data: Accepter<InferFactory, void> = {
        $constant(express: Constant) {
            express.infer.expressType = express.valueType;
        },
        $arrowMethod(express: ArrowMethodExpression) {
            express.infer.expressType = new TypeExpression(TypeKind.fun);
            express.infer.expressType.args = express.args.map(x => {
                return {
                    key: x.key,
                    type: x.parameterType
                }
            });
            express.infer.expressType.returnType = express.returnType;
        },
        $array(express: ArrayExpression)
        {
            express.args.each(arg => this.accept(arg));
            express.infer.expressType = new TypeExpression(TypeKind.union);
            express.infer.expressType.unionType = TypeExpression.createUnitType('Array');
            var arrayType: TypeExpression;
            if (express.args.length>0)
            {
                arrayType = express.args.first().infer.expressType;
                for (let i = 1; i < express.args.length; i++) {
                    if (!TypeExpression.TypeIsAdaptive(express.args.eq(i).infer.expressType, arrayType, undefined, express)) {
                        arrayType = null;
                        break;
                    } 
                }
            }
            if (!arrayType) arrayType = TypeExpression.createUnitType('Any');
            express.infer.expressType.generics = new VeArray(arrayType);
        },
        $Object(express: ObjectExpression) {
            express.propertys.each(pro => this.accept(pro.value));
            express.infer.expressType = new TypeExpression(TypeKind.object);
            express.infer.expressType.props = express.propertys.map(x => {
                return {
                    key: x.key,
                    type: x.value.infer.expressType
                }
            })
        }
    }
}