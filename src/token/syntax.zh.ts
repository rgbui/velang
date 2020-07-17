///<reference path='tokenizer.ts'/>
///<reference path='syntax.regex.ts'/>
namespace Ve.Lang {
    let keywords = [
        'async', 'await',
        'break', "when", 'switch', 'case', 'default', 'try', 'catch', 'finally', 'continue', 'const',
        'ctor','do','if','for', 'else', 'while', 'fun',
        'use', 'in', 'null',
        'return', 'decorate', 'package', 'super', 'new', 'this', 'throw', 'true', 'false',
        'def', 'void', 'not', 'is', 'as', 'and', 'or', 'xor', 'readonly',
        'out', 'inner', 'extends', 'enum', 'class', 'interface', 'super',
        'this', 'get', 'set', 'then', 'of', 'static', 'public', 'protected', 'private', 'sealed', 'operator',
        /**
         * 类型
         * */
        'any', 'Any', 'bool', 'Bool', 'number', 'Number', 'string', 'String', 'double', 'Double', 'Int', 'int',
        'Object', 'Array', 'Date'

    ].sort((x, y) => x.length > y.length ? -1 : 1);
    /**
     * 中文语法 token syntax
     * 
     */
    export var VeZhTokenSyntax: LangSyntax = {
        keywords: new RegExp(keywords.join("|")),
        operators: [
            '<=', '>=', '==', '!=', '->', '+', '-', '**',
            '*', '/', '%', '++', '--', '!', '~~', '&&', '||', '?', ':', '=', '+=', '-=',
            '*=', '**=', '/=', '%=',
            '#', '@', '...', '??', '?.', '..', '<', '>',
            /***中文符号 */
            '《=', '》=', '！=', '-》', '、', '！', '？', '：', '、=', '。。。', '？？', '？。', '。。', '《', '》',
            /**特殊符号
             * https://baike.baidu.com/item/%E4%B8%8D%E7%AD%89%E5%8F%B7/23446?fr=aladdin
             */
            // '≥', '≤', '≠',
            /**
             * 
             */
            // '÷','×'
        ],
        escapes: /\\\\([abfnrtv@\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        white: /[ \t\f\v]/,
        unit: /[a-zA-Z_\$￥\u4E00-\u9FA5]/,
        word: /@unit[a-zA-Z_\$￥\u4E00-\u9FA5\d]*/,
        namespace: /@word(@white(\.|。)@white@word)*/,
        number: /\d+((\.|。)\d+)?([eE][\-+]?\d+)?/,
        root: [
            { match: /@white+/, name: 'white' },
            { match: /(\/\/|、、).*$/, name: 'comment.line' },
            { match: /\/\*|、\*/, next: '@comment', name: 'comment.open', push: true },
            { match: /[\{\(\[（【]/, name: 'bracket.open', push: true },
            { match: /[\)\]）】]/, name: 'bracket.close', pop: true },
            /** 
             *  主要是区分}来源于{},还是@{}
             */
            {
                match: /}/,
                name: 'bracket.close',
                pop: true,
                action(contextToken: Token) {
                    if (contextToken && contextToken.value == '@{') {
                        var next = '@string_double_block';
                        if (contextToken.parent && contextToken.parent.value == '\'') next = '@string_single_block';
                        return {
                            next,
                            name: 'string.template.close'
                        }
                    }
                }
            },
            /****
             * 泛型<word(,word)*>
             */
            { match: /(\<|《)(?=@namespace(@white*(\,|，)@white*@namespace)*>)/, name: 'generic.bracket.open', next: '@generic', push: true },
            { match: /@number@word/, name: 'number.unit' },
            { match: /@number/, name: 'number' },
            { match: /@keywords(?![a-zA-Z_\$￥\u4E00-\u9FA5\d])/, name: 'keywords' },
            // { match: /@types(?![[a-zA-Z_\$\u4E00-\u9FA5\d])/, name: 'keywords' },
            { match: '@operators', name: 'operators' },
            { match: /[;,\.；，。]/, name: 'delimiter' },
            { match: /@word/, name: 'word' },

            { match: '"', name: 'string.double.open', next: '@string_double_block', push: true },
            { match: '\'', name: 'string.single.open', next: '@string_single_block', push: true },
            { match: /[“”]/, name: 'string.double.open', next: '@zh_string_double_block', push: true },
            { match: /[‘’]/, name: 'string.single.open', next: '@zh_string_single_block', push: true },
        ],
        comment: [
            { match: /[^\/\*、]+/, name: 'comment' },
            { match: /\*\/|\*、/, name: 'comment.end', pop: true, next: '@root' },
            { match: /[\/\*、]/, name: 'comment.escape' }
        ],
        string_double_block: [
            { match: /[^"\\@]+/, name: 'string.text' },
            { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
            { match: /@escapes/, name: 'string.escape' },
            { match: /@@word/, name: 'string.variable' },
            { match: /\\./, name: 'string.escape.invalid' },
            { match: '@', name: 'string.text' },
            { match: '"', name: 'string.double.close', pop: true, next: '@root' }
        ],
        string_single_block: [
            { match: /[^'\\@]+/, name: 'string.text' },
            { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
            { match: /@escapes/, name: 'string.escape' },
            { match: /@@word/, name: 'string.variable' },
            { match: /\\./, name: 'string.escape.invalid' },
            { match: '@', name: 'string.text' },
            { match: '\'', name: 'string.single.close', pop: true, next: '@root' }
        ],
        zh_string_double_block: [
            { match: /[^”“\\@]+/, name: 'string.text' },
            { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
            { match: /@escapes/, name: 'string.escape' },
            { match: /@@word/, name: 'string.variable' },
            { match: /\\./, name: 'string.escape.invalid' },
            { match: '@', name: 'string.text' },
            { match: /[”“]/, name: 'string.double.close', pop: true, next: '@root' }
        ],
        zh_string_single_block: [
            { match: /[^‘’\\@]+/, name: 'string.text' },
            { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
            { match: /@escapes/, name: 'string.escape' },
            { match: /@@word/, name: 'string.variable' },
            { match: /\\./, name: 'string.escape.invalid' },
            { match: '@', name: 'string.text' },
            { match: /[‘’]/, name: 'string.single.close', pop: true, next: '@root' }
        ],
        generic: [
            {
                match: /@namespace/,
                name: 'generic.type'
            },
            { match: /[,，]/, name: 'generic.delimiter' },
            { match: /[>》]/, name: 'generic.bracket.close', pop: true, next: '@root' },
            { match: /@white+/, name: 'generic.white' },
        ]
    }
    convertLangSyntax(VeZhTokenSyntax);
}