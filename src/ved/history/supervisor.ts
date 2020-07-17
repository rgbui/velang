namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    export class History {
        supervisor: HistorySupervisor;
        command: HistoryCommand;
        snapshots: List<ActionSnapshot> = new List();
        oldCursor: { row: number, col: number };
        newCursor: { row: number, col: number };
        constructor(command: HistoryCommand, supervisor: HistorySupervisor) {
            this.command = command;
            this.supervisor = supervisor;
            this.date = new Date().getTime();
        }
        get index() {
            return this.supervisor.historyList.findIndex(x => x == this);
        }
        get next() {
            return this.supervisor.historyList.eq(this.index + 1);
        }
        date: number;
        get() {
            return {
                command: HistoryCommand[this.command],
                snapshots: this.snapshots.toArray(x => x.get()),
                date: new Date(this.date).toString()
            }
        }
    }
    export class HistorySupervisor extends Ve.Lang.Util.BaseEvent {
        index = 0;
        maxLength = 100;
        historyList: List<History> = new List<History>();
        get current(): History {
            return this.historyList.eq(this.index);
        }
        get next(): History {
            return this.historyList.eq(this.index + 1);
        }
        get canRedo(): boolean {
            if (this.next) return true;
            else return false;
        }
        get canUndo(): boolean {
            if (this.current) return true;
            else return false;
        }
        onRedo() {
            if (this.canRedo) {
                try {
                    this.emit('redo', this.next);
                }
                catch (e) {
                    this.emit('error', e);
                }
                this.index += 1;
            }
        }
        onUndo() {
            if (this.canUndo) {
                try {
                    this.emit('undo', this.current);
                }
                catch (e) {
                    this.emit('error', e);
                }
                this.index -= 1;
            }
        }
        append(history: History) {
            var ru = { r: this.canRedo, u: this.canUndo };
            if (this.index < this.historyList.length - 1) {
                /**
                 * 每次新增的数据，将顶掉当前位置后面的数据
                 */
                this.historyList.removeAll((x, i) => i > this.index);
            }
            this.historyList.push(history);
            history.supervisor = this;
            history.date = new Date().getTime();
            this.index = this.historyList.length - 1;
            /**
             * 如果超出了，那么删除最后一位(即数据最前面的)
             */
            if (this.historyList.length > this.maxLength) {
                var deleteCount = this.historyList.length - this.maxLength;
                this.historyList.splice(0, deleteCount);
                this.index = this.index - deleteCount;
                if (this.index <= 0) this.index = 0;
            }
            /**
             * 通知撤消和通知的可用性
             */
            if (ru.r != this.canRedo) {
                this.emit('canRedo', this.canRedo);
            }
            if (ru.u != this.canUndo) {
                this.emit('canUndo', this.canUndo);
            }
        }
        clear() {
            this.index = 0;
            this.historyList = new List<History>();
        }
    }
}