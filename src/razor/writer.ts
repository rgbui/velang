namespace Ve.Lang.Razor {
    let Variable_COUNTER = 0;
    export class RazorWriter {
        codes: string[];
        writeVariable: string;
        constructor(options?: {
            writeVariable: string
        }) {
            if (typeof options == 'object') {
                if (typeof options.writeVariable != 'undefined') {
                    this.writeVariable = options.writeVariable;
                }
            }
            if (typeof this.writeVariable == 'undefined')
                this.writeVariable = `__$$rt${++Variable_COUNTER}`;
            this.codes = [`\nvar ${this.writeVariable}=[];\n`];
        }
        private writeCode(text: string) {
            this.codes.push(text);
        }
        private writeValue(text: string) {
            if (typeof text == 'undefined' || text == null || text === '') return;
            this.codes.push(`\n${this.writeVariable}.push(${text});\n`);
        }
        private writeString(text: string) {
            text = text.replace(/(\n|"|\\|\t|\r)/g, function ($0, $1) {
                switch ($1) {
                    case '\n':
                        return '\\n';
                    case '"':
                        return "\\\"";
                    case '\\':
                        return '\\\\';
                    case '\t':
                        return '\\t';
                    case '\r':
                        return '\\\r';
                }
                return $0;
            })
            this.codes.push(`\n${this.writeVariable}.push(\"${text}\");\n`);
        }
        private writeScope(code: string) {
            if (this.scope == 'code') this.writeCode(code);
            else if (this.scope == 'text') this.writeString(code);
        }
        scope: 'code' | 'text' = 'text';
        write(token: Token) {
            if (token.name == 'root') {
                token.childs.each(token => {
                    this.write(token);
                })
            }
            else if (token.name.startsWith('comment')) {

            }
            else if (token.name == 'escape') {
                var value = token.value;
                if (value == '@@') value = '@';
                else if (value == '@#{') value = '{'
                else if (value == '@#(') value = '('
                else if (value == '@}') value = '}'
                else if (value == '@)') value = ')'
                this.writeScope(value);
            }
            else if (token.name == 'if' || token.name == 'elseif') {
                this.writeCode(token.name == 'if' ? 'if' : 'else if');
                this.scope = 'code';
                this.writeCode('(');
                token.childs.each(token => {
                    this.write(token);
                });
                this.writeCode(')');
                this.scope = 'code';
            }
            else if (token.name == 'else' || token.name == 'bracket.if') {
                if (token.name == 'else') this.writeCode('else');
                this.scope = 'text';
                this.writeCode('{');
                token.childs.each(token => {
                    this.write(token);
                });
                this.writeCode('}');
                this.scope = 'code';
            }
            else if (token.name == 'forwhile') {
                if (token.name.indexOf('for') > -1) this.writeCode('for')
                else this.writeCode('while')
                this.scope = 'code';
                this.writeCode('(');
                token.childs.each(token => { this.write(token); });
                this.writeCode(')');
                this.scope = 'code';
            }
            else if (token.name == 'method.open') {
                this.scope = 'code';
                this.writeValue(`${token.value.replace(/[@\t ]+/g, '')}${this.read(token.childs)})`);
                this.scope = 'text';
            }
            else if (token.name == 'variable') {
                this.scope = 'text';
                this.writeValue(`${token.value.replace(/[@ \t]+/, '')}`);
                this.scope = 'text';
            }
            else if (token.name == 'bracket.value.open') {
                /***@(value)*/
                this.scope = 'text';
                this.writeValue(`${this.read(token.childs)}`);
                this.scope = 'text';
            }
            else if (token.name == 'bracket.block.open') {
                /***@{} */
                this.scope = 'code';
                token.childs.each(t => { this.write(t) });
                this.scope = 'text';
            }
            else if (token.name == 'bracket.open') {
                this.writeScope(token.value);
                token.childs.each(t => {
                    this.write(t);
                });
                this.writeScope(')');
            }
            else if (token.name == 'bracket.big.open') {
                /****主要区分{来源于@forwhile还是普通的{}*/
                if (token.isPrevMatch(/(for\(\)|if\(\)|elseif\(\))[s|n]*\{$/)) {
                    this.writeCode('{')
                    this.scope = 'text';
                    token.childs.each(t => {
                        this.write(t);
                    });
                    this.scope = 'text';
                    this.writeCode('}');
                }
                else {
                    this.writeScope(token.value);
                    token.childs.each(t => {
                        this.write(t);
                    });
                    this.writeScope('}');
                }
            }
            else if (token.name == 'text') {
                this.writeScope(token.value);
            }
            else if (token.name == 'line' || token.name == 'white') {
                if (!token.isPrevMatch(/(for\(\)|if\(\)|elseif\(\))([s|n]*\{\})?[s|n]*$/))
                    this.writeScope(token.value);
            }
            else if (token.name == 'bracket.close' || token.name == 'bracket.big.close') {

            }
        }
        private read(token: Token | Util.List<Token>) {
            if (token instanceof Util.List) return token.map(t => this.read(t)).join("")
            else return token.value + this.read(token.childs);
        }
        outputCode() {
            return this.codes.join('') + `\nreturn ${this.writeVariable}.join("");\n`;
        }
    }
}