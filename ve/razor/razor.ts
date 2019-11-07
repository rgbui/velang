namespace Ve.Lang {
    export enum RazorType {
        /**代码片段 */
        fragment,
        /**输出文本 */
        text,
        /***引号很容易误导解析，需单独解析提练出来 */
        quote,
        quoteEnd,
        /**行文本 @:*/
        lineText,
        /**行文本结束*/
        lineEnd,
        /**大括号文本 @:{*/
        blockText,
        /**大括号{左边*/
        blockLeft,
        /**大括号右边 */
        blockRight,
        /**小括号@(*/
        bracketLeft,
        /** 小括号右边*/
        bracketRight,
        /** @if */
        if,
        /** @if(){ }else if(){ } */
        elseif,
        /** @if(){}else if(){ }else{ } */
        else,
        /** @while*/
        while,
        /** @for */
        for,
        /** @{} */
        block,
        /**@小括号*/
        bracket,
        /**@*eee*@ */
        comment,
        /**@i*/
        value,
        /**@ab.test() */
        method,
        /**@@*/
        escape,
        /**@helper ab(a,c){ } */
        helper,
        /**@section ab{ } */
        section
    }
    export enum RazorEnviroment {
        text,
        code
    }
    export class Razor {
        childs: Razor[] = [];
        type: RazorType;
        text: string;
        value: string;
        parent: Razor;
        col: number;
        size: number;
        row: number;
        env: RazorEnviroment;
        contentEnv: RazorEnviroment;
        get prev(): Razor {
            return this.parent.childs[(this.index - 1)];
        }
        get index(): number {
            return _.findIndex(this.parent.childs, x => x == this);
        }
        get isWhiteText(): boolean {
            if (this.type == RazorType.text)
                return /^[\s\n]+$/.test(this.text);
        }
        prevSearch(fx: (x: Razor) => boolean, isInclude = false): Razor {
            var index = this.index;
            for (let i = index + (isInclude ? 0 : -1); i >= 0; i--) {
                var x = this.parent.childs[i];
                if (fx(x) == true) return x;
            }
        }
        nextSearch(fx: (x: Razor) => boolean, isInclude = false): Razor {
            var index = this.index;
            for (let i = index + (isInclude ? 0 : 1); i < this.parent.childs.length; i++) {
                var x = this.parent.childs[i];
                if (fx(x) == true) return x;
            }
        }
        append(razor: Razor) {
            this.childs.push(razor);
            razor.parent = this;
        }
        closest(predict: (razor: Razor) => boolean) {
            if (predict(this) == true) return this;
            var p = this.parent;
            while (true) {
                if (p) {
                    if (predict(p) == true) return p;
                    else p = p.parent;
                }
                else {
                    break;
                }
            }
        }
        gs() {
            var json: any = {};
            json.type = RazorType[this.type];
            json.value = this.value;
            json.text = this.text;
            json.childs = this.childs.map(x => x.gs());
            json.env = RazorEnviroment[this.env];
            return json;
        }
    }
}