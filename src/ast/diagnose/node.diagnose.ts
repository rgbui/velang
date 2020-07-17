namespace Ve.Lang {

    export class NodeDiagnose {

        program(node: Statement) { }
        package(node: Statement) { }
        use(node: Statement) { }
        $if(node: IFStatement) {
            if (!TypeExpress.typeIsEqual(node, node.ifCondition.inferType(), TypeExpress.create({ name: 'bool' })))
                throw Exception.create([ExceptionCode.conditionIsNotBool, node, '条件表达式类型不是bool值']);
            node.elseIFConditions.each(ec => {
                if (!TypeExpress.typeIsEqual(node, ec.inferType(), TypeExpress.create({ name: 'bool' })))
                    throw Exception.create([ExceptionCode.conditionIsNotBool, node, '条件表达式类型不是bool值']);
            })
        }
        while(node: WhileStatement) {
            if (!TypeExpress.typeIsEqual(node, node.condition.inferType(), TypeExpress.create({ name: 'bool' })))
                throw Exception.create([ExceptionCode.conditionIsNotBool, node, 'while条件表达式不是bool值']);
        }
        for(node: ForStatement) {
            if (!TypeExpress.typeIsEqual(node, node.condition.inferType(), TypeExpress.create({ name: 'bool' })))
                throw Exception.create([ExceptionCode.conditionIsNotBool, node, 'for条件表达式不是bool值']);
        }
        switch(node: Statement) { }
        when(node: WhenStatement) {
            node.whens.each(wh => {
                wh.value.each(va => {
                    if (!TypeExpress.typeIsEqual(va, va.inferType(), TypeExpress.create({ name: 'bool' })))
                        throw Exception.create([ExceptionCode.conditionIsNotBool, node, 'when条件表达式不是bool值']);
                })
            })
        }
        continue(node: Statement) { }
        break(node: Statement) { }
        return(node: Statement) { }
        $throw(node: Statement) { }
        try(node: Statement) { }
        class(node: ClassStatement) {
            /***检查方法如果是继承，那么与继承的方法类型否保持一致性 */
            if (node.extend) {

            }
            /****私有方法是不能被继承重载的 */

            /***继承的类是否为密封类 */
        }
        enum(node: Statement) {
            /***枚举的项的值是否有相同的 */
        }
        classProperty(node: Statement) {
            /****字段get是否为空参数 */
            /****字段set是否为空返回*/
        }
        classMethod(node: Statement) {
            /***检测方法里的返回类型是否唯一 */
            /****检测方法的返回类型和申明的返回类型是否兼容 */
        }
        classOperator(node: Statement) {
            /****检测操作符的参数个数*/
            /****操作符方法必须有返回值，不能为void */
        }
        fun(node: Statement) {
            /****同classMethod */
        }
        anonymousFun(node: Statement) {  /****同classMethod */ }
        'new'(node: Statement) {
            /***初始化的对象类是否存在 */
        }
        at(node: Statement) {
            /***检测at是否出现在类中 */
            var cm = node.closest(x => x instanceof ClassMethod);
            if (!cm) {
                throw Exception.create([ExceptionCode.syntaxError, node, '@只能在类方法中使用', {}])
            }
        }
        block(node: Statement) { }
        object(node: Statement) { }
        array(node: Statement) {
            /****检查数组里面的每一项，类型是否兼容，一致 */
        }
        objectCall(node: Statement) { }
        arrayCall(node: ArrayCallExpress) {
            /***检测调用进是否为集合类型，是不能支持[] */
            /***检查arrayIndex是否是数字，或者key呢 */
            if (TypeExpress.typeIsEqual(node, node.caller.inferType().unionType, TypeExpress.create({ name: "Array" }))) {
                if (!TypeExpress.typeIsEqual(node, node.arrayIndex.inferType(), TypeExpress.create({ name: 'int' }))) {
                    throw Exception.create([ExceptionCode.arrayIndexNotNumber, node, '数组索引项不为数字', {}])
                }
            }
        }
        nameCall(node: NameCall) {
            /****检测申明的变量名是否存在 */
            if (!(node.parent instanceof ObjectCallExpress)) {
                var ref = node.queryName(node.name);
                if (!ref) {
                    throw Exception.create([ExceptionCode.notDeclareVariable, node, '未找到变量名@{name}', { name: node.name }])
                }
            }
        }
        thisCall(node: Statement) {
            /***检测this是否出现在类中 */
            var cm = node.closest(x => x instanceof ClassMethod);
            if (!cm) {
                throw Exception.create([ExceptionCode.syntaxError, node, 'this关键词只能在类方法中使用', {}])
            }
        }
        superCall(node: Statement) {
            /***检测super是否应该出现在继承类中 */
            var cm = node.closest(x => x instanceof ClassMethod);
            if (!cm) {
                throw Exception.create([ExceptionCode.syntaxError, node, 'super关键词只能在类的方法中使用', {}])
            }
        }
        methodCall(node: Statement) { }
        constant(node: Statement) { }
        declareVariable(node: DeclareVariable) {
            /***申明的变量类型，与表达值的类型是否兼容一致*/
            if (node.value && node.declareType) {
                if (!TypeExpress.typeIsEqual(node, node.value.inferType(), node.declareType, true)) {
                    throw Exception.create([ExceptionCode.declareTypeNotEqual, node, '@{name}申明的类型和赋值的类型不一致', { name: node.name }])
                }
            }
        }
        stringTemplate(node: Statement) { }
        ternary(node: Statement) { }
        unary(node: Statement) { }
        binary(node: BinaryExpress) {
            /***检测当前的操作符是否存在 */
            var cp = InferType.InferTypeOperatorBinaryExpress(node);
            if (!cp) {
                throw Exception.create([ExceptionCode.notFoundOperator, node, '@{type}类型不支持操作符@{operator}', { type: node.left.inferType().toString(), name: node.operator }])
            }
            var right = cp.parameters.eq(1);
            if (!TypeExpress.typeIsEqual(node, node.right.inferType(), right.inferType(), true)) {
                throw Exception.create([ExceptionCode.declareTypeNotEqual, node, '操作符@{operator}支持的类型不兼容', { name: node.left.inferType() }])
            }
        }
        bracket(node: Statement) { }
        assign(node: Statement) { }
        type(node: Statement) { }
        parameter(node: Statement) { }
        spread(node: Statement) {
            /***展开的对象是否为object,array */
            /***展开符是否用在object,array中 */
        }
        emptyStatement(node: Statement) { }
    }
}