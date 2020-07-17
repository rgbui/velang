

namespace Ve.Lang {
    import List = Util.List;
    export class StatementParser$Class {
        $property(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('class.property'));
            var cp = new ClassProperty();
            tokens = this.decorateAndModify(tokens, cp);
            var nt = tokens.find(x => x.flag == 'type' || x.flag == 'word')
            cp.name = nt.value;
            cp.ref(nt);
            if (this.match(/@blank*\:/)) {
                this.eat(/@blank*\:/);
                cp.set('propType', this.$type());
            }
            if (this.match(/@blank*\=@blank*/)) {
                this.eat(/@blank*\=@blank*/);
                var valueExp: Express;
                valueExp = this.eatExpressUnit();
                if (!valueExp) {
                    if (this.match(/\{\}|\[\]/)) {
                        valueExp = this.TM.dataExpress(this.eat(/\{\}|\[\]/));
                    }
                }
                if (!valueExp) {
                    valueExp = this.nextExpress();
                }
                if (valueExp)
                    cp.set('propValue', valueExp);
            }
            this.eatEmptyStatement();
            return cp;
        }
        $method(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('class.method'));
            var cm = new ClassMethod();
            tokens = this.decorateAndModify(tokens, cm);
            var nt = this.TM.match(/@word|ctor|get|set/, tokens).first();
            cm.name = nt.value;
            cm.ref(nt);
            /***fun  parameters*/
            var parameterToken = tokens.find(x => x.flag == '(');
            if (parameterToken.childs.length > 0) {
                cm.set('parameters', this.TM.parameters(parameterToken.childs));
            }
            var rc = this.matchFunTypeAndBody();
            cm.returnType = rc.returnType;
            if (rc.content) cm.set('content', rc.content);
            else cm.modifys.push(Modify.interface);
            return cm;
        }
        $field(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('class.field'));
            var cp = new ClassProperty();
            tokens = this.decorateAndModify(tokens, cp);
            var nt = this.TM.match(/@word/, tokens).first();
            cp.ref(nt);
            cp.name = nt.value;
            if (tokens.exists(x => x.flag == 'get'))
                cp.modifys.push(Modify.get);
            else if (tokens.exists(x => x.flag == 'set'))
                cp.modifys.push(Modify.set);
            /***fun  parameters*/
            var parameterToken = tokens.find(x => x.flag == '(');
            if (parameterToken.childs.length > 0) {
                cp.set('parameters', this.TM.parameters(parameterToken.childs));
            }
            var rc = this.matchFunTypeAndBody();
            cp.returnType = rc.returnType;
            if (rc.content) cp.set('content', rc.content);
            else cp.modifys.push(Modify.interface)
            return cp;
        }
        $operator(this: StatementParser) {
            var tokens = this.eat(getStatementRegex('class.operator'));
            var op = new ClassOperator();
            tokens = this.decorateAndModify(tokens, op);
            tokens.removeBefore(x => x.flag == 'operator',true);
            /***fun  parameters*/
            var parameterToken = tokens.find(x => x.flag == '(');
            if (parameterToken.childs.length > 0) {
                op.set('parameters', this.TM.parameters(parameterToken.childs));
            }
            var rc = this.matchFunTypeAndBody();
            op.returnType = rc.returnType;
            if (rc.content) op.set('content', rc.content);
            else op.modifys.push(Modify.interface);
            var nt = this.TM.match(getStatementRegex('symbols'), tokens).first();
            op.ref(nt);
            op.name = nt.value;
            return op;
        }
    }
}