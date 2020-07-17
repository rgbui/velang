namespace Ve.Lang.Ved {

    export class Contextmenu {
        private editor: Editor;
        private ele: HTMLElement;
        constructor(editor: Editor, ele: HTMLElement) {
            this.editor = editor;
            this.ele = ele;
        }
    }
}