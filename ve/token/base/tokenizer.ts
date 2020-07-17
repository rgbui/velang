/// <reference path="../../util/array.ts" />
/// <reference path='mode.ts'/>
/// <reference path='stringStream.ts'/>



namespace Ve.Lang {
    const NEWLINE = /\n|(\r\n)|\r/g;
    /**
     * 词法分析
     * 1.把字符流转换为记号流Token
     * 2.对记号流Token进行修复调整（从全局，上下文）
     * *** */
    export class Tokenizer<T> {
        code: string;
        mode: Mode<T>;
        lines: VeArray<string>;
        state: State<T>;
        isNewLineParse: boolean;
        constructor(code: string, mode: Mode<T>, isNewLineParse: boolean = true) {
            this.code = code;
            this.mode = mode;
            this.lines = new VeArray<string>();
            this.isNewLineParse = isNewLineParse;
        }
        onStartState(): State<T> {
            return this.mode.startState();
        }
        onToken(sr: StringStream, state: State<T>) {
            this.mode.token(sr, state);
        }
        onTokenStart(sr: StringStream, state: State<T>) {
            if (typeof this.mode.tokenStart == 'function')
                this.mode.tokenStart(sr, state);
        }
        onTokenEnd(sr: StringStream, state: State<T>) {
            if (typeof this.mode.tokenEnd == 'function')
                this.mode.tokenEnd(sr, state);
        }
        onParse() {
            this.state = this.onStartState();
            if (this.isNewLineParse == true) {
                this.code.split(NEWLINE).forEach(x => this.lines.push(x));
                this.lines.each((text, row) => {
                    if (typeof text == 'string') {
                        var sr = new StringStream(text, row + 1);
                        this.onTokenStart(sr, this.state);
                        while (!sr.eol()) {
                            var p = sr.pos;
                            this.onToken(sr, this.state);
                            if (sr.pos == p) {
                                //没有任何的处理，会卡死，在解析中，不存在没有任何的处理，出现这个，只能是在调试中有问题
                                console.log(text, sr, sr.pos);
                                break;
                            }
                        }
                        this.onTokenEnd(sr, this.state);
                    }
                })
            }
            else {
                var sr = new StringStream(this.code);
                this.onTokenStart(sr, this.state);
                while (!sr.eol()) {
                    var p = sr.pos;
                    this.onToken(sr, this.state);
                    if (sr.pos == p) {
                        //没有任何的处理，会卡死，在解析中，不存在没有任何的处理，出现这个，只能是在调试中有问题
                        console.log(this.code, sr, sr.pos);
                        break;
                    }
                }
                this.onTokenEnd(sr, this.state);
            }
            if (typeof this.mode.revise == 'function')
                this.mode.revise();
            return this.state.root;
        }
    }
}