namespace Ve.Lang.Transtate.csharp {
    // export var binaryExpression: NodeTranstateTemplate = {
    //     type: StatementType.binary,
    //     template: `@content(node)`,
    //     content(statement: BinaryExpression) {
    //         switch (statement.kind) {
    //             case VeName.ASSIGN: //"=", 2)
    //             case VeName.ASSIGN_ADD:// "+=", 2)                                             
    //             case VeName.ASSIGN_SUB:// "-=", 2)                                             
    //             case VeName.ASSIGN_MUL:// "*=", 2)                                             
    //             case VeName.ASSIGN_DIV:// "/=", 2)                                             
    //             case VeName.ASSIGN_MOD:// "%=", 2)
    //             case VeName.OR: //"||", 4)                                                     
    //             case VeName.AND: //"&&", 5)                              
    //             case VeName.XOR:// "^", 7)                               
    //             case VeName.ADD:// "+", 12)                                                    
    //             case VeName.SUB:// "-", 12)                                                    
    //             case VeName.MUL: //"*", 13)                                                    
    //             case VeName.DIV:// "/", 13)                                                    
    //             case VeName.MOD:// "%", 13)
    //             case VeName.EQ:// "==", 9)                                                     
    //             case VeName.NE: //"!=", 9)                                                
    //             case VeName.GT: //">", 10)                                                     
    //             case VeName.LTE:// "<=", 10)                                                   
    //             case VeName.GTE:// ">=", 10) 
    //                 return `${this.call(statement.left)}${VeSyntax.get(statement.kind).string}${this.call(statement.right)}`
    //             case VeName.ASSIGN_EXP: //"**=", 2)
    //                 return `${this.call(statement.left)}=Math.pow(${this.call(statement.left)},${this.call(statement.right)})`

    //             case VeName.EXP:// "**", 14)
    //                 return `Math.pow(${this.call(statement.left)},${this.call(statement.right)})`

    //             case VeName.AS://   "as", KeyWordsType.operator);

    //                 break;
    //             case VeName.IS://   "is", KeyWordsType.constant);

    //                 break;
    //             case VeName.MATCH://  "match", KeyWordsType.operator);
    //                 // this.accept(statement.left);
    //                 // this.write('.test(');
    //                 // this.accept(statement.right);
    //                 // this.write(')');
    //                 break;
    //             case VeName.CONTAIN://   "contain", KeyWordsType.operator);
    //                 return `${this.call(statement.left)}.indexOf(${this.call(statement.right)})>-1`
    //             case VeName.STATR://   "start", KeyWordsType.operator);
    //                 return `${this.call(statement.left)}.indexOf(${this.call(statement.right)})==0`
    //             case VeName.END://   "end", KeyWordsType.operator);
    //                 return `${this.call(statement.left)}.endsWith(${this.call(statement.right)})`

    //             case VeName.K_EQ://   "equal", KeyWordsType.operator);
    //             case VeName.K_AND://   "and", KeyWordsType.operator);
    //             case VeName.K_OR:  // "or", KeyWordsType.operator);
    //                 var sy = '==';
    //                 if (statement.kind == VeName.K_AND) sy = '&&'
    //                 else if (statement.kind == VeName.K_OR) sy = '||'
    //                 return `${this.call(statement.left)}${sy}${this.call(statement.right)}`
    //             case VeName.K_XOR://   "xor", KeyWordsType.operator);
    //                 return `${this.call(statement.left)}!==${this.call(statement.right)}`
    //         }
    //     }
    // }
    // export var UnaryExpression: NodeTranstateTemplate = {
    //     type: StatementType.unary,
    //     template: `@content(node)`,
    //     content(express: UnaryExpression) {
    //         switch (express.kind) {
    //             case VeName.INC://"++", 0)                               
    //             case VeName.DEC://"--", 0) 
    //             case VeName.NOT://!
    //                 if (express.arrow == UnaryArrow.left) {
    //                     return `${this.call(express.exp)}${VeSyntax.get(express.kind).string}`;
    //                 }
    //                 else {
    //                     return `${VeSyntax.get(express.kind).string}${this.call(express.exp)}`;
    //                 }
    //         }
    //     }
    // }
    // export var Constant: NodeTranstateTemplate = {
    //     type: StatementType.constant,
    //     template: `@content(node)`,
    //     content(statement: Constant) {
    //         switch (statement.valueType.name) {
    //             case 'String':
    //             case 'string':
    //                 return (`\`${statement.value.replace(/`/g, "\\`")}\``);
    //             case 'Bool':
    //             case 'bool':
    //                 return statement.value ? 'true' : 'false';
    //             case 'null':
    //                 return 'null'
    //             case 'Number':
    //             case 'number':
    //                 return statement.value;
    //         }
    //     }
    // }
    // export var TernaryExpression: NodeTranstateTemplate = {
    //     type: StatementType.ternary,
    //     template: `@call(node.where)?@call(node.trueCondition):@call(node.falseCondition)`
    // }
    // export var ArrayIndexExpression: NodeTranstateTemplate = {
    //     type: StatementType.ternary,
    //     template: `@if(typeof node.name=='string')
    //     {@node.name[@call(node.indexExpress)]}
    //     else{@call(node.name)[@call(node.indexExpress)]} 
    //    `
    // }
    // export var Variable: NodeTranstateTemplate = {
    //     type: StatementType.variable,
    //     template: `@node.name`
    // }
    // export var ArrowMethodExpression: NodeTranstateTemplate = {
    //     type: StatementType.arrowMethod,
    //     template: `(@parameter(node.parameterArgs))=>{@statement(node.body)}`
    // }
    // export var ArrayExpression: NodeTranstateTemplate = {
    //     type: StatementType.array,
    //     template: `[@content(node)]`,
    //     content(express: ArrayExpression) {
    //         return express.args.map(arg => this.call(arg)).join(",");
    //     }
    // }
    // export var ObjectExpression: NodeTranstateTemplate = {
    //     type: StatementType.Object,
    //     template: `{@content(node)}`,
    //     content(express: ObjectExpression) {
    //         return express.propertys.map(pro => `${pro.key}:${this.call(pro.value)}`).join(",")
    //     }
    // }
}