namespace Ve.Lang {
    import List = Util.List;
    export class StatementParser$ExpressCommon {
        funExpress(this: StatementParser) {
            var index = this.index;
            if (this.match(/fun@blank*\(/)) {
                var bracketTokens = this.eat(/fun@blank*\(\)/);
                var returnType: TypeExpress;
                if (this.match(/\:/)) {
                    this.eat(/\:/);
                    returnType = this.$type();
                }
                this.eatBlank();
                if (this.match(/\{\}/)) {
                    var content = this.TM.statement(this.eat(/\{\}/).first().childs);
                    var af = new AnonymousFunExpress();
                    af.ref(bracketTokens.find(x => x.flag == 'fun'));
                    af.set('parameters', this.TM.parameters(bracketTokens.find(x => x.flag == '(').childs));
                    af.set('content', content);
                    if (returnType) af.returnType = returnType;
                    return af;
                }
            }
            this.back(this.index - index);
        }
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
        $type(this: StatementParser) {
            var index = this.index;
            this.eatBlank();
            var tokens: List<Token> = new List();
            if (this.match(/\(\)@blank*->/)) {
                var tokens = this.eat(/\(\)@blank*\-\>/);
                var tp = new TypeExpress();
                tp.args = tokens.find(x => x.flag == '(').childs.split(x => x.flag == ',').toArray(z => {
                    if (z.exists(g => g.flag == ':')) {
                        return {
                            key: z.range(0, z.findIndex(x => x.flag == ':') - 1).toArray(x => x.value).join("").trim(),
                            type: this.TM.typeExpress(z.range(z.findIndex(x => x.flag == ':') + 1))
                        }
                    }
                    return {
                        key: z.toArray(x => x.value).join("").trim(),
                        type: TypeExpress.create({ name: 'any' })
                    }
                });
                tp.returnType = this.$type();
                return tp;
            }
            else if (this.match(/(word|type|\(|\)|@blank|\-|\>|\{|\})+(\[\]@blank*)+/)) {
                var tokens = this.eat(/(word|type|\(|\)|@blank|\-|\>|\{|\})+(\[\]@blank*)+/);
                return this.TM.typeExpress(tokens);
            }
            else if (this.match(/\{\}/)) {
                var tokens = this.eat(/\{\}/);
                return this.TM.typeExpress(tokens);
            }
            else if (this.match(/@namespaceType@blank*\<\>/)) {
                var tokens = this.eat(/@namespaceType@blank*\<\>/);
                return this.TM.typeExpress(tokens);
            }
            else if (this.match(/@namespaceType/)) {
                var tokens = this.eat(/@namespaceType/);
                return this.TM.typeExpress(tokens);
            }
            else {
                console.log('not found type...');
            }
            this.back(this.index - index);
        }
        /****
         * 
         * 捕获箭头方法
         * 
         * ()(:?)->{ }
         * 
        */
        arrowFun(this: StatementParser) {
            this.eat(/@blank+/);
            var index = this.index;
            if (this.match(/\(\)@blank*/)) {
                var bracketTokens = this.eat(/\(\)@blank*/);
                var returnType: TypeExpress;
                if (this.match(/\:/)) {
                    this.eat(/\:/);
                    returnType = this.$type();
                }
                this.eat(/@blank+/);
                if (this.match(/\-\>/)) {
                    var ts = this.eat(/\-\>/);
                    this.eat(/@blank+/);
                    var content = this.eatBlockOrStatement();
                    var af = new AnonymousFunExpress();
                    af.ref(ts);
                    af.set('parameters', this.TM.parameters(bracketTokens.find(x => x.flag == '(').childs));
                    af.set('content', content);
                    if (returnType) af.returnType = returnType;
                    return af;
                }
            }
            this.back(this.index - index);
        }
    }
}