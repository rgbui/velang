namespace Ve.Lang.Outer {

    export type TranslateLang = 'nodejs' | 'js' | 'java' | 'csharp' | 'php' | 'python' | 'mysql' | 'mongodb' | 'mssql';
    /****翻译生成其它语言的代码*/
    export function TranslateLangCode(
        code: string,
        lang: TranslateLang) {
        let lan = parseInt(Ve.Lang.TranstateLanguage[lang].toString());
        var tf = new TranstateFactory(lan);
        return tf.compile(code);
    }
    /****翻译带参数的表达式 */
    export function TranslateExpressLangCode(code: string, args: VeProp[],
        lang: TranslateLang,
        options?: {
            argFlag: string
        }) {
        if (typeof options == 'undefined') options = {} as any;
        if (typeof options.argFlag == 'undefined') options.argFlag = '$$$';
        lang = lang.toLowerCase() as any;
        /***需要对表达式中出现的字段或变量做标记 */
        let mode = new Ve.Lang.VeMode({
            isIgnoreLineBreaks: false,
            isIgnoreWhiteSpace: false
        })
        let token = new Tokenizer(code, mode).onParse();
        var newCode = token.getWrapper(function (token, childTemplate) {
            if (typeof childTemplate == 'undefined') childTemplate = '';
            let value = '';
            switch (token.type) {
                case TokenType.unit:
                    if (typeof token.value == 'string')
                        value = `${token.value || ''}/${token.unit}`;
                    break;
                case TokenType.string:
                    value = typeof token.wholeValue != 'undefined' ? token.wholeValue : token.value;
                    break;
                case TokenType.word:
                    if (args.filter(x => x.text == token.value).length > 0)
                        value = `${options.argFlag}${token.value}`;
                    else
                        value = token.value;
                    break;
                case TokenType.newLine:
                    value = '\n'
                    break;
                case TokenType.closeBlock:
                    if (token.name == VeName.RBRACE) {
                        value = '}'
                    }
                    else if (token.name == VeName.RBRACK) {
                        value = ']'
                    }
                    else if (token.name == VeName.RPAREN) {
                        return ')'
                    }
                    break;
                case TokenType.block:
                    if (token.name == VeName.LBRACE) {
                        value = '{' + childTemplate;
                    }
                    else if (token.name == VeName.LBRACK) {
                        value = '[' + childTemplate;
                    }
                    else if (token.name == VeName.LPAREN) {
                        value = '(' + childTemplate;
                    }
                    else if (token.name == VeName.STRING_LBRACE) {
                        value = '@{' + childTemplate;
                    }
                    break;
                default:
                    value = (token.value || '') + childTemplate;
                    break;
            }
            return value;
        })
        let ma = (FLAG, props) => {
            return props.map(x => {
                return {
                    text: FLAG + x.text,
                    type: x.type,
                    value: x.value,
                    props: Array.isArray(x.props) ? ma(FLAG, x.props) : undefined
                }
            })
        }
        let newArgs = ma(options.argFlag, args);
        let lan = parseInt(Ve.Lang.TranstateLanguage[lang].toString());
        var tf = new TranstateFactory(lan);
        return tf.compileExpress(newCode, newArgs);
    }
    /****翻译数据库查询语句的表达式 */
    export function TranslateSQLExpressLangCode(code: string,
        args: VeProp[],
        fields: VeProp[],
        lang: TranslateLang,
        options?: {
            argFlag: string,
            fieldFlag: string
        }) {
        if (typeof options == 'undefined') options = {} as any;
        if (typeof options.argFlag == 'undefined') options.argFlag = '$$$';
        if (typeof options.fieldFlag == 'undefined') options.fieldFlag = '$$';
        lang = lang.toLowerCase() as any;
        /***需要对表达式中出现的字段或变量做标记 */
        let mode = new Ve.Lang.VeMode({
            isIgnoreLineBreaks: false,
            isIgnoreWhiteSpace: false
        })
        let token = new Tokenizer(code, mode).onParse();
        var newCode = token.getWrapper(function (token, childTemplate) {
            if (typeof childTemplate == 'undefined') childTemplate = '';
            let value = '';
            switch (token.type) {
                case TokenType.unit:
                    if (typeof token.value == 'string')
                        value = `${token.value || ''}/${token.unit}`;
                    break;
                case TokenType.string:
                    value = typeof token.wholeValue != 'undefined' ? token.wholeValue : token.value;
                    break;
                case TokenType.word:
                    if (fields.filter(x => x.text == token.value).length > 0) value = `${options.fieldFlag}${token.value}`;
                    else if (args.filter(x => x.text == token.value).length > 0) value = `${options.argFlag}${token.value}`;
                    else value = token.value;
                    break;
                case TokenType.newLine:
                    value = '\n'
                    break;
                case TokenType.closeBlock:
                    if (token.name == VeName.RBRACE) {
                        value = '}'
                    }
                    else if (token.name == VeName.RBRACK) {
                        value = ']'
                    }
                    else if (token.name == VeName.RPAREN) {
                        return ')'
                    }
                    break;
                case TokenType.block:
                    if (token.name == VeName.LBRACE) {
                        value = '{' + childTemplate;
                    }
                    else if (token.name == VeName.LBRACK) {
                        value = '[' + childTemplate;
                    }
                    else if (token.name == VeName.LPAREN) {
                        value = '(' + childTemplate;
                    }
                    else if (token.name == VeName.STRING_LBRACE) {
                        value = '@{' + childTemplate;
                    }
                    break;
                default:
                    value = (token.value || '') + childTemplate;
                    break;
            }
            return value;
        })
        let ma = (FLAG, props) => {
            return props.map(x => {
                return {
                    text: FLAG + x.text,
                    type: x.type,
                    value: x.value,
                    props: Array.isArray(x.props) ? ma(FLAG, x.props) : undefined
                }
            })
        }
        fields = ma(options.fieldFlag, fields)
        args = ma(options.argFlag, args);
        fields.forEach(f => args.push(f));
        let lan = parseInt(Ve.Lang.TranstateLanguage[lang].toString());
        var tf = new TranstateFactory(lan);
        return tf.compileExpress(newCode, args);
    }
}
