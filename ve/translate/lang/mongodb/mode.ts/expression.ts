namespace Ve.Lang.Transtate.mongodb {
    /***
     * 
     * https://docs.mongodb.com/manual/reference/operator/aggregation/
     * 
     */
    export var accepter: Accepter<VisitorLange, void> = {
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
                        var leftType = express.left.infer.expressType;
                        var rightType = express.right.infer.expressType;
                        switch (express.kind) {
                            case VeName.ASSIGN: //"=", 2)
                            case VeName.ASSIGN_ADD:// "+=", 2)                                             
                            case VeName.ASSIGN_SUB:// "-=", 2)                                             
                            case VeName.ASSIGN_MUL:// "*=", 2)                                             
                            case VeName.ASSIGN_DIV:// "/=", 2)                                             
                            case VeName.ASSIGN_MOD:// "%=", 2)
                            case VeName.ASSIGN_EXP: //"**=", 2)
                                return `mongodb:${VeName[express.kind]} not  can't be here`
                            case VeName.OR: //"||", 4)   
                            case VeName.K_OR:
                                return `{$or:[${left},${right}]}`
                            case VeName.AND: //"&&", 5)   
                            case VeName.K_AND:
                                return `{$and:[${left},${right}]}`
                            case VeName.XOR:// "&|", 7)  
                            case VeName.K_XOR:
                                return `{$nor:[${left},${right}]}`
                            case VeName.ADD:// "+", 12) 
                                //   if(express.left.infer.expressType.name=='int')
                                if (leftType && rightType && (leftType.name == 'int' || leftType.name == 'number') && (rightType.name == 'int' || rightType.name == 'number'))
                                    return `{$add:[${left},${right}]}`
                                else return `{$concat:[${left},${right}]}`
                            case VeName.SUB:// "-", 12)   
                                return `{$subtract:[${left},${right}]}`
                            case VeName.MUL: //"*", 13)  
                                return `{$multiply:[${left},${right}]}`
                            case VeName.DIV:// "/", 13)     
                                return `{$divide:[${left},${right}]}`
                            case VeName.MOD:// "%", 13)
                                return `{$mod:[${left},${right}]}`
                            case VeName.EQ:// "==", 9)  
                            case VeName.K_EQ:
                                return `{$eq:[${left},${right}]}`
                            case VeName.NE: //"!=", 9)  
                                return `{$ne:[${left},${right}]}`
                            case VeName.GT: //">", 10)    
                                return `{$gt:[${left},${right}]}`
                            case VeName.LTE:// "<=", 10) 
                                return `{$lte:[${left},${right}]}`
                            case VeName.GTE:// ">=", 10) 
                                return `{$gte:[${left},${right}]}`
                            case VeName.EXP:// "**", 14)
                                return `{$pow:[${left},${right}]}`
                            case VeName.AS://   "as", KeyWordsType.operator);
                                break;
                            case VeName.IS://   "is", KeyWordsType.constant);
                                break;
                            case VeName.MATCH://  "match", KeyWordsType.operator);
                                return `{${left}:{$regex:${right}}}`
                            case VeName.CONTAIN://   "contain", KeyWordsType.operator);
                                return `{$search:[${left},${right}]}`
                            case VeName.STATR://   "start", KeyWordsType.operator); 
                                return `{${left}:{$regex:/^${right}/}}`
                            case VeName.END://   "end", KeyWordsType.operator);
                                return `{${left}:{$regex:/${right}$/}}`
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
                        switch (express.kind) {
                            case VeName.INC://"++", 0)  
                                return `$add:[${this.call(express.exp)},1]`
                            case VeName.DEC://"--", 0) 
                                return `$add:[${this.call(express.exp)},-1]`
                            case VeName.NOT://!
                                return `$not:${this.call(express.exp)}`
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
                                return (`{$literal:\`${statement.value.replace(/`/g, "\\`")}\`}`);
                            case 'Bool':
                            case 'bool':
                                return statement.value ? '{$literal:true}' : '{$literal:false}';
                            case 'null':
                                return '{$literal:null}'
                            case 'Number':
                            case 'number':
                            case 'int':
                            case 'Int':
                                return `{$literal:${statement.value}}`;
                            default:
                                var cp = Statement.search(statement, statement.valueType.name, x => x instanceof ClassOrIntrfaceStatement ? true : false).referenceStatement as ClassOrIntrfaceStatement;
                                var cpp = cp.body.find(x => x.isCtor && x.args.length == 1);
                                if (cpp) {
                                    return this.visitor.acceptMethod(cpp.unqiueName, statement, statement.value)
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
                template: `
                {
                    $cond: {
                      if:@call(node.where),
                      then:@call(node.trueCondition),
                      else:@call(node.falseCondition)
                    }
                  }
               `
            })
        },
        arrayIndex(express: ArrayIndexExpression) {
            if (typeof express.name != 'string')
                this.accept(express.name);
            this.accept(express.indexExpress);
            LangRender.create(express, {
                template: `mongodb: arrayIndex not  can't be here`
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
                template: `mongodb: arrow method not  can't be here`
            })
        },
        array(express: ArrayExpression) {
            return LangRender.create(express, {
                template: `mongodb: variable not  can't be here`
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
            return LangRender.create(express, {
                template: `mongodb: parameter not  can't be here`
            })
        }
    }
}