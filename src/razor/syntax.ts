///<reference path='../token/tokenizer.ts'/>



namespace Ve.Lang.Razor {


    /***
     *@for(){}
     *@while(){} 
     *@if(){ }else if(){ } else{ }
     *@{}
     *@()
     * 
     *转义符["@@","@)","@}","@#{","@#("]
     *()和{}正常是成双成对，转义符主要用来匹配半个
     * 注释
     * @**@
     * 
     **/
    export var RazorSyntax: LangSyntax = {
        root: [
            { name: 'text', match: /[^@\(\)\{\} \t]+/ },
            { match: /@[ \t]*if[ \t]*\(/, name: 'if', push: true },
            { match: /@[ \t]*(for|while)[ \t]*\(/, name: 'forwhile', push: true },
            { match: ['@@', '@)', '@#{', '@}', "@#("], name: 'escape' },
            { match: /@\(/, name: 'bracket.value.open', push: true },
            { match: /@\{/, name: 'bracket.block.open', push: true },
            { match: /@([a-zA-Z_\$\u4E00-\u9FA5][a-zA-Z_\$\u4E00-\u9FA5\d]*)([ \t]*\.[ \t]*[a-zA-Z_\$\u4E00-\u9FA5][a-zA-Z_\$\u4E00-\u9FA5\d]*)*[ \t]*\(/, push: true, name: 'method.open' },
            { match: /@([a-zA-Z_\$\u4E00-\u9FA5][a-zA-Z_\$\u4E00-\u9FA5\d]*)([ \t]*\.[ \t]*[a-zA-Z_\$\u4E00-\u9FA5][a-zA-Z_\$\u4E00-\u9FA5\d]*)*/, name: 'variable' },
            { match: /\(/, name: 'bracket.open', push: true },
            { match: /\{/, name: 'bracket.big.open', push: true },
            { match: /@\*/, next: '@comment', name: 'comment.open', push: true },
            {
                match: ')',
                name: 'bracket.close',
                pop: true,
                action(contextToken: Token) {
                    if (contextToken.name == 'if' || contextToken.name == 'elseif') {
                        return {
                            next: '@if'
                        }
                    }
                }
            },
            {
                match: '}',
                name: 'bracket.big.close',
                pop: true,
                action(contextToken: Token) {
                    if (contextToken.isPrevMatch(/(if\(\)|elseif\(\))[s|n]*\{$/)) {
                        return {
                            next: '@if'
                        }
                    }
                }
            },
            { name: 'text', match: /@/ },
            { name: "white", match: /[ \t]+/ }
        ],
        if: [
            {
                name: 'bracket.if',
                match: '{',
                push: true,
                next: '@root',
                action(contextToken: Token) {
                    if (!['if', 'elseif'].includes(contextToken.name)) return {
                        nextTurn: '@root'
                    }
                }
            },
            { name: 'elseif', match: /[ \t]*else[ \t]+if[ \t]*\(/, push: true },
            { name: 'else', match: /[ \t]*else[ \t]*\{/, push: true },
            { name: 'if.end', nextTurn: '@root' }
        ],
        comment: [
            { match: /[^@\*]+/, name: 'comment' },
            { match: /\*@/, name: 'comment.end', pop: true, next: '@root' },
            { match: /[@\*]/, name: 'comment' }
        ]
    }
    export class RazorToken extends Token {
        get flag() {
            if (this.name == 'line') return 'n';
            else if (this.name == 'text') return 'text';
            else if (this.name == 'if') return 'if(';
            else if (this.name == 'elseif') return 'elseif(';
            else if (this.name == 'forwhile') return 'for(';
            else if (this.name == 'else') return 'else{';
            else if (this.name == 'bracket.if') return '{';
            else if (this.name.startsWith('comment')) return 'c';
            else if (this.name == 'bracket.open') return '('
            else if (this.name == 'bracket.close') return ')'
            else if (this.name == 'bracket.big.open') return '{'
            else if (this.name == 'bracket.big.close') return '}'
            else if (this.name == 'bracket.value.open') return '#('
            else if (this.name == 'bracket.block.open') return '#{'
            else if (this.name == 'escape') return 'e';
            else if (this.name == 'method.open') return '#method(';
            else if (this.name == 'variable') return '#varibale';
            else if (this.name == 'white') return 's'
            return this.name;
        }
    }
    export class RazorTokenizer extends Tokenizer {
        init() {
            this.load(RazorSyntax);
        }
        createToken() {
            return new RazorToken();
        }
    }
}