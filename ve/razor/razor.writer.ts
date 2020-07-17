namespace Ve.Lang {
    let Variable_COUNTER = 0;
    export class RazorWriter {
        codes: string[];
        writeVariable: string;
        constructor(options?: {
            writeVariable: string
        }) {
            if (typeof options == 'object') {
                if (typeof options.writeVariable != typeof undefined) {
                    this.writeVariable = options.writeVariable;
                }
            }
            if (typeof this.writeVariable == typeof undefined)
                this.writeVariable = `__$$rt${++Variable_COUNTER}`;
            this.codes = [`\nvar ${this.writeVariable}=[];\n`];
        }
        writeExpress(text: string) {
            this.codes.push(`\n${this.writeVariable}.push(${text});\n`);
        }
        writeString(text: string) {
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
        writeCode(text: string) {
            this.codes.push(text);
        }
        write(razor: Razor) {
            if (razor.env == RazorEnviroment.text) {
                switch (razor.type) {
                    case RazorType.quote:
                        this.writeString(razor.value);
                        razor.childs.forEach(r => this.write(r));
                        this.writeString(razor.value);
                        break;
                    case RazorType.text:
                    case RazorType.escape:
                        this.writeString(razor.value);
                        break;
                    case RazorType.blockLeft:
                        this.writeString('{');
                        razor.childs.forEach(r => this.write(r));
                        this.writeString('}');
                        break;
                    case RazorType.bracketLeft:
                        this.writeString('(');
                        razor.childs.forEach(r => this.write(r));
                        this.writeString(')');
                        break;
                    case RazorType.helper:
                        this.writeCode(`function ${razor.value}{`);
                        var rw: RazorWriter = new RazorWriter();
                        razor.childs.forEach(x => rw.write(x));
                        this.writeCode(rw.outputCode());
                        this.writeCode('}');
                        break;
                    case RazorType.section:
                        this.writeCode(`sectionRegister('${razor.value}',function(){`);
                        var rw: RazorWriter = new RazorWriter();
                        razor.childs.forEach(x => rw.write(x));
                        this.writeCode(rw.outputCode());
                        this.writeCode(`})`);
                        break;
                    case RazorType.lineText:
                    case RazorType.blockText:
                    case RazorType.fragment:
                        razor.childs.forEach(r => this.write(r));
                        break;
                }
            }
            else {
                switch (razor.type) {
                    case RazorType.quote:
                        this.writeCode(razor.value);
                        razor.childs.forEach(r => this.write(r));
                        this.writeCode(razor.value);
                        break;
                    case RazorType.text:
                    case RazorType.escape:
                        this.writeCode(razor.value);
                        break;
                    case RazorType.if:
                    case RazorType.elseif:
                    case RazorType.for:
                    case RazorType.while:
                        this.writeCode(RazorType.elseif == razor.type ? 'else if' : RazorType[razor.type])
                        this.writeCode('(');
                        razor.childs.forEach(r => this.write(r));
                        this.writeCode(')');
                        break;
                    case RazorType.else:
                        this.writeCode('else {');
                        razor.childs.forEach(r => this.write(r));
                        this.writeCode('}');
                    case RazorType.block:
                        razor.childs.forEach(r => this.write(r));
                        break;
                    case RazorType.bracket:
                        this.writeExpress(razor.childs.map(x => x.value).join(""));
                        break;
                    case RazorType.value:
                        this.writeExpress(razor.value);
                        break;
                    case RazorType.method:
                        this.writeExpress(`${razor.value}(${razor.childs.map(x => this.read(x)).join("")})`);
                        break;
                    case RazorType.blockLeft:
                        this.writeCode('{');
                        razor.childs.forEach(r => this.write(r));
                        this.writeCode('}');
                        break;
                    case RazorType.bracketLeft:
                        this.writeCode('(');
                        razor.childs.forEach(r => this.write(r));
                        this.writeCode(')');
                        break;
                }
            }
        }
        read(razor: Razor) {
            var text = razor.value || '';
            if (razor.childs && razor.childs.length > 0)
                razor.childs.forEach(r => {
                    text += this.read(r);
                })
            switch (razor.type) {
                case RazorType.quote:
                    text += razor.value;
                    break;
                case RazorType.blockLeft:
                    text += "}";
                case RazorType.bracketLeft:
                    text += ')';
            }
            return text;
        }
        outputCode() {
            return this.codes.join('') + `\nreturn ${this.writeVariable}.join("");\n`;
        }
    }
}