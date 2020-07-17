

namespace Ve.Lang.Transtate.js {
    export var accepter$binary: Accepter<VisitorLange, void> = {
        binary(express: BinaryExpression) {
            this.accept(express.left);
            this.accept(express.right)
            LangRender.create(express, {
                template: `@content(node)`,
                props: {
                    content() {
                        var express = this.node as BinaryExpression;
                        var left = this.call(express.left);
                        var right = this.call(express.right);
                        console.log(VeName[express.kind]);
                        switch (express.kind) {
                            case VeName.ASSIGN: //"=", 2)
                            case VeName.ASSIGN_ADD:// "+=", 2)                                             
                            case VeName.ASSIGN_SUB:// "-=", 2)                                             
                            case VeName.ASSIGN_MUL:// "*=", 2)                                             
                            case VeName.ASSIGN_DIV:// "/=", 2)                                             
                            case VeName.ASSIGN_MOD:// "%=", 2)
                            case VeName.OR: //"||", 4)                                                     
                            case VeName.AND: //"&&", 5)                              
                            case VeName.XOR:// "&|", 7)                               
                            case VeName.ADD:// "+", 12)                                                    
                            case VeName.SUB:// "-", 12)                                                    
                            case VeName.MUL: //"*", 13)                                                    
                            case VeName.DIV:// "/", 13)                                                    
                            case VeName.MOD:// "%", 13)
                            case VeName.EQ:// "==", 9)                                                     
                            case VeName.NE: //"!=", 9)                                                
                            case VeName.GT: //">", 10)  
                            case VeName.LT: //"<", 10)                                                
                            case VeName.LTE:// "<=", 10)                                                   
                            case VeName.GTE:// ">=", 10) 
                                return `${left}${VeSyntax.get(express.kind).string}${right}`
                            case VeName.ASSIGN_EXP: //"**=", 2)
                                return `${left}=Math.pow(${left},${right})`
                            case VeName.EXP:// "**", 14)
                                return `Math.pow(${left},${right})`
                            case VeName.AS://   "as", KeyWordsType.operator);

                                break;
                            case VeName.IS://   "is", KeyWordsType.constant);
                                break;
                            case VeName.MATCH://  "match", KeyWordsType.operator);
                                // this.accept(statement.left);
                                // this.write('.test(');
                                // this.accept(statement.right);
                                // this.write(')');
                                break;
                            case VeName.CONTAIN://   "contain", KeyWordsType.operator);
                                return `${left}.indexOf(${right})>-1`
                            case VeName.STATR://   "start", KeyWordsType.operator);
                                return `${left}.indexOf(${right})==0`
                            case VeName.END://   "end", KeyWordsType.operator);
                                return `${left}.endsWith(${right})`

                            case VeName.K_EQ://   "equal", KeyWordsType.operator);
                            case VeName.K_AND://   "and", KeyWordsType.operator);
                            case VeName.K_OR:  // "or", KeyWordsType.operator);
                                var sy = '==';
                                if (express.kind == VeName.K_AND) sy = '&&'
                                else if (express.kind == VeName.K_OR) sy = '||'
                                return `${left}${sy}${right}`
                            case VeName.K_XOR://   "xor", KeyWordsType.operator);
                                return `${left}!==${right}`
                        }
                    }
                }
            })
        },
        unary(express: UnaryExpression) {
            this.accept(express.exp);
            LangRender.create(express, {
                template: `@content()`,
                props: {
                    content() {
                        var express = this.node as UnaryExpression;
                        switch (express.kind)
                        {
                            case VeName.INC://"++", 0)                               
                            case VeName.DEC://"--", 0) 
                            case VeName.NOT://!
                                if (express.arrow == UnaryArrow.left) {
                                    return `${this.call(express.exp)}${VeSyntax.get(express.kind).string}`;
                                }
                                else {
                                    return `${VeSyntax.get(express.kind).string}${this.call(express.exp)}`;
                                }
                        }
                    }
                }
            })
        },
        constant(express: Constant) {
            LangRender.create(express, {
                template: `@content()`,
                props: {
                    content() {
                        var statement = this.node as Constant;
                        switch (statement.valueType.name) {
                            case 'String':
                            case 'string':
                                return (`\`${statement.value.replace(/`/g, "\\`")}\``);
                            case 'Bool':
                            case 'bool':
                                return statement.value ? 'true' : 'false';
                            case 'null':
                                return 'null'
                            case 'int':
                            case 'Int':
                            case 'Number':
                            case 'number':
                                return statement.value;
                            case 'Url':
                            case 'url':
                                return "{__ve_type:'url',value:" + (`\`${statement.value.replace(/\\\//g, "/").replace(/`/g, "\\`")}\``) + "}";
                            case 'date':
                            case 'Date':
                                if (typeof statement.value == 'number')
                                    return `new Date(${statement.value})`;
                                else if (typeof statement.value == 'string')
                                    return `new Date("${statement.value}")`;
                            default:
                                var cr = Statement.search(statement, statement.valueType.name, x => x instanceof ClassOrIntrfaceStatement ? true : false);
                                if (cr) {
                                    var cp = cr.referenceStatement as ClassOrIntrfaceStatement;
                                    var cpp = cp.body.find(x => x.isCtor && x.args.length == 1);
                                    if (cpp) {
                                        return this.visitor.acceptMethod(cpp.unqiueName, statement, statement.value)
                                    }
                                }
                                else {
                                    console.log('not found class', statement, statement.valueType.name);
                                }
                        }
                    }
                }
            })
        },
        ternary(express: TernaryExpression) {
            this.accept(express.where);
            this.accept(express.trueCondition);
            this.accept(express.falseCondition);
            LangRender.create(express, {
                template: `@call(node.where)?@call(node.trueCondition):@call(node.falseCondition)`
            })
        },
        arrayIndex(express: ArrayIndexExpression) {
            if (typeof express.name != 'string')
                this.accept(express.name);
            this.accept(express.indexExpress);
            LangRender.create(express, {
                template: `@if(typeof node.name=='string')
        {@node.name[@call(node.indexExpress)]}
        else{@call(node.name)[@call(node.indexExpress)]} 
       `
            })
        },
        variable(express: Variable) {
            return LangRender.create(express, {
                template: `@node.name`
            })
        },
        arrowMethod(express: ArrowMethodExpression) {
            express.args.each(arg => this.accept(arg));
            express.body.each(m => this.accept(m));
            LangRender.create(express, {
                template: `(@parameter())=>{@body()}`,
                props: {
                    parameter() {
                        var express: ArrowMethodExpression = this.node as ArrowMethodExpression;
                        return express.args.map(arg => arg.langeRender.render()).join(",");
                    },
                    body() {
                        var express: ArrowMethodExpression = this.node as ArrowMethodExpression;
                        return this.renderList(express.body)
                    }
                }
            })
        },
        array(express: ArrayExpression) {
            express.args.each(arg => this.accept(arg));
            LangRender.create(express, {
                template: `[@content(node)]`,
                props: {
                    content() {
                        var express = this.node as ArrayExpression;
                        return express.args.map(arg => arg.langeRender.render()).join(",");
                    }
                }
            })
        },
        Object(express: ObjectExpression) {
            express.propertys.each(pro => {
                this.accept(pro.value);
            })
            LangRender.create(express, {
                template: `{@content(node)}`,
                props: {
                    content() {
                        var express = this.node as ObjectExpression;
                        return express.propertys.map(pro => `"${pro.key}":${pro.value.langeRender.render()}`).join(",")
                    }
                }
            })
        },
        parameter(express: Parameter) {
            LangRender.create(express, {
                template: `@content()`,
                props: {
                    content() {
                        var exp = this.node as Parameter;
                        return `${exp.isParameter ? "..." : ""}${exp.key}`;
                    }
                }
            })
        }
    }
}