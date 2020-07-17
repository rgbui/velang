namespace Ve.Lang {

    import List = Ve.Lang.Util.List;
    export class IFStatement extends Node {
        type = NodeType.if;
        ifCondition: Express;
        ifContent: List<Statement> = new List;
        elseIFConditions: List<Express> = new List;
        elseIFContents: List<List<Statement>> = new List;
        elseConent: List<Statement> = new List;
    }
    export class WhenStatement extends Node {
        type = NodeType.when;
        whens: List<{ value: List<Express>, content: List<Statement> }> = new List;
        set(name: 'whens', value: WhenStatement['whens']) {
            this.whens = value;
            this.whens.each(wh => {
                wh.value.each(v => this.append(v));
                wh.content.each(v => this.append(v));
            });
        }
    }
    export class WhileStatement extends Node {
        type = NodeType.while;
        condition: Express;
        content: List<Statement> = new List;
    }
    export class ForStatement extends Node {
        type: NodeType.for;
        init: List<Statement> = new List;
        condition: Express;
        post: List<Statement> = new List;
        content: List<Statement> = new List;
    }
    export class SwitchStatement extends Node {
        type = NodeType.switch;
        value: Express;
        cases: List<{ case: List<Express>, content: List<Statement> }> = new List;
        default: List<Statement> = new List;
        set(name: 'cases' | 'value' | 'default', value: SwitchStatement['cases'] | any) {
            if (name == 'cases') {
                this.cases = value;
                this.cases.each(wh => {
                    wh.case.each(v => this.append(v));
                    wh.content.each(v => this.append(v));
                })
            }
            else {
                super.set(name, value);
            }
        }
    }
    export class TryStatement extends Node {
        type = NodeType.try;
        try: List<Statement> = new List;
        catchs: List<{ paramete?: Parameter, content: List<Statement> }> = new List;
        finally: List<Statement> = new List;
        set(name: 'try' | 'catchs' | 'finally', value: any) {
            if (name == 'catchs') {
                this.catchs = value;
                this.catchs.each(c => {
                    if (c.paramete) this.append(c.paramete);
                    c.content.each(cc => this.append(cc));
                })
            }
            else {
                super.set(name, value);
            }
        }
    }
    export class BreadkStatement extends Node {
        type = NodeType.break;
    }
    export class EmptyStatement extends Node {
        type = NodeType.emptyStatement;
    }
    export class ContinueStatement extends Node {
        type = NodeType.continue;
    }
    export class ReturnStatement extends Node {
        type = NodeType.return;
        result: Express;
        inferType() {
            return this.result.inferType();
        }
    }
    export class ThrowStatement extends Node {
        type = NodeType.throw;
        throw: Express;
    }
    export class BlockStatement extends Node {
        type = NodeType.block;
        content: List<Statement> = new List();
    }
}