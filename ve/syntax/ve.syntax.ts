

///<reference path='../util/array.ts'/>
namespace Ve.Lang {

    export enum SymbolType {
        statement,
        constant,
        accessor,
        declaration,

        //一元运算符
        unary,
        //三元运算符
        tertiary,
        //二元运算符
        binary,
        block,
        closeBlock,

        modifier,
        multiple,
        quote,
        escape,
        keyWord
    }

    export enum OperatorDirection {
        left,
        right
    }
    export enum VeName {
        FOR,
        WHILE,
        DO,
        IF,
        ELSE,
        ELSE_ZH,
        ELSEIF,
        SWITCH,
        CASE,
        DEFAULT,
        TRY,
        CATCH,
        FINALLY,
        CONTINUE,
        BREAK,
        RETURN,
        THROW,
        NULL_LITERAL,
        TRUE_LITERAL,
        FALSE_LITERAL,
        AS,//   "as", SymbolType .operator);
        IS,//   "is", SymbolType .constant);
        NEW,//   "new", SymbolType .operator);
        MATCH,//  "match", SymbolType .operator);
        CONTAIN,//   "contain", SymbolType .operator);
        STATR,//   "start", SymbolType .operator);
        END,//   "end", SymbolType .operator);
        EXTENDS,//   "extends", SymbolType .operator);
        K_EQ,//   "equal", SymbolType .operator);
        K_AND,//   "and", SymbolType .operator);
        K_OR,  // "or", SymbolType .operator);
        K_XOR,//   "xor", SymbolType .operator);
        SUPER,//"super", SymbolType .accessor);
        THIS,//   "this", SymbolType .accessor);
        VALUE,//   "value", SymbolType .accessor);
        GET,//   "get", [SymbolType .accessor, SymbolType .modifier]);
        SET,//   "set", [SymbolType .accessor, SymbolType .modifier]);

        FUN,//  "fun", [SymbolType .type, SymbolType .declaration]);
        CLASS,//    "class", SymbolType .declaration);
        PACKAGE,//    "package", SymbolType .declaration);
        USE,//   "use", SymbolType .declaration);
        DEF,//    "def", SymbolType .declaration);
        INTERFACE,// "interface", SymbolType .declaration);
        ENUM,//    "enum", SymbolType .declaration);

        PUBLIC,//    "public", SymbolType .modifier);
        PRIVATE,//    "private", SymbolType .modifier);
        PROTECTED,//   "protected", SymbolType .modifier);
        SEALED,//    "sealed", SymbolType .modifier);
        CONST,//    "const", [SymbolType .declaration, SymbolType .modifier]);
        STATIC,//    "static", SymbolType .modifier);
        READONLY,//    "readonly", SymbolType .modifier);
        OVERRIDE,//    "override", SymbolType .modifier);
        EXPORT,//  表示当前的方法是从外部导入

        IN,
        /**小括号*/
        LPAREN,//"(", 0)  
        /**小括号右边*/
        RPAREN, //")", 0) 
        /**中括号*/
        LBRACK, //"[", 0) 
        /**中括号右边*/
        RBRACK, //"]", 0) 
        /**大括号*/
        LBRACE,// "{", 0) 
        /**@大括号@{*/
        STRING_LBRACE,//'@{',0) 
        /**大括号右边*/
        RBRACE, //"}", 0)
        /**冒号*/
        COLON,//":", 0)  
        /**分号*/
        SEMICOLON,// ";", 0)   
        /**属性点*/
        PERIOD,//".", 0)
        /**属性问号?.*/
        NULL_PERIOD,//"?."    
        /**不定参数*/
        ELLIPSIS,//"...", 0)
        /**问号*/
        CONDITIONAL,// "?", 3)                                          
        INC,//"++", 0)                                                    
        DEC,//"--", 0)      
        /**箭头函数*/
        ARROW, //"=>", 0)    
        /**等号赋值*/
        ASSIGN, //"=", 2)                       
        ASSIGN_ADD,// "+=", 2)                                             
        ASSIGN_SUB,// "-=", 2)                                             
        ASSIGN_MUL,// "*=", 2)                                             
        ASSIGN_DIV,// "/=", 2)                                             
        ASSIGN_MOD,// "%=", 2)                                             
        ASSIGN_EXP, //"**=", 2)
        /**逗号*/
        COMMA,// ",", 1)                                                   
        OR, //"||", 4)                                                     
        AND, //"&&", 5)                              
        XOR,// "^", 7)                               
        ADD,// "+", 12)                                                    
        SUB,// "-", 12)                                                    
        MUL, //"*", 13)                                                    
        DIV,// "/", 13)                                                    
        MOD,// "%", 13)                                                    
        EXP,// "**", 14)   
        EQ,// "==", 9)
        NOT,//!                                                     
        NE, //"!=", 9) 
        /**小于号 */
        LT, //"<", 10)                                                     
        GT, //">", 10)                                                     
        LTE,// "<=", 10)                                                   
        GTE,// ">=", 10)  
        COMMENT,
        COMMENT_BLOCK,
        COMMENT_CLOSEBLOCK,
        SINGLE_QUOTE,
        DOUBLE_QUOTE,
        ESCAPTE,
        SPLIIT// |
    }
    export enum VeBaseTypeKind {
        value,
        ref
    }
    export enum language {
        en,
        zh
    }
    export type VeSyntaxType = {
        name: VeName,
        string: string,
        type: VeArray<SymbolType>,
        precedence: number,
        lang: language,
        direction: OperatorDirection
    };
    export class _VeSyntax {
        private keywords: VeArray<VeSyntaxType> = new VeArray();
        private operators: VeArray<VeSyntaxType> = new VeArray();
        private blocks: VeArray<VeArray<VeSyntaxType>> = new VeArray();
        word: RegExp = /^[a-zA-Z_\$@\u4E00-\u9FA5][a-zA-Z_\$@\u4E00-\u9FA5\d]*/;
        unit: string = '([a-zA-Z_\\\$@\\\u4E00-\\\u9FA5][a-zA-Z_\\\$@\\\u4E00-\\\u9FA5\\\d]*)';
        notWord: RegExp = /[^a-zA-Z_\$@\u4E00-\u9FA5\d]+/;
        number: RegExp = /\d+(\.[\d]+)?(e[\d]+)?/;
        negativeNumber: RegExp = /\-\d+(\.[\d]+)?(e[\d]+)?/;
        private constructor() {
            var K = (name: VeName, string: string, type: SymbolType | SymbolType[], precedence?: number, lang?: language, direction?: OperatorDirection) => {
                if (typeof precedence == typeof undefined) precedence = -1;
                if (typeof direction == typeof undefined) direction = OperatorDirection.left;
                this.keywords.append({ name, string, type: VeArray.asVeArray(type), precedence, lang: lang || language.en, direction });
            };
            var O = (name: VeName, string: string, type: SymbolType | SymbolType[], precedence?: number, lang?: language, direction?: OperatorDirection) => {
                if (typeof precedence == typeof undefined) precedence = -1;
                if (typeof direction == typeof undefined) direction = OperatorDirection.left;
                this.operators.append({ name, string, type: VeArray.asVeArray(type), precedence, lang: lang || language.en, direction });
            }

            O(VeName.LPAREN, "(", SymbolType.block, 16)
            O(VeName.RPAREN, ")", SymbolType.closeBlock, 0)
            O(VeName.LBRACK, "[", SymbolType.block, 16)
            O(VeName.RBRACK, "]", SymbolType.closeBlock, 0)
            O(VeName.LBRACE, "{", SymbolType.block, 4)//大括号在表达中，可以看成一个object对象，所以优先级相对较低
            O(VeName.STRING_LBRACE, '@{', SymbolType.block, 0);
            O(VeName.RBRACE, "}", SymbolType.closeBlock, 0)
            O(VeName.SPLIIT, "|", [SymbolType.block, SymbolType.closeBlock], 0);
            O(VeName.COLON, ":", SymbolType.binary, 3)
            O(VeName.SEMICOLON, ";", SymbolType.statement, 0)
            O(VeName.PERIOD, ".", SymbolType.binary, 16)
            O(VeName.ELLIPSIS, "...", SymbolType.modifier, 2)
            O(VeName.CONDITIONAL, "?", SymbolType.tertiary, 3, undefined, OperatorDirection.right)
            O(VeName.INC, "++", SymbolType.unary, 0, undefined, OperatorDirection.right)
            O(VeName.DEC, "--", SymbolType.unary, 0, undefined, OperatorDirection.right)
            O(VeName.ARROW, "=>", SymbolType.binary, 0, undefined, OperatorDirection.right)
            O(VeName.ASSIGN, "=", SymbolType.binary, 2, undefined, OperatorDirection.right)
            O(VeName.ASSIGN_ADD, "+=", SymbolType.binary, 2, undefined, OperatorDirection.right)
            O(VeName.ASSIGN_SUB, "-=", SymbolType.binary, 2, undefined, OperatorDirection.right)
            O(VeName.ASSIGN_MUL, "*=", SymbolType.binary, 2, undefined, OperatorDirection.right)
            O(VeName.ASSIGN_DIV, "/=", SymbolType.binary, 2, undefined, OperatorDirection.right)
            O(VeName.ASSIGN_MOD, "%=", SymbolType.binary, 2, undefined, OperatorDirection.right)
            O(VeName.ASSIGN_EXP, "**=", SymbolType.binary, 2, undefined, OperatorDirection.right)

            O(VeName.COMMA, ",", SymbolType.multiple, 1)
            O(VeName.OR, "||", SymbolType.binary, 4)
            O(VeName.AND, "&&", SymbolType.binary, 5)
            O(VeName.XOR, "&|", SymbolType.binary, 7)
            O(VeName.ADD, "+", SymbolType.binary, 12)
            O(VeName.SUB, "-", SymbolType.binary, 12)
            O(VeName.MUL, "*", SymbolType.binary, 13)
            O(VeName.DIV, "/", SymbolType.binary, 13)
            O(VeName.MOD, "%", SymbolType.binary, 13)
            O(VeName.EXP, "**", SymbolType.binary, 14)
            O(VeName.EQ, "==", SymbolType.binary, 9)
            O(VeName.NE, "!=", SymbolType.binary, 9)
            O(VeName.NOT, "!", SymbolType.unary, 15, undefined, OperatorDirection.right);
            O(VeName.LT, "<", [SymbolType.block, SymbolType.binary], 10)
            O(VeName.GT, ">", [SymbolType.closeBlock, SymbolType.binary], 10)
            O(VeName.LTE, "<=", SymbolType.binary, 10)
            O(VeName.GTE, ">=", SymbolType.binary, 10)

            K(VeName.FOR, "for", SymbolType.statement);
            K(VeName.WHILE, 'while', SymbolType.statement);
            K(VeName.DO, "do", SymbolType.statement);
            K(VeName.IF, "if", SymbolType.statement);
            K(VeName.ELSE, "else", SymbolType.statement);
            K(VeName.SWITCH, "switch", SymbolType.statement);
            K(VeName.CASE, "case", SymbolType.statement);
            K(VeName.DEFAULT, 'default', SymbolType.statement);
            K(VeName.TRY, "try", SymbolType.statement);
            K(VeName.CATCH, "catch", SymbolType.statement);
            K(VeName.FINALLY, "finally", SymbolType.statement);
            K(VeName.CONTINUE, 'continue', SymbolType.statement);
            K(VeName.BREAK, 'break', SymbolType.statement);
            K(VeName.RETURN, 'return', SymbolType.statement);
            K(VeName.THROW, "throw", SymbolType.statement);

            K(VeName.TRUE_LITERAL, "true", SymbolType.constant);
            K(VeName.FALSE_LITERAL, "false", SymbolType.constant);
            K(VeName.NULL_LITERAL, "null", SymbolType.constant);

            O(VeName.AS, "as", [SymbolType.binary, SymbolType.keyWord], 9);
            O(VeName.IS, "is", [SymbolType.binary, SymbolType.keyWord], 9);
            O(VeName.NEW, "new", [SymbolType.unary, SymbolType.keyWord], 15);
            O(VeName.AND, "and", [SymbolType.binary, SymbolType.keyWord], 4);
            O(VeName.OR, "or", [SymbolType.binary, SymbolType.keyWord], 5);
            O(VeName.XOR, "xor", [SymbolType.binary, SymbolType.keyWord], 7);


            K(VeName.SUPER, "super", SymbolType.accessor);
            K(VeName.THIS, "this", SymbolType.accessor);
            K(VeName.VALUE, "value", SymbolType.accessor);
            K(VeName.GET, "get", [SymbolType.accessor, SymbolType.modifier]);
            K(VeName.SET, "set", [SymbolType.accessor, SymbolType.modifier]);

            K(VeName.FUN, "fun", [SymbolType.declaration]);
            K(VeName.CLASS, "class", SymbolType.declaration);
            K(VeName.INTERFACE, "interface", SymbolType.declaration);
            K(VeName.EXTENDS, "extends", SymbolType.declaration);
            K(VeName.PACKAGE, "package", SymbolType.declaration);
            K(VeName.USE, "use", SymbolType.declaration);
            K(VeName.DEF, "def", SymbolType.declaration);

            K(VeName.ENUM, "enum", SymbolType.declaration);

            K(VeName.PUBLIC, "public", SymbolType.modifier);
            K(VeName.PRIVATE, "private", SymbolType.modifier);
            K(VeName.PROTECTED, "protected", SymbolType.modifier);
            K(VeName.SEALED, "sealed", SymbolType.modifier);
            K(VeName.CONST, "const", [SymbolType.declaration, SymbolType.modifier]);
            K(VeName.STATIC, "static", SymbolType.modifier);
            K(VeName.READONLY, "readonly", SymbolType.modifier);
            K(VeName.OVERRIDE, "override", SymbolType.modifier);
            K(VeName.EXPORT, 'export', SymbolType.modifier);
            K(VeName.IN, "in", SymbolType.modifier);




            O(VeName.COMMENT, "//", SymbolType.block);
            O(VeName.COMMENT_BLOCK, "/*", SymbolType.block);
            O(VeName.COMMENT_CLOSEBLOCK, "*/", SymbolType.closeBlock);

            O(VeName.SINGLE_QUOTE, "'", SymbolType.quote);
            O(VeName.DOUBLE_QUOTE, "\"", SymbolType.quote);
            O(VeName.ESCAPTE, "\\", SymbolType.escape);

            /***Chinese keywords**/
            K(VeName.FOR, "环", SymbolType.statement, undefined, language.zh);
            K(VeName.WHILE, '当', SymbolType.statement, undefined, language.zh);
            K(VeName.DO, "执行", SymbolType.statement, undefined, language.zh);
            K(VeName.IF, "若", SymbolType.statement, undefined, language.zh);
            K(VeName.ELSE_ZH, "否则", SymbolType.statement, undefined, language.zh);
            K(VeName.ELSEIF, "如若", SymbolType.statement, undefined, language.zh)
            K(VeName.SWITCH, "匹", SymbolType.statement, undefined, language.zh);
            K(VeName.CASE, "配", SymbolType.statement, undefined, language.zh);
            K(VeName.DEFAULT, '归', SymbolType.statement, undefined, language.zh);
            K(VeName.TRY, "捕", SymbolType.statement, undefined, language.zh);
            K(VeName.CATCH, "获", SymbolType.statement, undefined, language.zh);
            K(VeName.FINALLY, "终", SymbolType.statement, undefined, language.zh);
            K(VeName.CONTINUE, '中止', SymbolType.statement, undefined, language.zh);
            K(VeName.BREAK, '中断', SymbolType.statement, undefined, language.zh);
            K(VeName.RETURN, '返回', SymbolType.statement, undefined, language.zh);
            K(VeName.THROW, "扔", SymbolType.statement, undefined, language.zh);


            K(VeName.TRUE_LITERAL, "是", SymbolType.constant, undefined, language.zh);
            K(VeName.FALSE_LITERAL, "否", SymbolType.constant, undefined, language.zh);
            K(VeName.NULL_LITERAL, "空", SymbolType.constant, undefined, language.zh);

            O(VeName.AS, "为", [SymbolType.binary, SymbolType.keyWord], 9, language.zh);
            O(VeName.IS, "似", [SymbolType.binary, SymbolType.keyWord], 9, language.zh);
            O(VeName.NEW, "初", [SymbolType.unary, SymbolType.keyWord], 15, language.zh);

            O(VeName.AND, "且", [SymbolType.binary, SymbolType.keyWord], 4, language.zh);
            O(VeName.OR, "或", [SymbolType.binary, SymbolType.keyWord], 5, language.zh);
            O(VeName.XOR, "异或", [SymbolType.binary, SymbolType.keyWord], 7, language.zh);

            K(VeName.SUPER, "父", SymbolType.accessor, undefined, language.zh);
            K(VeName.THIS, "本", SymbolType.accessor, undefined, language.zh);
            K(VeName.VALUE, "值", SymbolType.accessor, undefined, language.zh);
            K(VeName.GET, "取", [SymbolType.accessor, SymbolType.modifier], undefined, language.zh);
            K(VeName.SET, "放", [SymbolType.accessor, SymbolType.modifier], undefined, language.zh);

            K(VeName.FUN, "法", [SymbolType.declaration], undefined, language.zh);
            K(VeName.CLASS, "类", SymbolType.declaration, undefined, language.zh);
            K(VeName.INTERFACE, "接口", SymbolType.declaration, undefined, language.zh);
            K(VeName.EXTENDS, "继承", SymbolType.declaration, undefined, language.zh);
            K(VeName.PACKAGE, "包", SymbolType.declaration, undefined, language.zh);
            K(VeName.USE, "引用", SymbolType.declaration, undefined, language.zh);
            K(VeName.DEF, "定义", SymbolType.declaration, undefined, language.zh);
            K(VeName.ENUM, "枚举", SymbolType.declaration, undefined, language.zh);
            K(VeName.PUBLIC, "公开", SymbolType.modifier, undefined, language.zh);
            K(VeName.PRIVATE, "私有", SymbolType.modifier, undefined, language.zh);
            K(VeName.PROTECTED, "保护", SymbolType.modifier, undefined, language.zh);
            K(VeName.SEALED, "密封", SymbolType.modifier, undefined, language.zh);
            K(VeName.CONST, "常量", [SymbolType.declaration, SymbolType.modifier], undefined, language.zh);
            K(VeName.STATIC, "静量", SymbolType.modifier, undefined, language.zh);
            K(VeName.READONLY, "只读", SymbolType.modifier, undefined, language.zh);
            K(VeName.OVERRIDE, "重载", SymbolType.modifier, undefined, language.zh);
            K(VeName.IN, "内", SymbolType.modifier, undefined, language.zh);

            /******Chinese operator symbols */
            O(VeName.LPAREN, "（", SymbolType.block, 16, language.zh)
            O(VeName.RPAREN, "）", SymbolType.closeBlock, 0, language.zh)
            O(VeName.LBRACK, "【", SymbolType.block, 16, language.zh)
            O(VeName.RBRACK, "】", SymbolType.closeBlock, 0, language.zh)
            O(VeName.COLON, "：", SymbolType.binary, 3, language.zh)
            O(VeName.SEMICOLON, "；", SymbolType.statement, 0, language.zh)
            O(VeName.ELLIPSIS, "……", SymbolType.modifier, 2, language.zh)
            O(VeName.CONDITIONAL, "？", SymbolType.tertiary, 3, language.zh)
            O(VeName.ARROW, "=》", SymbolType.binary, 0, language.zh)
            O(VeName.ASSIGN_DIV, "~=", SymbolType.binary, 2, language.zh)
            O(VeName.COMMA, "，", SymbolType.multiple, 1, language.zh)
            O(VeName.DIV, "~", SymbolType.binary, 13, language.zh)


            O(VeName.NE, "！=", SymbolType.binary, 9, language.zh);
            O(VeName.NOT, "！", SymbolType.unary, 15, language.zh);
            O(VeName.LT, "《", [SymbolType.block, SymbolType.binary], 10, language.zh)
            O(VeName.GT, "》", [SymbolType.closeBlock, SymbolType.binary], 10, language.zh)
            O(VeName.LTE, "《=", SymbolType.binary, 10, language.zh)
            O(VeName.GTE, "》=", SymbolType.binary, 10, language.zh)

            O(VeName.NE, "不等于", [SymbolType.binary, SymbolType.keyWord], 9, language.zh);
            O(VeName.LT, "小于", [SymbolType.binary, SymbolType.keyWord], 10, language.zh);
            O(VeName.GT, "大于", [SymbolType.binary, SymbolType.keyWord], 10, language.zh);
            O(VeName.LTE, "小于等于", [SymbolType.binary, SymbolType.keyWord], 10, language.zh);
            O(VeName.GTE, "大于等于", [SymbolType.binary, SymbolType.keyWord], 10, language.zh);


            O(VeName.COMMENT, "##", SymbolType.block, undefined, language.zh);
            O(VeName.COMMENT_BLOCK, "#*", SymbolType.block, undefined, language.zh);
            O(VeName.COMMENT_CLOSEBLOCK, "*#", SymbolType.closeBlock, undefined, language.zh);

            O(VeName.SINGLE_QUOTE, "‘", SymbolType.quote, undefined, language.zh);
            O(VeName.SINGLE_QUOTE, "’", SymbolType.quote, undefined, language.zh);
            O(VeName.DOUBLE_QUOTE, "“", SymbolType.quote, undefined, language.zh);
            O(VeName.DOUBLE_QUOTE, "”", SymbolType.quote, undefined, language.zh);
            O(VeName.ESCAPTE, "#", SymbolType.escape, undefined, language.zh);

            /******chinese symbols --end */
            if (typeof this.blocks.appendArray != 'function') console.log(this.blocks, VeArray);
            this.blocks.appendArray(new VeArray(this.get(VeName.LPAREN), this.get(VeName.RPAREN)));
            this.blocks.appendArray(new VeArray(this.get(VeName.LBRACK), this.get(VeName.RBRACK)));
            this.blocks.appendArray(new VeArray(this.get(VeName.LPAREN, language.zh), this.get(VeName.RPAREN, language.zh)));
            this.blocks.appendArray(new VeArray(this.get(VeName.LBRACK, language.zh), this.get(VeName.RBRACK, language.zh)));
            this.blocks.appendArray(new VeArray(this.get(VeName.LBRACE), this.get(VeName.RBRACE)));
            this.blocks.appendArray(new VeArray(this.get(VeName.LT), this.get(VeName.GT)));
            this.blocks.appendArray(new VeArray(this.get(VeName.LT, language.zh), this.get(VeName.GT, language.zh)));


        }
        getKeyWords(): VeArray<VeSyntaxType> {
            return this.keywords;
        }
        getOperators(): VeArray<VeSyntaxType> {
            return this.operators;
        }
        getBlocks(): VeArray<VeArray<VeSyntaxType>> {
            return this.blocks;
        }
        find(predict: (item: any, i?: number) => boolean): VeSyntaxType {
            var r = this.keywords.find(predict);
            if (r) return r;
            r = this.operators.find(predict);
            return r;
        }
        get(name: VeName, lang?: language): VeSyntaxType {
            lang = lang || language.en;
            var k = this.keywords.find(x => x.name == name && x.lang == lang);
            if (k) return k;
            return this.operators.find(x => x.name == name && x.lang == lang);
        }
        getAll(name: VeName): VeArray<VeSyntaxType> {
            var ks = this.keywords.findAll(x => x.name == name);
            if (ks.length > 0) return ks;
            return this.operators.findAll(x => x.name == name);
        }
        static create(): _VeSyntax {
            return new _VeSyntax;
        }
    }
    export var VeSyntax = _VeSyntax.create();
}
