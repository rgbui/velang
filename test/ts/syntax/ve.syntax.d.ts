declare namespace Ve.Lang {
    enum SymbolType {
        statement = 0,
        constant = 1,
        accessor = 2,
        declaration = 3,
        unary = 4,
        tertiary = 5,
        binary = 6,
        block = 7,
        closeBlock = 8,
        modifier = 9,
        multiple = 10,
        quote = 11,
        escape = 12,
        keyWord = 13
    }
    enum OperatorDirection {
        left = 0,
        right = 1
    }
    enum VeName {
        FOR = 0,
        WHILE = 1,
        DO = 2,
        IF = 3,
        ELSE = 4,
        ELSE_ZH = 5,
        ELSEIF = 6,
        SWITCH = 7,
        CASE = 8,
        DEFAULT = 9,
        TRY = 10,
        CATCH = 11,
        FINALLY = 12,
        CONTINUE = 13,
        BREAK = 14,
        RETURN = 15,
        THROW = 16,
        ASYNC = 17,
        AWAIT = 18,
        NULL_LITERAL = 19,
        TRUE_LITERAL = 20,
        FALSE_LITERAL = 21,
        AS = 22,
        IS = 23,
        NEW = 24,
        MATCH = 25,
        CONTAIN = 26,
        STATR = 27,
        END = 28,
        EXTENDS = 29,
        K_EQ = 30,
        K_AND = 31,
        K_OR = 32,
        K_XOR = 33,
        SUPER = 34,
        THIS = 35,
        VALUE = 36,
        GET = 37,
        SET = 38,
        FUN = 39,
        CLASS = 40,
        PACKAGE = 41,
        USE = 42,
        DEF = 43,
        INTERFACE = 44,
        ENUM = 45,
        PUBLIC = 46,
        PRIVATE = 47,
        PROTECTED = 48,
        SEALED = 49,
        CONST = 50,
        STATIC = 51,
        READONLY = 52,
        OVERRIDE = 53,
        EXPORT = 54,
        IN = 55,
        LPAREN = 56,
        RPAREN = 57,
        LBRACK = 58,
        RBRACK = 59,
        LBRACE = 60,
        STRING_LBRACE = 61,
        RBRACE = 62,
        COLON = 63,
        SEMICOLON = 64,
        PERIOD = 65,
        NULL_PERIOD = 66,
        ELLIPSIS = 67,
        CONDITIONAL = 68,
        INC = 69,
        DEC = 70,
        ARROW = 71,
        ASSIGN = 72,
        ASSIGN_ADD = 73,
        ASSIGN_SUB = 74,
        ASSIGN_MUL = 75,
        ASSIGN_DIV = 76,
        ASSIGN_MOD = 77,
        ASSIGN_EXP = 78,
        COMMA = 79,
        OR = 80,
        AND = 81,
        XOR = 82,
        ADD = 83,
        SUB = 84,
        MUL = 85,
        DIV = 86,
        MOD = 87,
        EXP = 88,
        EQ = 89,
        NOT = 90,
        NE = 91,
        LT = 92,
        GT = 93,
        LTE = 94,
        GTE = 95,
        COMMENT = 96,
        COMMENT_BLOCK = 97,
        COMMENT_CLOSEBLOCK = 98,
        SINGLE_QUOTE = 99,
        DOUBLE_QUOTE = 100,
        ESCAPTE = 101
    }
    enum VeBaseType {
        Null = 0,
        Any = 1,
        Void = 2,
        String = 3,
        Int = 4,
        Number = 5,
        Bool = 6,
        Array = 7,
        Date = 8,
        Color = 9,
        Url = 10,
        Path = 11,
        Regex = 12,
        Font = 13,
        Point = 14,
        Object = 15,
        Dir = 16,
        Image = 17,
        File = 18
    }
    enum VeBaseTypeKind {
        value = 0,
        ref = 1
    }
    enum language {
        en = 0,
        zh = 1
    }
    type VeSyntaxType = {
        name: VeName;
        string: string;
        type: VeArray<SymbolType>;
        precedence: number;
        lang: language;
        direction: OperatorDirection;
    };
    class _VeSyntax {
        private keywords;
        private operators;
        private blocks;
        private typeMaps;
        word: RegExp;
        unit: string;
        notWord: RegExp;
        number: RegExp;
        private constructor();
        getKeyWords(): VeArray<VeSyntaxType>;
        getOperators(): VeArray<VeSyntaxType>;
        getBlocks(): VeArray<VeArray<VeSyntaxType>>;
        getTypeMaps(): VeArray<{
            type: VeBaseType;
            kind: VeBaseTypeKind;
            covariance: VeBaseType;
            contravariance: VeBaseType;
        }>;
        find(predict: (item: any, i?: number) => boolean): VeSyntaxType;
        get(name: VeName, lang?: language): VeSyntaxType;
        getAll(name: VeName): VeArray<VeSyntaxType>;
        static create(): _VeSyntax;
    }
    var VeSyntax: _VeSyntax;
}
