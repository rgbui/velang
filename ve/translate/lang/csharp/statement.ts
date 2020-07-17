

namespace Ve.Lang.Transtate.csharp {
    // export var _package: NodeTranstateTemplate = {
    //     type: StatementType.package,
    //     template: `@prev()@content(node)@next()`,
    //     content(express: PackageStatement) {
    //         var content = '';
    //         var ns = VeArray.asVeArray(express.name.split(".")) as VeArray<string>;
    //         ns.recursion((item: string, i: number, next: (i: number) => void) => {
    //             var pre = i > 0 ? ns.eq(i - 1) : '';
    //             content += (`var ${name};`);
    //             content += (`(function(${name}){`);
    //             next(i + 1);
    //             if (i == ns.length - 1) {
    //                 content += express.body.map(x => this.call(x)).join(";");
    //             }
    //             if (pre)
    //                 content += (`})(${name}=${pre}.${name}||(${pre}.${name}={}))`);
    //             else content += (`})(${name}||(${name}={}))`);
    //         })
    //         return content;
    //     }
    // }
    // export var useDeclaration: NodeTranstateTemplate = {
    //     type: StatementType.use,
    //     template: `@if(node.localName)
    //     {
    //         var @node.localName=@node.name;
    //     }
    //     @next()
    //     `
    // }
    // export var classDeclaration: NodeTranstateTemplate = {
    //     type: StatementType.class,
    //     template: `class @node.name @if(node.extendName) { extends @node.extendName }
    //     {
    //          @content(node)
    //     }
    //     @next()`,
    //     content(express: ClassOrIntrfaceStatement) {
    //         return express.body.map(x => this.call(x)).join(";");
    //     }
    // }
    // export var enumStatement: NodeTranstateTemplate = {
    //     type: StatementType.enum,
    //     template: `var @node.name;
    //     (function(@node.name){
    //         @content(node);
    //     })(@node.name=@node.package.lastName@{}.@node.name||(@node.package.lastName@{}.@node.name={ }))
    //     @next()
    //     `,
    //     content(express: EnumStatement) {
    //         return express.options.map(pro => {
    //             return `${express.name}[${express.name}["${pro.key}"]=${this.call(pro.value)}]="${pro.key}";`;
    //         })
    //     }
    // }
    // export var classProperty: NodeTranstateTemplate = {
    //     type: StatementType.classProperty,
    //     template: `@content(node)@next()`,
    //     content(express: ClassProperty) {
    //         if (express.kind == ClassPropertyKind.prop) {
    //             // return `${express.name}${express.value ? `=${this.call(express.value)}` : ''}`;
    //         }
    //         else if (express.kind == ClassPropertyKind.method) {
    //             return `${express.name}(${this.parameter(express.args)}){${this.statement(express.body)}}`;
    //         }
    //         else if (express.kind == ClassPropertyKind.field) {
    //             var code = '';
    //             if (express.get.length > 0) {
    //                 code += `get ${express.name}(){${express.get.map(b => this.call(b)).join(";")}}`
    //             }
    //             else {
    //                 code += `set ${express.name}(value){${express.set.map(b => this.call(b)).join(";")}}`;
    //             }
    //         }
    //     }
    // }
    // export var FunStatement: NodeTranstateTemplate = {
    //     type: StatementType.fun,
    //     template: `function @node.name@{}(@parameter(node.args)){@statement(node.body)}@next()`,
    // }
    // export var VariableStatement: NodeTranstateTemplate = {
    //     type: StatementType.declareVariable,
    //     template: `var @node.name@if(node.value){=@call(node.value)}@next()`,
    // }
}