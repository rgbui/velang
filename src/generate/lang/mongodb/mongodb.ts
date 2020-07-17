
///<reference path='../../gen/lang.ts'/>
///<reference path='lib/core/Array.ts'/>
///<reference path='lib/core/Common.ts'/>
///<reference path='lib/core/date.ts'/>
///<reference path='lib/core/Math.ts'/>
///<reference path='lib/core/number.ts'/>
///<reference path='lib/core/string.ts'/>

namespace Ve.Lang.Generate {
    /**
     *  https://docs.mongodb.com/manual/reference/command/nav-geospatial/
     */
    export class GenerateMongodb extends Ve.Lang.Generate.GenerateLang {
        at(node: AtExpress, render: NodeRender) {
            if (node.at instanceof NameCall) {
                render.append(node.at);
                return `"${this.paper.thisObjectName || 'this'}${render.ref((node.at as NameCall).name)}"`;
            }
        }
        nameCall(node: NameCall) {
            return `@ref()`;
        }
        constant(node: Constant) {
            var name = node.constantType.name;
            var nu = name.toLocaleLowerCase();
            if (nu.startsWith('ve.core')) nu = nu.substring('ve.core.'.length);
            if (nu == 'int' || nu == 'number' || nu == 'double') return `{$literal:${node.value}}`;
            else if (nu == 'bool') return node.value ? '{$literal:true}' : '{$literal:false}';
            else if (nu == 'null') return '{$literal:null}'
            else if (nu == 'string') return `{$literal:\"${node.value.replace(/"/g, '\\"')}\"}`;
            else if (typeof node.value == 'number' || typeof node.value == 'string') {
                if (nu == 'date') {
                    return `new Date(${node.value})`;
                }
            }
        }
        stringTemplate(node: StringTemplateExpress, render: NodeRender) {
            node.strings.each(str => {
                render.append(str);
            })
            return `{$concat:[${node.strings.map(str => {
                return render.express(str);
            }).join(",")}]}`
        }
        ternary(node: TernaryExpress, render: NodeRender) {
            render.append(node.condition);
            render.append(node.trueExpress);
            render.append(node.falseExpress);
            return `
                {
                    $cond: {
                      if:@express(node.condition),
                      then:@express(node.trueExpress),
                      else:@express(node.falseExpress)
                    }
                  }
               `
        }
        unary(node: UnaryExpress, render: NodeRender) {
            render.append(node.express);
            switch (node.operator) {
                case '++':
                    return `{$add:[@express(node.express),1]}`
                case '--':
                    return `{$add:[@express(node.express),-1]}`
                case '!':
                    return `{$not:@express(node.express)}`
            }
        }
        bracket(node: BracketExpress, render: NodeRender) {
            render.append(node.express);
            return `@express(node.express)`
        }
        binary(node: BinaryExpress, render: NodeRender) {
            render.append(node.left);
            render.append(node.right);
            var cp = InferType.InferTypeOperatorBinaryExpress(node);
            var obj = {
                caller: render.express(node.left)
            };
            obj[cp.parameters.first().name] = render.express(node.right);
            return this.renderClassProp(cp.onlyName, obj);
        }
        methodCall(node: MethodCallExpress, render: NodeRender) {
            node.argements.each(exp => {
                render.append(exp);
            })
            return this.generateMethod(node.caller as ObjectCallExpress, node, render);
        }
        object(obj: ObjectExpress, render: NodeRender) {
            obj.items.each(no => {
                render.append(no.value);
            });
            return {
                template: `{
                   @content()
            }`, content() {
                    return obj.items.toArray(x => {
                        return `"${x.key}":` + this.express(x.value);
                    }).join(",")
                }
            };
        }
    }
    export var generateMongodb = new GenerateMongodb();
    generateMongodb.import(Ve.Lang.Generate.mongodb.genArray);
    generateMongodb.import(Ve.Lang.Generate.mongodb.genCommon);
    generateMongodb.import(Ve.Lang.Generate.mongodb.genDate);
    generateMongodb.import(Ve.Lang.Generate.mongodb.genMath);
    generateMongodb.import(Ve.Lang.Generate.mongodb.genNumber);
    generateMongodb.import(Ve.Lang.Generate.mongodb.genString);
}