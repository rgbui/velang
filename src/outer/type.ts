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
        props?: { key: string, viewText?: string, type: VeType }[],
        /***fun type */
        args?: { key: string, viewText?: string, type: VeType, value?: any }[],
        returnType?: VeType,
        /**generic type* */
        unionType?: VeType,
        generics?: VeType[]
    } |/**unit type */
        string;
    export function VePropToParameter(args: VeProp[]): string {
        return args.map(arg => {
            return `${arg.text}:${VeTypeToCode(arg.type)}`
        }).join(",")
    }
    export function VePropToCode(prop: VeProp): string {
        if (typeof prop.type == 'string' && prop.type.toLowerCase() != 'object' && prop.type.toLowerCase() != 'array') {
            var pt = prop.type.toLowerCase();
            switch (pt) {
                case 'int':
                case 'double':
                case 'number':
                case 've.core.int':
                case 've.core.number':
                case 've.core.double':
                    if (typeof prop.value != 'undefined' && prop.value != null) return prop.value.toString();
                    else return '0';
                case 'string':
                case 've.core.string':
                    if (typeof prop.value == 'string')
                        return `"${prop.value ? prop.value.replace(/"/g, `\\"`) : ""}"`;
                    else if (typeof prop.value == 'undefined' || prop.value === null) return `""`;
                    else return `"${prop.value.toString()}"`;
                case 'bool':
                case 've.core.bool':
                    return prop.value == '是' || prop.value == true || prop.value == 'true' ? 'true' : 'false';
                case 'date':
                case 've.core.date':
                    if (typeof prop.value == 'number') prop.value = new Date(prop.value);
                    if (!prop.value) prop.value = new Date(0);
                    if (prop.value instanceof Date) {
                        return `${prop.value.getTime()}Date`;
                    }
                default:
                    if (prop.value == null || typeof prop.value == 'undefined') {
                        return `${prop.type}!!`;
                    }
                    else if (typeof prop.value == 'string') {
                        return `"${prop.value.replace(/"/g, `\\"`)}"${prop.type}`;
                    }
                    else if (typeof prop.value == 'number') {
                        return `${prop.value}${prop.type}`;
                    }
            }
        }
        var isArray = prop.type == 'array' || prop.type == 'Array' || prop.type == 'Ve.Core.Array';
        if (!isArray) {
            if (typeof prop.type == 'object')
                if (prop.type.unionType && (prop.type.unionType == 'Array' || prop.type.unionType == 'Ve.Core.Array' || prop.type.unionType == 'array')) {
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
        else if (prop.type == 'object' || prop.type == 'Object' || prop.type == 'Ve.Core.Object' || Array.isArray(prop.props)) {
            if (Array.isArray(prop.props))
                return `{${prop.props.map(x => {
                    return `"${x.text}":${VePropToCode(x)}`
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
            if (prop.type == 'Array' || prop.type == 'array' || prop.type == 'Ve.Core.Array') {
                return {
                    unionType: 'Array',
                    generics: [VePropToVeType(prop.props[0])]
                }
            }
            else if (prop.type == 'Object' || prop.type == 'object' || prop.type == 'Ve.Core.Object') {
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
            return `{${veType.props.map(x => `${x.key}:${VeTypeToCode(x.type)}`).join(",")}}`
        }
        else if (Array.isArray(veType.args)) {
            return `(${veType.args.map(x => `${x.key}:${VeTypeToCode(x.type)}`)})=>${veType.returnType ? VeTypeToCode(veType.returnType) : 'void'}`;
        }
        else if (veType.unionType) {
            if ((veType.unionType == 'Array' || veType.unionType == 'Ve.Core.Array') && veType.generics.length == 1) {
                return `${VeTypeToCode(veType.generics[0])}[]`
            }
            else {
                return `${VeTypeToCode(veType.unionType)}<${veType.generics.map(x => VeTypeToCode(x)).join(",")}>`;
            }
        }
    }
    export function TypeExpressToVeType(typeExpress: TypeExpress): VeType {
        if (typeExpress.name) return typeExpress.name;
        else if (typeExpress.unionType) {
            return {
                unionType: TypeExpressToVeType(typeExpress.unionType),
                generics: typeExpress.generics.map(gen => TypeExpressToVeType(gen)).asArray()
            }
        }
        else if (typeExpress.args) {
            return {
                args: typeExpress.args.toArray(x => {
                    return {
                        key: x.key,
                        type: TypeExpressToVeType(x.type)
                    }
                }).asArray(),
                returnType: TypeExpressToVeType(typeExpress.returnType)
            }
        }
        else if (typeExpress.props) {
            return {
                props: typeExpress.props.toArray(x => { return { key: x.key, type: TypeExpressToVeType(x.type) } })
                    .asArray()
            }
        }
    }
    export function dataToVeProp(data: Express): VeProp {
        var prop: VeProp;
        if (data instanceof Constant) {
            prop = {} as any;
            prop.type = TypeExpressToVeType(data.constantType);
            prop.value = data.value;
            return prop;
        }
        else if (data instanceof ObjectExpress) {
            prop = { props: [], type: TypeExpressToVeType(data.inferType()) } as any;
            data.items.each(pro => {
                var p = dataToVeProp(pro.value);
                p.text = pro.key;
                prop.props.push(p);
            })
            return prop;
        }
        else if (data instanceof ArrayExpress) {
            prop = { props: [], type: TypeExpressToVeType(data.inferType()) } as any;
            data.items.each(pro => {
                var p = dataToVeProp(pro);
                prop.props.push(p);
            })
            return prop;
        }
        else if (data instanceof DeclareVariable) {
            prop = {} as any;
            prop.type = TypeExpressToVeType(data.inferType());
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
            var prop: VeProp = { text: '', type: 'Date', value: jsObject.getTime() };
            return prop;
        }
        else if (jsObject === null || typeof jsObject == 'undefined') {
            var prop: VeProp = { text: '', type: 'Null', value: null };
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


/***
 *{"标题":"","分类":"boy","是否推送至公众号":false,"图片":"/资源/图片.png","文章内容":"","ID":""}
 *
 */