namespace Ve.Lang {
    export enum ExceptionCode {
        /***未实现类、方法泛型 */
        notImplementGenerics,
        conditionIsNotBool,
        notDeclareVariable,
        arrayIndexNotNumber,
        /***语法错误 */
        syntaxError,
        declareTypeNotEqual,
        /***找不到相应的操作符 */
        notFoundOperator,
        /****操作符运算类型不一致 */
        operatorTypeNotEqual,
        /****查找不到方法 */
        notFoundMethod,
        notFoundClassProperty,
        /****方法形参不适配 */
        methodArgementNotCompatibility,
        /***object对象无法找到key */
        objectNotFoundKey,
        /****找到不类型 */
        notFoundType,
    }
    export enum ExceptionLevel {
        error = 1,
        warn = 2,
        info = 0
    }
    export class Exception extends Error {
        node: Node | Token;
        code: ExceptionCode;
        template: string;
        object: Record<string, any> = {};
        level: ExceptionLevel;
        static create(data: [ExceptionCode, Node | Token, string, Record<string, any>?], level: ExceptionLevel = ExceptionLevel.error) {
            var exp = new Exception();
            exp.level = level;
            exp.code = data[0];
            exp.node = data[1];
            exp.template = data[2];
            exp.object = data[3] || {};
            exp.message = this.toString();
            exp.name = ExceptionCode[exp.code];
            console.log(arguments);
        }
        toString() {
            var token: Token = this.node instanceof Node ? this.node.tokens.first() : this.node;
            var row = token.row;
            var col = token.col;
            var level = this.level == ExceptionLevel.error ? "错误" : '警告';
            return Ve.Lang.Razor.RazorTemplate.compile(this.template, Object.assign({ row, col, level }, this.object));
        }
    }
}