/// <reference path="ve.d.ts" />
/// <reference types="node" />
declare namespace Ve.Lang.Ved {
    class Compiler {
        private editor;
        constructor(editor: Editor);
        mode: 'code' | 'block' | 'express' | 'type';
        code: string;
        args: Outer.VeProp[];
        thisObjectArgs: Outer.VeProp[];
        doc: Doc;
        compiler: Ve.Lang.Compiler;
        load(mode: Compiler['mode'], code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]): void;
        private reload;
        private timer;
        scan(interval?: number): void;
        private rce;
    }
}
declare namespace Ve.Lang.Ved {
    class Editor extends Ve.Lang.Util.BaseEvent {
        private fontSize;
        private fontFamily;
        private width;
        private height;
        private scrollX;
        private scrollY;
        readonly: boolean;
        lineHeight: number;
        wordWidth: number;
        private theme;
        private padding;
        constructor(ele: HTMLElement, options?: {
            fontSize?: number;
            lineHeight?: number;
            fontFamily?: string;
            width?: number;
            height?: number;
            theme?: 'light' | 'dark';
            padding?: number[];
            readonly?: boolean;
        });
        private _inited?;
        readonly fontStyle: {
            fontSize: number;
            fontFamily: string;
        };
        compiler: Compiler;
        private editor_wrapper_ele;
        private editor_ele;
        content_ele: HTMLElement;
        intellisense: Intellisense;
        hang: Hang;
        contextmenu: Contextmenu;
        cursor: Cursor;
        textInput: TextInput;
        selection: Selection;
        focused: boolean;
        onblur(): void;
        private _initElement;
        readonly paddingBound: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
        readonly bound: Rect;
        readonly visibleBound: Rect;
        readonly doc: Doc;
        relativeContentPoint(point: {
            x: number;
            y: number;
        }): Point;
        load(this: Editor, code: string): void;
        loadExpress(this: Editor, code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]): void;
        loadType(this: Editor, code: string): void;
        loadBlock(this: Editor, code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]): void;
        getCode(): string;
        setOption(options: {
            fontSize?: number;
            lineHeight?: number;
            fontFamily?: string;
            width?: number;
            height?: number;
            theme?: 'light' | 'dark';
            padding?: number[];
            readonly?: boolean;
        }): void;
        layout(options?: {
            width: number;
            height: number;
        }): void;
    }
    interface Editor {
        on(name: 'focus', fn: (event: FocusEvent) => void): any;
        on(name: 'blur', fn: (event: FocusEvent) => void): any;
        on(name: 'contextmenu', fn: (cursor: Cursor, event: MouseEvent) => void): any;
        on(name: 'mousedown', fn: (cursor: Cursor, event: MouseEvent) => void): any;
        on(name: 'save', fn: (code: string) => void): any;
        on(name: 'change', fn: () => void): any;
        on(name: 'error', fn: (error: Error | string) => void): any;
        on(name: 'createHistory', fn: (history: History) => void): any;
        on(name: 'writeHistory', fn: (history: History) => void): any;
        on(name: 'clearHistory', fn: (history: History) => void): any;
        on(name: 'writeSnapshot', fn: (snapshot: ActionSnapshot) => void): any;
        on(name: 'canRedo', fn: (canRedo: boolean) => void): any;
        on(name: 'canUndo', fn: (canUndo: boolean) => void): any;
    }
}
declare namespace Ve.Lang.Ved {
    class Contextmenu {
        private editor;
        private ele;
        constructor(editor: Editor, ele: HTMLElement);
    }
}
declare namespace Ve.Lang.Ved {
    class Cursor {
        private timer;
        private editor;
        private ele;
        position: SpanPosition;
        constructor(editor: Editor, ele: HTMLElement);
        update(): void;
        render(): void;
        hidden(): void;
        visible(): void;
        setCursor(point: Point): void;
        resetCursor(): void;
        move(arrow: 'arrow-left' | 'arrow-right' | 'arrow-down' | 'arrow-up' | 'page-down' | 'page-up'): void;
        insertText(text: string): void;
        insertLine(): void;
        deleteWord(arrow: 'before' | 'after'): void;
        deleteLine(): void;
    }
    class SpanPosition {
        editor: Editor;
        row: number;
        col: number;
        constructor(editor: Editor, row?: number, col?: number);
        copy(): SpanPosition;
        copyFrom(sp: SpanPosition): void;
        readonly top: number;
        readonly left: number;
        readonly tokenSpan: TokenSpan;
        readonly tillTokenSpan: TokenSpan;
        readonly line: Line;
        pos: {
            row: number;
            col: number;
        };
    }
}
declare namespace Ve.Lang.Ved {
    class Hang {
        private editor;
        private ele;
        constructor(editor: Editor, ele: HTMLElement);
        timer: NodeJS.Timer;
        span: HTMLElement;
        type: 'warn' | 'error' | 'info' | 'property';
        title: string;
        des: string;
        private init;
        clear(): void;
        hide(): void;
        show(): void;
        render(): void;
    }
}
declare namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    class Intellisense extends Ve.Lang.Util.BaseEvent {
        private editor;
        private ele;
        constructor(editor: Editor, ele: HTMLElement);
        init(): void;
        open: boolean;
        markWords: List<{
            type: string;
            text: string;
            description?: string;
        }>;
        focusIndex: number;
        render(): void;
        close(): void;
        onSelectMarkWords(markWord: ListOf<Intellisense['markWords']>): void;
        moveFocusIndex(arrow: 'arrow-down' | 'arrow-up'): void;
        enter(event: KeyboardEvent): void;
    }
    interface Intellisense {
        on(name: 'selectMarkWord', fn: (markWord: ListOf<Intellisense['markWords']>) => void, isR?: boolean): any;
    }
}
declare namespace Ve.Lang.Ved {
    class Selection {
        private ele;
        private editor;
        constructor(editor: Editor, ele: HTMLElement);
        start: SpanPosition;
        private _end;
        end: SpanPosition;
        clear(): void;
        readonly isEmpty: boolean;
        readonly isNotEmpty: boolean;
        isInSelection(point: Point): boolean;
        selectAll(): void;
        selectLine(): void;
        deleteAll(): void;
        readonly code: string;
        private render;
        private getRowBounds;
        getMinAndMax(): {
            min: SpanPosition;
            max: SpanPosition;
        };
        copy(): Selection;
        createDragEvent(): DragSelectionEvent;
    }
    class DragSelectionEvent {
        selection: Selection;
        constructor(editor: Editor, selection: Selection);
        private editor;
        isDown: boolean;
        isMove: boolean;
        startCursor: SpanPosition;
        start?: Point;
        current?: Point;
        operator: 'selection' | 'drag-selection' | 'none';
        dragDown(point: Point): void;
        dragMove(event: Point): void;
        dragEnd(event: Point): void;
        clear(): void;
    }
}
declare namespace Ve.Lang.Ved {
    class TextInput {
        private editor;
        private ele;
        constructor(editor: Editor, ele: HTMLTextAreaElement);
        private init;
        render(): void;
        active(): void;
        blur(): void;
        private pos;
        private lastValue;
        focus(): void;
        enter(event: KeyboardEvent): void;
        deleteSelection(): void;
        input(): void;
        paster(event: ClipboardEvent): void;
        backspace(event: KeyboardEvent): void;
        delete(event: KeyboardEvent): void;
    }
}
declare namespace Ve.Lang.Ved {
    class Doc$Recorder {
        recoder: HistoryRecorder;
        initRecoder(this: Doc): void;
        readonly canRedo: boolean;
        readonly canUndo: boolean;
        onRedo(this: Doc): void;
        onUndo(this: Doc): void;
        redo(this: Doc, history: History): void;
        undo(this: Doc, history: History): void;
    }
}
declare namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    class Doc {
        editor: Editor;
        el: HTMLElement;
        private errors;
        constructor(editor: Editor, el: HTMLElement);
        clearError(): void;
        appendError(error: Ve.Lang.VeLangError): void;
        getTokenError(token: Token): VeLangError;
        tokens: List<Token>;
        load(tokens: List<Token>): void;
        render(): void;
        private lines;
        getCode(): string;
        findTokenSpan(predict: (ts: TokenSpan) => boolean): TokenSpan;
        findLine(predict: (line: Line) => boolean): Line;
        line(row: number): Line;
        getLineIndex(predict: (line: Line) => boolean): number;
        insertAt(at: number, line: Line): void;
        remove(predict: ((line: Line) => boolean) | Line): List<Line>;
        readonly length: number;
        readonly last: Line;
        readonly first: Line;
    }
    interface Doc extends Doc$Recorder {
    }
}
declare namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    class Line {
        constructor(doc: Doc);
        ele: HTMLElement;
        doc: Doc;
        spans: List<TokenSpan>;
        render(): void;
        readonly html: string;
        readonly editor: Editor;
        readonly code: string;
        readonly value: string;
        readonly end: number;
        readonly bound: Rect;
        readonly contentBound: Rect;
        readonly top: number;
        readonly width: number;
        readonly index: number;
        readonly prev: Line;
        readonly next: Line;
        readonly prevTokenSpan: TokenSpan;
        readonly prevToken: Token;
        readonly nextToken: Token;
        readonly startPosition: SpanPosition;
        readonly endPosition: SpanPosition;
        findPointPosition(point: Point): SpanPosition;
        findTokenSpan(col: number): TokenSpan;
        remove(): void;
        append(span: TokenSpan): void;
        insertText(col: number, text: string): void;
        replaceText(col: number, text: string, limitSize?: number): void;
        readonly isEmpty: boolean;
        readonly isNotEmpty: boolean;
        delete(startCol: number, endCol: number): void;
        getValue(startCol: number, endCol: number): string;
        cutKeepLeft(col: number): {
            spans: List<TokenSpan>;
            word: string;
        };
        removeTokenSpan(tokenSpan: TokenSpan): void;
        unionLine(line: Line): void;
        createSimulateLine(word?: string, spans?: List<TokenSpan>): Line;
        createSimulateToken(insertValue: string): Token;
    }
}
declare namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    class TokenSpan {
        constructor(token: Token, line: Line);
        ele: HTMLElement;
        line: Line;
        readonly doc: Doc;
        readonly editor: Editor;
        token: Token;
        readonly classList: string;
        render(): void;
        readonly deep: number;
        readonly range: number[];
        readonly col: number;
        readonly end: number;
        readonly size: number;
        readonly top: number;
        readonly left: number;
        readonly width: number;
        readonly bound: Rect;
        readonly charBounds: {
            char: string;
            wordIndx: number;
            rect: Rect;
        }[];
        readonly content: any;
        value: string;
        readonly isEmpty: boolean;
        readonly html: string;
        readonly index: number;
        readonly prev: TokenSpan;
        readonly prevTill: Token | TokenSpan;
        readonly next: TokenSpan;
        readonly nextTill: Token | TokenSpan;
        readonly prevTokens: List<TokenSpan>;
        readonly nextTokens: List<TokenSpan>;
    }
}
declare namespace Ve.Lang.Ved {
    enum HistoryCommand {
        onKeyCut = 0,
        onKeyPaster = 1,
        onKeyCancel = 2,
        onKeyRedo = 3,
        onKeyBackspace = 4,
        onKeyDelete = 5,
        onKeyShiftDelete = 6,
        onKeyEnter = 7,
        InputWords = 8
    }
    enum HistoryAction {
        createLine = 0,
        deleteLine = 1,
        deleteLineRange = 2,
        lineRemoveTokenSpan = 3,
        insertTokenSpan = 4,
        updateTokenSpan = 5
    }
    class ActionSnapshot {
        action: HistoryAction;
        data: {
            col?: number;
            row?: number;
            oldValue?: string;
            newValue?: string;
            value?: string;
            startCol?: number;
            endCol?: number;
        };
        private date;
        constructor(data: Partial<ActionSnapshot>);
        get(): {
            action: string;
            date: string;
            data: {
                col?: number;
                row?: number;
                oldValue?: string;
                newValue?: string;
                value?: string;
                startCol?: number;
                endCol?: number;
            };
        };
    }
    interface HistoryRecorder {
        writeSnapshot(action: HistoryAction.deleteLine, data: {
            row: number;
            value: string;
        }): any;
        writeSnapshot(action: HistoryAction.deleteLineRange, data: {
            row: number;
            startCol: number;
            endCol: number;
            value: string;
        }): any;
        writeSnapshot(action: HistoryAction.createLine, data: {
            row: number;
            value: string;
        }): any;
        writeSnapshot(action: HistoryAction.lineRemoveTokenSpan, data: {
            row: number;
            col: number;
            value: string;
        }): any;
        writeSnapshot(action: HistoryAction.insertTokenSpan, data: {
            row: number;
            col: number;
            value: string;
        }): any;
        writeSnapshot(action: HistoryAction.updateTokenSpan, data: {
            row: number;
            col: number;
            oldValue: string;
            newValue: string;
        }): any;
    }
}
declare namespace Ve.Lang.Ved {
    class HistoryRecorder {
        doc: Doc;
        readonly editor: Editor;
        supervisor: HistorySupervisor;
        constructor(doc: Doc);
        private history;
        createHistory(command: HistoryCommand): void;
        writeHistory(): void;
        clearHistory(): void;
    }
}
declare namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    class History {
        supervisor: HistorySupervisor;
        command: HistoryCommand;
        snapshots: List<ActionSnapshot>;
        oldCursor: {
            row: number;
            col: number;
        };
        newCursor: {
            row: number;
            col: number;
        };
        constructor(command: HistoryCommand, supervisor: HistorySupervisor);
        readonly index: number;
        readonly next: History;
        date: number;
        get(): {
            command: string;
            snapshots: List<{
                action: string;
                date: string;
                data: {
                    col?: number;
                    row?: number;
                    oldValue?: string;
                    newValue?: string;
                    value?: string;
                    startCol?: number;
                    endCol?: number;
                };
            }>;
            date: string;
        };
    }
    class HistorySupervisor extends Ve.Lang.Util.BaseEvent {
        index: number;
        maxLength: number;
        historyList: List<History>;
        readonly current: History;
        readonly next: History;
        readonly canRedo: boolean;
        readonly canUndo: boolean;
        onRedo(): void;
        onUndo(): void;
        append(history: History): void;
        clear(): void;
    }
}
declare namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    var keyInfos: ({
        "text": string;
        "code": number;
        "name"?: undefined;
    } | {
        "text": string;
        "code": number;
        "name": string;
    })[];
    class KeyBoard {
        private event;
        constructor(event: KeyboardEvent);
        readonly isShift: boolean;
        readonly isCtrl: boolean;
        readonly isAlt: boolean;
        readonly keys: List<string>;
        readonly key: string;
        match(key: string): boolean;
        everyMatch(key: string): boolean;
    }
}
declare namespace Ve.Lang.Ved {
    class Point {
        x: number;
        y: number;
        constructor(x: number | {
            x: number;
            y: number;
        }, y?: number);
        add(point: Point): Point;
        sub(point: Point): Point;
        isInRect(rect: Rect): boolean;
    }
    class Rect {
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(x: number | {
            x: number;
            y: number;
            width: number;
            height: number;
        }, y?: number, width?: number, height?: number);
        readonly right: number;
        readonly bottom: number;
        readonly point: Point;
        isInside(point: Point): boolean;
    }
}
declare namespace Ve.Lang.Ved {
    class Util {
        static computeFontSize(text: any, fontStyle: {
            fontSize: number;
            fontFamily: string;
        }): Record<string, any>;
        private static __g;
        static getTextbound(text: string, fontStyle: {
            fontSize: number;
            fontFamily: string;
        }): TextMetrics | {
            width: number;
        };
        static htmlEscape(sHtml: any): any;
    }
}
