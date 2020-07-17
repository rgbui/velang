declare namespace Ve.Lang.Util {
    type ListPredict<T> = T | ((item?: any, index?: number, list?: List<T>) => boolean);
    class List<T> {
        private $;
        constructor(...args: T[]);
        push(item: T): number;
        readonly length: number;
        splice(start: number, deleteCount: number, ...items: T[]): this;
        join(separator?: string, predict?: (item: T, i: number, list: List<T>) => string): string;
        reverse(): this;
        /**
         * Sorts an array.
         * @param compareFn Function used to determine the order of the elements. It is expected to return
         * a negative value if first argument is less than second argument, zero if they're equal and a positive
         * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
         * ```ts
         * List[11,2,22,1].sort((a, b) => a - b)
         * ```
         */
        sort(compareFn?: (a: T, b: T) => number): this;
        eq(pos: number): T;
        predicateMatch(item: any, index: number, list: List<T>, predicate: ListPredict<T>): boolean;
        last(): T;
        first(): T;
        toArray<U>(predicate: (item?: T, index?: number, list?: List<T>) => U): List<U>;
        append(a: List<T> | T[] | T, pos?: number): List<T>;
        insertAt(pos: number, a: List<T> | T[] | T): List<T>;
        replaceAt(pos: number, a: T): List<T>;
        appendArray(a: List<any> | any[], pos?: number): List<T>;
        insertArrayAt(pos: number, a: List<any> | any[]): List<T>;
        removeAt(pos: number): List<T>;
        remove(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean)): List<T>;
        removeAll(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean)): List<T>;
        removeBefore(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean), isIncludeFind?: boolean): List<T>;
        removeAfter(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean), isIncludeFind?: boolean): List<T>;
        exists(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean)): boolean;
        trueForAll(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean)): boolean;
        findLast(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean)): T | null;
        findBefore(indexPredict: ListPredict<T>, predict: ListPredict<T>, isIncludeSelf?: boolean): T;
        findAfter(indexPredict: ListPredict<T>, predict: ListPredict<T>, isIncludeSelf?: boolean): T;
        findSkip(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean), skip?: number): T;
        findRange(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean), predicate2: T | ((item?: T, index?: number, list?: List<T>) => boolean)): List<T>;
        findAll(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean)): List<T>;
        findAt(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean), defaultIndex?: number): number;
        findLastIndex(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean), defaultIndex?: number): number;
        forEach(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): void;
        each(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): void;
        reach(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): void;
        recursion(predicate: (item?: T, index?: number, next?: ((index?: number) => void)) => void): void;
        eachReverse(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): void;
        limit(index: number, size: number): List<T>;
        /***
         * 包含start,end
         */
        range(start: number, end?: number): List<T>;
        split(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): List<List<T>>;
        matchIndex(regex: string | RegExp, map: (item?: T, index?: number, list?: List<T>) => string, startIndex?: number): number;
        /**
         * 两个集合相减
         */
        subtract(arr: List<T>): List<T>;
        sum(predicate?: T | ((item?: T, index?: number, list?: List<T>) => number)): number;
        match(regex: string | RegExp, map: (item?: any, index?: number, list?: List<T>) => string, startIndex?: number): List<T>;
        copy(): List<T>;
        asArray(): T[];
        treeEach(treeChildName: string, fn: (item: T, deep?: number, index?: number, sort?: number, parent?: T, arr?: List<T>) => (void | {
            break?: boolean;
            continue?: boolean;
            returns?: any;
        }), parent?: T, defaultDeep?: number, defaultIndex?: number): {
            total: number;
            deep: number;
        };
        findIndex(predicate: any, defaultIndex?: number): number;
        find(predicate: any): T;
        map<U>(predicate: (item: T, i: number, list: List<T>) => U): List<U>;
        static isList(t: any): boolean;
        static asList<V>(t: V | V[] | List<V>): List<V>;
        static treeEach<T>(list: List<T>, treeChildName: string, fn: (item: T, deep?: number, index?: number, sort?: number, parent?: any, arr?: List<T>) => (void | {
            break?: boolean;
            continue?: boolean;
            returns?: any;
        }), parent?: any, defaultDeep?: any, defaultIndex?: any): {
            total: any;
            deep: any;
        };
    }
    var _: {
        remove<T>(list: T[], predict: T | ((t: T, index?: number, thisArray?: T[]) => boolean)): void;
        removeAll<T_1>(list: T_1[], predict: T_1 | ((t: T_1, index?: number, thisArray?: T_1[]) => boolean)): void;
        each<T_2>(list: T_2[], predict: (t: T_2, index?: number, thisArray?: T_2[]) => boolean): void;
        addRange<T_3>(list: T_3[], newArray: T_3[]): void;
        find<T_4>(list: T_4[], predict: (t: T_4, index?: number, thisArray?: T_4[]) => boolean): T_4;
        findIndex<T_5>(list: T_5[], predict: T_5 | ((t: T_5, index?: number, thisArray?: T_5[]) => boolean)): number;
        exists<T_6>(list: T_6[], predict: T_6 | ((t: T_6, index?: number, thisArray?: T_6[]) => boolean)): boolean;
        treeEach<T_7>(list: T_7[], treeChildName: string, fn: (item: T_7, deep?: number, index?: number, sort?: number, parent?: any, arr?: any[]) => void | {
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
    type ArrayOf<T> = T extends (infer p)[] ? p : never;
    type ListOf<T> = T extends Ve.Lang.Util.List<infer p> ? p : never;
}
declare namespace Ve.Lang.Util {
    function Inherit(Mix: any, ...mixins: any[]): any;
    function Mixin(cla: any, baseCla: any, keys: string[]): void;
    function Extend(mix: any, ...mixins: any[]): any;
    function getAvailableName<T>(name: any, list: List<T>, predict: (item: T) => string): any;
    function nullSafe<T>(value: T, def: T): T;
    function getId(): string;
}
declare namespace Ve.Lang.Util {
    class BaseEvent {
        private __$events;
        on(name: string | Record<string, (this: BaseEvent, ...args: any[]) => any>, cb?: (this: BaseEvent, ...args: any[]) => any, isReplace?: boolean): this;
        once(name: string | Record<string, (this: BaseEvent, ...args: any[]) => any>, cb?: (this: BaseEvent, ...args: any[]) => any, isReplace?: boolean): this;
        off(name: string | ((this: BaseEvent, ...args: any[]) => any)): this;
        emit(name: string, ...args: any[]): any;
        in(name: string): boolean;
    }
}
declare namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    class Token {
        /***列号*/
        col: number;
        size: number;
        row: number;
        value: string;
        childs: List<Token>;
        /***
         * @param name:'root'|'invalid'
         *
         */
        name: string;
        parent?: Token;
        node: Node;
        readonly prev: Token;
        readonly next: Token;
        nextFindAll(predict: (t: Token) => boolean): List<Token>;
        nextFind(predict: (t: Token) => boolean): Token;
        prevExists(predict: (t: Token) => boolean): boolean;
        /***incluse self */
        isPrevMatch(match: string | RegExp | string[] | RegExp[]): boolean;
        prevFlags(): string;
        closest(predict: (t: Token) => boolean, considerSelf?: boolean): Token;
        parents(predict: (t: Token) => boolean, tillPredict?: (t: Token) => boolean): List<Token>;
        get(): Record<string, any>;
        readonly flag: any;
        readonly index: number;
    }
}
declare namespace Ve.Lang {
    /**
     * @link https://microsoft.github.io/monaco-editor/monarch.html
     */
    type LangSyntaxRoot = {
        root: {
            include?: string;
            name?: string;
            match?: string | RegExp | (string[]);
            next?: string;
            nextTurn?: string;
            push?: boolean;
            pop?: boolean;
            action?: (contextToken: Token) => Record<string, any> | void;
        }[];
    };
    type LangSyntax = Record<string, string | (string[]) | RegExp | LangSyntaxRoot['root']> | LangSyntaxRoot;
    function getLangSyntaxRegex(syntax: LangSyntax, r: RegExp | string): any;
    function convertLangSyntax(syntax: LangSyntax): void;
}
declare namespace Ve.Lang {
    var VeTokenSyntax: LangSyntax;
}
declare namespace Ve.Lang {
    /**
     * 中文语法 token syntax
     *
     */
    var VeZhTokenSyntax: LangSyntax;
}
declare namespace Ve.Lang {
    class Tokenizer extends Util.BaseEvent {
        constructor();
        private pos;
        private len;
        private code;
        private line;
        private lines;
        private lineCount;
        private row;
        private rootToken;
        private contextToken;
        private contextMode;
        private syntax;
        protected init(): void;
        protected load(syntax: LangSyntax): void;
        protected createToken(): Token;
        parse(code: string): Token;
        private matchMode;
        private match;
        private matchInvalid;
        private nextLine;
        private readonly lineIsEol;
        private readonly rowIsEol;
        private llegalTermination;
    }
    interface Tokenizer {
        on(name: 'error', fn: (error: Error | string, pos?: {
            col: number;
            row: number;
        }, token?: Token) => void): any;
    }
}
declare namespace Ve.Lang {
    import List = Util.List;
    type NodeMayAppendType = Node | List<Node> | List<Node | List<Node>> | List<List<Node>>;
    class Node {
        childs: List<Node>;
        tokens: List<Token>;
        parent: Node;
        type: NodeType;
        inferType(classGenerics?: List<TypeExpress>, methodGenerics?: List<TypeExpress>): TypeExpress;
        constructor(options?: Record<string, any>);
        append(statement: NodeMayAppendType): void;
        /**
         * ast 节点引用的token
         * 建议一个ast节点只关注具体标识性的一个token
         *
         * */
        ref(tokens: List<Token> | Token): void;
        set(name: string, statement: NodeMayAppendType | any): void;
        /***
         * 先判断当前节点，
         * 然后判断当前节点前面的所有节点
         * 然后找到父节点，
         * 再判断父节点前面的
         *
         */
        closest(predict: (node: Node) => boolean, considerSelf?: boolean): Node;
        private $cache;
        cache(key: string, value?: any): any;
        readonly root: any;
        /****
         *
         * @param name 通过名称查找申明的变量名，形参名，类，类的静态参数,枚举，申明的函数
         * @param types 主要是指定查询的类型范围
         *
         */
        queryName(name: string, types?: List<NodeType> | ((node: Node) => boolean)): any;
        findAll(predict: (node: Node) => boolean): List<Node>;
        find(predict: (node: Node) => boolean): Node;
        readonly prevs: List<Node>;
        readonly next: Node;
    }
    class Express extends Node {
    }
    class Statement extends Node {
    }
    class Program extends Node {
        type: NodeType.program;
        packages: List<Statement>;
        append(node: List<Statement> | Statement): void;
        remove(node: List<Statement> | Statement): void;
    }
}
declare namespace Ve.Lang {
    class VeLangError {
        /**
         * 错误阶段
         * @enum {string} token 解析token指令，一般主要错误是token进栈后，没有退出来，如'{'没有另一半'}',还有就是未识别的token,但这个发生的可能性很小
         * @enum {string} node 主要是语法结构的错误
         * @enum {string} infer 主要是检测用法是否正确，类型是否有冲途、检测项是最多的
         */
        stage: 'token' | 'node' | 'infer';
        /**错误的token */
        token?: Token;
        /**
         * 指定发生错误的地方
         */
        pos?: {
            col: number;
            row: number;
        };
        /**错误信息 */
        error?: string | Error;
        static create(data: Partial<VeLangError>): VeLangError;
    }
    class Compiler extends Util.BaseEvent {
        private id;
        constructor();
        /**
         *
         * @param code 编辑的代码，最好是一个类（可以多个类）文件，最好是这样
         *
         */
        compile(code: string): {
            nodes: Util.List<Node>;
            tokens: Util.List<Token>;
        };
        /**
         * 由于ve语言是面向对象语言，不能直接执行脚本，需要模拟一个静态方法
         * @param isExpressOrBlock 是表达式还是语句（类似于函数体)
         * @param code
         * @param args
         * @param thisObjectArgs 当前方法的this对象
         *
         */
        private simulateClass;
        /**
         * 编译表达式，因为是面向对象语言，不能直接运行表达式脚本，故模拟一个类静态方法，表达式做为返回值
         * @param code
         * @param args
         * @param thisObjectArgs 当前方法的this对象
         *
         */
        express(code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]): {
            express: Express;
            tokens: Util.List<Token>;
        };
        /**
         * 编译代码块(函数体)，需要模拟类，构造静态方法
         * @param code
         * @param args
         * @param thisObjectArgs 当前方法的this对象
         *
         */
        block(code: string, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[]): {
            nodes: Util.List<Statement>;
            tokens: Util.List<Token>;
            classMethod: ClassMethod;
        };
        /**
         * 编译类型代码
         * @param code  类型代码
         */
        type(code: string): {
            nodes: Util.List<TypeExpress>;
            tokens: Util.List<Token>;
        };
        /**
         * 不用了，记得注销掉,谢谢
         */
        dispose(): void;
    }
    interface Compiler {
        on(name: 'error', fn: (error: VeLangError) => void): any;
    }
}
declare namespace Ve.Lang {
    /**
    * @enum o core 是整个Ve语言的核心库，是不可缺少的，打包时，会一起打包进去，主要是一些基本的类型
    * @enum o lib 库，主要是一些平台类型的库，如html环境，后台io，android环境等，会根据使用情况选择性的导入加载
    * @enum o code 用户编写的代码
    *
    */
    export enum LibType {
        core = 0,
        lib = 1,
        code = 2
    }
    class CoreCompile extends Util.BaseEvent {
        constructor();
        program: Program;
        /**
         * 存储导入所有类库等信息
         */
        private packages;
        importNodes(nodes: Util.List<Node>, type: LibType, id?: string): void;
        importPackage(code: string, type: LibType): Util.List<Node>;
        removeNodes(id: string): void;
    }
    export var coreCompile: CoreCompile;
    export {};
}
declare namespace Ve.Lang {
    class NodeDiagnose {
        program(node: Statement): void;
        package(node: Statement): void;
        use(node: Statement): void;
        $if(node: IFStatement): void;
        while(node: WhileStatement): void;
        for(node: ForStatement): void;
        switch(node: Statement): void;
        when(node: WhenStatement): void;
        continue(node: Statement): void;
        break(node: Statement): void;
        return(node: Statement): void;
        $throw(node: Statement): void;
        try(node: Statement): void;
        class(node: ClassStatement): void;
        enum(node: Statement): void;
        classProperty(node: Statement): void;
        classMethod(node: Statement): void;
        classOperator(node: Statement): void;
        fun(node: Statement): void;
        anonymousFun(node: Statement): void;
        'new'(node: Statement): void;
        at(node: Statement): void;
        block(node: Statement): void;
        object(node: Statement): void;
        array(node: Statement): void;
        objectCall(node: Statement): void;
        arrayCall(node: ArrayCallExpress): void;
        nameCall(node: NameCall): void;
        thisCall(node: Statement): void;
        superCall(node: Statement): void;
        methodCall(node: Statement): void;
        constant(node: Statement): void;
        declareVariable(node: DeclareVariable): void;
        stringTemplate(node: Statement): void;
        ternary(node: Statement): void;
        unary(node: Statement): void;
        binary(node: BinaryExpress): void;
        bracket(node: Statement): void;
        assign(node: Statement): void;
        type(node: Statement): void;
        parameter(node: Statement): void;
        spread(node: Statement): void;
        emptyStatement(node: Statement): void;
    }
}
declare namespace Ve.Lang {
    enum ExceptionCode {
        /***未实现类、方法泛型 */
        notImplementGenerics = 0,
        conditionIsNotBool = 1,
        notDeclareVariable = 2,
        arrayIndexNotNumber = 3,
        /***语法错误 */
        syntaxError = 4,
        declareTypeNotEqual = 5,
        /***找不到相应的操作符 */
        notFoundOperator = 6,
        /****操作符运算类型不一致 */
        operatorTypeNotEqual = 7,
        /****查找不到方法 */
        notFoundMethod = 8,
        notFoundClassProperty = 9,
        /****方法形参不适配 */
        methodArgementNotCompatibility = 10,
        /***object对象无法找到key */
        objectNotFoundKey = 11,
        /****找到不类型 */
        notFoundType = 12
    }
    enum ExceptionLevel {
        error = 1,
        warn = 2,
        info = 0
    }
    class Exception extends Error {
        node: Node | Token;
        code: ExceptionCode;
        template: string;
        object: Record<string, any>;
        level: ExceptionLevel;
        static create(data: [ExceptionCode, Node | Token, string, Record<string, any>?], level?: ExceptionLevel): void;
        toString(): any;
    }
}
declare namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    class InferType {
        static InferTypeStatements(statement: Statement | List<Statement>): TypeExpress;
        static InferTypeOperatorBinaryExpress(binary: BinaryExpress): ClassOperator;
        static InferTypeObjectKeyType(node: ObjectCallExpress, callExpress?: MethodCallExpress | NewCallExpress): TypeExpress;
        /***判断函数调用的类型是否与函数类型相一致 */
        static InferTypeMethodCallFunTypeIsCompatibility(methodCall: MethodCallExpress, fun: FunStatement | ClassMethod, classGen?: List<TypeExpress>): boolean;
        /***判断类型参数数组与函数参数类型相一致 */
        static InterTypeListTypeFunTypeIsCompatibility(listType: List<TypeExpress>, fun: FunStatement | ClassMethod): boolean;
    }
}
declare namespace Ve.Lang {
    enum NodeType {
        program = 0,
        package = 1,
        use = 2,
        if = 3,
        while = 4,
        for = 5,
        switch = 6,
        when = 7,
        continue = 8,
        break = 9,
        return = 10,
        throw = 11,
        try = 12,
        class = 13,
        enum = 14,
        enumItem = 15,
        classProperty = 16,
        classMethod = 17,
        classOperator = 18,
        fun = 19,
        anonymousFun = 20,
        new = 21,
        at = 22,
        block = 23,
        express = 24,
        object = 25,
        array = 26,
        objectCall = 27,
        arrayCall = 28,
        nameCall = 29,
        thisCall = 30,
        superCall = 31,
        methodCall = 32,
        constant = 33,
        declareVariable = 34,
        stringTemplate = 35,
        ternary = 36,
        unary = 37,
        binary = 38,
        bracket = 39,
        assign = 40,
        type = 41,
        parameter = 42,
        spread = 43,
        emptyStatement = 44
    }
}
declare namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    class ArrayCallExpress extends Express {
        type: NodeType;
        caller: Express;
        arrayIndex: Express;
        inferType(): TypeExpress;
    }
    /****
     *
     * a.length.toString.length.toString
     *
     */
    class ObjectCallExpress extends Express {
        type: NodeType;
        caller: Express;
        /***运算符 "?."" "." */
        operator: string;
        key: NameCall;
        inferType(): any;
        readonly nameCallers: List<Express>;
    }
    class MethodCallExpress extends Express {
        type: NodeType;
        caller: Express;
        argements: List<Express>;
        inferType(): any;
    }
    class NewCallExpress extends Express {
        type: NodeType;
        caller: Express;
        inferType(): any;
    }
    /***
     * 调用的变量申明
     * a+b;
     * Math.PI
     * 注意命名空间的首名也是NameCall
     * 命名空间的全称没法初始能很好的判断出来
     * @param implementGeneric泛型实现
     *
     */
    class NameCall extends Express {
        type: NodeType;
        name: string;
        implementGeneric: List<TypeExpress>;
        /**
        * 能够被调用，说明是变量名，来源申明的变量名，方法参数名
        * */
        inferType(): any;
        /**
        * 能够被调用，说明是变量名，来源申明的变量名，方法参数名
        **/
        readonly refNode: any;
    }
    class ThisCall extends Express {
        type: NodeType;
        inferType(): any;
    }
    class SuperCall extends Express {
        type: NodeType;
        inferType(): any;
    }
    /****
     * 类的@属性
     */
    class AtExpress extends Express {
        type: NodeType;
        at: NameCall | MethodCallExpress | ThisCall | SuperCall;
        inferType(): any;
    }
}
declare namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    class Constant extends Express {
        type: NodeType;
        value: any;
        constantType: TypeExpress;
        readonly isNumber: boolean;
        inferType(): TypeExpress;
    }
    /***形参 */
    class Parameter extends Statement {
        type: NodeType;
        /***剩余参数...args:string[] */
        rest: boolean;
        /***参数可选，parma?:bool */
        optional: boolean;
        name: string;
        default: Express;
        valueType: TypeExpress;
        inferType(): any;
    }
    /***
     * 申明一个变量
     */
    class DeclareVariable extends Express {
        type: NodeType;
        name: string;
        modifys: List<Modify>;
        declareType: TypeExpress;
        value: Express;
        readonly isConst: boolean;
        inferType(): any;
    }
    class ObjectExpress extends Express {
        type: NodeType;
        items: List<{
            key: string;
            value: Express;
        }>;
        inferType(): TypeExpress;
    }
    class ArrayExpress extends Express {
        type: NodeType;
        items: List<Express>;
        inferType(): TypeExpress;
    }
    /****
     * 匿名函数
     */
    class AnonymousFunExpress extends Express {
        type: NodeType;
        content: List<Statement>;
        parameters: List<Parameter>;
        returnType: TypeExpress;
        /****是否为箭头函数 */
        isArrow: boolean;
        inferType(): TypeExpress;
    }
    class StringTemplateExpress extends Express {
        type: NodeType;
        strings: List<Constant | NameCall | Express>;
        stringType: TypeExpress;
        inferType(): any;
    }
}
declare namespace Ve.Lang {
    /**
     * 操作符也可以是关键词 as is
     *
     */
    /***
     * 三元运算符
     */
    class TernaryExpress extends Express {
        type: NodeType;
        trueExpress: Express;
        falseExpress: Express;
        condition: Express;
        inferType(): TypeExpress;
    }
    /***
     * 一元运算符
     */
    class UnaryExpress extends Express {
        type: NodeType;
        operator: string;
        express: Express;
        direction: boolean;
        inferType(): TypeExpress;
    }
    /****特指小括号 */
    class BracketExpress extends Express {
        type: NodeType;
        express: Express;
        inferType(): TypeExpress;
    }
    /***
     * 二元运算符
     */
    class BinaryExpress extends Express {
        type: NodeType;
        operator: string;
        left: Express;
        right: Express;
        inferType(): any;
    }
    class AssignExpress extends Express {
        type: NodeType;
        operator: string;
        left: Express;
        right: Express;
        inferType(): TypeExpress;
    }
    class SpreadExpress extends Express {
        type: NodeType;
        express: Express;
        inferType(): TypeExpress;
    }
}
declare namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    enum TypeKind {
        union = 0,
        fun = 1,
        object = 2,
        unit = 3
    }
    class TypeExpress extends Express {
        type: NodeType;
        /**unit type**/
        name?: string;
        /**fun type property */
        args?: List<{
            key: string;
            type: TypeExpress;
        }>;
        returnType?: TypeExpress;
        /***object type property */
        props?: List<{
            key: string;
            type: TypeExpress;
        }>;
        /***union type property */
        unionType: TypeExpress;
        generics: List<TypeExpress>;
        static create(options: Partial<TypeExpress>): TypeExpress;
        toString(): any;
        injectImplementGenerics(Generics: List<Generic>, ImplementGenerics: List<TypeExpress>): any;
        /****
         * 判断类型是否相等
         * @param isCompatibility 类型是否兼容 如int兼容number，因为int继成number
         */
        static typeIsEqual(node: Node, type1: TypeExpress, type2: TypeExpress, isCompatibility?: boolean): boolean;
    }
}
declare namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    enum Modify {
        readonly = 0,
        static = 1,
        public = 2,
        protected = 3,
        private = 4,
        out = 5,
        inner = 6,
        const = 7,
        /****密封类*/
        sealed = 8,
        class = 9,
        interface = 10,
        enum = 11,
        /***自定义类操作符 */
        operator = 12,
        fun = 13,
        /***申明 */
        def = 14,
        /***表示重载 */
        override = 15,
        /***通常表示当前类为装饰类 */
        decorate = 16,
        async = 17,
        await = 18,
        /****属性get,set */
        get = 19,
        set = 20,
        field = 21
    }
    class DecorateStatement extends Statement {
        name: string;
        arguments: List<Express>;
    }
    class Generic extends Statement {
        name: string;
        /***泛型继承 */
        extend?: TypeExpress;
    }
    class PackageStatement extends Statement {
        type: NodeType;
        name: string;
        content: List<Statement>;
        readonly lastName: String;
        getReferenceNames(name: string): List<string>;
        readonly classList: List<ClassStatement | EnumStatement | FunStatement>;
    }
    class UseStatement extends Statement {
        type: NodeType;
        packageName: string;
        aliasName: string;
    }
    class ClassStatement extends Statement {
        type: NodeType;
        name: string;
        extendName: string;
        content: List<Statement>;
        decorates: List<DecorateStatement>;
        modifys: List<Modify>;
        generics: List<Generic>;
        readonly names: List<any>;
        readonly extend: ClassStatement;
        readonly extends: List<ClassStatement>;
        readonly package: PackageStatement;
        readonly fullNames: List<string>;
        readonly isOut: boolean;
        isFullName(name: string): boolean;
        isName(name: string): boolean;
        readonly propertys: List<ClassMethod | ClassOperator | ClassProperty>;
        methods(onlySelfClass?: boolean): List<Statement> | List<ClassMethod | ClassOperator | ClassProperty>;
        operators(onlySelfClass?: boolean): List<Statement> | List<ClassMethod | ClassOperator | ClassProperty>;
        props(onlySelfClass?: boolean): List<Statement> | List<ClassMethod | ClassOperator | ClassProperty>;
        inferType(): TypeExpress;
    }
    class EnumStatement extends Statement {
        type: NodeType;
        name: string;
        items: List<EnumItem>;
        decorates: List<DecorateStatement>;
    }
    class EnumItem extends Statement {
        type: NodeType;
        name: string;
        value: number;
        readonly fullNames: List<string>;
        isFullName(name: string): boolean;
    }
    interface EnumStatement extends Pick<ClassStatement, 'package' | 'fullNames' | 'names' | 'isName' | 'isFullName' | 'isOut'> {
    }
    class FunStatement extends Statement {
        type: NodeType;
        decorates: List<DecorateStatement>;
        modifys: List<Modify>;
        name: string;
        content: List<Statement>;
        parameters: List<Parameter>;
        returnType: TypeExpress;
        generics: List<Generic>;
        inferType(): TypeExpress;
    }
    interface FunStatement extends Pick<ClassStatement, 'package' | 'fullNames' | 'names' | 'isName' | 'isFullName' | 'isOut'> {
    }
    class ClassMethod extends Statement {
        type: NodeType;
        name: string;
        content: List<Statement>;
        parameters: List<Parameter>;
        returnType: TypeExpress;
        decorates: List<DecorateStatement>;
        modifys: List<Modify>;
        generics: List<Generic>;
        readonly class: any;
        readonly package: any;
        readonly fullNames: List<string>;
        readonly names: List<any>;
        readonly onlyName: string;
        readonly isStatic: boolean;
        readonly isPublic: boolean;
        readonly isProtected: boolean;
        readonly isPrivate: boolean;
        readonly isOverride: boolean;
        readonly isInterface: boolean;
        isName(name: string): boolean;
        isFullName(name: string): boolean;
        /***
         * 方法inferType表示当前方法的类型
         */
        inferType(): TypeExpress;
        readonly isCtor: boolean;
    }
    class ClassProperty extends Statement {
        type: NodeType;
        name: string;
        /***
         * 属性字段的get,set内容
         *
         */
        content: List<Statement>;
        /***属性字段get,set参数 */
        parameters: List<Parameter>;
        /***属性字段方法返回类型 */
        returnType: TypeExpress;
        /****注解 */
        decorates: List<DecorateStatement>;
        modifys: List<Modify>;
        propType: TypeExpress;
        propValue: Constant;
        readonly isGet: boolean;
        readonly isSet: boolean;
        readonly class: any;
        readonly package: any;
        readonly fullNames: List<string>;
        readonly names: List<any>;
        readonly onlyName: string;
        readonly isStatic: boolean;
        readonly isPublic: boolean;
        readonly isProtected: boolean;
        readonly isPrivate: boolean;
        readonly isOverride: boolean;
        readonly isInterface: boolean;
        isName(name: string): boolean;
        isFullName(name: string): boolean;
        inferType(): any;
    }
    class ClassOperator extends Statement {
        type: NodeType;
        parameters: List<Parameter>;
        returnType: TypeExpress;
        decorates: List<DecorateStatement>;
        modifys: List<Modify>;
        name: string;
        content: List<Statement>;
        /***
         * 推导的是操作符返回值的类型，
         * 不是操作符本身方法类型
         */
        inferType(): any;
        readonly class: any;
        readonly package: any;
        readonly fullNames: List<string>;
        readonly names: List<any>;
        readonly onlyName: string;
        readonly isStatic: boolean;
        readonly isPublic: boolean;
        readonly isProtected: boolean;
        readonly isPrivate: boolean;
        readonly isOverride: boolean;
        readonly isInterface: boolean;
        isName(name: string): boolean;
        isFullName(name: string): boolean;
    }
}
declare namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    class IFStatement extends Node {
        type: NodeType;
        ifCondition: Express;
        ifContent: List<Statement>;
        elseIFConditions: List<Express>;
        elseIFContents: List<List<Statement>>;
        elseConent: List<Statement>;
    }
    class WhenStatement extends Node {
        type: NodeType;
        whens: List<{
            value: List<Express>;
            content: List<Statement>;
        }>;
        set(name: 'whens', value: WhenStatement['whens']): void;
    }
    class WhileStatement extends Node {
        type: NodeType;
        condition: Express;
        content: List<Statement>;
    }
    class ForStatement extends Node {
        type: NodeType.for;
        init: List<Statement>;
        condition: Express;
        post: List<Statement>;
        content: List<Statement>;
    }
    class SwitchStatement extends Node {
        type: NodeType;
        value: Express;
        cases: List<{
            case: List<Express>;
            content: List<Statement>;
        }>;
        default: List<Statement>;
        set(name: 'cases' | 'value' | 'default', value: SwitchStatement['cases'] | any): void;
    }
    class TryStatement extends Node {
        type: NodeType;
        try: List<Statement>;
        catchs: List<{
            paramete?: Parameter;
            content: List<Statement>;
        }>;
        finally: List<Statement>;
        set(name: 'try' | 'catchs' | 'finally', value: any): void;
    }
    class BreadkStatement extends Node {
        type: NodeType;
    }
    class EmptyStatement extends Node {
        type: NodeType;
    }
    class ContinueStatement extends Node {
        type: NodeType;
    }
    class ReturnStatement extends Node {
        type: NodeType;
        result: Express;
        inferType(): TypeExpress;
    }
    class ThrowStatement extends Node {
        type: NodeType;
        throw: Express;
    }
    class BlockStatement extends Node {
        type: NodeType;
        content: List<Statement>;
    }
}
declare namespace Ve.Lang {
    import List = Util.List;
    type ExpressTreeNode = {
        op: OperatorPrecedence;
        operator: List<Token>;
        leftExpress?: Express;
        leftUnitExpress?: List<Express>;
        rightExpress?: Express;
        rightUnitExpress?: List<Express>;
    };
    class StatementParser$Express {
        express(this: StatementParser): Express;
        eatExpressUnit(this: StatementParser): Express;
        eatExpressSymbol(this: StatementParser): {
            operator: List<Token>;
            op: OperatorPrecedence;
        };
        nextExpress(this: StatementParser): Express;
        /**
         *
         * 逗号分割表达式
         *
         * */
        commasExpress(this: StatementParser): List<Express>;
        private expressTrees;
        private units;
        private commonUnitExpress;
        private parseCommonUnit;
        private parseOperatorExpress;
        /***三元运算符 */
        private parseTernary;
        /***单元运算符 */
        private parseUnary;
        /****二元运算符 */
        private parseBinary;
        /****括号运算，有left的说明是某个调用（如方法，否则为括号运算符） */
        private parseBracket;
        /**
         * 优先级比较
         */
        private comparePrecedence;
    }
}
declare namespace Ve.Lang {
    class StatementParser$Class {
        $property(this: StatementParser): ClassProperty;
        $method(this: StatementParser): ClassMethod;
        $field(this: StatementParser): ClassProperty;
        $operator(this: StatementParser): ClassOperator;
    }
}
declare namespace Ve.Lang {
    import List = Util.List;
    class StatementParser$Declare {
        $package(this: StatementParser): PackageStatement;
        $use(this: StatementParser): UseStatement;
        $class(this: StatementParser): ClassStatement;
        $enum(this: StatementParser): EnumStatement;
        $fun(this: StatementParser): FunStatement;
        $def(this: StatementParser): List<DeclareVariable>;
    }
}
declare namespace Ve.Lang {
    class StatementParser$Statement {
        $if(this: StatementParser): IFStatement;
        $for(this: StatementParser): ForStatement;
        $while(this: StatementParser): WhileStatement;
        $when(this: StatementParser): WhenStatement;
        $switch(this: StatementParser): SwitchStatement;
        $try(this: StatementParser): TryStatement;
        $break(this: StatementParser): BreadkStatement;
        $continue(this: StatementParser): ContinueStatement;
        $return(this: StatementParser): ReturnStatement;
        $throw(this: StatementParser): ThrowStatement;
    }
}
declare namespace Ve.Lang {
    class StatementParser$Common {
        block(this: StatementParser): BlockStatement;
        /***提取空白符*/
        blank(this: StatementParser): void;
        /****吃掉空白的语句 */
        emptyStatement(this: StatementParser): EmptyStatement;
    }
}
declare namespace Ve.Lang {
    import List = Util.List;
    class StatementParser$Util {
        /****匹配方法返回类型和方法体 */
        matchFunTypeAndBody(this: StatementParser): {
            returnType: TypeExpress;
            content: List<Statement>;
        };
        decorateAndModify(this: StatementParser, tokens: List<Token>, statement: Statement): List<Token>;
    }
}
declare namespace Ve.Lang {
    class StatementParser$ExpressCommon {
        funExpress(this: StatementParser): AnonymousFunExpress;
        /***
       * T[]
       * ()->T
       *
       * string[][][][]
       * {}[]
       * ()->{}
       * ()->string
       * ()->{}[][] 这种无法区分
       * (()->string[])[]
       * ()->[]{}
       * ()->()->(a:string)->string
       * Array<string>
       **/
        $type(this: StatementParser): any;
        /****
         *
         * 捕获箭头方法
         *
         * ()(:?)->{ }
         *
        */
        arrowFun(this: StatementParser): AnonymousFunExpress;
    }
}
declare namespace Ve.Lang {
    import List = Ve.Lang.Util.List;
    class StatementParser extends Util.BaseEvent {
        private tokens;
        private nodes;
        private syntax;
        syntaxContext: string;
        private pos;
        constructor();
        private load;
        onError(error: string | Error, token?: Token): void;
        import(tokens: List<Token>): void;
        parse(tokens: List<Token>): List<Node>;
        /***执行下一个语句 */
        next(actionName?: string): void;
        nextOne(actionName?: string): any;
        eat(match: string | RegExp | (string | RegExp)[]): List<Token>;
        eatBlockOrStatement(): List<Statement>;
        eatBlank(): List<Token>;
        eatEmptyStatement(): void;
        eatOne(): Token;
        match(match: string | RegExp | (string | RegExp)[]): boolean;
        end(): void;
        append(node: Statement | List<Statement>): void;
        range(start: number, end?: number): List<Token>;
        /**
         * @param pos 如果为正的，将向前滚，如果负的，将向后滚
         * */
        move(pos: number): void;
        back(pos: number): void;
        readonly index: number;
        readonly prevToken: Token;
        readonly currentToken: Token;
        readonly restTokens: List<Token>;
        readonly restFlags: string;
        readonly restValues: string;
        isErrored: boolean;
        readonly eol: boolean;
        private matchTokens;
        private matchText;
        private getFlags;
        createParser(): StatementParser;
        readonly TM: TokenMatch;
    }
    interface StatementParser {
        on(name: 'error', fn: (error: string | Error, pos?: {
            col: number;
            row: number;
        }, token?: Token) => void): any;
    }
    interface StatementParser extends StatementParser$Class {
    }
    interface StatementParser extends StatementParser$Declare {
    }
    interface StatementParser extends StatementParser$Statement {
    }
    interface StatementParser extends StatementParser$Common {
    }
    interface StatementParser extends StatementParser$Util {
    }
    interface StatementParser extends StatementParser$Express {
    }
    interface StatementParser extends StatementParser$ExpressCommon {
    }
}
declare namespace Ve.Lang {
    /***
    * @param  s表示空格
    * @param  n表示换行符
    * @param  blank表示空白符（包括换符号和空格符）
    * @param  decorate 表示注解
    * @param  modify 表示方法的修辞符
    *
    */
    var veStatementSyntax: LangSyntax;
    /***
    *
    * @param precedence 运算优先级 如果为-1表示无意义
    * @param direction 运算求值，默认为-1表示无意义  从左到右(0)，从右到左(1)
    * @param operand 操作数 0 表示没有 1:单元运算符 2:二元运算符 3:表示三元运算符
    *
    */
    type OperatorPrecedence = {
        name: string;
        match?: string | (string | RegExp)[] | RegExp;
        precedence: number;
        direction?: number;
        operand?: number;
    };
    var veOperatorPrecedences: OperatorPrecedence[];
    function getStatementRegex(namespace: any): string | RegExp | (string[]);
}
declare namespace Ve.Lang {
    import List = Util.List;
    class TokenMatch extends Ve.Lang.Util.BaseEvent {
        pickExpressFromBracketOfStatement(tokens: List<Token>): Express;
        pickStatementFromBlockOfStatement(tokens: List<Token>): List<Node>;
        statement(tokens: List<Token>): List<Node>;
        express(tokens: List<Token>): Express;
        /****tokens */
        /***
           * 判断是否存匹配
           */
        isMatch(match: string | RegExp | (string | RegExp)[], tokens: List<Token>): boolean;
        /***获取匹配的token数量 */
        match(match: string | RegExp | (string | RegExp)[], tokens: List<Token>): List<Token>;
        matchAll(match: string | RegExp | (string | RegExp)[], tokens: List<Token>): List<List<Token>>;
        /***
         * 过滤(是过滤所有)
         */
        filter(match: string | RegExp | (string | RegExp)[], tokens: List<Token>): List<Token>;
        /***
         * 解析类型
         */
        typeExpress(tokens: List<Token>): any;
        /****
        * 解析数据
        */
        dataExpress(tokens: List<Token>): Constant | ObjectExpress | ArrayExpress | StringTemplateExpress;
        decorate(tokens: List<Token>): DecorateStatement;
        generics(tokens: List<Token>): List<Generic>;
        parameters(tokens: List<Token>): List<Parameter>;
        private createParser;
    }
}
declare namespace Ve.Lang.Generate {
    class GenerateLang extends Ve.Lang.Util.BaseEvent {
        paper: GeneratePaper;
        private libs;
        import(la: apiPackage): void;
        renderClassProp(onlyName: string, obj: Record<string, any>): any;
        generateMethod(node: ObjectCallExpress, callExpress: MethodCallExpress | NewCallExpress, render: NodeRender): string;
        generateAt(node: AtExpress, render: NodeRender): string;
    }
}
declare namespace Ve.Lang.Generate.nodeJS {
    /***
     *
     *
     *
     */
    var genArray: apiPackage;
}
declare namespace Ve.Lang.Generate.nodeJS {
    var genCommon: apiPackage;
}
declare namespace Ve.Lang.Generate.nodeJS {
    /***
     *
     * 计算一年中的第几周 参考https://www.jianshu.com/p/aa6dd016db26
     *
     */
    var genDate: apiPackage;
}
declare namespace Ve.Lang.Generate.nodeJS {
    var genNumber: apiPackage;
}
declare namespace Ve.Lang.Generate.nodeJS {
    var genString: apiPackage;
}
declare namespace Ve.Lang.Generate {
    class GenerateNodeJS extends Ve.Lang.Generate.GenerateLang {
        program(node: Program, render: NodeRender): string;
        package(node: PackageStatement): string;
        use(node: UseStatement): string;
        $if(node: IFStatement, render: NodeRender): string;
        $while(node: Statement, render: NodeRender): string;
        $for(node: Statement, render: NodeRender): string;
        $switch(node: Statement, render: NodeRender): string;
        when(node: Statement, render: NodeRender): string;
        $continue(node: Statement): string;
        $break(node: Statement): string;
        $return(node: Statement): string;
        $throw(node: Statement): string;
        $try(node: Statement): string;
        enum(node: Statement): {
            template: string;
            content(node: any): string;
        };
        $class(node: ClassStatement): string;
        classProperty(node: ClassProperty): void;
        classMethod(node: ClassMethod): string;
        classOperator(node: ClassOperator): string;
        fun(node: Statement): string;
        anonymousFun(node: AnonymousFunExpress): string;
        objectCall(node: ObjectCallExpress, render: NodeRender): string;
        $new(node: NewCallExpress, render: NodeRender): string;
        methodCall(node: MethodCallExpress, render: NodeRender): string;
        at(node: AtExpress, render: NodeRender): string;
        block(node: BlockStatement): string;
        object(obj: ObjectExpress, render: NodeRender): {
            template: string;
            content(): string;
        };
        array(node: ArrayExpress, render: NodeRender): string;
        arrayCall(arrayCall: ArrayCallExpress): string;
        nameCall(node: NameCall): string;
        thisCall(node: Statement): string;
        superCall(node: Statement): string;
        constant(node: Constant): any;
        declareVariable(node: DeclareVariable): "const @def()@(node.value?\"=\"+express(node.value):\"\")" | "var  @def()@(node.value?\"=\"+express(node.value):\"\")";
        stringTemplate(node: StringTemplateExpress, render: NodeRender): {
            template: string;
            strings(): string;
        };
        ternary(node: TernaryExpress, render: NodeRender): string;
        unary(node: UnaryExpress, render: NodeRender): "(@node.operator@express(node.express))" | "(@express(node.express)@node.operator)";
        bracket(node: BracketExpress, render: NodeRender): string;
        assign(node: AssignExpress, render: NodeRender): string;
        binary(node: BinaryExpress, render: NodeRender): any;
        type(node: Statement): string;
        parameter(pa: Parameter): string;
        spread(node: Statement): string;
        emptyStatement(node: Statement): string;
    }
    var nodejsGenerate: GenerateNodeJS;
}
declare namespace Ve.Lang.Generate {
    import List = Util.List;
    enum GenerateLanguage {
        nodejs = 0,
        js = 1,
        java = 2,
        csharp = 3,
        php = 4,
        python = 5,
        mongodb = 6,
        mysql = 7,
        mssql = 8
    }
    class Generate extends Ve.Lang.Util.BaseEvent {
        constructor();
        nodes: List<Node>;
        lang: GenerateLanguage;
        paper: GeneratePaper;
        generate(code: string, lang: GenerateLanguage): string;
        generateExpress(code: string, lang: GenerateLanguage, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[], options?: {
            thisObjectName?: string;
            parameterMapNames?: Record<string, any>;
        }): string;
        private getLang;
    }
}
declare namespace Ve.Lang.Generate {
    type apiRender = string;
    type apiPackage = Record<string, Record<string, apiRender>>;
}
declare namespace Ve.Lang.Razor {
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
    var RazorSyntax: LangSyntax;
    class RazorToken extends Token {
        readonly flag: string;
    }
    class RazorTokenizer extends Tokenizer {
        init(): void;
        createToken(): RazorToken;
    }
}
declare namespace Ve.Lang.Razor {
    class RazorWriter {
        codes: string[];
        writeVariable: string;
        constructor(options?: {
            writeVariable: string;
        });
        private writeCode;
        private writeValue;
        private writeString;
        private writeScope;
        scope: 'code' | 'text';
        write(token: Token): void;
        private read;
        outputCode(): string;
    }
}
declare namespace Ve.Lang.Razor {
    class RazorTemplate {
        static escape(code: string): string;
        static compile(code: string, obj: Record<string, any>, ViewBag?: Record<string, any>): any;
        /***
         * 提取对象的所有property name,包括继承的
         */
        private static getObjectKeyValues;
    }
}
declare namespace Ve.Lang.Generate {
    import List = Ve.Lang.Util.List;
    /***
     * @description 标记申明的位置，方便注入
     *
     */
    enum DeclarePosition {
        /**
         * @param  当前的申明就是自身
         *
         */
        self = 0,
        /***
         * @param  当前节点所在的语句的前面
         */
        prev = 1,
        /***
         * @param  程序的头部
         */
        head = 2,
        /**
         *@param  在方法内的前面
         */
        method = 3,
        /**
         * @param  在大括的下面
         */
        brace = 4
    }
    /**
     * 节点渲染器
     */
    class NodeRender {
        constructor(paper: GeneratePaper, node: Node);
        load(data: any): void;
        generate(): any;
        paper: GeneratePaper;
        node: Node;
        childRenders: Util.List<NodeRender>;
        append(node: Node): void;
        find(predict: ((render: NodeRender) => boolean) | Node): any;
        parentRender: NodeRender;
        template: string;
        /***
         * @description 当前节点申明的变量名称
         *
         */
        declares: {
            position: DeclarePosition;
            name: string;
            code: string;
        }[];
        /***
         * @description 通常这是编译多个语句的块，每个语句块有可能会依赖于前一个语句块
         *
         */
        childs(name?: string | Node | List<Node>): any;
        /***
         * @description 当前的名称是定义的
         *
         */
        def(name?: string): any;
        /**
         * @description 当前的名称是引用的（被调用的）
         * @param name
         *
         */
        ref(name?: string): any;
        next(): string;
        prev(): void;
        readonly $this: string;
        readonly $value: string;
        express(name: string | Node, at?: number): any;
        /**
         * @description 语句编译
         * @enum name {string} node节点的属性名名
         * @enum name {Node}  node节点子节点
         * @param at? 如果节点是集合，那么需要指定编译的
         *
         */
        statement(name: string | Node, at?: number): any;
    }
}
declare namespace Ve.Lang.Generate {
    import List = Util.List;
    class GeneratePaper extends Ve.Lang.Util.BaseEvent {
        thisObjectName: string;
        parameterMapNames: Record<string, any>;
        constructor(generateLang: GenerateLang, options?: {
            thisObjectName?: string;
            parameterMapNames?: Record<string, any>;
        });
        generateLang: GenerateLang;
        render(node: Node): NodeRender;
        private renders;
        generate(nodes: Node | List<Node>): string;
    }
}
declare namespace Ve.Lang.Generate.mongodb {
    /***
     *
     *
     *
     */
    var genArray: Record<string, Record<string, any>>;
}
declare namespace Ve.Lang.Generate.mongodb {
    var genCommon: Record<string, Record<string, any>>;
}
declare namespace Ve.Lang.Generate.mongodb {
    /***
     *
     * 计算一年中的第几周 参考https://www.jianshu.com/p/aa6dd016db26
     *
     */
    var genDate: apiPackage;
}
declare namespace Ve.Lang.Generate.mongodb {
    /***
     *
     *
     *
     */
    var genMath: apiPackage;
}
declare namespace Ve.Lang.Generate.mongodb {
    var genNumber: apiPackage;
}
declare namespace Ve.Lang.Generate.mongodb {
    var genString: Record<string, Record<string, any>>;
}
declare namespace Ve.Lang.Generate {
    /**
     *  https://docs.mongodb.com/manual/reference/command/nav-geospatial/
     */
    class GenerateMongodb extends Ve.Lang.Generate.GenerateLang {
        at(node: AtExpress, render: NodeRender): string;
        nameCall(node: NameCall): string;
        constant(node: Constant): string;
        stringTemplate(node: StringTemplateExpress, render: NodeRender): string;
        ternary(node: TernaryExpress, render: NodeRender): string;
        unary(node: UnaryExpress, render: NodeRender): "{$add:[@express(node.express),1]}" | "{$add:[@express(node.express),-1]}" | "{$not:@express(node.express)}";
        bracket(node: BracketExpress, render: NodeRender): string;
        binary(node: BinaryExpress, render: NodeRender): any;
        methodCall(node: MethodCallExpress, render: NodeRender): string;
        object(obj: ObjectExpress, render: NodeRender): {
            template: string;
            content(): string;
        };
    }
    var generateMongodb: GenerateMongodb;
}
declare namespace Ve.Lang {
    var VeLibraryCodes: Util.List<{
        name: string;
        code: string;
    }>;
}
declare namespace Ve.Lang {
    function importCoreLibrary(): void;
}
declare namespace Ve.Lang.Outer {
    function pickVeTypeFromCode(code: string): VeType;
    /***
     * 通过code去解析参数
     * example:
     * "a:int=2,b=3,c:string='ssss'"=>{ key: string, type: VeType }
     * 参数里面的值基本上都是常量
     *
     */
    function pickArgsFromCode(code: string): {
        key: string;
        type: VeType;
        rest?: boolean;
        optional?: boolean;
        value?: any;
    }[];
    function pickVePropFromCode(code: string): VeProp;
    function inferExpressType(expressCode: string, args?: VeProp[], thisObjectArgs?: VeProp[]): VeType;
    function inferTypeFunType(funbodyCode: string, args?: VeProp[], thisObjectArgs?: VeProp[]): VeType;
    /**
     * 判断当前表达式是否为常量表达式
     * @param express
     */
    function inferExpressIsConstant(express: string): boolean;
    /**
     * 判断当前表达式是否引用申明的参数，因为有些表达式可以写成"1+1"这种表达式并不是常量表达式
     * @param expressCode
     * @param args
     * @param thisObjectArgs
     *
     */
    function inferExpressIsReferenceArgs(expressCode: string, args: VeProp[], thisObjectArgs?: VeProp[]): boolean;
}
declare namespace Ve.Lang.Outer {
    type TranslateLang = 'nodejs' | 'js' | 'java' | 'csharp' | 'php' | 'python' | 'mysql' | 'mongodb' | 'mssql';
    function TranslateCode(code: string, lang: TranslateLang, error?: (...args: any[]) => void): string;
    /**
     * 翻译带参数的表达式
     * @param code  表达式
     * @param lang  语言
     * @param args  参数
     * @param thisObjectArgs 上下文参数
     * @param options 配制参数
     * @param options.thisObjectName 上下文对象名称，类似于thisObjectName=x={name:string},生成x.name
     * @param options.parameterMapNames  参数投影映射，会将当前构造的函数参数，替换成其它参数
     * @param error 错误回调
     *
     */
    function TranslateExpressCode(code: string, lang: TranslateLang, args?: Outer.VeProp[], thisObjectArgs?: Outer.VeProp[], options?: {
        thisObjectName?: string;
        parameterMapNames?: Record<string, any>;
    }, error?: (...args: any[]) => void): string;
}
declare namespace Ve.Lang.Outer {
    /***对外传输的数据或类型 */
    type VeProp = {
        text: string;
        type: VeType;
        value?: any;
        props?: VeProp[];
    };
    type VeType = {
        /***object type */
        props?: {
            key: string;
            viewText?: string;
            type: VeType;
        }[];
        /***fun type */
        args?: {
            key: string;
            viewText?: string;
            type: VeType;
            value?: any;
        }[];
        returnType?: VeType;
        /**generic type* */
        unionType?: VeType;
        generics?: VeType[];
    } | /**unit type */ string;
    function VePropToParameter(args: VeProp[]): string;
    function VePropToCode(prop: VeProp): string;
    function VePropToVeType(prop: VeProp): VeType;
    function VeTypeToCode(veType: VeType): any;
    function TypeExpressToVeType(typeExpress: TypeExpress): VeType;
    function dataToVeProp(data: Express): VeProp;
    function jsObjectToVeProp(jsObject: Record<string, any>): VeProp;
}
/***
 *{"标题":"","分类":"boy","是否推送至公众号":false,"图片":"/资源/图片.png","文章内容":"","ID":""}
 *
 */ 
