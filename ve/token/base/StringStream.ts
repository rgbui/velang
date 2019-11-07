/// <reference path="../../util/array.ts" />

namespace Ve.Lang {
    export class StringStream {
        pos: number;
        str: string;
        row: number;
        constructor(str: string, row?: number) {
            this.pos = 0; this.str = str;
            if (typeof row != typeof undefined) this.row = row;
        }
        till(text: string | VeArray<string>, consider: boolean = false, predict?: (str: string) => boolean): string {
            var pos = this.pos;
            var index = pos;
            var ts = typeof text == 'string' ? new VeArray(text) : text;
            var rest = this.rest();
            while (!this.eol()) {
                var findText, findIndex;
                ts.each(t => {
                    if (rest.indexOf(t) > -1) {
                        findText = t;
                        findIndex = rest.indexOf(t);
                        return false;
                    }
                })
                if (typeof findIndex == 'number') {
                    index += findIndex;
                    if (typeof predict == 'function') {
                        var matchedText = this.slice(pos, index + (consider ? findText.length : 0));
                        if (predict(matchedText) != false) {
                            if (consider == true) index += findText.length;
                            this.pos = index;
                            return this.slice(pos, this.pos);
                        }
                        else {
                            index += 1;
                            rest = this.str.substring(index);
                        }
                    }
                    else {
                        this.pos = index;
                        if (consider == true) this.pos += findText.length;
                        return this.slice(pos, this.pos);
                    }
                }
                else {
                    break;
                }
            }
            return ``;
        }
        match(
            pattern: string | VeArray<string> | RegExp,
            matchAfterPattern?: RegExp | string | VeArray<string> | ((str: string) => boolean)): string {
            if (typeof pattern == 'string') {
                return this.match(new VeArray<string>(pattern), matchAfterPattern);
            }
            else if (pattern instanceof VeArray) {
                var restStr = this.rest();
                var text;
                pattern.each(p => {
                    if (restStr.indexOf(p) == 0) {
                        if (typeof matchAfterPattern != typeof undefined) {
                            var next = restStr.substring(p.length);
                            if (next) {
                                var c = next[0];
                                if (typeof matchAfterPattern == 'string') {
                                    if (c.indexOf(matchAfterPattern) == 0) {
                                        text = p;
                                        return false;
                                    }
                                }
                                else if (matchAfterPattern instanceof VeArray) {
                                    if (matchAfterPattern.exists(x => c.indexOf(x) == 0)) {
                                        text = p;
                                        return false;
                                    }
                                }
                                else if (matchAfterPattern instanceof RegExp) {
                                    if (matchAfterPattern.test(c)) {
                                        text = p;
                                        return false;
                                    }
                                }
                                else if (typeof matchAfterPattern == 'function') {
                                    if (matchAfterPattern(c)) {
                                        text = p;
                                        return false;
                                    }
                                }
                            } else {
                                text = p;
                                return false;
                            }
                        } else {
                            text = p;
                            return false;
                        }
                    }
                })
                if (typeof text == 'string') {
                    this.pos += text.length;
                }
                return text;
            }
            else if (pattern instanceof RegExp) {
                let match = this.rest().match(pattern);
                if (match && match.index > 0) return null
                if (!match) return null;
                this.pos += match[0].length
                return match[0]
            }
        }
        startWith(pattern: string): boolean {
            var text = this.match(pattern);
            if (text && text) {
                this.backUp(text.length);
                return true;
            }
            return false;
        }
        skipToEnd(): string {
            if (this.eol()) return '';
            var pos = this.pos;
            this.pos = this.str.length;
            var r = this.slice(pos, this.pos);
            if (typeof r == 'string') return r;
            else return '';
        }
        rest(): string {
            return this.str.slice(this.pos, this.str.length);
        }
        eol(): boolean {
            return this.pos >= this.str.length
        }
        slice(from: number, to: number): string {
            return this.str.slice(from, to);
        }
        eatSpace(): string | null {
            let start = this.pos;
            while (/[\s\u00a0]/.test(this.str.charAt(this.pos)))++this.pos
            if (this.pos > start) {
                return this.slice(start, this.pos);
            } else return null;
        }
        next(): string | null {
            //返回当前，并跳到一下个
            if (this.pos < this.str.length)
                return this.str.charAt(this.pos++)
            else return null;
        }
        backUp(n: number) {
            this.pos -= n
        }
        current() {
            return this.str.slice(0, this.pos)
        }

    }
}