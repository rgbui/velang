///<reference path='../../token/syntax.regex.ts'/>
namespace Ve.Lang {
    /***
    * @param  s表示空格
    * @param  n表示换行符
    * @param  blank表示空白符（包括换符号和空格符）
    * @param  decorate 表示注解
    * @param  modify 表示方法的修辞符
    *    
    */
    export var veStatementSyntax: LangSyntax = {
        blank: /space|line|comment/,
        white: /space|line/,

        modify: /(decorate|out|readonly|inner|static|public|protected|private|override|partial|sealed)@blank*/,
        generic: /\<\>@blank*/,
        word: /word|type/,
        wordType: /word|type|void/,
        namespace: /@word(@blank*\.@blank*@word)*@blank*/,
        namespaceType: /@wordType(@blank*\.@blank*@word)*@blank*/,
        /****可以自定义操作符的符号 */
        symbols: /[\+\-\*%\/\|&\>\<\=!]+|(as|is|in|and|xor|or)/,
        block: /@blank*\{\}@blank*/,
        decorate: /#@namespace(\(\)@blank*)?(;@blank*)?/,
        root: [
            { name: 'package', match: /package@blank+@namespace(;@blank*)?/ },
            { name: 'use', match: /use/ },
            { name: 'fun', match: /@decorate*@modify*fun@blank+@word@generic?\(\)/ },
            { name: 'enum', match: /@decorate*@modify*enum@blank+@word@blank*\{\}/ },
            { name: 'class', match: /@decorate*@modify*(class|interface)@blank+@word@blank*@generic?(extends@blank*@word@blank*)?\{\}/ },

            { name: 'def', match: /def|const/ },

            { name: 'if', match: /if/ },
            { name: 'when', match: /when/ },
            { name: 'while', match: /while/ },
            { name: 'for', match: /for/ },
            { name: 'switch', match: /switch/ },
            { name: 'try', match: /try/ },

            { name: 'break', match: /break/ },
            { name: 'continue', match: /continue/ },
            { name: 'return', match: /return/ },
            { name: 'throw', match: /throw/ },

            { name: 'block', match: /@block/ },
            { name: 'blank', match: /@blank+/ },
            { name: 'emptyStatement', match: /;/ },
            { name: 'express' },
        ],
        class: [
            { name: 'operator', match: /@decorate*@modify*operator@blank+@symbols@blank*\(\)/ },
            { name: 'field', match: /@decorate*@modify*(get|set)@blank+@word@blank*\(\)/ },
            { name: 'method', match: /@decorate*@modify*(@word|ctor|get|set)@blank*@generic?\(\)/ },
            { name: 'property', match: /@decorate*@modify*@word/ },
            { name: 'blank', match: /@blank+/ },
            { name: 'emptyStatement', match: /;/ },
        ],
        if: [
            { name: 'condition', match: /if@blank*\(\)/ },
            { name: 'elseCondition', match: /@blank*else@blank+if@blank*\(\)/ },
            { name: 'else', match: /@blank*else/ }
        ],
        for: [
            { name: 'condition', match: /for@blank*\(\)/ }
        ],
        while: [
            { name: 'condition', match: /while@blank*\(\)/ }
        ],
        switch: [
            { name: 'statement', match: /switch@blank*\(\)@blank*\{\}/ }
        ],
        when: [
            { name: 'statement', match: /when@blank*\{\}/ }
        ],
        try: [
            { name: 'name', match: /try/ },
            { name: 'catch', match: /catch@blank*\(\)/ },
            { name: 'finally', match: /finally/ }
        ]
    };
    Ve.Lang.convertLangSyntax(veStatementSyntax);
    /***
    * 
    * @param precedence 运算优先级 如果为-1表示无意义
    * @param direction 运算求值，默认为-1表示无意义  从左到右(0)，从右到左(1)
    * @param operand 操作数 0 表示没有 1:单元运算符 2:二元运算符 3:表示三元运算符
    * 
    */
    export type OperatorPrecedence = {
        name: string,
        match?: string | (string | RegExp)[] | RegExp,
        precedence: number,
        direction?: number,
        operand?: number
    }

    export var veOperatorPrecedences: OperatorPrecedence[] = [

        { name: '[', match: /\[\]/, precedence: 16 },
        { name: '{', match: /\{\}/, precedence: 16 },
        { name: '(', match: /\(\)/, precedence: 16 },
        { name: 'new', match: 'new', precedence: 15, operand: 1 },
        { name: '==', match: '==', precedence: 9, direction: 0, operand: 2 },
        { name: '@', match: '@', precedence: 16, operand: 1 },
        { name: '?.', match: '?.', precedence: 16, operand: 2 },
        { name: '...', match: '...', precedence: 15, operand: 1 },
        { name: '..', match: '..', precedence: 15, operand: 2 },
        { name: '.', match: '.', precedence: 16, operand: 2 },
        { name: '++', match: '++', precedence: 15.5, operand: 1 },
        { name: '--', match: '--', precedence: 15.5, operand: 1 },
        { name: '=', match: '=', precedence: 2, direction: 1, operand: 2 },
        { name: '+=', match: '+=', precedence: 2, direction: 1, operand: 2 },
        { name: '-=', match: '-=', precedence: 2, direction: 1, operand: 2 },

        { name: '**=', match: '**=', precedence: 2, direction: 1, operand: 2 },
        { name: '*=', match: '*=', precedence: 2, direction: 1, operand: 2 },
        { name: '%=', match: '%=', precedence: 2, direction: 1, operand: 2 },
        { name: '/=', match: '/=', precedence: 2, direction: 1, operand: 2 },

        { name: '||', match: '||', precedence: 4, direction: 0, operand: 2 },
        { name: '&&', match: '&&', precedence: 5, direction: 0, operand: 2 },
        /**类型空值运算符 */
        { name: '~~', match: '~~', precedence: 16, operand: 2 },
        { name: '+', match: '+', precedence: 12, direction: 0, operand: 2 },
        { name: '-', match: '-', precedence: 12, direction: 0, operand: 2 },

        { name: '/', match: '/', precedence: 13, direction: 0, operand: 2 },
        { name: '%', match: '%', precedence: 13, direction: 0, operand: 2 },
        { name: '**', match: '**', precedence: 13, direction: 0, operand: 2 },
        { name: '*', match: '*', precedence: 13, direction: 0, operand: 2 },
        { name: '??', match: '??', precedence: 14, direction: 0, operand: 2 },


        { name: '!=', match: '!=', precedence: 9, direction: 0, operand: 2 },
        { name: '!', match: '!', precedence: 15, operand: 1 },
        { name: '<=', match: '<=', precedence: 10, direction: 0, operand: 2 },
        { name: '>=', match: '>=', precedence: 10, direction: 0, operand: 2 },
        { name: '<', match: '<', precedence: 10, direction: 0, operand: 2 },
        { name: '>', match: '>', precedence: 10, direction: 0, operand: 2 },
        { name: 'or', match: 'or', precedence: 4, direction: 0, operand: 2 },
        { name: 'xor', match: 'xor', precedence: 4.5, direction: 0, operand: 2 },
        { name: 'and', match: 'and', precedence: 5, direction: 0, operand: 2 },
        { name: 'as', match: 'as', precedence: 9, direction: 0, operand: 2 },
        { name: 'is', match: 'is', precedence: 9, direction: 0, operand: 2 },
        { name: 'nas', match: /not@blank+as/, precedence: 9, direction: 0, operand: 2 },
        { name: 'nis', match: /not@blank+is/, precedence: 9, direction: 0, operand: 2 },
        { name: 'nor', match: /not@blank+or/, precedence: 4, direction: 0, operand: 2 },
        { name: 'nxor', match: /not@blank+or/, precedence: 4.5, direction: 0, operand: 2 },
        { name: 'nand', match: /not@blank+and/, precedence: 5, direction: 0, operand: 2 },

        { name: '?:', match: '?', precedence: 3, direction: 0, operand: 3 },
        { name: '?:', match: ':', precedence: 3, direction: 0, operand: 3 },
    ];
    veOperatorPrecedences.sort((x, y) => {
        if (x.match instanceof RegExp && typeof y.match == 'string') return -1;
        else if (x.match instanceof RegExp && y.match instanceof RegExp) return 0;
        else if (typeof x.match == 'string' && typeof y.match == 'string' && x.match.length > y.match.length) return -1;
        else return 1;
    })
    export function getStatementRegex(namespace): string | RegExp | (string[]) {
        var ns = namespace.split(/\./g);
        var n = veStatementSyntax[ns[0]];
        if (Array.isArray(n)) {
            return n.find(x => x.name == ns[1]).match;
        }
        else return n;
    }
}




