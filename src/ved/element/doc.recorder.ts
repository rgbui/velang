namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    export class Doc$Recorder {
        recoder: HistoryRecorder;
        initRecoder(this: Doc) {
            this.recoder = new HistoryRecorder(this);
            this.recoder.supervisor.on('redo', (history: History) => this.redo(history));
            this.recoder.supervisor.on('undo', (history: History) => this.undo(history));
            this.recoder.supervisor.on('canRedo', (canRedo: boolean) => { this.editor.emit('canRedo', canRedo) });
            this.recoder.supervisor.on('canUndo', (canUndo: boolean) => { this.editor.emit('canUndo', canUndo) });
            this.recoder.supervisor.on('error', (error: Error | string) => this.editor.emit('error', error));
        }
        get canRedo(this: Doc): boolean {
            return this.recoder.supervisor.canRedo;
        }
        get canUndo(this: Doc): boolean {
            return this.recoder.supervisor.canUndo;
        }
        onRedo(this: Doc) {
            this.recoder.createHistory(HistoryCommand.onKeyRedo);
            this.recoder.supervisor.onRedo();
            this.recoder.writeHistory();
        }
        onUndo(this: Doc) {
            this.recoder.createHistory(HistoryCommand.onKeyCancel);
            this.recoder.supervisor.onUndo();
            this.recoder.writeHistory();
        }
        redo(this: Doc, history: History) {
            history.snapshots.each(snapshot => {
                switch (snapshot.action) {
                    case HistoryAction.createLine:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            line.createSimulateLine(snapshot.data.value);
                        }
                        break;
                    case HistoryAction.deleteLine:
                        var line = this.line(snapshot.data.row);
                        if (line) line.remove()
                        break;
                    case HistoryAction.deleteLineRange:
                        var line = this.line(snapshot.data.row);
                        if (line) line.delete(snapshot.data.startCol, snapshot.data.endCol);
                        break;
                    case HistoryAction.lineRemoveTokenSpan:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            var sp = line.findTokenSpan(snapshot.data.col);
                            if (sp) line.removeTokenSpan(sp);
                        }
                        break;
                    case HistoryAction.insertTokenSpan:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            line.insertText(snapshot.data.col, snapshot.data.value);
                        }
                        break;
                    case HistoryAction.updateTokenSpan:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            line.replaceText(snapshot.data.col, snapshot.data.newValue, snapshot.data.oldValue.length);
                        }
                        break;
                }
            });
            var line = this.line(history.newCursor.row);
            if (line) {
                this.editor.cursor.position.copyFrom(new SpanPosition(this.editor, line.index, history.newCursor.col));
                this.editor.cursor.update();
            }
        }
        undo(this: Doc, history: History) {
            /**
             * 重做所有的动作反着来
             * */
            var sns = history.snapshots.toArray(x => x).reverse() as List<ActionSnapshot>;
            sns.each(snapshot => {
                switch (snapshot.action) {
                    case HistoryAction.createLine:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            line.next.remove();
                        }
                        break;
                    case HistoryAction.deleteLine:
                        /**
                         * 找到前一行，并在前一行的基存上创建新行
                         */
                        var line = this.line(snapshot.data.row - 1);
                        if (line) {
                            line.createSimulateLine(snapshot.data.value)
                        }
                        break;
                    case HistoryAction.deleteLineRange:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            line.insertText(snapshot.data.startCol, snapshot.data.value)
                        };
                        break;
                    case HistoryAction.lineRemoveTokenSpan:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            line.insertText(snapshot.data.col, snapshot.data.value);
                        }
                        break;
                    case HistoryAction.insertTokenSpan:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            var sp = line.findTokenSpan(snapshot.data.col);
                            if (sp) sp.value = '';
                        }
                        break;
                    case HistoryAction.updateTokenSpan:
                        var line = this.line(snapshot.data.row);
                        if (line) {
                            if (snapshot.data.newValue == '') {
                                line.insertText(snapshot.data.col, snapshot.data.oldValue)
                            }
                            else {
                                var sp = line.findTokenSpan(snapshot.data.col);
                                if (sp) {
                                    sp.value = snapshot.data.oldValue;
                                }
                            }
                        }
                        break;
                }
            });
            var line = this.line(history.oldCursor.row);
            if (line) {
                this.editor.cursor.position.copyFrom(new SpanPosition(this.editor, history.oldCursor.row, history.oldCursor.col));
                this.editor.cursor.update();
            }
        }
    }
}