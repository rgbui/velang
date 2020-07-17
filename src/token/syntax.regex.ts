namespace Ve.Lang {


    /**
     * @link https://microsoft.github.io/monaco-editor/monarch.html
     */
    export type LangSyntaxRoot = {
        root: {
            include?: string,
            name?: string,
            match?: string | RegExp | (string[]),
            next?: string,
            nextTurn?: string,
            push?: boolean,
            pop?: boolean,
            action?: (contextToken: Token) => Record<string, any> | void
        }[]
    }
    export type LangSyntax = Record<string, string | (string[]) | RegExp | LangSyntaxRoot['root']> | LangSyntaxRoot;
    export function getLangSyntaxRegex(syntax: LangSyntax, r: RegExp | string) {
        if (r instanceof RegExp) {
            var rs = r.toString();
            var rm = rs.match(/(@[a-zA-Z\d\_]+)/);
            if (rm && rm[0]) {
                rs = rs.substring(1, rs.length - 1);
                rs = rs.replace(/(@[a-zA-Z\d\_]+)/g, ($, $1) => {
                    if (syntax[$1.substring(1)] instanceof RegExp) {
                        var gs = syntax[$1.substring(1)].toString();
                        gs = gs.substring(1, gs.length - 1);
                        return `(${gs})`;
                    }
                    else return $1;
                });
                return new RegExp(rs);
            }
        }
        else if (typeof r == 'string' && r.startsWith('@')) {
            if (typeof syntax[r.substring(1)] != 'undefined') {
                return syntax[r.substring(1)];
            }
        }
        return r;
    }
    export function convertLangSyntax(syntax: LangSyntax) {
        for (var key in syntax) {
            if (syntax[key] instanceof RegExp) syntax[key] = getLangSyntaxRegex(syntax, syntax[key]);
        }
        Object.keys(syntax).forEach(key => {
            if (Array.isArray(syntax[key])) {
                syntax[key].forEach(z => {
                    if (Array.isArray(z.match)) {
                        for (var i = 0; i < z.match.length; i++) {
                            if (z.match[i])
                                z.match[i] = getLangSyntaxRegex(syntax, z.match[i]);
                        }
                    }
                    else if (z.match) z.match = getLangSyntaxRegex(syntax, z.match);
                })
            }
        })
    }
}