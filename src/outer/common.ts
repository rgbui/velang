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
        var keyTypes = pickArgsFromCode(args);
        return keyTypes[0].type;
    }
    /***
     * 通过code去解析参数
     * example:
     * "a:int=2,b=3,c:string='ssss'"=>{ key: string, type: VeType }
     * 参数里面的值基本上都是常量
     * 
     */
    export function pickArgsFromCode(code: string): { key: string, type: VeType, rest?: boolean, optional?: boolean, value?: any }[] {
        var compiler = new Compiler();
        var exp = compiler.express(`(${code}):void->{}`).express as AnonymousFunExpress;
        var args = exp.parameters.map(x => {
            var value = x.default ? (x.default as Constant).value : undefined;
            return {
                rest: x.rest,
                key: x.name,
                optional: x.optional,
                value: value,
                type: TypeExpressToVeType(x.inferType())
            }
        }).asArray();
        compiler.dispose();
        return args;
    }
    /*
     * 通过数据代码去解析Object数据
     * example:
     *  "{a:'xxx',b:5,c:[]}"=>VeProp
     */
    export function pickVePropFromCode(code: string): VeProp {
        if (typeof code != 'string') return null;
        var compiler = new Compiler();
        var exp = compiler.express(code).express as Express;
        var vp = dataToVeProp(exp);
        compiler.dispose();
        return vp;
    }
    /*
    * 通过表达式和参数，去推断当前表达式的返回类型
    * 如果推断有错误，需要抛出来
    * "a+b",[{name:'a',type:'string',value:"xxx"},{name:'b',type:'string',value:'sss'}]=>infer VeType
    */
    export function inferExpressType(expressCode: string, args?: VeProp[], thisObjectArgs?: VeProp[]): VeType {
        if (typeof expressCode != 'string') expressCode = '';
        var compiler = new Compiler();
        var express = compiler.express(expressCode, args, thisObjectArgs).express;
        var expressType = express.inferType();
        compiler.dispose();
        return TypeExpressToVeType(expressType);
    }
    export function inferTypeFunType(funbodyCode: string, args?: VeProp[], thisObjectArgs?: VeProp[]): VeType {
        if (typeof funbodyCode != 'string') funbodyCode = '';
        var compiler = new Compiler();
        var cm = compiler.block(funbodyCode, args, thisObjectArgs).classMethod;
        return TypeExpressToVeType(cm.inferType());
    }
    /**
     * 判断当前表达式是否为常量表达式
     * @param express 
     */
    export function inferExpressIsConstant(express: string) {
        if (typeof express != 'string' && express) express = (express as any).toString();
        if (!express) return false;
        var compiler = new Compiler();
        var r = compiler.express(express);
        if (r.express instanceof Constant) return true;
        else return false;
    }
    /**
     * 判断当前表达式是否引用申明的参数，因为有些表达式可以写成"1+1"这种表达式并不是常量表达式
     * @param expressCode 
     * @param args 
     * @param thisObjectArgs 
     * 
     */
    export function inferExpressIsReferenceArgs(expressCode: string, args: VeProp[], thisObjectArgs?: VeProp[]) {
        if (typeof expressCode != 'string') expressCode = '';
        if (!(Array.isArray(args) && args.length > 0)) return false;
        var compiler = new Compiler();
        var express = compiler.express(expressCode, args, thisObjectArgs).express;
        var node = express.find(x => x instanceof NameCall && args.findIndex(g => g.text == x.name) > -1);
        if (node) return true;
        else return false;
    }
}