declare namespace Ve.Lang {
    class BaseEvent {
        private __$events;
        on(name: string | Record<string, (this: BaseEvent, ...args: any[]) => any>, cb?: (this: BaseEvent, ...args: any[]) => any, isReplace?: boolean): this;
        once(name: string | Record<string, (this: BaseEvent, ...args: any[]) => any>, cb?: (this: BaseEvent, ...args: any[]) => any, isReplace?: boolean): this;
        off(name: string | ((this: BaseEvent, ...args: any[]) => any)): this;
        emit(name: string, ...args: any[]): any;
    }
}
declare namespace Ve.Lang {
    class AstParser extends BaseEvent {
        compile(code: string): Statement | VeArray<Statement>;
        compileExpress(express: string, args?: Outer.VeProp[]): Expression;
        private static $baseLib;
        static readonly baseLib: VeArray<Statement>;
    }
    interface AstParser {
        on(name: 'error', cb: (error: any) => void): any;
    }
}
declare namespace Ve.Lang {
    type Accepter<K, T extends (void | {
        visitor: AstVisitor<T>;
    })> = Record<string, (this: K, express: Statement) => T>;
    class AstVisitor<T extends (void | {
        visitor: AstVisitor<T>;
    })> extends BaseEvent {
        private express;
        accepter: Accepter<AstVisitor<T>, T>;
        constructor(express: VeArray<Statement> | Statement, accepter?: Accepter<AstVisitor<T>, T>);
        onInit?(): any;
        start(): T;
        accept(express: Statement): T;
        next(express: Statement): T;
        error(error: any): void;
    }
    interface AstVisitor<T extends (void | {
        visitor: AstVisitor<T>;
    })> {
        on(name: 'error', cb: (error: any) => void): any;
        on(name: 'accept', cb: (express: Statement) => void): any;
    }
}
declare namespace Ve.Lang {
    enum StatementType {
        program = 0,
        package = 1,
        use = 2,
        enum = 3,
        class = 4,
        interface = 5,
        declareVariable = 6,
        method = 7,
        classProperty = 8,
        field = 9,
        fun = 10,
        for = 11,
        if = 12,
        doWhile = 13,
        while = 14,
        switch = 15,
        continue = 16,
        break = 17,
        try = 18,
        throw = 19,
        return = 20,
        context = 21,
        binary = 22,
        unary = 23,
        ternary = 24,
        new = 25,
        constant = 26,
        variable = 27,
        Object = 28,
        objectReferenceProperty = 29,
        arrayIndex = 30,
        array = 31,
        classInstance = 32,
        callMethod = 33,
        arrowMethod = 34,
        parameters = 35,
        parameter = 36,
        type = 37
    }
    class Statement {
        constructor(parent?: Statement);
        parent: Statement;
        type: StatementType;
        token: Token;
        private $childs;
        append(ts: Statement | VeArray<Statement>): void;
        remove(ts: Statement | VeArray<Statement>): void;
        childs: VeArray<Statement>;
        find(predict: (item: Statement, index?: number, thisArray?: VeArray<Statement>) => boolean, includeSelf?: boolean): Statement;
        findAll(predict: (item: Statement, index?: number, thisArray?: VeArray<Statement>) => boolean, includeSelf?: boolean): VeArray<Statement>;
        each(predict: (item: Statement) => void, includeSelf?: boolean): void;
        closest(predict: (item: Statement) => boolean): Statement;
        closestPrev(predict: (item: Statement) => boolean): Statement;
        parents(predict: (item: Statement) => boolean): VeArray<Statement>;
        parentsUntil(predict: (item: Statement) => boolean): VeArray<Statement>;
        readonly next: Statement;
        readonly currentStatement: Statement;
        readonly scope: (ArrowMethodExpression | FunStatement | ClassProperty | PackageStatement);
        readonly program: ProgramStatement;
        static search(statement: Statement, name: string, predict?: (node: DeclareVariable | ClassProperty | FunStatement | ClassOrIntrfaceStatement) => boolean): StatementReference;
        infer: {
            expressType?: TypeExpression;
            requireExpressType?: VeArray<TypeExpression>;
            referenceStatement?: StatementReference;
        };
        runResult: RunResult;
        langeRender: LangRender;
    }
    class ProgramStatement extends Statement {
        type: StatementType;
    }
    class Expression extends Statement {
    }
}
declare namespace Ve.Lang {
    class CallMethodExpression extends Expression {
        private _name;
        name: string | Expression;
        private _args;
        args: VeArray<Expression>;
        generics: VeArray<{
            type: TypeExpression;
        }>;
        type: StatementType;
        isCompatibility(cp: ClassProperty): boolean;
        getGenericMap(): Record<string, any>;
    }
}
declare namespace Ve.Lang {
    class BinaryExpression extends Expression {
        kind: VeName;
        type: StatementType;
        private $left;
        left: Expression;
        private $right;
        right: Expression;
    }
    enum UnaryArrow {
        left = 0,
        right = 1
    }
    class UnaryExpression extends Expression {
        kind: VeName;
        arrow: UnaryArrow;
        type: StatementType;
        private $exp;
        exp: Expression;
    }
    class Constant extends Expression {
        value: any;
        type: StatementType;
        valueType: TypeExpression;
    }
    class TernaryExpression extends Expression {
        name: VeName;
        type: StatementType;
        private _where;
        where: Expression;
        private _trueCondition;
        trueCondition: Expression;
        private _falseCondition;
        falseCondition: Expression;
    }
    class ArrayIndexExpression extends Expression {
        private _name;
        name: string | PropertyExpression;
        private _indexExpress;
        indexExpress: Expression;
        type: StatementType;
    }
    class Variable extends Expression {
        name: string;
        type: StatementType;
    }
    class ArrowMethodExpression extends Expression {
        args: VeArray<Parameter>;
        type: StatementType;
        returnType: TypeExpression;
        body: VeArray<Statement>;
    }
    class ArrayExpression extends Expression {
        private _args;
        args: VeArray<Expression>;
        type: StatementType;
    }
    class ObjectExpression extends Expression {
        private _propertys;
        propertys: VeArray<{
            key: string;
            value: Expression;
        }>;
        type: StatementType;
    }
    class Parameter extends Expression {
        key: string;
        default?: Constant;
        isParameter?: boolean;
        parameterType: TypeExpression;
        type: StatementType;
    }
}
declare namespace Ve.Lang {
    class PropertyExpression extends Expression {
        type: StatementType;
        private _propertys;
        propertys: VeArray<string | Expression>;
    }
}
declare namespace Ve.Lang {
    enum TypeKind {
        union = 0,
        fun = 1,
        object = 2,
        unit = 3,
        dic = 4
    }
    class TypeExpression extends Expression {
        type: StatementType;
        constructor(kind?: TypeKind, options?: {
            name?: string;
        });
        kind: TypeKind;
        name?: string;
        states: VeArray<string>;
        args?: VeArray<{
            key: string;
            type: TypeExpression;
        }>;
        returnType?: TypeExpression;
        props?: VeArray<{
            key: string;
            type: TypeExpression;
        }>;
        options?: VeArray<{
            key: string;
            value: string | number;
        }>;
        unionType: TypeExpression;
        generics: VeArray<TypeExpression>;
        injectGenericImplement(map: Record<string, TypeExpression>): TypeExpression;
        static createUnitType(name: string): TypeExpression;
        static TypeIsAdaptive(from: TypeExpression, to: TypeExpression, gens?: VeArray<{
            key: string;
        }>, pg?: Statement): boolean;
    }
}
declare namespace Ve.Lang {
    var Infer$Binary: Accepter<InferFactory, void>;
}
declare namespace Ve.Lang {
    var Infer$Data: Accepter<InferFactory, void>;
}
declare namespace Ve.Lang {
    var Infer$ObjectReferenceProperty: Accepter<InferFactory, void>;
}
declare namespace Ve.Lang {
    var Infer$Statement: Accepter<InferFactory, void>;
}
declare namespace Ve.Lang {
    function applyMixins(Mix: any, ...mixins: any[]): any;
    function applyExtend(mix: any, ...mixins: any[]): void;
    function getAvailableName<T>(name: any, list: VeArray<T>, predict: (item: T) => string): any;
}
declare namespace Ve.Lang {
    enum StatementReferenceKind {
        DeclareVariable = 0,
        DeclareFun = 1,
        FunArgs = 2,
        currentClassMethodArgs = 3,
        outerClass = 4,
        outerClassProperty = 5
    }
    class StatementReference {
        constructor(kind?: StatementReferenceKind, statement?: Statement);
        kind: StatementReferenceKind;
        referenceStatement: Statement;
        target: any;
    }
    var Infer: Accepter<InferFactory, void>;
    class InferFactory extends AstVisitor<void> {
        accepter: Record<string, (this: InferFactory, express: Statement) => void>;
    }
}
declare namespace Ve.Lang {
    class ParserRegex {
        static attr: string;
        static access: string;
        static genic: string;
        static method_modifys: string;
        static class_property_modifys: string;
        static variable_value: string;
        static type_namespace: string;
        static datatype: string;
        static package: string;
        static use: string;
        static export: string;
        static enum: string;
        static classOrInterface: string;
        static classPropertyEnd: string;
        static classMethod: string;
        static interfaceMethod: string;
        static classProperty: string;
        static classField: string;
        static fun: string;
        static variable: string;
        static statement: string;
        static block_or_statement: string;
        static if: string;
        static else_if: string;
        static else: string;
        static while: string;
        static do_while: string;
        static for: string;
        static try: string;
        static switch: string;
        static case: string;
        static return: string;
        static throw: string;
        static break: string;
        static continue: string;
        static fun_arrow_type: string;
        static fun_arrow_statement: string;
        static new_instance: string;
        static emptyStatement: string;
    }
}
declare namespace Ve.Lang {
    class TokenParseData {
        static parseArguments(tokens: VeArray<Token>): VeArray<Expression>;
        static parseParameter(tokens: VeArray<Token>): VeArray<Parameter>;
        static parseType(tokens: VeArray<Token>): TypeExpression;
        static parsePropertys(tokens: VeArray<Token>): VeArray<{
            key: string;
            value: Expression;
        }>;
        static parseEnumOptions(tokens: VeArray<Token>): VeArray<{
            key: string;
            value: Expression;
        }>;
    }
}
declare namespace Ve.Lang {
    class TokenParseExpression {
        static parseBinaryExpression(ts: VeArray<Statement | Token>): Expression;
        static parseUnaryExpression(ts: VeArray<Statement | Token>): Expression;
        static parseTernaryOperator(ts: VeArray<Statement | Token>): Expression;
        static parsePropertyReference(ts: VeArray<Statement | Token>): PropertyExpression;
        static parseArray(ts: VeArray<Statement | Token>): Expression;
        static parseArrayIndex(ts: VeArray<Statement | Token>): Expression;
        static parseObject(ts: VeArray<Statement | Token>): ObjectExpression;
        static parseMethod(ts: VeArray<Statement | Token>): Expression;
        static parseArrowMethod(ts: VeArray<Statement | Token>): ArrowMethodExpression;
        static parseOneToken(ts: VeArray<Statement | Token>): Expression;
    }
}
declare namespace Ve.Lang {
    class TokenParseExpress {
        tokens: VeArray<Token>;
        parent: Statement;
        constructor(token: Token | VeArray<Token>, parent?: Statement);
        getLeftAndRightOpertors(): any;
        parse(onlyOnce?: boolean): Expression;
        static parseExpression(ts: VeArray<Statement | Token>): Expression;
    }
}
declare namespace Ve.Lang {
    enum Modifier {
        private = 0,
        public = 1,
        const = 2,
        readonly = 3,
        static = 4,
        export = 5
    }
    class PackageStatement extends Statement {
        name: string;
        type: StatementType;
        private _body;
        body: VeArray<Statement>;
        readonly lastName: String;
        private $classList;
        readonly classList: VeArray<ClassOrIntrfaceStatement>;
        search(name: string, predict?: (item: ClassOrIntrfaceStatement | ClassProperty) => boolean): ClassOrIntrfaceStatement | ClassProperty;
        searchAll(name: string, predict?: (item: ClassOrIntrfaceStatement | ClassProperty) => boolean): VeArray<ClassOrIntrfaceStatement | ClassProperty>;
    }
    class UseStatement extends Statement {
        name: string;
        localName: string;
        type: StatementType;
        search(name: string, predict?: (item: ClassOrIntrfaceStatement | ClassProperty) => boolean): ClassOrIntrfaceStatement | ClassProperty;
        searchAll(name: string, predict?: (item: ClassOrIntrfaceStatement | ClassProperty) => boolean): VeArray<ClassOrIntrfaceStatement | ClassProperty>;
    }
    class EnumStatement extends Statement {
        type: StatementType;
        name: string;
        modifiers: VeArray<Modifier>;
        options: VeArray<{
            key: string;
            value: Constant;
        }>;
        readonly package: PackageStatement;
    }
    class ClassOrIntrfaceStatement extends Statement {
        type: StatementType;
        name: string;
        extendName: string;
        modifiers: VeArray<Modifier>;
        attributes: VeArray<{
            name: string;
            args: VeArray<{
                key?: string;
                value: Constant;
            }>;
        }>;
        generics: VeArray<{
            key: string;
        }>;
        private _body;
        body: VeArray<ClassProperty>;
        readonly package: PackageStatement;
        readonly nicks: VeArray<string>;
        isName(name: string): boolean;
        readonly fullName: string;
    }
    enum ClassPropertyKind {
        method = 0,
        prop = 1,
        field = 2
    }
    class ClassContext extends Statement {
        type: StatementType;
        name: 'this' | 'super';
    }
    class ClassProperty extends Statement {
        type: StatementType;
        name: string;
        isInterface?: boolean;
        modifiers: VeArray<Modifier>;
        generics: VeArray<{
            key: string;
        }>;
        attributes: VeArray<{
            name: string;
            args: VeArray<{
                key?: string;
                value: Constant;
            }>;
        }>;
        kind: ClassPropertyKind;
        propType?: TypeExpression;
        value?: Constant;
        args: VeArray<Parameter>;
        returnType?: TypeExpression;
        private _get;
        get: VeArray<Statement>;
        private _set;
        set: VeArray<Statement>;
        private _body_1;
        body: VeArray<Statement>;
        readonly class: ClassOrIntrfaceStatement;
        readonly isStatic: boolean;
        readonly isPublic: boolean;
        readonly isPrivate: boolean;
        readonly isCtor: boolean;
        isName(name: string): boolean;
        readonly fullName: string;
        readonly unqiueName: string;
    }
    class FunStatement extends Statement {
        modifiers: VeArray<Modifier>;
        name: string;
        generics: VeArray<{
            key: string;
        }>;
        args: VeArray<Parameter>;
        returnType: TypeExpression;
        type: StatementType;
        private _body;
        body: VeArray<Statement>;
        readonly package: PackageStatement;
    }
    class DeclareVariable extends Statement {
        type: StatementType;
        isReadonly: boolean;
        name: string;
        variableType: TypeExpression;
        private _value;
        value: Expression;
    }
}
declare namespace Ve.Lang {
    class TokenStatementParserDeclaration {
        parsePackageStatement(this: TokenStatementParser): PackageStatement;
        parseUseStatement(this: TokenStatementParser): UseStatement;
        parseEnumStatement(this: TokenStatementParser): EnumStatement;
        $parseAttribute(token: Token, parent: Statement): {
            name: string;
            args: VeArray<{
                key?: string;
                value: Constant;
            }>;
        };
        $parseGeneric(token: Token, parent: Statement): VeArray<{
            key: string;
        }>;
        parseClassOrInterfaceStatement(this: TokenStatementParser): ClassOrIntrfaceStatement;
        parseMethodStatement(this: TokenStatementParser, ignoreClass?: boolean): ClassProperty;
        parsePropertyStatement(this: TokenStatementParser, ignoreClass?: boolean): ClassProperty;
        parseFieldStatement(this: TokenStatementParser, ignoreClass?: boolean): ClassProperty;
        parseFunStatement(this: TokenStatementParser): FunStatement;
        parseVariableStatement(this: TokenStatementParser): VeArray<Statement>;
        parseExpression(this: TokenStatementParser): Expression;
    }
}
declare namespace Ve.Lang {
    class TokenStatementParserStatement {
        parseIf(this: TokenStatementParser): Statement | null;
        parseWhile(this: TokenStatementParser): WhileStatement;
        parseDoWhile(this: TokenStatementParser): DoWhileStatement;
        parseFor(this: TokenStatementParser): ForStatement;
        parseTry(this: TokenStatementParser): TryStatement;
        parseSwitch(this: TokenStatementParser): SwitchStatement;
        parseReturn(this: TokenStatementParser): ReturnStatement;
        parseThrow(this: TokenStatementParser): ThrowStatement;
        parseBreak(this: TokenStatementParser): BreakStatement;
        parseContinue(this: TokenStatementParser): ContinueStatement;
        parseEmptyStatement(this: TokenStatementParser): any;
    }
}
declare namespace Ve.Lang {
    class TokenStatementParser {
        tokens: VeArray<Token>;
        index: number;
        parent: Statement;
        constructor(token: Token | VeArray<Token>, parent?: Statement);
        preteatment(): void;
        readonly current: Token;
        next(predicate?: number | ((token: Token) => boolean)): Token;
        findIndex(predicate: Token | ((token: Token, pos?: number) => boolean)): number;
        eq(at: number): Token;
        nextAll(): VeArray<Token>;
        match(pattern: RegExp | string, getFlag?: (Token: Token) => string, ignoreSkip?: boolean): VeArray<Token>;
        readonly eol: boolean;
        rest(): VeArray<Token>;
        skip(pos?: number): void;
        skipToEnd(): void;
        backUp(pos?: number): void;
        getFlagText(): string;
        getNextValue(): string;
        getFlag(token: Token): string;
        getNextFlag(): string;
        parse(): VeArray<Statement>;
        parseAndSave(): void;
    }
    interface TokenStatementParser extends TokenStatementParserDeclaration {
    }
    interface TokenStatementParser extends TokenStatementParserStatement {
    }
}
declare namespace Ve.Lang {
    class IfStatement extends Statement {
        private $ifCondition;
        ifCondition: Expression;
        private $ifStatement;
        ifStatement: VeArray<Statement>;
        private $elseStatement;
        elseStatement: VeArray<Statement>;
        thenConditions: VeArray<Statement>;
        thenStatements: VeArray<VeArray<Statement>>;
        constructor();
        appendThen(exp: Expression, statement: VeArray<Statement>): void;
        type: StatementType;
    }
    class ForStatement extends Statement {
        private $condition;
        condition: Statement;
        private $nextStatement;
        nextStatement: Statement;
        private $initStatement;
        initStatement: Statement;
        private _body;
        body: VeArray<Statement>;
        type: StatementType;
    }
    class ReturnStatement extends Statement {
        private $expression;
        expression: Expression;
        type: StatementType;
    }
    class ThrowStatement extends Statement {
        private $expression;
        expression: Expression;
        type: StatementType;
    }
    class BreakStatement extends Statement {
        type: StatementType;
    }
    class ContinueStatement extends Statement {
        type: StatementType;
    }
    class SwitchStatement extends Statement {
        caseStatements: VeArray<{
            value: Expression;
            matchs: VeArray<Statement>;
        }>;
        appendCaseStatement(value: Expression, matchs: VeArray<Statement>): void;
        private $valueExpression;
        valueExpression: Expression;
        private $defaultStatement;
        defaultStatement: VeArray<Statement>;
        type: StatementType;
    }
    class TryStatement extends Statement {
        private _tryStatement;
        tryStatement: VeArray<Statement>;
        private _catchStatement;
        catchStatement: VeArray<Statement>;
        catchParameter: VeArray<Parameter>;
        private _finallyStatement;
        finallyStatement: VeArray<Statement>;
        type: StatementType;
    }
    class WhileStatement extends Statement {
        private $condition;
        condition: Expression;
        private _body;
        body: VeArray<Statement>;
        type: StatementType;
    }
    class DoWhileStatement extends Statement {
        private $condition;
        condition: Expression;
        private _body;
        body: VeArray<Statement>;
        type: StatementType;
    }
}
declare namespace Ve.Lang.Outer {
    function pickVeTypeFromCode(code: string): VeType;
    function pickArgsFromCode(code: string): {
        key: string;
        type: VeType;
    }[];
    function pickVePropFromCode(code: string): VeProp;
    function pickVePropFromExpress(expressCode: string, args: VeProp[]): VeProp[];
    function inferExpressType(expressCode: string, args: VeProp[]): VeType;
}
declare namespace Ve.Lang.Outer {
    type TranslateLang = 'nodejs' | 'js' | 'java' | 'csharp' | 'php' | 'python' | 'mysql' | 'mongodb' | 'mssql';
    function TranslateLangCode(code: string, lang: TranslateLang): string;
    function TranslateExpressLangCode(code: string, args: VeProp[], lang: TranslateLang, options?: {
        argFlag: string;
    }): string;
    function TranslateSQLExpressLangCode(code: string, args: VeProp[], fields: VeProp[], lang: TranslateLang, options?: {
        argFlag: string;
        fieldFlag: string;
    }): string;
}
declare namespace Ve.Lang.Outer {
    type VeProp = {
        text: string;
        type: VeType;
        value?: any;
        props?: VeProp[];
    };
    type VeType = {
        props?: {
            key: string;
            type: VeType;
        }[];
        options?: {
            key: string;
            value: number | string;
        }[];
        args?: {
            key: string;
            type: VeType;
            value: any;
        }[];
        returnType?: VeType;
        returns?: {
            key: string;
            type: VeType;
        }[];
        unionType?: VeType;
        generics?: VeType[];
        valueType?: {
            type: VeType;
            value: any;
        };
        types?: VeType[];
    } | string;
    function VePropToParameter(args: VeProp[]): string;
    function VePropToCode(prop: VeProp): string;
    function VePropToVeType(prop: VeProp): VeType;
    function VeTypeToCode(veType: VeType): string;
    function TypeExpressionToVeType(typeExpression: TypeExpression): VeType;
    function dataToVeProp(data: Expression): VeProp;
    function jsObjectToVeProp(jsObject: Record<string, any>): VeProp;
}
declare namespace Ve.Lang {
    class RazorMode implements Mode<Razor> {
        state: State<Razor>;
        startState(): State<Razor>;
        token(stream: StringStream, state: State<Razor>): Razor;
        tokenEnd(stream: StringStream, state: State<Razor>): void;
        walk(stream: StringStream, state: State<Razor>): Razor;
        private matchEscape;
        private matchStatement;
        private matchELseStatement;
        private matchBracket;
        private matchBlock;
        private matchValue;
        private matchMethod;
        private matchStringTextBlock;
        private matchStringText;
        private matchHelper;
        private matchSection;
        private matchTextBlock;
        private matchQuote;
        private matchClose;
        private matchText;
        onInferRazorEnv(): void;
    }
}
declare namespace Ve.Lang {
    class RazorContext {
        ViewBag: object;
        layout: string;
        layoutBody: string;
        razorTemplate: RazorTemplate;
        section: any;
        constructor(razorTemplate: RazorTemplate);
        renderBody(): string;
        renderSection(sectionName: any): string;
        sectionRegister(name: any, fn: any): void;
        clear(): void;
    }
    enum RazorTemplateType {
        View = 0,
        LayoutMaster = 1,
        PartialView = 2
    }
    class RazorTemplate {
        caller: object;
        context: RazorContext;
        type: RazorTemplateType;
        dir?: string;
        printFunCodeFilePath?: string;
        printTokenCodeFilePath?: string;
        private compilerFunction;
        private compilerParms;
        constructor(options?: {
            caller?: object;
            context?: RazorContext;
            type?: RazorTemplateType;
            dir?: string;
            printFunCodeFilePath?: string;
            printTokenCodeFilePath?: string;
        });
        private imports;
        import(methodName: string | object, obj: object | (() => string)): void;
        render(template: string | object, data?: object, ViewBag?: object): any;
        compile(template: string, data?: object, ViewBag?: object): string;
        private excuteFunction;
        private getDataArgs;
    }
}
declare namespace Ve.Lang {
    enum RazorType {
        fragment = 0,
        text = 1,
        quote = 2,
        quoteEnd = 3,
        lineText = 4,
        lineEnd = 5,
        blockText = 6,
        blockLeft = 7,
        blockRight = 8,
        bracketLeft = 9,
        bracketRight = 10,
        if = 11,
        elseif = 12,
        else = 13,
        while = 14,
        for = 15,
        block = 16,
        bracket = 17,
        comment = 18,
        value = 19,
        method = 20,
        escape = 21,
        helper = 22,
        section = 23
    }
    enum RazorEnviroment {
        text = 0,
        code = 1
    }
    class Razor {
        childs: Razor[];
        type: RazorType;
        text: string;
        value: string;
        parent: Razor;
        col: number;
        size: number;
        row: number;
        env: RazorEnviroment;
        contentEnv: RazorEnviroment;
        readonly prev: Razor;
        readonly index: number;
        readonly isWhiteText: boolean;
        prevSearch(fx: (x: Razor) => boolean, isInclude?: boolean): Razor;
        nextSearch(fx: (x: Razor) => boolean, isInclude?: boolean): Razor;
        append(razor: Razor): void;
        closest(predict: (razor: Razor) => boolean): Razor;
        gs(): any;
    }
}
declare namespace Ve.Lang {
    class RazorWriter {
        codes: string[];
        writeVariable: string;
        constructor(options?: {
            writeVariable: string;
        });
        writeExpress(text: string): void;
        writeString(text: string): void;
        writeCode(text: string): void;
        write(razor: Razor): void;
        read(razor: Razor): string;
        outputCode(): string;
    }
}
declare namespace Ve.Lang.Run {
    var Run$Binary: Accepter<RunVisitor, void>;
}
declare namespace Ve.Lang.Run {
    var Run$Data: Accepter<RunVisitor, void>;
}
declare namespace Ve.Lang.Run {
    var Run$ObjectReferenceProperty: Accepter<RunVisitor, void>;
}
declare namespace Ve.Lang.Run {
    var Run$Statement: Accepter<RunVisitor, void>;
}
declare namespace Ve.Lang {
    class RunResult {
        context: any;
        value: any;
        continue: boolean;
        break: boolean;
        return: boolean;
        throw: boolean;
        traces: {
            statement: Statement;
            value?: any;
        }[];
        caller: Statement;
    }
    class Runner {
        compile(code: string, ...args: any[]): any;
        compileExpress(code: string, ...args: Outer.VeProp[]): any;
    }
    class RunVisitor extends AstVisitor<void> {
        accepter: Record<string, (this: RunVisitor, express: Statement) => void>;
        callObjectProp(node: Statement, statement: ClassProperty, $this: any, ...args: any[]): any;
        callMethod(node: Statement, statement: FunStatement | ArrowMethodExpression | ClassProperty, ...args: any[]): any;
        runStatements(sts: VeArray<Statement>): void;
    }
    type RunMethod = {
        name: string;
        props: Record<string, (this: RunVisitor, ...args: any[]) => any>;
    };
    var RunAccepter: Accepter<RunVisitor, void>;
}
declare namespace Ve.Lang.Run {
    var runMethod: RunMethod[];
}
declare namespace Ve.Lang {
    type VeArrayPredict<T> = T | ((item?: any, index?: number, array?: VeArray<T>) => boolean);
    class VeArray<T> extends Array<T> {
        constructor(...args: T[]);
        private predicateMatch;
        last(): T;
        first(): T;
        eq(pos: number): T;
        map<U>(predicate: (item?: T, index?: number, array?: VeArray<T>) => U): VeArray<U>;
        append(a: VeArray<T> | T[] | T, pos?: number): VeArray<T>;
        insertAt(pos: number, a: VeArray<T> | T[] | T): VeArray<T>;
        replaceAt(pos: number, a: T): VeArray<T>;
        appendArray(a: VeArray<any> | any[], pos?: number): VeArray<T>;
        insertArrayAt(pos: number, a: VeArray<any> | any[]): VeArray<T>;
        removeAt(pos: number): VeArray<T>;
        remove(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): VeArray<T>;
        removeAll(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): VeArray<T>;
        removeBefore(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean), isIncludeFind?: boolean): VeArray<T>;
        removeAfter(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean), isIncludeFind?: boolean): VeArray<T>;
        exists(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): boolean;
        find(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): T | null;
        findLast(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): T | null;
        findBefore(indexPredict: VeArrayPredict<T>, predict: VeArrayPredict<T>, isIncludeSelf?: boolean): T;
        findAfter(indexPredict: VeArrayPredict<T>, predict: VeArrayPredict<T>, isIncludeSelf?: boolean): T;
        findSkip(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), skip?: number): T;
        findRange(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), predicate2: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): VeArray<T>;
        findAll(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): VeArray<T>;
        findIndex(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), defaultIndex?: number): number;
        findLastIndex(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), defaultIndex?: number): number;
        forEach(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void;
        each(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void;
        reach(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void;
        recursion(predicate: (item?: T, index?: number, next?: ((index?: number) => void)) => void): void;
        eachReverse(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void;
        limit(index: number, size: number): VeArray<T>;
        range(start: number, end?: number): VeArray<T>;
        split(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => any)): VeArray<VeArray<T>>;
        matchIndex(regex: string | RegExp, map: (item?: T, index?: number, array?: VeArray<T>) => string, startIndex?: number): number;
        match(regex: string | RegExp, map: (item?: any, index?: number, array?: VeArray<T>) => string, startIndex?: number): VeArray<T>;
        copy(): VeArray<T>;
        asArray(): T[];
        arrayJsonEach(arrayJsonName: string, fn: (item: T, deep?: number, index?: number, sort?: number, parent?: T, arr?: VeArray<T>) => (void | {
            break?: boolean;
            continue?: boolean;
            returns?: any;
        }), parent?: T, defaultDeep?: number, defaultIndex?: number): {
            total: number;
            deep: number;
        };
        static isVeArray(t: any): boolean;
        static asVeArray<V>(t: V | V[] | VeArray<V>): VeArray<V>;
    }
    var _: {
        remove<T>(array: T[], predict: T | ((t: T, index?: number, thisArray?: T[]) => boolean)): void;
        removeAll<T>(array: T[], predict: T | ((t: T, index?: number, thisArray?: T[]) => boolean)): void;
        each<T>(array: T[], predict: (t: T, index?: number, thisArray?: T[]) => boolean): void;
        addRange<T>(array: T[], newArray: T[]): void;
        find<T>(array: T[], predict: (t: T, index?: number, thisArray?: T[]) => boolean): T;
        findIndex<T>(array: T[], predict: T | ((t: T, index?: number, thisArray?: T[]) => boolean)): number;
        exists<T>(array: T[], predict: T | ((t: T, index?: number, thisArray?: T[]) => boolean)): boolean;
        arrayJsonEach<T>(array: T[], arrayJsonName: string, fn: (item: T, deep?: number, index?: number, sort?: number, parent?: any, arr?: any[]) => void | {
            break?: boolean;
            continue?: boolean;
            returns?: any;
        }, parent?: any, defaultDeep?: any, defaultIndex?: any): {
            total: any;
            deep: any;
        };
    };
}
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
        NULL_LITERAL = 17,
        TRUE_LITERAL = 18,
        FALSE_LITERAL = 19,
        AS = 20,
        IS = 21,
        NEW = 22,
        MATCH = 23,
        CONTAIN = 24,
        STATR = 25,
        END = 26,
        EXTENDS = 27,
        K_EQ = 28,
        K_AND = 29,
        K_OR = 30,
        K_XOR = 31,
        SUPER = 32,
        THIS = 33,
        VALUE = 34,
        GET = 35,
        SET = 36,
        FUN = 37,
        CLASS = 38,
        PACKAGE = 39,
        USE = 40,
        DEF = 41,
        INTERFACE = 42,
        ENUM = 43,
        PUBLIC = 44,
        PRIVATE = 45,
        PROTECTED = 46,
        SEALED = 47,
        CONST = 48,
        STATIC = 49,
        READONLY = 50,
        OVERRIDE = 51,
        EXPORT = 52,
        IN = 53,
        LPAREN = 54,
        RPAREN = 55,
        LBRACK = 56,
        RBRACK = 57,
        LBRACE = 58,
        STRING_LBRACE = 59,
        RBRACE = 60,
        COLON = 61,
        SEMICOLON = 62,
        PERIOD = 63,
        NULL_PERIOD = 64,
        ELLIPSIS = 65,
        CONDITIONAL = 66,
        INC = 67,
        DEC = 68,
        ARROW = 69,
        ASSIGN = 70,
        ASSIGN_ADD = 71,
        ASSIGN_SUB = 72,
        ASSIGN_MUL = 73,
        ASSIGN_DIV = 74,
        ASSIGN_MOD = 75,
        ASSIGN_EXP = 76,
        COMMA = 77,
        OR = 78,
        AND = 79,
        XOR = 80,
        ADD = 81,
        SUB = 82,
        MUL = 83,
        DIV = 84,
        MOD = 85,
        EXP = 86,
        EQ = 87,
        NOT = 88,
        NE = 89,
        LT = 90,
        GT = 91,
        LTE = 92,
        GTE = 93,
        COMMENT = 94,
        COMMENT_BLOCK = 95,
        COMMENT_CLOSEBLOCK = 96,
        SINGLE_QUOTE = 97,
        DOUBLE_QUOTE = 98,
        ESCAPTE = 99,
        SPLIIT = 100
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
        word: RegExp;
        unit: string;
        notWord: RegExp;
        number: RegExp;
        negativeNumber: RegExp;
        private constructor();
        getKeyWords(): VeArray<VeSyntaxType>;
        getOperators(): VeArray<VeSyntaxType>;
        getBlocks(): VeArray<VeArray<VeSyntaxType>>;
        find(predict: (item: any, i?: number) => boolean): VeSyntaxType;
        get(name: VeName, lang?: language): VeSyntaxType;
        getAll(name: VeName): VeArray<VeSyntaxType>;
        static create(): _VeSyntax;
    }
    var VeSyntax: _VeSyntax;
}
declare namespace Ve.Lang {
    var VeBaseCode: VeArray<{
        name: string;
        code: string;
    }>;
}
declare namespace Ve.Lang {
    class StringStream {
        pos: number;
        str: string;
        row: number;
        constructor(str: string, row?: number);
        till(text: string | VeArray<string>, consider?: boolean, predict?: (str: string) => boolean): string;
        match(pattern: string | VeArray<string> | RegExp, matchAfterPattern?: RegExp | string | VeArray<string> | ((str: string) => boolean)): string;
        startWith(pattern: string): boolean;
        skipToEnd(): string;
        rest(): string;
        eol(): boolean;
        slice(from: number, to: number): string;
        eatSpace(): string | null;
        next(): string | null;
        backUp(n: number): void;
        current(): string;
    }
}
declare namespace Ve.Lang {
    class State<T> {
        root: T;
        current: T;
        context: T;
    }
    interface Mode<T> {
        state: State<T>;
        startState(): State<T>;
        token(stream: StringStream, state: State<T>): T;
        tokenStart?(stream: StringStream, state: State<T>): any;
        tokenEnd?(stream: StringStream, state: State<T>): any;
        walk?(stream: StringStream, state: State<T>): T;
        revise?(): any;
    }
}
declare namespace Ve.Lang {
    class Tokenizer<T> {
        code: string;
        mode: Mode<T>;
        lines: VeArray<string>;
        state: State<T>;
        isNewLineParse: boolean;
        constructor(code: string, mode: Mode<T>, isNewLineParse?: boolean);
        onStartState(): State<T>;
        onToken(sr: StringStream, state: State<T>): void;
        onTokenStart(sr: StringStream, state: State<T>): void;
        onTokenEnd(sr: StringStream, state: State<T>): void;
        onParse(): T;
    }
}
declare namespace Ve.Lang {
    enum CodeMode {
        code = 0,
        data = 1,
        express = 2
    }
    class TokenFormat {
        private chineseOperatorIsReplaceEnglish;
        private chineseBoolIsReplaceEnglish;
        private chineseKeyWordIsReplaceEnglish;
        private chineseQuoteIsReplaceEnglish;
        private codeMode;
        constructor(options: {
            codeMode: CodeMode;
            chineseOperatorIsReplaceEnglish?: boolean;
            chineseBoolIsReplaceEnglish?: boolean;
            chineseKeyWordIsReplaceEnglish?: boolean;
            chineseQuoteIsReplaceEnglish?: boolean;
        });
        format(to: Token): string;
        private codeFormat;
        private getNumberChar;
        private dataFormat;
    }
}
declare namespace Ve.Lang {
    enum TokenType {
        program = 0,
        keyWord = 1,
        block = 2,
        closeBlock = 3,
        operator = 4,
        number = 5,
        string = 6,
        word = 7,
        comment = 8,
        separator = 9,
        bool = 10,
        null = 11,
        newLine = 12,
        unit = 13,
        whiteSpace = 14
    }
    class Token {
        col: number;
        size: number;
        row: number;
        value: string;
        stringValue: string;
        stringQuote: string;
        wholeValue: string;
        parent: Token;
        childs: VeArray<Token>;
        type: TokenType;
        name: VeName;
        lang: language;
        unit?: string;
        _rowSpanToken: Token;
        readonly typeString: string;
        readonly nameString: string;
        static isConstantType(token: Token): boolean;
        constructor(tokenType: TokenType, options?: any);
        append(token: Token | VeArray<Token>): void;
        prev(pos?: number): Token | null;
        prevAll(fx?: any): VeArray<Token>;
        next(pos?: number): Token | null;
        nextAll(fx?: any): VeArray<Token>;
        readonly index: number;
        readonly isRowspan: boolean;
        rowSpanToken: Token;
        clearRowSpan(rowSpanToken: any): void;
        closest(fx: (token: Token) => boolean): Token | null;
        parents(fx: (token: Token) => boolean): VeArray<Token>;
        each(predict: (token: Token) => void): void;
        parentsUntil(fx: (token: Token) => boolean): VeArray<Token>;
        get(): any;
        getValue(): any;
        getWrapper(wp: (token: Token, childsTemplate: string) => string): string;
    }
}
declare namespace Ve.Lang {
    class VeMode implements Mode<Token> {
        state: State<Token>;
        root: Token;
        isIgnoreLineBreaks: boolean;
        isIgnoreWhiteSpace: boolean;
        constructor(options?: {
            isIgnoreLineBreaks?: boolean;
            isIgnoreWhiteSpace?: boolean;
        });
        startState(): State<Token>;
        token(stream: StringStream, state: State<Token>): Token;
        tokenStart(stream: StringStream, state: State<Token>): void;
        tokenEnd(stream: StringStream, state: State<Token>): void;
        walk(stream: StringStream, state: State<Token>): Token;
        private matchKeyWords;
        private matchComment;
        private matchRowspanComment;
        private matchStringBlock;
        private matchString;
        private matchBlock;
        private matchNegativeNumber;
        private matchNumber;
        private matchDoubleOperators;
        private matchOperators;
        private matchWord;
        private matchUnit;
        private mathEnum;
        onTraverse(fx: (token: Token) => void): void;
        revise(): void;
    }
}
declare namespace Ve.Lang.Transtate.js {
    var method$File: MethodAccepter;
}
declare namespace Ve.Lang.Transtate.js {
    var methodAccepter: MethodAccepter;
}
declare namespace Ve.Lang.Transtate.js {
    var accepter$method: Accepter<VisitorLange, void>;
}
declare namespace Ve.Lang.Transtate.js {
    var accepter$binary: Accepter<VisitorLange, void>;
}
declare namespace Ve.Lang.Transtate.js {
    var accepter$statement: Accepter<VisitorLange, void>;
}
declare namespace Ve.Lang.Transtate.js {
    var accepter: Accepter<VisitorLange, void>;
}
declare namespace Ve.Lang {
    enum TranstateLanguage {
        nodejs = 0,
        js = 1,
        java = 2,
        csharp = 3,
        php = 4,
        python = 5,
        mysql = 6,
        mongodb = 7,
        mssql = 8
    }
    class LangRender {
        node: Statement;
        visitor: VisitorLange;
        constructor(statement: Statement, options: any);
        template: string;
        render(): string;
        renderList(statement: VeArray<Statement>): string;
        call(statement: Statement): string;
        delclare(name: string): any;
        static create(statement: Statement, options: {
            template?: string;
            props?: Record<string, ((this: LangRender, ...args: any[]) => string) | string | Statement>;
        }): LangRender;
        wrappers: VeArray<string>;
        appendWrapper(wrapperCode: string): void;
    }
    type MethodAccepter = {
        name: string;
        props?: Record<string, (this: VisitorLange, statement: Statement, ...args: any[]) => string>;
    }[];
    type ResourceReference = {
        name: string;
        items: {
            type: 'file' | 'dir' | 'code';
            path?: string;
            url?: string;
            dest?: string;
            append?: string;
            code?: string;
        }[];
    };
    class VisitorLange extends AstVisitor<void> {
        methodAccepter: MethodAccepter;
        onInit(): void;
        acceptMethod(methodName: string, statement: Statement, ...args: string[]): any;
        resources: VeArray<ResourceReference>;
        appendResource(resource: ResourceReference): void;
    }
    class TranstateFactory {
        lang: TranstateLanguage;
        constructor(lang: TranstateLanguage);
        compile(code: string): string;
        compileExpress(express: string, args?: Outer.VeProp[]): string;
        private createVisitorLange;
    }
}
declare namespace Ve.Lang.Transtate.csharp {
}
declare namespace Ve.Lang.Transtate.csharp {
}
declare namespace Ve.Lang.Transtate.csharp {
}
declare namespace Ve.Lang.Transtate.csharp {
}
declare namespace Ve.Lang.Class.csharp {
}
declare namespace Ve.Lang.Transtate.mongodb {
    var methodAccepter: MethodAccepter;
}
declare namespace Ve.Lang.Transtate.mongodb {
    var accepter: Accepter<VisitorLange, void>;
}
declare namespace Ve.Lang.Transtate.nodejs {
    var method$File: MethodAccepter;
}
declare namespace Ve.Lang.Transtate.nodejs {
    var methodAccepter: MethodAccepter;
}
declare namespace Ve.Lang.Transtate.nodejs {
    var accepter$binary: Accepter<VisitorLange, void>;
}
declare namespace Ve.Lang.Transtate.nodejs {
    var accepter$statement: Accepter<VisitorLange, void>;
}
declare namespace Ve.Lang.Transtate.nodejs {
    var accepter$method: Accepter<VisitorLange, void>;
}
declare namespace Ve.Lang.Transtate.nodejs {
    var accepter: Accepter<VisitorLange, void>;
}
