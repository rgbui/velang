

namespace Ve.Lang.Ved {


    /**
     * 每次执行的命令
     */
    export enum HistoryCommand {
        onKeyCut,
        onKeyPaster,
        onKeyCancel,
        onKeyRedo,
        onKeyBackspace,
        onKeyDelete,
        onKeyShiftDelete,
        onKeyEnter,
        InputWords
    }

    /**
     * 
     * 内部执行的子动作
     * @tip 一条命令是由多个动作执行出来的
     */
    export enum HistoryAction {
        createLine,
        deleteLine,
        deleteLineRange,
        lineRemoveTokenSpan,

        insertTokenSpan,
        updateTokenSpan
    }
    export class ActionSnapshot {
        action: HistoryAction;
        data: {
            col?: number;
            row?: number;
            oldValue?: string;
            newValue?: string;
            value?: string;
            startCol?: number;
            endCol?: number;
        }
        private date: number;
        constructor(data: Partial<ActionSnapshot>) {
            if (typeof data == 'object') {
                for (var n in data) {
                    this[n] = data[n];
                }
            }
            this.date = new Date().getTime();
        }
        get() {
            return {
                action: HistoryAction[this.action],
                date: new Date(this.date).toString(),
                data: this.data
            }
        }
    }

    export interface HistoryRecorder {

        writeSnapshot(action: HistoryAction.deleteLine, data: { row: number, value: string });
        writeSnapshot(action: HistoryAction.deleteLineRange, data: { row: number, startCol: number, endCol: number, value: string });
        writeSnapshot(action: HistoryAction.createLine, data: { row: number, value: string });
               
        writeSnapshot(action: HistoryAction.lineRemoveTokenSpan, data: { row: number, col: number, value: string });
        writeSnapshot(action: HistoryAction.insertTokenSpan, data: { row: number, col: number, value: string });
        writeSnapshot(action: HistoryAction.updateTokenSpan, data: { row: number, col: number, oldValue: string, newValue: string });


    }
}