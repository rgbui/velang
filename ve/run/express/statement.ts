
namespace Ve.Lang.Run {

    export var Run$Statement: Accepter<RunVisitor, void> = {
        return(statement: ReturnStatement) {
            this.accept(statement.expression);
            statement.runResult.value - statement.expression.runResult.value;
            statement.scope.runResult.return = true;
            statement.scope.runResult.value = statement.expression.runResult.value;
        },
        continue(statement: ContinueStatement) {
            var c = statement.closest(x => x instanceof ForStatement || x instanceof WhileStatement || x instanceof DoWhileStatement);
            if (c) {
                c.runResult.continue = true;
            }
        },
        break(statement: BreakStatement) {
            var c = statement.closest(x => x instanceof SwitchStatement || x instanceof ForStatement || x instanceof WhileStatement || x instanceof DoWhileStatement);
            if (c) {
                c.runResult.continue = true;
            }
        },
        context(statement: ClassContext) {
            var ci = statement.closest(x => x instanceof ClassOrIntrfaceStatement) as ClassOrIntrfaceStatement;
            statement.runResult.value = ci.runResult.context;
        },
        throw(statement: ThrowStatement) {
            this.accept(statement.expression);
            statement.scope.runResult.throw = true;
            statement.scope.runResult.traces.push({ statement: statement, value: statement.expression.runResult.value });
        },
        if(statement: IfStatement) {
            this.accept(statement.ifCondition);
            if (statement.ifCondition.runResult.value == true) {
                this.runStatements(statement.ifStatement);
                return;
            }
            for (let i = 0; i < statement.thenConditions.length; i++) {
                var c = statement.thenConditions[i];
                this.accept(c);
                if (c.runResult.value == true) {
                    this.runStatements(statement.thenStatements.eq(i));
                    return;
                }
            }
            statement.elseStatement.each(s => this.accept(s));
        },
        for(statement: ForStatement) {
            this.accept(statement.initStatement);
            while (true) {
                this.accept(statement.condition);
                if (statement.condition.runResult.value == true) {
                    for (let i = 0; i < statement.body.length; i++) {
                        this.accept(statement.body[i]);
                        if (statement.runResult.continue == true) {
                            this.accept(statement.next);
                            continue;
                        }
                        else if (statement.runResult.break == true) {
                            this.accept(statement.next);
                            break;
                        }
                        else if (statement.scope.runResult.return == true) {
                            break;
                        }
                        else if (statement.scope.runResult.throw == true) {
                            break;
                        }
                    }
                    this.accept(statement.next);
                }
                else {
                    this.accept(statement.next);
                    break;
                }
            }
        },
        while(statement: WhileStatement) {
            while (true) {
                this.accept(statement.condition);
                if (statement.condition.runResult.value == true) {
                    for (let i = 0; i < statement.body.length; i++) {
                        this.accept(statement.body[i]);
                        if (statement.runResult.continue == true) {
                            continue;
                        }
                        else if (statement.runResult.break == true) {
                            this.accept(statement.next);
                            break;
                        }
                        else if (statement.scope.runResult.return == true) {
                            break;
                        }
                        else if (statement.scope.runResult.throw == true) {
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }
        },
        doWhile(statement: DoWhileStatement) {
            while (true) {
                if (statement.condition.runResult.value == true) {
                    for (let i = 0; i < statement.body.length; i++) {
                        this.accept(statement.body[i]);
                        if (statement.runResult.continue == true) {
                            continue;
                        }
                        else if (statement.runResult.break == true) {
                            this.accept(statement.next);
                            break;
                        }
                        else if (statement.scope.runResult.return == true) {
                            break;
                        }
                        else if (statement.scope.runResult.throw == true) {
                            break;
                        }
                    }
                }
                this.accept(statement.condition);
                if (statement.condition.runResult.value != true) {
                    break;
                }
            }
        },
        fun(statement: FunStatement) {
            statement.returnType.runResult.value = { __$type: statement.name, caller: statement };
        },
        switch(statement: SwitchStatement) {
            this.accept(statement.valueExpression);
            statement.caseStatements.each(s => this.accept(s.value));
            var caseIndex = statement.caseStatements.findIndex(x => x.value.runResult.value == statement.valueExpression.runResult.value);
            if (caseIndex > -1) {
                for (let i = caseIndex; i < statement.caseStatements.length; i++) {
                    var isbreak = false;
                    statement.caseStatements[i].matchs.each(match => {
                        this.accept(match);
                        if (statement.runResult.break == true) {
                            isbreak = true; return false;
                        }
                        else if (statement.scope.runResult.return == true) {
                            isbreak = true; return false;
                        }
                        else if (statement.scope.runResult.throw == true) {
                            isbreak = true; return false;
                        }
                    })
                    if (isbreak) {
                        break;
                    }
                }
            }
            else {
                for (let i = 0; i < statement.defaultStatement.length; i++) {
                    this.accept(statement[i]);
                    if (statement.runResult.break == true) {
                        isbreak = true; return false;
                    }
                    else if (statement.scope.runResult.return == true) {
                        isbreak = true; return false;
                    }
                }
            }
        },
        try(statement: TryStatement) {
            var isReturn: boolean = false;
            for (let i = 0; i < statement.tryStatement.length; i++) {
                this.accept(statement.tryStatement[i]);
                if (statement.scope.runResult.return == true) {
                    isReturn = true;
                    break;
                }
                else if (statement.scope.runResult.throw == true) {
                    break;
                }
            }
            if (isReturn != true) {
                if (statement.scope.runResult.throw == true) {
                    statement.catchParameter.first().runResult.value = statement.scope.runResult.traces[0].value;
                    statement.scope.runResult.throw = false;
                    statement.scope.runResult.traces = [];
                    this.runStatements(statement.catchStatement);
                }
                this.runStatements(statement.finallyStatement);
            }
        },
        use(statement: UseStatement) {

        },
        package(statement: PackageStatement) {

        },
        class(statement: ClassOrIntrfaceStatement) {
            statement.runResult.value = {};
            statement.body.each(s => {
                if (s.kind == ClassPropertyKind.prop) {
                    this.accept(s);
                    statement.runResult.value[s.name] = s.runResult.value;
                }
            });
        },
        classProperty(statement: ClassProperty) {
            if (statement.value) {
                this.accept(statement.value);
                statement.runResult.value = statement.value.runResult.value;
            }
        }
    }
}