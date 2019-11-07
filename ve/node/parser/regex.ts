namespace Ve.Lang {
    export class ParserRegex {
        /**
         * 数据类型
         * def a:string
         * def a:{a:number,b:string}
         * def a:string[]
         * def a:{a:number,b:string}[]
         * def a:string[][]
         * def a:(a:number,b:string)=>void
         * def a:(a:number,b:string)=>{a:strig,b:number}
         */

        static attr = `(\\\[[^\\\]]*\\\])*`;
        static access = `(public|private)?`;
        static genic = `(<>)?`;
        static method_modifys = `(static)?`;
        static class_property_modifys = `(const|static|readonly)*`;
        static variable_value = '(=[^,;]+)?';
        static type_namespace = `word(\\\.word)*`;
        public static datatype = `(${ParserRegex.type_namespace}|${ParserRegex.type_namespace}\\\[\\\]|\\\{\\\}|\\\{\\\}\\\[\\\]|\\\(\\\)=>(${ParserRegex.type_namespace}|\\\{\\\}|${ParserRegex.type_namespace}\\\[\\\]|\\\{\\\}\\\[\\\]))`;
        public static package = `package${ParserRegex.type_namespace}\\\{\\\}`;
        public static use = `use${ParserRegex.type_namespace}((=)word)?;?`;
        public static export = `(export)?`;
        public static enum = `${ParserRegex.export}enumword\\\{\\\}`;
        public static classOrInterface = `${ParserRegex.attr}${ParserRegex.export}(class|interface)word${ParserRegex.genic}(extends${ParserRegex.type_namespace})?\\\{\\\}`;

        public static classPropertyEnd = `((?!(public|private|const|static|readonly|word|new|\\\[|<)).)*;?`;

        public static classMethod = `${ParserRegex.attr}${ParserRegex.access}${ParserRegex.method_modifys}(word|new)${ParserRegex.genic}\\\(\\\)(:${ParserRegex.datatype})?\\\{\\\}`;
        public static interfaceMethod = `${ParserRegex.attr}${ParserRegex.access}${ParserRegex.method_modifys}(word|new)${ParserRegex.genic}\\\(\\\)(:${ParserRegex.datatype})?${ParserRegex.classPropertyEnd}`;
        public static classProperty = `${ParserRegex.attr}${ParserRegex.access}${ParserRegex.class_property_modifys}word(:${ParserRegex.datatype})?${ParserRegex.variable_value}${ParserRegex.classPropertyEnd}`;
        public static classField = `${ParserRegex.attr}${ParserRegex.access}${ParserRegex.method_modifys}word(:${ParserRegex.datatype})?\\\{\\\}${ParserRegex.classPropertyEnd}`;

        public static fun = `${ParserRegex.attr}${ParserRegex.access}funword${ParserRegex.genic}\\\(\\\)(:${ParserRegex.datatype})?\\\{\\\}`
        public static variable = `^(def|const)(word(:${ParserRegex.datatype})?${ParserRegex.variable_value})(,word(:${ParserRegex.datatype})?${ParserRegex.variable_value})*;?`
        public static statement = '((?!(try|for|while|if|else|do|switch|throw|case|fun|return|;|default|break|def|const|continue)).)*;?';
        public static block_or_statement = `(\\\{\\\}|${ParserRegex.statement})`;
        public static if = `^if\\\(\\\)${ParserRegex.block_or_statement}`;
        public static else_if = `elseif\\\(\\\)${ParserRegex.block_or_statement}`;
        public static else = `else${ParserRegex.block_or_statement}`;
        public static while = `while\\\(\\\)${ParserRegex.block_or_statement}`
        public static do_while = `do${ParserRegex.block_or_statement}while\\\(\\\)`;
        public static for = `for\\\(\\\)${ParserRegex.block_or_statement}`;
        public static try = `try\\\{\\\}catch\\\(\\\)\\\{\\\}(finally\\\{\\\})?`;
        public static switch = `switch\\\(\\\)\\\{\\\}`;
        public static case = `(case[^:]+|default):((?!(case|default)).)*`;
        public static return = `return${ParserRegex.block_or_statement}`;
        public static throw = `throw${ParserRegex.block_or_statement}`;
        public static break = 'break';
        public static continue = 'continue';
        public static fun_arrow_type = `\\\(\\\)=>${ParserRegex.datatype}`;
        public static fun_arrow_statement = `(\\\(\\\)|${ParserRegex.type_namespace})(:${ParserRegex.datatype})?=>${ParserRegex.block_or_statement}`;
        public static new_instance = `new${ParserRegex.type_namespace}${ParserRegex.genic}\\\(\\\)`;
        public static emptyStatement = `[;]+`;
    }
}