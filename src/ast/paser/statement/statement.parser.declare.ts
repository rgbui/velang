namespace Ve.Lang {
    import List = Util.List;
    export class StatementParser$Declare {
        $package(this: StatementParser)
        {
            var pa = new PackageStatement();
            pa.ref(this.eat(/package/));
            this.eatBlank();
            pa.name = this.eat(/@namespace/).toArray(x => x.value.trim()).join("");
            this.eatBlank();
            this.eatEmptyStatement();
            return pa;
        }
        $use(this: StatementParser) {
            var use = new UseStatement();
            use.ref(this.eat(/use/));
            this.eatBlank();
            use.packageName = this.eat(/@namespace/).toArray(x => x.value.trim()).join("");
            this.eatBlank();
            if (this.match(/@namespace/)) {
                use.aliasName = this.eat(/@namespace/).toArray(x => x.value.trim()).join("");
            }
            this.eatEmptyStatement();
            return use;
        }
        $class(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.class'));
            var classStatement = new ClassStatement();
            tokens = this.decorateAndModify(tokens, classStatement);
            if (tokens.exists(x => x.flag == 'interface')) classStatement.modifys.push(Modify.interface)
            else if (tokens.exists(x => x.flag == 'class')) classStatement.modifys.push(Modify.class);
            var classNameTokens = this.TM.match(/(class|interface)@blank+(@word|type)/, tokens);
            var nt = classNameTokens.find(x => x.flag == 'word' || x.flag == 'type');
            classStatement.ref(nt);
            classStatement.name = nt.value;
            if (this.TM.isMatch(/extends@blank*(@word|type)/, tokens)) {
                var classExtendTokens = this.TM.match(/extends@blank*(@word|type)/, tokens);
                classStatement.extendName = classExtendTokens.find(x => x.flag == 'word' || x.flag == 'type').value;
            }
            /***class content */
            var contentToken = tokens.find(x => x.flag == '{');
            if (contentToken.childs.length > 0) {
                var parser =this.createParser();
                parser.syntaxContext = 'class';
                var contentNodes = parser.parse(contentToken.childs);
                var ns = new List(NodeType.classMethod, NodeType.classOperator, NodeType.classProperty);
                contentNodes.removeAll(x => !ns.exists(n => n == x.type));
                classStatement.set('content', contentNodes);
            }
            return classStatement;
        }
        $enum(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.enum'));
            var enumStatement = new EnumStatement();
            tokens = this.decorateAndModify(tokens, enumStatement);
            var nt = this.TM.match(/@word/, tokens).first();
            enumStatement.name = nt.value;
            enumStatement.ref(nt);
            /***enum content */
            var contentToken = tokens.find(x => x.flag == '{');
            var ts = contentToken.childs.split(x => x.flag == ',' || x.flag == ';');
            ts.each((os, i) => {
                var key = this.TM.match(/@word/, os).first().value;
                var numToken = this.TM.match(/number/, os);
                var kv = new EnumItem();
                kv.value = 1;
                kv.name = key;
                if (numToken && numToken.length > 0) {
                    kv.value = parseInt(numToken.first().value);
                }
                enumStatement.items.push(kv);
            })
            return enumStatement;
        }
        $fun(this: StatementParser) {
            var funStatement = new FunStatement();
            var tokens = this.eat(getStatementRegex('root.fun'));
            tokens = this.decorateAndModify(tokens, funStatement);
            var nt = this.TM.match(/@word/, tokens).first();
            funStatement.ref(nt);
            funStatement.name = nt.value;
            /***fun  parameters*/
            var parameterToken = tokens.find(x => x.flag == '(');
            if (parameterToken.childs.length > 0) {
                funStatement.set('parameters', this.TM.parameters(parameterToken.childs));
            }
            /****返回类型和方法体需要加以区分处理 */
            var rc = this.matchFunTypeAndBody();
            funStatement.returnType = rc.returnType;
            funStatement.set('content', rc.content);
            return funStatement;
        }
        $def(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('root.def'));
            var defToken = tokens.find(x => x.flag == 'def' || x.flag == 'const');
            var dvs: List<DeclareVariable> = new List;
            while (true) {
                if (this.match(/@blank*@word@blank*/)) {
                    var dv = new DeclareVariable();
                    if (defToken.flag == 'const') dv.modifys.push(Modify.const);
                    var tokens = this.eat(/@blank*@word@blank*/);
                    var nt = tokens.find(x => x.flag == 'word' || x.flag == 'type');
                    dv.ref(nt);
                    dv.name = nt.value;
                    if (this.match(/\:/)) {
                        this.eat(/\:/);
                        dv.declareType = this.$type();
                    }
                    if (this.match(/@blank*\=@blank*/)) {
                        this.eat(/@blank*\=@blank*/);
                        dv.set('value', this.nextExpress());
                    };
                    dvs.push(dv);
                    if (this.match(/@blank*\,@blank*/)) {
                        this.eat(/@blank*\,@blank*/);
                        continue;
                    }
                    else break;
                }
                else break;
            }
            return dvs;
        }
    }
}