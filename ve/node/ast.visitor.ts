
///<reference path='../util/event.ts'/>

namespace Ve.Lang {

    export type Accepter<K, T extends (void | { visitor: AstVisitor<T> })> = Record<string, (this: K, express: Statement) => T>;

    export class AstVisitor<T extends (void | { visitor: AstVisitor<T> })> extends BaseEvent {
        private express: VeArray<Statement>;
        public accepter: Accepter<AstVisitor<T>, T>;
        constructor(express: VeArray<Statement> | Statement, accepter?: Accepter<AstVisitor<T>, T>) {
            super();
            if (express instanceof Statement)
                this.express = new VeArray(express)
            else
                this.express = express;
            this.accepter = accepter;
            if (typeof this.onInit == 'function') this.onInit();
        }
        onInit?();
        start(): T {
            return this.accept(this.express.eq(0));
        }
        accept(express: Statement): T {
            if (!(express instanceof Statement)) {
                console.warn('only accpent statement:', express);
                return;
            }
            var name = StatementType[express.type];
            if (typeof this.accepter[name] == 'function') {
                var result = this.accepter[name].apply(this, [express]);
                if (typeof result != typeof undefined) {
                    result.visitor = this;
                }
                this.emit('accept', express);
                return result;
            }
            if (typeof this.accepter['$' + name] == 'function') {
                var result = this.accepter['$' + name].apply(this, [express]);
                if (typeof result != typeof undefined) {
                    result.visitor = this;
                }
                this.emit('accept', express);
                return result;
            }
            else {
                console.warn(`not found ${name}`);
            }
        }
        next(express: Statement): T {
            var next = express.next;
            if (next) {
                return this.accept(next);
            }
        }
        error(error: any) {
            this.emit('error', error);
        }
    }
    export interface AstVisitor<T extends (void | { visitor: AstVisitor<T> })> {
        on(name: 'error', cb: (error: any) => void)
        on(name: 'accept', cb: (express: Statement) => void)
    }
}