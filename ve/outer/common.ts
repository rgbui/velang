namespace Ve.Lang.Outer {

    /*
     * 通过code解析ve类型
     * example:
     * "int"=>VeType
     * "{a:string,b:string}"=>VeType
     * 
     */
    export function pickVeTypeFromCode(code: string): VeType {
        var args = `a:${code}`;
        var keyTypes = this.pickArgsFromCode(args);
        return keyTypes.first().type;
    }
    /***
     * 通过code去解析参数
     * example:
     * "a:int=2,b=3,c:string='ssss'"=>{ key: string, type: VeType }
     * 
     */
    export function pickArgsFromCode(code: string): { key: string, type: VeType }[] {
        if (typeof code != 'string') code = '';
        var ast = new AstParser();
        var node = ast.compileExpress(`(${code})=>void`) as ArrowMethodExpression;
        var keyTypes: { key: string, type: VeType }[] = [];
        node.args.each(x => {
            keyTypes.push({ key: x.key, type: TypeExpressionToVeType(x.default ? x.default.valueType : x.parameterType) })
        })
        return keyTypes;
    }
    /*
     * 通过数据代码去解析Object数据
     * example:
     *  "{a:'xxx',b:5,c:[]}"=>VeProp
     */
    export function pickVePropFromCode(code: string): VeProp {
        if (typeof code != 'string') return null;
        var ast = new AstParser();
        var node = ast.compileExpress(code);
        return dataToVeProp(node);
    }
    /*
     * 获取表达式中申明的变量
     * example:
     * "def c=10;a+b+c",[{name:'a',type:'string',value:"xxx"},{name:'b',type:'string',value:'sss'}]
     * 
     */
    export function pickVePropFromExpress(expressCode: string, args: VeProp[]): VeProp[] {
        if (typeof expressCode != 'string') return [];
        var ast = new AstParser();
        var expressNode = ast.compileExpress(expressCode, args);
        var vs = expressNode.findAll(x => x instanceof Variable);
        var cs = expressNode.findAll(x => x instanceof Constant);
        return vs.map(x => dataToVeProp(x));
    }
    /*
     * 通过表达式和参数，去推断当前表达式的返回类型
     * 如果推断有错误，需要抛出来
     * "a+b",[{name:'a',type:'string',value:"xxx"},{name:'b',type:'string',value:'sss'}]=>infer VeType
     */
    export function inferExpressType(expressCode: string, args: VeProp[]): VeType {
        if (typeof expressCode != 'string') expressCode = '';
        var ast = new AstParser();
        let express = ast.compileExpress(expressCode, args);
        let expressType = (express.parent as ReturnStatement).infer.expressType;
        return TypeExpressionToVeType(expressType);
    }
}