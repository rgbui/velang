///<reference path='../../gen/lang.ts'/>
///<reference path='lib/core/Array.ts'/>
///<reference path='lib/core/common.ts'/>
///<reference path='lib/core/date.ts'/>
///<reference path='lib/core/number.ts'/>
///<reference path='lib/core/string.ts'/>

namespace Ve.Lang.Generate {
    import List = Util.List;
    export class GenerateNodeJS extends Ve.Lang.Generate.GenerateLang {
        program(node: Program, render: NodeRender) {
            node.packages.each(pa => {
                render.append(pa);
            })
            return `@childs()`
        }
        package(node: PackageStatement) {
            var content = '';
            var ns = List.asList(node.name.split(".")) as List<string>;
            ns.recursion((name: string, i: number, next: (i: number) => void) => {
                var pre = i > 0 ? ns.eq(i - 1) : '';
                content += (`var ${name};`);
                content += (`(function(${name}){`);
                next(i + 1);
                if (i == ns.length - 1) {
                    content += '@childs()'
                }
                if (pre) content += (`})(${name}=${pre}.${name}||(${pre}.${name}={}))`);
                else content += (`})(${name}||(${name}={}))`);
            })
            return content
        }
        use(node: UseStatement) {
            return `@if(node.aliasName)
        {
            var @node.aliasName=@node.packageName;
        }`
        }
        $if(node: IFStatement, render: NodeRender) {
            return `if(@express('ifCondition'))
            {
                @statement('ifContent')
            }
            @for(var i=0;i<node.elseIFConditions.length;i++)
            {
                else if(@express('elseIFConditions',i))
                {
                    @statement('elseIFContents',i)
                }
            }
            else{
                @statement('elseConent')
            }
            `;
        }
        $while(node: Statement, render: NodeRender) {
            return `while(@express("condition"))
            {
                 @statement('content')
            }`;
        }
        $for(node: Statement, render: NodeRender) {
            return `for(@statement("init");@express("condition");@statement("post"))
            {
                @statement('content')
            }`;
        }
        $switch(node: Statement, render: NodeRender) {
            return `
                @{
                    var valueExpress=express('value');
                }
                @for(var i=0;i<node.cases.length;i++)
                {
                    @{
                        var caseCode=node.cases.eq(i).case.map(x=>"("+valueExpress+"=="+express(x)")").join("||");
                        var content=node.cases.eq(i).content;
                    }
                    @if(i==0)
                    {
                        if(@caseCode)
                        {
                            @statement(content)
                        }
                    }
                    else if(i>0)
                    {
                        else if(@caseCode)
                        {
                            @statement(content)
                        }
                    }
                }
                @if(node.default.length>0)
                {
                     else{
                        @statement(node.default)
                     }
                }
            `;
        }
        when(node: Statement, render: NodeRender) {
            return `@for(var i=0;i<node.whens.length;i++)
            {
                @{
                    var caseCode=node.whens.eq(i).value?node.whens.eq(i).value.map(x=>express(x)).join("||"):"true";
                    var content=node.whens.eq(i).content;
                }
                 @if(i==0)
                 {
                    if(@caseCode)
                    {
                        @statement(content)
                    }
                 }
                 else if(i>0){
                    else if(@caseCode)
                    {
                        @statement(content)
                    }
                 }
            }`;
        }
        $continue(node: Statement) { return `continue;`; }
        $break(node: Statement) { return 'break;'; }
        $return(node: Statement) { return `return @express(node.express);`; }
        $throw(node: Statement) { return `throw @express(node.express);`; }
        $try(node: Statement) {
            return `try{ @statement(node.try) }catche(e)
            { 
                @for(var i=0;i<node.catchs.length;i++)
                {
                    @{
                        var ca=node.catchs.eq(i).paramete;
                        var cc=node.catchs.eq(i).content;
                    }
                    @if(i==0)
                    {
                        if(e instanceof @express(ca))
                        {
                             @statement(@cc)
                        }
                    }
                    else if(i>0){
                        else  if(e instanceof @express(ca))
                        {
                             @statement(@cc)
                        }
                    }
                }
            }
            @if(finally.length>0)
            {
                finally{@statement(node.finally) }
            }
            `;
        }
        enum(node: Statement) {
            return {
                template: `var @def(node.name);
            (function(@def(node.name)){
                @content(node);
            })(@def(node.name)=@(node.package.lastName).@def(node.name)||(@node.package.lastName@{}.@def(node.name)={ }))`,
                content(node) {
                    if (node instanceof EnumStatement) {
                        return node.items.map(pro => {
                            return `${this.def(node.name)}[${this.def(node.name)}["${pro.name}"]=${this.visitor.accept(pro.value)}]="${pro.name}";`;
                        }).join("");
                    }
                }
            }
        }
        $class(node: ClassStatement) {
            var lastName = node.package.lastName;
            return `class @def() @(node.extendName?"extends "+node.extendName:""){
                @childs()
            }
            ${lastName}.@def()=@def();
            `
        }
        classProperty(node: ClassProperty) {

        }
        classMethod(node: ClassMethod) {
            return `${node.isStatic ? 'static ' : ''}@(node.name)(@express(node.parameters))
                {
                    @childs(node.content)
                }`;
        }
        classOperator(node: ClassOperator) {
            return `static "${node.name}"(@express(node.parameters)){
                 @childs(node.content)
            }`
        }
        fun(node: Statement) {
            return `function @def()(@express(node.parameters))
            {
                @statement(node.content)
            }`
        }
        anonymousFun(node: AnonymousFunExpress) {
            return `(@express(node.parameters))=>{
                @statement(node.content)
            }`
        }
        objectCall(node: ObjectCallExpress, render: NodeRender) {
            return this.generateMethod(node, node, render);
        }
        $new(node: NewCallExpress, render: NodeRender) {
            (node.caller as MethodCallExpress).argements.each(exp => {
                render.append(exp);
            })
            return this.generateMethod((node.caller as MethodCallExpress).caller as ObjectCallExpress, node, render);
        }
        methodCall(node: MethodCallExpress, render: NodeRender) {
            node.argements.each(exp => {
                render.append(exp);
            })
            return this.generateMethod(node.caller as ObjectCallExpress, node, render);
        }
        at(node: AtExpress, render: NodeRender) {
            return this.generateAt(node, render);
        }
        block(node: BlockStatement) { return `{@statement(node.content)}` }
        object(obj: ObjectExpress, render: NodeRender) {
            obj.items.each(no => {
                render.append(no.value);
            });
            return {
                template: `{
                   @content()
            }`, content() {
                    return obj.items.toArray(x => {
                        return `${x.key}:` + this.express(x.value);
                    }).join(",")
                }
            };
        }
        array(node: ArrayExpress, render: NodeRender) {
            node.items.each(no => {
                render.append(no);
            })
            return `
    [
        @for(var i=0;i<node.items.length;i++)
        {  
            @express(node.items.eq(i))
            @if(i<node.items.length-1)
            {
                 ,
            }
        }
    ] 
        `
        }
        arrayCall(arrayCall: ArrayCallExpress) {
            return `@express("caller")[@express("arrayIndex")]`;
        }
        nameCall(node: NameCall) {
            return `@ref()`;
        }
        thisCall(node: Statement) { return 'this' }
        superCall(node: Statement) { return 'super' }
        constant(node: Constant) {
            var name = node.constantType.name;
            var nu = name.toLocaleLowerCase();
            if (nu.startsWith('ve.core')) nu = nu.substring('ve.core.'.length);
            if (nu == 'int' || nu == 'number' || nu == 'double') return node.value.toString();
            else if (nu == 'bool') return node.value.toString();
            else if (nu == 'null') return 'null';
            else if (nu == 'string') return "\"" + node.value.toString().replace(/"/g, "\"") + "\"";
            else if (typeof node.value == 'number' || typeof node.value == 'string') {
                if (nu == 'date') {
                    return `new Date(${node.value})`;
                }
                var cp = node.queryName(node.constantType.name, new Util.List(NodeType.class)) as ClassStatement;
                if (!cp) {
                    throw `not found create Constant Type class name ${node.constantType.name}`
                }
                var ctorFirstParameter = typeof node.value == 'string' ? TypeExpress.create({ name: 'string' }) : TypeExpress.create({ name: node.value.toString().indexOf('.') > -1 ? 'number' : 'int' })
                var pro = cp.propertys.find(x => x instanceof ClassMethod && x.isCtor && Ve.Lang.InferType.InterTypeListTypeFunTypeIsCompatibility(new Util.List(ctorFirstParameter), x));
                if (!pro) throw `not foun class ctor name:${cp.fullNames.first()}`;
                var value = typeof node.value == 'string' ? "\"" + node.value.toString().replace(/"/g, "\"") + "\"" : node.value.toString();
                return this.renderClassProp(pro.onlyName, { caller: value });
            }
        }
        declareVariable(node: DeclareVariable) {
            if (node.isConst) {
                return `const @def()@(node.value?"="+express(node.value):"")`
            }
            else return `var  @def()@(node.value?"="+express(node.value):"")`
        }
        stringTemplate(node: StringTemplateExpress, render: NodeRender) {
            node.strings.each(str => {
                render.append(str);
            });
            return {
                template: `@strings()`,
                strings() {
                    var strs = `\`${this.node.strings.map(str => {
                        if (str instanceof Constant) {
                            var name = str.constantType.name;
                            var nu = name.toLocaleLowerCase();
                            if (nu.startsWith('ve.core')) nu = nu.substring('ve.core.'.length);
                            if (nu == 'string') return str.value.toString().replace(/`/g, "\\`");
                        }
                        else return `\${${this.express(str)}}`
                    }).join("")}\``;
                    if (!this.node.stringType || this.node.stringType && this.node.stringType.name == 'string' || this.node.stringType.name.toLocaleLowerCase() == 've.core.string') {
                        return strs;
                    }
                    else {
                        return `new ${this.express(this.node.stringType)}(\`${strs}\`)`
                    }
                }
            }
        }
        ternary(node: TernaryExpress, render: NodeRender) {
            render.append(node.condition);
            render.append(node.trueExpress);
            render.append(node.falseExpress);
            return '(@express(node.condition))?(@express(node.trueExpress)):(@express(node.falseExpress))'
        }
        unary(node: UnaryExpress, render: NodeRender) {
            render.append(node.express);
            if (node.direction == true) return `(@node.operator@express(node.express))`;
            else return `(@express(node.express)@node.operator)`;
        }
        bracket(node: BracketExpress, render: NodeRender) {
            render.append(node.express);
            return `(@express(node.express))`
        }
        assign(node: AssignExpress, render: NodeRender) {
            render.append(node.left);
            render.append(node.right);
            return `@express(node.left)${node.operator}@express(node.right)`;
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
        type(node: Statement) { return ''; }
        parameter(pa: Parameter) { return `@(node.rest?"...":"")@def(node.name)@(node.default?"="+express(node.default):"")` }
        spread(node: Statement) { return `...@express(node.express)`; }
        emptyStatement(node: Statement) { return ';'; }
        /****
         * 
         * 
         */
    }
    export var nodejsGenerate = new GenerateNodeJS();
    nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genArray);
    nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genCommon);
    nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genDate);
    nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genNumber);
    nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genString);
}