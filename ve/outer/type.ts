


namespace Ve.Lang.Outer {

    /***对外传输的数据或类型 */
    export type VeProp = {
        text: string,
        type: VeType,
        value?: any,
        props?: VeProp[]
    };
    export type VeType = {
        /***object type */
        props?: { key: string, type: VeType }[],
        /***enum type */
        options?: { key: string, value: number | string }[],
        /***fun type */
        args?: { key: string, type: VeType, value: any }[],
        returnType?: VeType,
        returns?: { key: string, type: VeType }[],
        /**generic type* */
        unionType?: VeType,
        generics?: VeType[],
        /**value type */
        valueType?: { type: VeType, value: any },
        /**types */
        types?: VeType[]
    } |/**unit type */
        string;
    export function VePropToParameter(args: VeProp[]): string {
        return args.map(arg => {
            return `${arg.text}:${VeTypeToCode(arg.type)}`
        }).join(",")
    }
    function toUnitValue(value: string, type: string) {
        if (typeof value == 'string') {
            if (value.endsWith('/' + type)) {
                return value;
            }
            else {
                value = value.replace(/\//g, "\\/");
                if (value == '') value = ' ';
                return `/${value}/${type}`;
            }
        }
        else {
            return `/ /${type}`;
        }
    }
    export function VePropToCode(prop: VeProp): string {
        if (typeof prop.type == 'string' && prop.type.toLowerCase() != 'object' && prop.type.toLowerCase() != 'array') {
            var pt = prop.type.toLowerCase();
            switch (pt) {
                case 'int':
                case 'number':
                    if (typeof prop.value != 'undefined' && prop.value != null) return prop.value.toString();
                    else return '0';
                case 'string':
                    return `'${prop.value || ""}'`;
                case 'bool':
                    return prop.value == '是' || prop.value == true || prop.value == 'true' ? 'true' : 'false';
                case 'date':
                case 'time':
                    if (typeof prop.value == 'number') prop.value = new Date(prop.value);
                    if (!prop.value) prop.value = new Date();
                    if (prop.value instanceof Date) {
                        return `/${prop.value.getFullYear()}-${prop.value.getMonth() + 1}-${prop.value.getDate()} ${prop.value.getHours()}:${prop.value.getMinutes()}:${prop.value.getSeconds()}/date`;
                    }
                    return toUnitValue(prop.value, prop.type);
                case 'point':
                    if (typeof prop.value == 'object') {
                        return `/(${prop.value.x},${prop.value.y})/point`
                    }
                    break;
                default:
                    return `'${prop.value || ""}'`;
            }
        }
        var isArray = prop.type == 'array' || prop.type == 'Array';
        if (!isArray) {
            if (typeof prop.type == 'object')
                if (prop.type.unionType && (prop.type.unionType == 'Array' || prop.type.unionType == 'array')) {
                    isArray = true;
                }
        }
        if (isArray) {
            if (Array.isArray(prop.props)) {
                return `[${prop.props.map(pro => {
                    return VePropToCode(pro);
                }).join(",")}]`
            }
            else if (typeof prop.value == 'string') {
                return prop.value;
            }
            else if (Array.isArray(prop.value)) {
                //说明传递的值是js数组，那么理论上讲是需要将js数组转成ve语言的
                var vp = jsObjectToVeProp(prop.value);
                return `[${vp.props.map(pro => {
                    return VePropToCode(pro);
                }).join(",")}]`
            }
        }
        else if (prop.type == 'object' || prop.type == 'Object' || Array.isArray(prop.props)) {
            if (Array.isArray(prop.props))
                return `{${prop.props.map(x => {
                    return `'${x.text}':${VePropToCode(x)}`
                })}}`
            else if (typeof prop.value == 'string') {
                return prop.value;
            }
        }
        else if (typeof prop.type == 'object' && Array.isArray(prop.type.args)) {
            if (typeof prop.value == 'string')
                return `fun(${prop.type.args.map(x => `${x.key}:${VeTypeToCode(x.type)}`)}){${prop.value}\n}`
        }
    }
    export function VePropToVeType(prop: VeProp): VeType {
        if (prop.props && prop.props.length > 0) {
            if (prop.type == 'Array' || prop.type == 'array') {
                return {
                    unionType: 'Array',
                    generics: [VePropToVeType(prop.props[0])]
                }
            }
            else if (prop.type == 'Object' || prop.type == 'object') {
                return {
                    props: prop.props.map(pro => {
                        return {
                            key: pro.text,
                            type: VePropToVeType(pro)
                        }
                    })
                }
            }
        }
        else {
            return prop.type;
        }
    }
    export function VeTypeToCode(veType: VeType) {
        if (typeof veType == 'string') return veType;
        else if (Array.isArray(veType.props)) {
            return `{${veType.props.map(x => `${x.key}:${this.VeTypeToCode(x.type)}`).join(",")}}`
        }
        else if (Array.isArray(veType.options)) {
            return `|${veType.options.map(x => `${x.key}${x.value ? `=${x.value}` : ''}`).join(",")}|`
        }
        else if (Array.isArray(veType.args)) {
            return `(${veType.args.map(x => `${x.key}:${this.VeTypeToCode(x.type)}`)})=>${veType.returnType ? this.VeTypeToCode(veType.returnType) : 'void'}`;
        }
        else if (veType.unionType) {
            if (veType.unionType == 'Array' && veType.generics.length == 1) {
                return `${this.VeTypeToCode(veType.generics[0])}[]`
            }
            else {
                throw 'not identify union type:' + veType.unionType
            }
        }
    }
    export function TypeExpressionToVeType(typeExpression: TypeExpression): VeType {
        if (typeExpression) {
            switch (typeExpression.kind) {
                case TypeKind.unit:
                    return typeExpression.name
                case TypeKind.object:
                    return {
                        props: typeExpression.props.map(x => {
                            return {
                                key: x.key,
                                type: TypeExpressionToVeType(x.type)
                            }
                        }) as any
                    }
                case TypeKind.fun:
                    return {
                        args: typeExpression.args.map(x => {
                            return {
                                key: x.key,
                                type: TypeExpressionToVeType(x.type)
                            }
                        }) as any
                    }
                case TypeKind.dic:
                    return {
                        options: typeExpression.options.map(x => x) as any
                    }
                case TypeKind.union:
                    return {
                        unionType: TypeExpressionToVeType(typeExpression.unionType),
                        generics: typeExpression.generics.map(gen => TypeExpressionToVeType(gen)) as any
                    }
            }
        }
        else {
            console.trace(typeExpression);
        }
        return 'unknow';
    }
    export function dataToVeProp(data: Expression): VeProp {
        var prop: VeProp;
        if (data instanceof Constant) {
            prop = {} as any;
            prop.type = TypeExpressionToVeType(data.valueType);
            prop.value = data.value;
            return prop;
        }
        else if (data instanceof ObjectExpression) {
            prop = { props: [], type: TypeExpressionToVeType(data.infer.expressType) } as any;
            data.propertys.each(pro => {
                var p = dataToVeProp(pro.value);
                p.text = pro.key;
                prop.props.push(p);
            })
            return prop;
        }
        else if (data instanceof ArrayExpression) {
            prop = { props: [], type: TypeExpressionToVeType(data.infer.expressType) } as any;
            data.args.each(pro => {
                var p = dataToVeProp(pro);
                prop.props.push(p);
            })
            return prop;
        }
        else if (data instanceof Variable) {
            prop = {} as any;
            if (data.infer.expressType)
                prop.type = TypeExpressionToVeType(data.infer.expressType);
            prop.text = data.name;
            return prop;
        }
    }
    export function jsObjectToVeProp(jsObject: Record<string, any>): VeProp {
        if (Array.isArray(jsObject)) {
            var prop: VeProp = { props: [], text: '', type: 'Array' };
            prop.props = jsObject.map(x => jsObjectToVeProp(x));
            return prop;
        }
        else if (jsObject instanceof Date) {
            var prop: VeProp = { text: '', type: 'date', value: jsObject.getTime() };
            return prop;
        }
        else if (jsObject == null || typeof jsObject == 'undefined') {
            var prop: VeProp = { text: '', type: 'null', value: null };
            return prop;
        }
        else if (typeof jsObject == 'object') {
            if (typeof jsObject.__ve_type == 'string') {
                //说明这是ve语言的类型用js表达的
                var prop: VeProp = { text: '', type: jsObject.__ve_type, value: jsObject.value };
                return prop;
            }
            else {
                var prop: VeProp = { props: [], text: '', type: 'object' };
                for (var n in jsObject) {
                    var keyProp = jsObjectToVeProp(jsObject[n]);
                    keyProp.text = n;
                    prop.props.push(keyProp);
                }
                return prop;
            }
        }
        else if (typeof jsObject == 'number') {
            return { text: '', type: 'number', value: jsObject };
        }
        else if (typeof jsObject == 'string') {
            return { text: '', type: 'string', value: jsObject };
        }
        else if (typeof jsObject == 'boolean') {
            return { text: '', type: 'bool', value: jsObject };
        }
    }
}