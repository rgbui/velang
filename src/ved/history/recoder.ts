


namespace Ve.Lang.Ved {
    export class HistoryRecorder {
        doc: Doc;
        get editor() {
            return this.doc.editor;
        }
        supervisor: HistorySupervisor;
        constructor(doc: Doc) {
            this.doc = doc;
            this.supervisor = new HistorySupervisor();
        }
        private history: History;
        createHistory(command: HistoryCommand) {
            this.history = new History(command, this.supervisor);
            this.history.oldCursor = this.editor.cursor.position.pos;
            this.editor.emit('createHistory', this.history);
        }
        writeHistory() {
            if (this.history && this.history.snapshots.length > 0) {
                this.history.newCursor = this.editor.cursor.position.pos;
                /**
                 * 如果是撤消或重做，则不能加入当前的队伍
                 * 
                 * */
                if (this.history.command != HistoryCommand.onKeyCancel && this.history.command != HistoryCommand.onKeyRedo)
                    this.supervisor.append(this.history);
                this.editor.emit('writeHistory', this.history);
                /**
                 * 基本上有这个writeHistory触发，说明整体修改了
                 * */
                this.editor.emit('change');
                delete this.history;
            }
        }
        clearHistory() {
            this.editor.emit('clearHistory', this.history);
            delete this.history;
        }
        writeSnapshot(action: HistoryAction, data: any) {
            if (this.history) {
                var actionSnaapshot = new ActionSnapshot({ action, data });
                this.history.snapshots.push(actionSnaapshot);
                this.editor.emit('writeSnapshot', actionSnaapshot);
            }
        }
    }
}