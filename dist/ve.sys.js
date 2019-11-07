var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class BaseEvent {
            constructor() {
                this.__$events = new Lang.VeArray();
            }
            on(name, cb, isReplace) {
                if (typeof name == 'object') {
                    for (var n in name)
                        this.on(n, name[n]);
                    return;
                }
                else {
                    var ev = this.__$events.find(x => x.name == name);
                    if (isReplace == true) {
                        Lang.applyExtend(ev, { name, cb });
                    }
                    else {
                        this.__$events.push({ name, cb });
                    }
                }
                return this;
            }
            once(name, cb, isReplace) {
                if (typeof name == 'object') {
                    for (var n in name)
                        this.once(n, name[n]);
                    return;
                }
                else {
                    var ev = this.__$events.find(x => x.name == name);
                    if (isReplace == true) {
                        Lang.applyExtend(ev, { name, cb, once: true });
                    }
                    else {
                        this.__$events.push({ name, cb, once: true });
                    }
                }
                return this;
            }
            off(name) {
                if (typeof name == 'string') {
                    this.__$events.removeAll(x => x.name == name);
                }
                else {
                    this.__$events.removeAll(x => x.cb == name);
                }
                return this;
            }
            emit(name, ...args) {
                var ev = this.__$events.find(x => x.name == name);
                if (ev) {
                    var result = ev.cb.apply(this, args);
                    if (ev.once == true)
                        this.__$events.remove(ev);
                    return result;
                }
            }
        }
        Lang.BaseEvent = BaseEvent;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class AstParser extends Lang.BaseEvent {
            compile(code) {
                var mode = new Lang.VeMode({
                    isIgnoreLineBreaks: false
                });
                var tokenizer = new Lang.Tokenizer(code, mode);
                var token = tokenizer.onParse();
                token.each(x => {
                    x.childs.removeAll(x => x.type == Lang.TokenType.comment || x.type == Lang.TokenType.newLine);
                });
                var programStatement = new Lang.ProgramStatement();
                programStatement.append(AstParser.baseLib);
                var ps = new Lang.TokenStatementParser(token, programStatement);
                var st = ps.parse();
                programStatement.append(st);
                var IF = new Lang.InferFactory(st);
                IF.on('error', (...args) => {
                    this.emit('error', ...args);
                });
                IF.start();
                return st;
            }
            compileExpress(express, args) {
                if (!Array.isArray(args))
                    args = [];
                var code = `package Ve.Express.Test{
                use Ve;
                export class Test{
                    static Main(${Lang.Outer.VePropToParameter(args)}){
                        return ${express}
                    }
                }
            }`;
                var mode = new Lang.VeMode({
                    isIgnoreLineBreaks: false
                });
                var tokenizer = new Lang.Tokenizer(code, mode);
                var token = tokenizer.onParse();
                token.each(x => {
                    x.childs.removeAll(x => x.type == Lang.TokenType.comment || x.type == Lang.TokenType.newLine);
                });
                var programStatement = new Lang.ProgramStatement();
                programStatement.append(AstParser.baseLib);
                var ps = new Lang.TokenStatementParser(token.childs, programStatement);
                var st = ps.parse();
                programStatement.append(st);
                var main = st.first().find(x => x instanceof Lang.ClassProperty && x.name == 'Main');
                try {
                    var IF = new Lang.InferFactory(main);
                    IF.on('error', (...args) => {
                        this.emit('error', ...args);
                    });
                    IF.start();
                }
                catch (e) {
                    throw e;
                }
                var rs = main.body.first();
                return rs.expression;
            }
            static get baseLib() {
                if (typeof this.$baseLib == typeof undefined) {
                    this.$baseLib = new Lang.VeArray();
                    Lang.VeBaseCode.each(c => {
                        var mode = new Lang.VeMode({
                            isIgnoreLineBreaks: false
                        });
                        var tokenizer = new Lang.Tokenizer(c.code, mode);
                        var token = tokenizer.onParse();
                        var ps = new Lang.TokenStatementParser(token);
                        this.$baseLib.append(ps.parse());
                    });
                }
                return this.$baseLib;
            }
        }
        Lang.AstParser = AstParser;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class AstVisitor extends Lang.BaseEvent {
            constructor(express, accepter) {
                super();
                if (express instanceof Lang.Statement)
                    this.express = new Lang.VeArray(express);
                else
                    this.express = express;
                this.accepter = accepter;
                if (typeof this.onInit == 'function')
                    this.onInit();
            }
            start() {
                return this.accept(this.express.eq(0));
            }
            accept(express) {
                if (!(express instanceof Lang.Statement)) {
                    console.warn('only accpent statement:', express);
                    return;
                }
                var name = Lang.StatementType[express.type];
                if (typeof this.accepter[name] == 'function') {
                    var result = this.accepter[name].apply(this, [express]);
                    if (typeof result != typeof undefined) {
                        result.visitor = this;
                    }
                    this.emit('accept', express);
                    return result;
                }
                if (typeof this.accepter['$' + name] == 'function') {
                    var result = this.accepter['$' + name].apply(this, [express]);
                    if (typeof result != typeof undefined) {
                        result.visitor = this;
                    }
                    this.emit('accept', express);
                    return result;
                }
                else {
                    console.warn(`not found ${name}`);
                }
            }
            next(express) {
                var next = express.next;
                if (next) {
                    return this.accept(next);
                }
            }
            error(error) {
                this.emit('error', error);
            }
        }
        Lang.AstVisitor = AstVisitor;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let StatementType;
        (function (StatementType) {
            StatementType[StatementType["program"] = 0] = "program";
            StatementType[StatementType["package"] = 1] = "package";
            StatementType[StatementType["use"] = 2] = "use";
            StatementType[StatementType["enum"] = 3] = "enum";
            StatementType[StatementType["class"] = 4] = "class";
            StatementType[StatementType["interface"] = 5] = "interface";
            StatementType[StatementType["declareVariable"] = 6] = "declareVariable";
            StatementType[StatementType["method"] = 7] = "method";
            StatementType[StatementType["classProperty"] = 8] = "classProperty";
            StatementType[StatementType["field"] = 9] = "field";
            StatementType[StatementType["fun"] = 10] = "fun";
            StatementType[StatementType["for"] = 11] = "for";
            StatementType[StatementType["if"] = 12] = "if";
            StatementType[StatementType["doWhile"] = 13] = "doWhile";
            StatementType[StatementType["while"] = 14] = "while";
            StatementType[StatementType["switch"] = 15] = "switch";
            StatementType[StatementType["continue"] = 16] = "continue";
            StatementType[StatementType["break"] = 17] = "break";
            StatementType[StatementType["try"] = 18] = "try";
            StatementType[StatementType["throw"] = 19] = "throw";
            StatementType[StatementType["return"] = 20] = "return";
            StatementType[StatementType["context"] = 21] = "context";
            StatementType[StatementType["binary"] = 22] = "binary";
            StatementType[StatementType["unary"] = 23] = "unary";
            StatementType[StatementType["ternary"] = 24] = "ternary";
            StatementType[StatementType["new"] = 25] = "new";
            StatementType[StatementType["constant"] = 26] = "constant";
            StatementType[StatementType["variable"] = 27] = "variable";
            StatementType[StatementType["Object"] = 28] = "Object";
            StatementType[StatementType["objectReferenceProperty"] = 29] = "objectReferenceProperty";
            StatementType[StatementType["arrayIndex"] = 30] = "arrayIndex";
            StatementType[StatementType["array"] = 31] = "array";
            StatementType[StatementType["classInstance"] = 32] = "classInstance";
            StatementType[StatementType["callMethod"] = 33] = "callMethod";
            StatementType[StatementType["arrowMethod"] = 34] = "arrowMethod";
            StatementType[StatementType["parameters"] = 35] = "parameters";
            StatementType[StatementType["parameter"] = 36] = "parameter";
            StatementType[StatementType["type"] = 37] = "type";
        })(StatementType = Lang.StatementType || (Lang.StatementType = {}));
        class Statement {
            constructor(parent) {
                this.token = null;
                this.$childs = new Lang.VeArray();
                this.infer = {};
                this.runResult = new Lang.RunResult();
                if (parent)
                    this.parent = parent;
            }
            append(ts) {
                this.$childs.append(ts);
                if (ts instanceof Statement)
                    ts.parent = this;
                else if (ts instanceof Lang.VeArray) {
                    ts.each(t => {
                        t.parent = this;
                    });
                }
            }
            remove(ts) {
                if (ts instanceof Lang.VeArray) {
                    ts.each(t => { this.childs.remove(t); });
                }
                else
                    this.childs.remove(ts);
            }
            get childs() {
                return this.$childs;
            }
            set childs(val) {
                this.$childs = val;
                this.$childs.each(c => c.parent = this);
            }
            find(predict, includeSelf) {
                if (includeSelf == true && predict(this) == true)
                    return this;
                var c = this.childs.find(predict);
                if (!c) {
                    this.childs.each(r => {
                        var v = r.find(predict);
                        if (v) {
                            c = v;
                            return false;
                        }
                    });
                    return c;
                }
                return c;
            }
            findAll(predict, includeSelf) {
                var list = new Lang.VeArray();
                if (includeSelf == true && predict(this) == true)
                    list.push(this);
                this.childs.each(c => {
                    if (predict(c) == true) {
                        list.push(c);
                    }
                    var rs = c.findAll(predict);
                    rs.each(r => list.push(r));
                });
                return list;
            }
            each(predict, includeSelf) {
                includeSelf ? predict(this) : undefined;
                this.childs.each(c => {
                    predict(c);
                    c.each(predict);
                });
            }
            closest(predict) {
                var r = this;
                while (true) {
                    if (predict(r) == true)
                        return r;
                    else {
                        r = r.parent;
                        if (!r)
                            return;
                    }
                }
            }
            closestPrev(predict) {
                var r = this;
                while (true) {
                    if (r.parent) {
                        var index = r.parent.childs.findIndex(r);
                        if (index > -1) {
                            var search = r.parent.childs.find((x, i) => i <= index && predict(x) == true);
                            if (search)
                                return search;
                        }
                        r = r.parent;
                    }
                    else {
                        break;
                    }
                }
            }
            parents(predict) {
                var list = new Lang.VeArray();
                var r = this.parent;
                while (true) {
                    if (!r)
                        break;
                    if (predict(r))
                        list.push(r);
                    r = r.parent;
                }
                return list;
            }
            parentsUntil(predict) {
                var list = new Lang.VeArray();
                var r = this.parent;
                while (true) {
                    if (!r)
                        break;
                    list.push(r);
                    if (predict(r)) {
                        break;
                    }
                    r = r.parent;
                }
                return list;
            }
            get next() {
                if (this.parent) {
                    var index = this.parent.childs.findIndex(this);
                    if (index > -1) {
                        return this.parent.childs.eq(index + 1);
                    }
                }
            }
            get currentStatement() {
                if (this instanceof Statement && !(this instanceof Expression)) {
                    return this;
                }
                var s = this.closest(x => x instanceof Lang.TryStatement
                    || x instanceof Lang.IfStatement
                    || x instanceof Lang.WhileStatement
                    || x instanceof Lang.DoWhileStatement
                    || x instanceof Lang.ForStatement
                    || x instanceof Lang.SwitchStatement);
                if (!s) {
                    s = this.closest(x => x instanceof Expression && !(x.parent instanceof Expression));
                }
                return s;
            }
            get scope() {
                return this.closest(x => x instanceof Lang.ArrowMethodExpression || x instanceof Lang.PackageStatement || (x instanceof Lang.ClassProperty && x.kind == Lang.ClassPropertyKind.method) || x instanceof Lang.FunStatement);
            }
            get program() {
                return this.closest(x => x instanceof ProgramStatement);
            }
            static search(statement, name, predict) {
                var nrs;
                var dv = statement.closestPrev(x => {
                    if (typeof predict == 'function' && predict(x) == false)
                        return false;
                    return x instanceof Lang.DeclareVariable && x.name == name;
                });
                if (dv)
                    return new Lang.StatementReference(Lang.StatementReferenceKind.DeclareVariable, dv);
                var fn = statement.closestPrev(x => {
                    if (x instanceof Lang.FunStatement || (x instanceof Lang.ClassProperty && x.kind == Lang.ClassPropertyKind.method)) {
                        if (x.args.exists(z => z.key == name)) {
                            if (typeof predict == 'function' && predict(x) == false)
                                return false;
                            return true;
                        }
                    }
                });
                if (fn) {
                    nrs = new Lang.StatementReference(fn instanceof Lang.FunStatement ? Lang.StatementReferenceKind.FunArgs : Lang.StatementReferenceKind.currentClassMethodArgs, fn);
                    nrs.target = fn.args.find(x => x.key == name);
                    return nrs;
                }
                var pa = statement.closest(x => x instanceof Lang.PackageStatement);
                if (pa) {
                    var f = pa.search(name, predict);
                    if (f instanceof Lang.ClassOrIntrfaceStatement) {
                        nrs = new Lang.StatementReference(Lang.StatementReferenceKind.outerClass, f);
                        return nrs;
                    }
                    else if (f instanceof Lang.ClassProperty) {
                        nrs = new Lang.StatementReference(Lang.StatementReferenceKind.outerClassProperty, f);
                        return nrs;
                    }
                }
            }
        }
        Lang.Statement = Statement;
        class ProgramStatement extends Statement {
            constructor() {
                super(...arguments);
                this.type = StatementType.program;
            }
        }
        Lang.ProgramStatement = ProgramStatement;
        class Expression extends Statement {
        }
        Lang.Expression = Expression;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class CallMethodExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this._args = new Lang.VeArray();
                this.generics = new Lang.VeArray();
                this.type = Lang.StatementType.callMethod;
            }
            get name() {
                return this._name;
            }
            set name(value) {
                this._name = value;
                if (value instanceof Lang.Expression) {
                    this.append(value);
                }
            }
            get args() {
                return this._args;
            }
            set args(value) {
                this._args = value;
                this.append(value);
            }
            isCompatibility(cp) {
                for (var i = 0; i < cp.args.length; i++) {
                    if (cp.args.eq(i).isParameter == true) {
                        break;
                    }
                    else {
                        if (!Lang.TypeExpression.TypeIsAdaptive(this.args.eq(i).infer.expressType, cp.args.eq(i).parameterType, cp.class.generics, cp)) {
                            return false;
                        }
                    }
                }
                if (cp.args.exists(x => x.isParameter == true)) {
                    var arrayType = cp.args.last().parameterType.unionType;
                    for (let j = cp.args.length - 1; j < this.args.length; j++) {
                        if (!Lang.TypeExpression.TypeIsAdaptive(this.args.eq(j).infer.expressType, arrayType, cp.class.generics, cp)) {
                            return false;
                        }
                    }
                }
                return true;
            }
            getGenericMap() {
                if (typeof this.infer.referenceStatement != typeof undefined) {
                    switch (this.infer.referenceStatement.kind) {
                        case Lang.StatementReferenceKind.DeclareFun:
                        case Lang.StatementReferenceKind.FunArgs:
                            var method = this.infer.referenceStatement.referenceStatement;
                            var map = {};
                            method.generics.each((gen, i) => {
                                map[gen.key] = this.generics.eq(i).type;
                            });
                            return map;
                        case Lang.StatementReferenceKind.currentClassMethodArgs:
                        case Lang.StatementReferenceKind.outerClassProperty:
                            var map = {};
                            if (this.name instanceof Lang.PropertyExpression) {
                                var pe = this.name;
                                if (typeof this.name.infer.expressType != undefined) {
                                    if (this.name.infer.expressType.kind == Lang.TypeKind.union) {
                                        var rf = Lang.Statement.search(this, this.name.infer.expressType.unionType.name, x => {
                                            if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                                return false;
                                        });
                                        if (rf) {
                                            var typeClass = rf.referenceStatement;
                                            if (typeClass) {
                                                typeClass.generics.each((gen, i) => {
                                                    map[gen.key] = pe.infer.expressType.generics.eq(i);
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                            var cp = this.infer.referenceStatement.referenceStatement;
                            cp.generics.each((gen, i) => {
                                map[gen.key] = this.generics.eq(i).type;
                            });
                            return map;
                        case Lang.StatementReferenceKind.outerClass:
                            var cla = this.infer.referenceStatement.referenceStatement;
                            var map = {};
                            cla.generics.each((gen, i) => {
                                map[gen.key] = this.generics.eq(i).type;
                            });
                            return map;
                    }
                }
            }
        }
        Lang.CallMethodExpression = CallMethodExpression;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class BinaryExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.binary;
            }
            get left() {
                return this.$left;
            }
            set left(val) {
                this.$left = val;
                this.append(this.$left);
            }
            get right() {
                return this.$right;
            }
            set right(val) {
                this.$right = val;
                this.append(this.$right);
            }
        }
        Lang.BinaryExpression = BinaryExpression;
        let UnaryArrow;
        (function (UnaryArrow) {
            UnaryArrow[UnaryArrow["left"] = 0] = "left";
            UnaryArrow[UnaryArrow["right"] = 1] = "right";
        })(UnaryArrow = Lang.UnaryArrow || (Lang.UnaryArrow = {}));
        class UnaryExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.arrow = UnaryArrow.right;
                this.type = Lang.StatementType.unary;
            }
            get exp() {
                return this.$exp;
            }
            set exp(val) {
                this.$exp = val;
                this.append(this.$exp);
            }
        }
        Lang.UnaryExpression = UnaryExpression;
        class Constant extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.constant;
            }
        }
        Lang.Constant = Constant;
        class TernaryExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.ternary;
            }
            get where() {
                return this._where;
            }
            set where(value) {
                this._where = value;
                this.append(value);
            }
            get trueCondition() {
                return this._trueCondition;
            }
            set trueCondition(value) {
                this._trueCondition = value;
                this.append(value);
            }
            get falseCondition() {
                return this._falseCondition;
            }
            set falseCondition(value) {
                this._falseCondition = value;
                this.append(value);
            }
        }
        Lang.TernaryExpression = TernaryExpression;
        class ArrayIndexExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.arrayIndex;
            }
            get name() {
                return this._name;
            }
            set name(value) {
                this._name = value;
                if (value instanceof Lang.Expression)
                    this.append(value);
            }
            get indexExpress() {
                return this._indexExpress;
            }
            set indexExpress(value) {
                this._indexExpress = value;
            }
        }
        Lang.ArrayIndexExpression = ArrayIndexExpression;
        class Variable extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.variable;
            }
        }
        Lang.Variable = Variable;
        class ArrowMethodExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.args = new Lang.VeArray();
                this.type = Lang.StatementType.arrowMethod;
                this.body = new Lang.VeArray();
            }
        }
        Lang.ArrowMethodExpression = ArrowMethodExpression;
        class ArrayExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this._args = new Lang.VeArray();
                this.type = Lang.StatementType.array;
            }
            get args() {
                return this._args;
            }
            set args(value) {
                this._args = value;
                this.append(value);
            }
        }
        Lang.ArrayExpression = ArrayExpression;
        class ObjectExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this._propertys = new Lang.VeArray();
                this.type = Lang.StatementType.Object;
            }
            get propertys() {
                return this._propertys;
            }
            set propertys(value) {
                this._propertys = value;
                value.each(v => {
                    this.append(v.value);
                });
            }
        }
        Lang.ObjectExpression = ObjectExpression;
        class Parameter extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.parameter;
            }
        }
        Lang.Parameter = Parameter;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class PropertyExpression extends Lang.Expression {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.objectReferenceProperty;
                this._propertys = new Lang.VeArray();
            }
            get propertys() {
                return this._propertys;
            }
            set propertys(value) {
                this._propertys = value;
                value.each(v => {
                    if (v instanceof Lang.Statement)
                        this.append(v);
                });
            }
        }
        Lang.PropertyExpression = PropertyExpression;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let TypeKind;
        (function (TypeKind) {
            TypeKind[TypeKind["union"] = 0] = "union";
            TypeKind[TypeKind["fun"] = 1] = "fun";
            TypeKind[TypeKind["object"] = 2] = "object";
            TypeKind[TypeKind["unit"] = 3] = "unit";
            TypeKind[TypeKind["dic"] = 4] = "dic";
        })(TypeKind = Lang.TypeKind || (Lang.TypeKind = {}));
        class TypeExpression extends Lang.Expression {
            constructor(kind, options) {
                super();
                this.type = Lang.StatementType.type;
                this.states = new Lang.VeArray();
                this.args = new Lang.VeArray();
                this.props = new Lang.VeArray();
                this.options = new Lang.VeArray();
                this.generics = new Lang.VeArray();
                if (typeof kind != typeof undefined)
                    this.kind = kind;
                if (typeof options != typeof undefined) {
                    if (typeof options.name != typeof undefined)
                        this.name = options.name;
                }
            }
            injectGenericImplement(map) {
                if (!map)
                    map = {};
                switch (this.kind) {
                    case TypeKind.unit:
                        if (typeof map[this.name] == 'string') {
                            return map[this.name];
                        }
                        else {
                            return TypeExpression.createUnitType(this.name);
                        }
                    case TypeKind.object:
                        var typeObject = new TypeExpression(this.kind);
                        typeObject.props = this.props.map(x => {
                            return {
                                key: x.key,
                                type: x.type.injectGenericImplement(map)
                            };
                        });
                        return typeObject;
                    case TypeKind.fun:
                        var typeFun = new TypeExpression(this.kind);
                        typeFun.args = this.args.map(x => {
                            return {
                                key: x.key,
                                type: x.type.injectGenericImplement(map)
                            };
                        });
                        if (this.returnType)
                            typeFun.returnType = this.returnType.injectGenericImplement(map);
                        return typeFun;
                    case TypeKind.dic:
                        var typeFun = new TypeExpression(this.kind);
                        typeFun.options = this.options;
                        return typeFun;
                    case TypeKind.union:
                        var typeUnion = new TypeExpression(this.kind);
                        typeUnion.unionType = this.unionType.injectGenericImplement(map);
                        typeUnion.generics = this.generics.map(x => {
                            return x.injectGenericImplement(map);
                        });
                        return typeUnion;
                }
            }
            static createUnitType(name) {
                return new TypeExpression(TypeKind.unit, { name });
            }
            static TypeIsAdaptive(from, to, gens, pg) {
                if (!gens)
                    gens = new Lang.VeArray;
                if (from.kind == to.kind) {
                    switch (from.kind) {
                        case TypeKind.unit:
                            if (from.name == to.name)
                                return true;
                            else {
                                if (pg) {
                                    var rf = Lang.Statement.search(pg, from.name, x => x instanceof Lang.ClassOrIntrfaceStatement);
                                    if (rf && rf.referenceStatement) {
                                        var fromClass = rf.referenceStatement;
                                        if (fromClass.name == to.name || fromClass.nicks.exists(to.name))
                                            return true;
                                    }
                                }
                                if (gens.exists(z => z.key == to.name))
                                    return true;
                                var maps = [{ from: 'int', to: "number" }];
                                return maps.filter(x => x.from == from.name && x.to == to.name).length > 0 ? true : false;
                            }
                        case TypeKind.dic:
                            return from.options.exists(op => {
                                return !to.options.exists(z => z.key == op.key && z.value == op.value);
                            });
                        case TypeKind.union:
                            if (!this.TypeIsAdaptive(from.unionType, to.unionType, gens, pg))
                                return false;
                            if (from.generics.exists((x, i) => !this.TypeIsAdaptive(x, to.generics.eq(i), gens, pg)))
                                return false;
                            return true;
                        case TypeKind.object:
                            if (from.props.length == to.props.length) {
                                return from.props.exists(f => {
                                    var t = to.props.find(z => z.key == f.key);
                                    if (t) {
                                        if (this.TypeIsAdaptive(f.type, t.type, gens, pg))
                                            return false;
                                    }
                                    return true;
                                }) ? false : true;
                            }
                            return false;
                        case TypeKind.fun:
                            if (!this.TypeIsAdaptive(from.returnType, to.returnType, gens, pg))
                                return false;
                            return from.args.exists((f, i) => {
                                var t = to.args.eq(i);
                                if (t) {
                                    if (this.TypeIsAdaptive(f.type, t.type, gens, pg))
                                        return false;
                                }
                                return true;
                            }) ? false : true;
                    }
                }
            }
        }
        Lang.TypeExpression = TypeExpression;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        Lang.Infer$Binary = {
            $binary(express) {
                switch (express.kind) {
                    case Lang.VeName.ASSIGN:
                        this.accept(express.right);
                        if (typeof express.right.infer.expressType == typeof undefined) {
                            this.error(`无法确认运算符=右边的数据类型`);
                        }
                        else {
                            express.left.infer.requireExpressType = new Lang.VeArray(express.right.infer.expressType);
                            this.accept(express.left);
                            express.infer.expressType = express.right.infer.expressType;
                        }
                        break;
                    case Lang.VeName.ADD:
                        this.accept(express.left);
                        this.accept(express.right);
                        var leftTypeName = express.left.infer.expressType ? express.left.infer.expressType.name : '';
                        var rightTypeName = express.right.infer.expressType ? express.right.infer.expressType.name : '';
                        if (leftTypeName)
                            leftTypeName = leftTypeName.toLowerCase();
                        if (rightTypeName)
                            rightTypeName = rightTypeName.toLowerCase();
                        if (leftTypeName == 'string' || rightTypeName == 'string') {
                            express.infer.expressType = Lang.TypeExpression.createUnitType('string');
                        }
                        else if (leftTypeName == 'number' || rightTypeName == 'number') {
                            express.infer.expressType = Lang.TypeExpression.createUnitType('number');
                        }
                        else if (leftTypeName == 'int' || rightTypeName == 'int') {
                            express.infer.expressType = Lang.TypeExpression.createUnitType('int');
                        }
                        else {
                            express.infer.expressType = Lang.TypeExpression.createUnitType('string');
                        }
                        break;
                    case Lang.VeName.SUB:
                    case Lang.VeName.MUL:
                    case Lang.VeName.MOD:
                    case Lang.VeName.EXP:
                    case Lang.VeName.DIV:
                    case Lang.VeName.ASSIGN_ADD:
                    case Lang.VeName.ASSIGN_SUB:
                    case Lang.VeName.ASSIGN_MUL:
                    case Lang.VeName.ASSIGN_DIV:
                    case Lang.VeName.ASSIGN_MOD:
                    case Lang.VeName.ASSIGN_EXP:
                        express.left.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('int'), Lang.TypeExpression.createUnitType('number'));
                        express.right.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('int'), Lang.TypeExpression.createUnitType('number'));
                        this.accept(express.left);
                        this.accept(express.right);
                        var leftTypeName = express.left.infer.expressType ? express.left.infer.expressType.name : '';
                        var rightTypeName = express.right.infer.expressType ? express.right.infer.expressType.name : '';
                        if (leftTypeName)
                            leftTypeName = leftTypeName.toLowerCase();
                        if (rightTypeName)
                            rightTypeName = rightTypeName.toLowerCase();
                        if ((leftTypeName == 'int' || rightTypeName == 'number') && (rightTypeName == 'int' || rightTypeName == 'number')) {
                            if (leftTypeName == 'int' && rightTypeName == 'int') {
                                express.infer.expressType = Lang.TypeExpression.createUnitType('int');
                            }
                            else if (leftTypeName == 'number' || rightTypeName == 'number') {
                                express.infer.expressType = Lang.TypeExpression.createUnitType('number');
                            }
                        }
                        else {
                            this.error(`运算符${Lang.VeName[express.kind]}两边的数据类型为数字或整数`);
                            express.infer.expressType = Lang.TypeExpression.createUnitType('number');
                        }
                        break;
                    case Lang.VeName.OR:
                    case Lang.VeName.AND:
                    case Lang.VeName.XOR:
                    case Lang.VeName.K_AND:
                    case Lang.VeName.K_OR:
                    case Lang.VeName.K_XOR:
                        express.left.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('bool'));
                        express.right.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('bool'));
                        this.accept(express.left);
                        this.accept(express.right);
                        express.infer.expressType = Lang.TypeExpression.createUnitType('bool');
                        break;
                    case Lang.VeName.K_EQ:
                    case Lang.VeName.EQ:
                    case Lang.VeName.NE:
                        this.accept(express.left);
                        express.right.infer.requireExpressType = new Lang.VeArray(express.left.infer.expressType);
                        this.accept(express.right);
                        express.infer.expressType = Lang.TypeExpression.createUnitType('bool');
                        break;
                    case Lang.VeName.LT:
                    case Lang.VeName.GT:
                    case Lang.VeName.LTE:
                    case Lang.VeName.GTE:
                        express.left.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('int'), Lang.TypeExpression.createUnitType('number'));
                        express.right.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('int'), Lang.TypeExpression.createUnitType('number'));
                        this.accept(express.left);
                        this.accept(express.right);
                        express.infer.expressType = Lang.TypeExpression.createUnitType('bool');
                        break;
                    case Lang.VeName.AS:
                    case Lang.VeName.IS:
                        break;
                    case Lang.VeName.MATCH:
                    case Lang.VeName.CONTAIN:
                    case Lang.VeName.STATR:
                    case Lang.VeName.END:
                        express.left.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('string'));
                        express.right.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('string'));
                        this.accept(express.left);
                        this.accept(express.right);
                        express.infer.expressType = Lang.TypeExpression.createUnitType('bool');
                        break;
                    default:
                }
            },
            $unary(express) {
                switch (express.kind) {
                    case Lang.VeName.INC:
                    case Lang.VeName.DEC:
                        express.infer.expressType = Lang.TypeExpression.createUnitType('int');
                        express.exp.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('int'));
                        this.accept(express.exp);
                        break;
                    case Lang.VeName.NOT:
                        express.infer.expressType = Lang.TypeExpression.createUnitType('bool');
                        express.exp.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('bool'));
                        this.accept(express.exp);
                        break;
                }
            },
            $ternary(express) {
                express.where.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('bool'));
                this.accept(express.where);
                this.accept(express.trueCondition);
                express.falseCondition.infer.requireExpressType = new Lang.VeArray(express.trueCondition.infer.expressType);
                this.accept(express.falseCondition);
                express.infer.expressType = express.trueCondition.infer.expressType;
            }
        };
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        Lang.Infer$Data = {
            $constant(express) {
                express.infer.expressType = express.valueType;
            },
            $arrowMethod(express) {
                express.infer.expressType = new Lang.TypeExpression(Lang.TypeKind.fun);
                express.infer.expressType.args = express.args.map(x => {
                    return {
                        key: x.key,
                        type: x.parameterType
                    };
                });
                express.infer.expressType.returnType = express.returnType;
            },
            $array(express) {
                express.args.each(arg => this.accept(arg));
                express.infer.expressType = new Lang.TypeExpression(Lang.TypeKind.union);
                express.infer.expressType.unionType = Lang.TypeExpression.createUnitType('Array');
                var arrayType;
                if (express.args.length > 0) {
                    arrayType = express.args.first().infer.expressType;
                    for (let i = 1; i < express.args.length; i++) {
                        if (!Lang.TypeExpression.TypeIsAdaptive(express.args.eq(i).infer.expressType, arrayType, undefined, express)) {
                            arrayType = null;
                            break;
                        }
                    }
                }
                if (!arrayType)
                    arrayType = Lang.TypeExpression.createUnitType('Any');
                express.infer.expressType.generics = new Lang.VeArray(arrayType);
            },
            $Object(express) {
                express.propertys.each(pro => this.accept(pro.value));
                express.infer.expressType = new Lang.TypeExpression(Lang.TypeKind.object);
                express.infer.expressType.props = express.propertys.map(x => {
                    return {
                        key: x.key,
                        type: x.value.infer.expressType
                    };
                });
            }
        };
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        Lang.Infer$ObjectReferenceProperty = {
            $objectReferenceProperty(express) {
                var referenceType;
                var names = new Lang.VeArray;
                for (var i = 0; i < express.propertys.length; i++) {
                    var ep = express.propertys.eq(i);
                    if (typeof ep == 'string') {
                        if (typeof referenceType != typeof undefined) {
                            switch (referenceType.kind) {
                                case Lang.TypeKind.unit:
                                    var result = Lang.Statement.search(express, referenceType.name, x => {
                                        if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                            return false;
                                    });
                                    if (result) {
                                        var typeClass = result.referenceStatement;
                                        if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                            var cp = typeClass.body.find(x => x.name == ep && x.kind == Lang.ClassPropertyKind.method && express.parent.isCompatibility(x));
                                            if (!cp) {
                                                if (typeClass.body.find(x => x.name == ep && x.kind == Lang.ClassPropertyKind.method)) {
                                                    this.error(`the class ${typeClass.fullName} method ${ep} args is not  compatibility`);
                                                }
                                                else if (typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method)) {
                                                    this.error(`the class ${typeClass.fullName} method ${ep}  is not method name `);
                                                }
                                                else {
                                                    this.error(`not found class ${typeClass.fullName} method ${ep} `);
                                                }
                                            }
                                            else {
                                                express.parent.infer.referenceStatement = new Lang.StatementReference(Lang.StatementReferenceKind.outerClassProperty, cp);
                                            }
                                        }
                                        else {
                                            var cp = typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method);
                                            if (cp)
                                                referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                            else
                                                this.error(`not found class ${typeClass.name} property:${ep}`);
                                        }
                                    }
                                    else {
                                        this.error(`not found class ${referenceType.name} `);
                                    }
                                    break;
                                case Lang.TypeKind.union:
                                    var typeClass = Lang.Statement.search(express, referenceType.unionType.name, x => { if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                        return false; }).referenceStatement;
                                    if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                        var cp = typeClass.body.find(x => x.name == ep && x.kind == Lang.ClassPropertyKind.method && express.parent.isCompatibility(x));
                                        express.parent.infer.referenceStatement = new Lang.StatementReference(Lang.StatementReferenceKind.outerClassProperty, cp);
                                    }
                                    else {
                                        var cp = typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method);
                                        if (cp) {
                                            referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                            var map = {};
                                            typeClass.generics.each((gen, i) => map[gen.key] = referenceType.generics.eq(i));
                                            if (referenceType)
                                                referenceType = referenceType.injectGenericImplement(map);
                                        }
                                        else {
                                            this.error(`not found class ${typeClass.name} property:${ep}`);
                                        }
                                    }
                                    break;
                                case Lang.TypeKind.object:
                                    var prop = referenceType.props.find(x => x.type == name);
                                    if (prop) {
                                        referenceType = prop.type;
                                    }
                                    else
                                        this.error(`无法找到object对象${name}`);
                                    break;
                            }
                        }
                        else {
                            names.push(ep);
                            var referenceStatement = Lang.Statement.search(express, names.join("."));
                            if (referenceStatement) {
                                switch (referenceStatement.kind) {
                                    case Lang.StatementReferenceKind.FunArgs:
                                    case Lang.StatementReferenceKind.currentClassMethodArgs:
                                        var target = referenceStatement.target;
                                        referenceType = target.parameterType || (target.default ? target.default.valueType : undefined);
                                        break;
                                    case Lang.StatementReferenceKind.outerClass:
                                        if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                            var cp = typeClass.body.find(x => x.kind == Lang.ClassPropertyKind.method && x.isCtor && express.parent.isCompatibility(x));
                                            if (!cp && express.parent.args.length == 0) {
                                                express.parent.infer.referenceStatement = new Lang.StatementReference(Lang.StatementReferenceKind.outerClass, typeClass);
                                            }
                                            else {
                                                express.parent.infer.referenceStatement = new Lang.StatementReference(Lang.StatementReferenceKind.outerClassProperty, cp);
                                            }
                                        }
                                        else {
                                        }
                                        break;
                                    case Lang.StatementReferenceKind.outerClassProperty:
                                        var cp = referenceStatement.referenceStatement;
                                        referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                        break;
                                    case Lang.StatementReferenceKind.DeclareVariable:
                                        referenceType = referenceStatement.referenceStatement.infer.expressType;
                                        break;
                                }
                            }
                        }
                    }
                    else if (ep instanceof Lang.Expression) {
                        this.accept(ep);
                        referenceType = ep.infer.expressType;
                    }
                }
                if (referenceType)
                    express.infer.expressType = referenceType;
            },
            callMethod(express) {
                express.args.each(arg => this.accept(arg));
                if (typeof express.name == 'string') {
                    var reference = Lang.Statement.search(express, express.name, x => {
                        if (x instanceof Lang.ClassProperty && x.kind != Lang.ClassPropertyKind.method)
                            return false;
                    });
                    if (reference)
                        express.infer.referenceStatement = reference;
                }
                else if (express.name instanceof Lang.PropertyExpression) {
                    this.accept(express.name);
                }
                if (typeof express.infer.referenceStatement != typeof undefined) {
                    switch (express.infer.referenceStatement.kind) {
                        case Lang.StatementReferenceKind.DeclareFun:
                            var method = express.infer.referenceStatement.referenceStatement;
                            express.infer.expressType = method.returnType.injectGenericImplement(express.getGenericMap());
                            break;
                        case Lang.StatementReferenceKind.currentClassMethodArgs:
                        case Lang.StatementReferenceKind.FunArgs:
                            var target = express.infer.referenceStatement.target;
                            var argType = target.type || (target.default ? target.default.valueType : undefined);
                            if (argType && argType.kind == Lang.TypeKind.fun) {
                                express.infer.expressType = argType.returnType.injectGenericImplement(express.getGenericMap());
                            }
                            break;
                        case Lang.StatementReferenceKind.outerClassProperty:
                            var cp = express.infer.referenceStatement.referenceStatement;
                            if (!cp) {
                                console.log(express);
                            }
                            if (cp.isCtor) {
                                if (cp.class.generics.length > 0) {
                                    express.infer.expressType = new Lang.TypeExpression(Lang.TypeKind.union);
                                    express.infer.expressType.unionType = Lang.TypeExpression.createUnitType(cp.class.fullName);
                                    express.infer.expressType.generics = express.generics.map(x => x.type);
                                }
                                else
                                    express.infer.expressType = Lang.TypeExpression.createUnitType(cp.class.fullName);
                            }
                            else {
                                express.infer.expressType = cp.returnType.injectGenericImplement(express.getGenericMap());
                            }
                            break;
                        case Lang.StatementReferenceKind.outerClass:
                            var ci = express.infer.referenceStatement.referenceStatement;
                            express.infer.expressType = new Lang.TypeExpression(Lang.TypeKind.union);
                            express.infer.expressType.unionType = Lang.TypeExpression.createUnitType(ci.fullName);
                            express.infer.expressType.generics = express.generics.map(x => x.type);
                            break;
                    }
                }
            }
        };
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        Lang.Infer$Statement = {
            return(statement) {
                this.accept(statement.expression);
                statement.infer.expressType = statement.expression.infer.expressType;
                this.next(statement);
            },
            continue(statement) {
                this.next(statement);
            },
            break(statement) {
                this.next(statement);
            },
            context(statement) {
                if (statement.name == 'this') {
                    statement.infer.expressType = Lang.TypeExpression.createUnitType(statement.closest(x => x instanceof Lang.ClassOrIntrfaceStatement).fullName);
                }
                else if (statement.name == 'super') {
                    statement.infer.expressType = Lang.TypeExpression.createUnitType(statement.closest(x => x instanceof Lang.ClassOrIntrfaceStatement).fullName);
                }
            },
            if(statement) {
                this.accept(statement.ifCondition);
                statement.ifStatement.each(s => this.accept(s));
                statement.thenConditions.each((c, i) => {
                    this.accept(c);
                    statement.thenStatements.eq(i).each(s => this.accept(s));
                });
                statement.elseStatement.each(s => this.accept(s));
                this.next(statement);
            },
            for(statement) {
                this.accept(statement.initStatement);
                this.accept(statement.condition);
                this.accept(statement.next);
                statement.body.each(s => this.accept(s));
                this.next(statement);
            },
            while(statement) {
                this.accept(statement.condition);
                statement.body.each(b => this.accept(b));
                this.next(statement);
            },
            doWhile(statement) {
                statement.body.each(b => this.accept(b));
                this.accept(statement.condition);
                this.next(statement);
            },
            fun(statement) {
                statement.body.each(st => this.accept(st));
            },
            switch(statement) {
                this.accept(statement.valueExpression);
                statement.caseStatements.each(ca => {
                    this.accept(ca.value);
                    ca.matchs.each(m => this.accept(m));
                });
                statement.defaultStatement.each(d => this.accept(d));
                this.next(statement);
            },
            try(statement) {
                statement.tryStatement.each(t => this.accept(t));
                statement.catchStatement.each(s => this.accept(s));
                statement.finallyStatement.each(f => this.accept(f));
            },
            use(statement) {
            },
            package(statement) {
                statement.body.each(b => this.accept(b));
            },
            class(statement) {
                statement.body.each(b => this.accept(b));
            },
            classProperty(statement) {
                statement.body.each(b => this.accept(b));
                statement.get.each(b => this.accept(b));
                statement.set.each(b => this.accept(b));
            }
        };
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        function applyMixins(Mix, ...mixins) {
            function copyProperties(target, source) {
                for (let key of Reflect.ownKeys(source)) {
                    if (key !== "constructor"
                        && key !== "prototype"
                        && key !== "name") {
                        let desc = Object.getOwnPropertyDescriptor(source, key);
                        Object.defineProperty(target, key, desc);
                    }
                }
            }
            for (let mixin of mixins) {
                copyProperties(Mix, mixin);
                copyProperties(Mix.prototype, mixin.prototype);
            }
            return Mix;
        }
        Lang.applyMixins = applyMixins;
        function applyExtend(mix, ...mixins) {
            mixins.forEach(mi => {
                for (var n in mi) {
                    mix[n] = mi[n];
                }
            });
        }
        Lang.applyExtend = applyExtend;
        function getAvailableName(name, list, predict) {
            var i = 0;
            while (true) {
                var text = name + (i == 0 ? "" : i);
                if (list.exists(z => predict(z) == text)) {
                    i++;
                }
                else {
                    break;
                }
            }
            return name + (i == 0 ? "" : i);
        }
        Lang.getAvailableName = getAvailableName;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let StatementReferenceKind;
        (function (StatementReferenceKind) {
            StatementReferenceKind[StatementReferenceKind["DeclareVariable"] = 0] = "DeclareVariable";
            StatementReferenceKind[StatementReferenceKind["DeclareFun"] = 1] = "DeclareFun";
            StatementReferenceKind[StatementReferenceKind["FunArgs"] = 2] = "FunArgs";
            StatementReferenceKind[StatementReferenceKind["currentClassMethodArgs"] = 3] = "currentClassMethodArgs";
            StatementReferenceKind[StatementReferenceKind["outerClass"] = 4] = "outerClass";
            StatementReferenceKind[StatementReferenceKind["outerClassProperty"] = 5] = "outerClassProperty";
        })(StatementReferenceKind = Lang.StatementReferenceKind || (Lang.StatementReferenceKind = {}));
        class StatementReference {
            constructor(kind, statement) {
                if (typeof kind != typeof undefined)
                    this.kind = kind;
                if (typeof statement != typeof undefined)
                    this.referenceStatement = statement;
            }
        }
        Lang.StatementReference = StatementReference;
        Lang.Infer = {
            declareVariable(express) {
                if (typeof express.infer.expressType == typeof undefined) {
                    if (typeof express.variableType != typeof undefined) {
                        express.infer.expressType = express.variableType;
                    }
                    else {
                        if (typeof express.value != typeof undefined) {
                            this.accept(express.value);
                            if (typeof express.value.infer.expressType != typeof undefined) {
                                express.infer.expressType = express.value.infer.expressType;
                            }
                            else {
                                this.error(`无法取得声明的变量${Lang.DeclareVariable.name}表达式类型`);
                            }
                        }
                        else {
                            this.error(`无法确定声明的变量${Lang.DeclareVariable.name}类型`);
                        }
                    }
                }
                this.next(express);
            },
            arrayIndex(express) {
                if (typeof express.name == 'string' && typeof express.infer.referenceStatement == typeof undefined) {
                    var reference = Lang.Statement.search(express, express.name);
                    if (reference)
                        express.infer.referenceStatement = reference;
                }
                express.indexExpress.infer.requireExpressType = new Lang.VeArray(Lang.TypeExpression.createUnitType('int'));
            },
            variable(express) {
                var reference = Lang.Statement.search(express, express.name);
                if (reference) {
                    express.infer.referenceStatement = reference;
                    if (typeof express.infer.expressType == typeof undefined) {
                        switch (express.infer.referenceStatement.kind) {
                            case StatementReferenceKind.FunArgs:
                            case StatementReferenceKind.currentClassMethodArgs:
                                var target = express.infer.referenceStatement.target;
                                express.infer.expressType = target.parameterType || (target.default ? target.default.valueType : undefined);
                                if (typeof express.infer.expressType == typeof undefined) {
                                    this.error(`${express.infer.referenceStatement.referenceStatement.name}方法参数${target.key}没有声明类型`);
                                }
                                break;
                            case StatementReferenceKind.outerClassProperty:
                                var cp = express.infer.referenceStatement.referenceStatement;
                                express.infer.expressType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                if (typeof express.infer.expressType == typeof undefined) {
                                    this.error(`${express.infer.referenceStatement.referenceStatement.name}方法参数${target.key}没有声明类型`);
                                }
                                break;
                        }
                    }
                }
                else {
                    this.error(`变量${express.name}没有声明`);
                }
            }
        };
        Lang.applyExtend(Lang.Infer, Lang.Infer$Statement, Lang.Infer$Binary, Lang.Infer$ObjectReferenceProperty, Lang.Infer$Data);
        class InferFactory extends Lang.AstVisitor {
            constructor() {
                super(...arguments);
                this.accepter = Lang.Infer;
            }
        }
        Lang.InferFactory = InferFactory;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class ParserRegex {
        }
        ParserRegex.attr = `(\\\[[^\\\]]*\\\])*`;
        ParserRegex.access = `(public|private)?`;
        ParserRegex.genic = `(<>)?`;
        ParserRegex.method_modifys = `(static)?`;
        ParserRegex.class_property_modifys = `(const|static|readonly)*`;
        ParserRegex.variable_value = '(=[^,;]+)?';
        ParserRegex.type_namespace = `word(\\\.word)*`;
        ParserRegex.datatype = `(${ParserRegex.type_namespace}|${ParserRegex.type_namespace}\\\[\\\]|\\\{\\\}|\\\{\\\}\\\[\\\]|\\\(\\\)=>(${ParserRegex.type_namespace}|\\\{\\\}|${ParserRegex.type_namespace}\\\[\\\]|\\\{\\\}\\\[\\\]))`;
        ParserRegex.package = `package${ParserRegex.type_namespace}\\\{\\\}`;
        ParserRegex.use = `use${ParserRegex.type_namespace}((=)word)?;?`;
        ParserRegex.export = `(export)?`;
        ParserRegex.enum = `${ParserRegex.export}enumword\\\{\\\}`;
        ParserRegex.classOrInterface = `${ParserRegex.attr}${ParserRegex.export}(class|interface)word${ParserRegex.genic}(extends${ParserRegex.type_namespace})?\\\{\\\}`;
        ParserRegex.classPropertyEnd = `((?!(public|private|const|static|readonly|word|new|\\\[|<)).)*;?`;
        ParserRegex.classMethod = `${ParserRegex.attr}${ParserRegex.access}${ParserRegex.method_modifys}(word|new)${ParserRegex.genic}\\\(\\\)(:${ParserRegex.datatype})?\\\{\\\}`;
        ParserRegex.interfaceMethod = `${ParserRegex.attr}${ParserRegex.access}${ParserRegex.method_modifys}(word|new)${ParserRegex.genic}\\\(\\\)(:${ParserRegex.datatype})?${ParserRegex.classPropertyEnd}`;
        ParserRegex.classProperty = `${ParserRegex.attr}${ParserRegex.access}${ParserRegex.class_property_modifys}word(:${ParserRegex.datatype})?${ParserRegex.variable_value}${ParserRegex.classPropertyEnd}`;
        ParserRegex.classField = `${ParserRegex.attr}${ParserRegex.access}${ParserRegex.method_modifys}word(:${ParserRegex.datatype})?\\\{\\\}${ParserRegex.classPropertyEnd}`;
        ParserRegex.fun = `${ParserRegex.attr}${ParserRegex.access}funword${ParserRegex.genic}\\\(\\\)(:${ParserRegex.datatype})?\\\{\\\}`;
        ParserRegex.variable = `^(def|const)(word(:${ParserRegex.datatype})?${ParserRegex.variable_value})(,word(:${ParserRegex.datatype})?${ParserRegex.variable_value})*;?`;
        ParserRegex.statement = '((?!(try|for|while|if|else|do|switch|throw|case|fun|return|;|default|break|def|const|continue)).)*;?';
        ParserRegex.block_or_statement = `(\\\{\\\}|${ParserRegex.statement})`;
        ParserRegex.if = `^if\\\(\\\)${ParserRegex.block_or_statement}`;
        ParserRegex.else_if = `elseif\\\(\\\)${ParserRegex.block_or_statement}`;
        ParserRegex.else = `else${ParserRegex.block_or_statement}`;
        ParserRegex.while = `while\\\(\\\)${ParserRegex.block_or_statement}`;
        ParserRegex.do_while = `do${ParserRegex.block_or_statement}while\\\(\\\)`;
        ParserRegex.for = `for\\\(\\\)${ParserRegex.block_or_statement}`;
        ParserRegex.try = `try\\\{\\\}catch\\\(\\\)\\\{\\\}(finally\\\{\\\})?`;
        ParserRegex.switch = `switch\\\(\\\)\\\{\\\}`;
        ParserRegex.case = `(case[^:]+|default):((?!(case|default)).)*`;
        ParserRegex.return = `return${ParserRegex.block_or_statement}`;
        ParserRegex.throw = `throw${ParserRegex.block_or_statement}`;
        ParserRegex.break = 'break';
        ParserRegex.continue = 'continue';
        ParserRegex.fun_arrow_type = `\\\(\\\)=>${ParserRegex.datatype}`;
        ParserRegex.fun_arrow_statement = `(\\\(\\\)|${ParserRegex.type_namespace})(:${ParserRegex.datatype})?=>${ParserRegex.block_or_statement}`;
        ParserRegex.new_instance = `new${ParserRegex.type_namespace}${ParserRegex.genic}\\\(\\\)`;
        ParserRegex.emptyStatement = `[;]+`;
        Lang.ParserRegex = ParserRegex;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class TokenParseData {
            static parseArguments(tokens) {
                var ts = tokens.split(x => x.name == Lang.VeName.COMMA);
                var args = new Lang.VeArray;
                ts.each(t => {
                    var exp = new Lang.TokenParseExpress(t).parse();
                    args.push(exp);
                });
                return args;
            }
            static parseParameter(tokens) {
                var ts = tokens.split(x => x.name == Lang.VeName.COMMA);
                var args = new Lang.VeArray();
                ts.each(t => {
                    var pe = {};
                    if (t.exists(x => x.name == Lang.VeName.ELLIPSIS)) {
                        pe.isParameter = true;
                        t.remove(x => x.name == Lang.VeName.ELLIPSIS);
                    }
                    ;
                    pe.key = t.eq(0).value;
                    if (t.exists(x => x.name == Lang.VeName.COLON)) {
                        var typeTs = t.range(t.findIndex(x => x.name == Lang.VeName.COLON) + 1, t.findIndex(x => x.name == Lang.VeName.ASSIGN, t.length));
                        pe.parameterType = this.parseType(typeTs);
                    }
                    if (t.exists(x => x.name == Lang.VeName.ASSIGN)) {
                        pe.default = new Lang.TokenParseExpress(t.range(t.findIndex(x => x.name == Lang.VeName.ASSIGN) + 1, t.length)).parse();
                    }
                    var arg = new Lang.Parameter();
                    for (var n in pe)
                        arg[n] = pe[n];
                    args.push(arg);
                });
                return args;
            }
            static parseType(tokens) {
                var typeExpression = new Lang.TypeExpression();
                if (tokens.exists(x => x.name == Lang.VeName.LBRACE) && tokens.exists(x => x.name == Lang.VeName.LBRACK)) {
                    typeExpression.unionType = Lang.TypeExpression.createUnitType('Array');
                    typeExpression.kind = Lang.TypeKind.union;
                    typeExpression.generics.push(this.parseType(new Lang.VeArray(tokens.eq(0))));
                    return typeExpression;
                }
                else if (tokens.exists(x => x.name == Lang.VeName.LBRACE)) {
                    typeExpression.kind = Lang.TypeKind.object;
                    tokens.find(x => x.name == Lang.VeName.LBRACE).childs.split(x => x.name == Lang.VeName.COMMA).each(ts => {
                        var key = ts.eq(0).value;
                        var type;
                        if (ts.exists(x => x.name == Lang.VeName.COLON)) {
                            var v = ts.range(ts.findIndex(x => x.name == Lang.VeName.COLON) + 1, ts.length);
                            type = this.parseType(v);
                        }
                        typeExpression.props.push({ key, type });
                    });
                    return typeExpression;
                }
                else if (tokens.exists(x => x.name == Lang.VeName.LBRACK)) {
                    var index = tokens.findIndex(x => x.name == Lang.VeName.LBRACK);
                    typeExpression.unionType = Lang.TypeExpression.createUnitType('Array');
                    typeExpression.kind = Lang.TypeKind.union;
                    typeExpression.generics.push(this.parseType(tokens.findAll((x, i) => i < index)));
                    return typeExpression;
                }
                else if (tokens.exists(x => x.name == Lang.VeName.ARROW)) {
                    var index = tokens.findIndex(x => x.name == Lang.VeName.ARROW);
                    typeExpression.kind = Lang.TypeKind.fun;
                    tokens.find(x => x.name == Lang.VeName.LPAREN).childs.split(x => x.name == Lang.VeName.COMMA).each(ts => {
                        var key = ts.eq(0).value;
                        if (ts.exists(x => x.name == Lang.VeName.COLON)) {
                            var v = ts.range(ts.findIndex(x => x.name == Lang.VeName.COLON) + 1, ts.length);
                            var type = this.parseType(v);
                        }
                        typeExpression.args.push({ key, type: type });
                    });
                    typeExpression.returnType = this.parseType(tokens.findAll((x, i) => i > index));
                    return typeExpression;
                }
                else if (tokens.exists(x => x.name == Lang.VeName.SPLIIT)) {
                    typeExpression.kind = Lang.TypeKind.dic;
                    tokens.find(x => x.name == Lang.VeName.SPLIIT).childs.split(x => x.name == Lang.VeName.COMMA).each(ts => {
                        var key = ts.eq(0).value, value;
                        if (ts.exists(x => x.name == Lang.VeName.ASSIGN)) {
                            var vs = ts.range(ts.findIndex(x => x.name == Lang.VeName.COLON) + 1, ts.length);
                            if (vs.length == 1) {
                                value = vs.first().value;
                                var v = parseInt(value);
                                if (!isNaN(v))
                                    value = v;
                            }
                        }
                        if (!typeExpression.options.exists(x => x.key == key))
                            typeExpression.options.push({ key, value: typeof value != typeof undefined ? value : undefined });
                    });
                    return typeExpression;
                }
                else if (tokens.length > 0) {
                    typeExpression.kind = Lang.TypeKind.unit;
                    typeExpression.name = tokens.map(x => {
                        if (x instanceof Lang.Token) {
                            if (x.name == Lang.VeName.PERIOD)
                                return '.';
                            else
                                return x.value;
                        }
                    }).join("");
                    return typeExpression;
                }
            }
            static parsePropertys(tokens) {
                var tns = tokens.split(x => x.name == Lang.VeName.COMMA);
                var opes = new Lang.VeArray();
                tns.each(tt => {
                    var ope = {};
                    ope.key = tt[0].value;
                    ope.value = new Lang.TokenParseExpress(tt.range(tt.findIndex(x => x.name == Lang.VeName.COLON) + 1, tt.length)).parse();
                    opes.push(ope);
                });
                return opes;
            }
            static parseEnumOptions(tokens) {
                var tns = tokens.split(x => x.name == Lang.VeName.COMMA);
                var opes = new Lang.VeArray();
                tns.each(tt => {
                    var ope = {};
                    ope.key = tt[0].value;
                    ope.value = Lang.TokenParseExpression.parseOneToken(tt.range(tt.findIndex(x => x.name == Lang.VeName.ASSIGN) + 1, tt.length));
                    opes.push(ope);
                });
                return opes;
            }
        }
        Lang.TokenParseData = TokenParseData;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class TokenParseExpression {
            static parseBinaryExpression(ts) {
                var index = ts.findIndex(x => x instanceof Lang.Token && x.type == Lang.TokenType.operator);
                var left = Lang.TokenParseExpress.parseExpression(ts.range(0, index - 1));
                var right = Lang.TokenParseExpress.parseExpression(ts.range(index + 1, ts.length));
                var binaryExpression = new Lang.BinaryExpression();
                binaryExpression.kind = ts.eq(index).name;
                binaryExpression.left = left;
                binaryExpression.right = right;
                return binaryExpression;
            }
            static parseUnaryExpression(ts) {
                var index = ts.findIndex(x => x instanceof Lang.Token && x.type == Lang.TokenType.operator);
                var left, right;
                var unaryExpression = new Lang.UnaryExpression();
                if (index > 0) {
                    left = Lang.TokenParseExpress.parseExpression(new Lang.VeArray(ts.find((x, i) => i < index)));
                    unaryExpression.arrow = Lang.UnaryArrow.right;
                }
                else {
                    right = Lang.TokenParseExpress.parseExpression(new Lang.VeArray(ts.find((x, i) => i >= index)));
                    unaryExpression.arrow = Lang.UnaryArrow.left;
                }
                unaryExpression.kind = ts.eq(index).name;
                unaryExpression.exp = left ? left : right;
                return unaryExpression;
            }
            static parseTernaryOperator(ts) {
                var ternaryExpression = new Lang.TernaryExpression();
                var wi = ts.findIndex(x => x instanceof Lang.Token && x.name == Lang.VeName.CONDITIONAL);
                var ti = ts.findIndex(x => x instanceof Lang.Token && x.name == Lang.VeName.COLON);
                ternaryExpression.where = Lang.TokenParseExpress.parseExpression(ts.range(0, wi - 1));
                ternaryExpression.trueCondition = Lang.TokenParseExpress.parseExpression(ts.range(wi + 1, ti - 1));
                ternaryExpression.falseCondition = Lang.TokenParseExpress.parseExpression(ts.range(ti + 1, ts.length - 1));
                return ternaryExpression;
            }
            static parsePropertyReference(ts) {
                var propertyExpression = new Lang.PropertyExpression();
                ts.removeAll(x => x.name == Lang.VeName.PERIOD);
                propertyExpression.propertys = ts.map(x => {
                    if (x instanceof Lang.Token) {
                        if (x.type == Lang.TokenType.word) {
                            return x.value;
                        }
                        else {
                            return this.parseOneToken(new Lang.VeArray(x));
                        }
                    }
                    else if (x instanceof Lang.Statement)
                        return x;
                });
                return propertyExpression;
            }
            static parseArray(ts) {
                var arrayExpression = new Lang.ArrayExpression();
                arrayExpression.args = Lang.TokenParseData.parseArguments(ts.eq(0).childs);
                return arrayExpression;
            }
            static parseArrayIndex(ts) {
                var ai = new Lang.ArrayIndexExpression();
                var first = ts.eq(0);
                if (first instanceof Lang.Token) {
                    ai.name = first.value;
                }
                else {
                    ai.name = first;
                }
                ai.indexExpress = new Lang.TokenParseExpress(ts.find(x => x instanceof Lang.Token && x.name == Lang.VeName.LBRACK).childs).parse();
                return ai;
            }
            static parseObject(ts) {
                var oe = new Lang.ObjectExpression();
                var tms = ts.eq(0).childs;
                oe.propertys = Lang.TokenParseData.parsePropertys(tms);
                return oe;
            }
            static parseMethod(ts) {
                var callMethod = new Lang.CallMethodExpression();
                var first = ts.eq(0);
                if (first instanceof Lang.Token) {
                    callMethod.name = first.value;
                }
                else if (first instanceof Lang.Expression) {
                    callMethod.name = first;
                }
                var t = ts.find(x => x instanceof Lang.Token && x.name == Lang.VeName.LPAREN);
                callMethod.args = Lang.TokenParseData.parseArguments(t.childs);
                if (ts.exists(x => x.name == Lang.VeName.LT)) {
                    ts.find(x => x instanceof Lang.Token && x.name == Lang.VeName.LT).childs.split(x => x.name == Lang.VeName.COMMA).each(tt => {
                        var type = Lang.TokenParseData.parseType(tt);
                        callMethod.generics.push({ type });
                    });
                }
                return callMethod;
            }
            static parseArrowMethod(ts) {
                var ame = new Lang.ArrowMethodExpression();
                var arrowIndex = ts.findIndex(x => x instanceof Lang.Token && x.name == Lang.VeName.ARROW);
                if (ts.exists((x, i) => i < arrowIndex && x instanceof Lang.Token && x.name == Lang.VeName.LPAREN)) {
                    ame.args = Lang.TokenParseData.parseParameter(ts.find((x, i) => i < arrowIndex && x instanceof Lang.Token && x.name == Lang.VeName.LPAREN).childs);
                }
                else {
                    ame.args = Lang.TokenParseData.parseParameter(new Lang.VeArray(ts.eq(0)));
                }
                if (ts.exists((x, i) => i < arrowIndex && x instanceof Lang.Token && x.name == Lang.VeName.COLON)) {
                    ame.returnType = Lang.TokenParseData.parseType(ts.range(ts.findIndex((x, i) => i < arrowIndex && x instanceof Lang.Token && x.name == Lang.VeName.COLON) + 1, arrowIndex - 1));
                }
                var last = ts.findAll((x, i) => i > arrowIndex);
                if (last.length == 1 && last instanceof Lang.Token && last.name == Lang.VeName.LBRACE) {
                    ame.body = new Lang.TokenStatementParser(last.childs).parse();
                }
                else {
                    ame.body.append(new Lang.TokenParseExpress(last).parse());
                }
                return ame;
            }
            static parseOneToken(ts) {
                if (ts.length == 1 && ts[0] instanceof Lang.Token) {
                    var token = ts[0];
                    if (token.type == Lang.TokenType.number) {
                        var constant = new Lang.Constant();
                        if (/^\-?[\d]+$/g.test(token.value)) {
                            constant.value = parseInt(token.value);
                            constant.valueType = new Lang.TypeExpression(Lang.TypeKind.unit, { name: 'int' });
                        }
                        else {
                            constant.value = parseFloat(token.value);
                            constant.valueType = new Lang.TypeExpression(Lang.TypeKind.unit, { name: 'number' });
                        }
                        return constant;
                    }
                    if (token.type == Lang.TokenType.unit) {
                        var constant = new Lang.Constant();
                        constant.valueType = new Lang.TypeExpression(Lang.TypeKind.unit, { name: token.unit });
                        constant.value = token.value;
                        return constant;
                    }
                    else if (token.type == Lang.TokenType.null) {
                        var constant = new Lang.Constant();
                        constant.valueType = new Lang.TypeExpression(Lang.TypeKind.unit, { name: 'null' });
                        constant.value = null;
                        return constant;
                    }
                    else if (token.type == Lang.TokenType.string) {
                        var constant = new Lang.Constant();
                        constant.valueType = new Lang.TypeExpression(Lang.TypeKind.unit, { name: 'string' });
                        constant.value = token.value;
                        return constant;
                    }
                    else if (token.type == Lang.TokenType.bool) {
                        var constant = new Lang.Constant();
                        constant.valueType = new Lang.TypeExpression(Lang.TypeKind.unit, { name: 'bool' });
                        if (token.value == 'true')
                            constant.value = true;
                        else
                            constant.value = false;
                        return constant;
                    }
                    else if (token.type == Lang.TokenType.word) {
                        var variable = new Lang.Variable();
                        variable.type = Lang.StatementType.variable;
                        variable.name = token.value;
                        return variable;
                    }
                    else if (token.type == Lang.TokenType.keyWord && (token.value == 'this' || token.value == 'super')) {
                        var cc = new Lang.ClassContext();
                        cc.name = token.value;
                        return cc;
                    }
                }
                return null;
            }
        }
        Lang.TokenParseExpression = TokenParseExpression;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class TokenParseExpress {
            constructor(token, parent) {
                if (!token) {
                    return;
                }
                if (token instanceof Lang.Token) {
                    this.tokens = token.childs.copy();
                }
                else if (token instanceof Lang.VeArray)
                    this.tokens = token.copy();
                if (!this.tokens)
                    console.trace(token);
                if (typeof parent != typeof undefined)
                    this.parent = parent;
                Lang.TokenStatementParser.prototype.preteatment.apply(this, []);
                this.tokens.removeAll(x => x.name == Lang.VeName.NEW);
            }
            getLeftAndRightOpertors() {
                var json = { left: new Lang.VeArray, right: new Lang.VeArray };
                var self = this;
                var getOperator = (startToken) => {
                    var ve = new Lang.VeArray();
                    if (startToken) {
                        var moveIndex = self.tokens.findIndex(startToken);
                        ve.push(startToken);
                        if (startToken.type == Lang.TokenType.block) {
                            moveIndex += 1;
                            ve.push(self.tokens.eq(moveIndex));
                        }
                        if (startToken.name == Lang.VeName.LT && startToken.type == Lang.TokenType.block) {
                            if (this.tokens.eq(moveIndex + 1) && this.tokens.eq(moveIndex + 1).name == Lang.VeName.LPAREN) {
                                ve.append(this.tokens.eq(moveIndex + 1));
                                ve.append(this.tokens.eq(moveIndex + 2));
                            }
                        }
                        else if (startToken.name == Lang.VeName.CONDITIONAL) {
                            if (this.tokens.eq(moveIndex + 2) && this.tokens.eq(moveIndex + 2).name == Lang.VeName.COLON) {
                                ve.append(this.tokens.eq(moveIndex + 1));
                                ve.append(this.tokens.eq(moveIndex + 2));
                            }
                        }
                        else if (startToken.name == Lang.VeName.LPAREN) {
                            var ms = self.tokens.match(Lang.ParserRegex.fun_arrow_statement, Lang.TokenStatementParser.prototype.getFlag, moveIndex - 1);
                            if (ms && ms.length > 0) {
                                ms.each((m, i) => {
                                    if (i > 0)
                                        ve.append(m);
                                });
                            }
                            moveIndex += ms.length - 1;
                        }
                        else if (startToken.name == Lang.VeName.ARROW) {
                            var ms = self.tokens.match(Lang.ParserRegex.block_or_statement, Lang.TokenStatementParser.prototype.getFlag, moveIndex);
                            if (ms && ms.length > 0) {
                                ms.each((m, i) => {
                                    if (i > 0)
                                        ve.append(m);
                                });
                            }
                            moveIndex += ms.length - 1;
                        }
                        else if (startToken.name == Lang.VeName.PERIOD) {
                            while (true) {
                                if (self.tokens.eq(moveIndex + 1) instanceof Lang.Token && self.tokens.eq(moveIndex + 1).type == Lang.TokenType.word) {
                                    if (self.tokens.eq(moveIndex + 2) instanceof Lang.Token && self.tokens.eq(moveIndex + 2).name == Lang.VeName.PERIOD) {
                                        ve.append(self.tokens.eq(moveIndex + 1));
                                        ve.append(self.tokens.eq(moveIndex + 2));
                                        moveIndex += 2;
                                        continue;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    ve.removeAll(x => x ? false : true);
                    return ve;
                };
                var isOp = (x) => (x.type == Lang.TokenType.operator || x.type == Lang.TokenType.block || (x.type == Lang.TokenType.keyWord && new Lang.VeArray('new').exists(x.value)));
                json.left = getOperator(this.tokens.find(x => x instanceof Lang.Token && isOp(x)));
                json.right = getOperator(this.tokens.find(x => x instanceof Lang.Token && !json.left.exists(x) && isOp(x)));
                return json;
            }
            parse(onlyOnce) {
                var LR = this.getLeftAndRightOpertors();
                if (LR.left.length > 0 && LR.left.first().name == Lang.VeName.COMMA) {
                    throw '逗号不应该出现在这里';
                }
                if (LR.right.exists(x => x ? false : true)) {
                    console.log(LR);
                }
                if (LR.right.length > 0) {
                    var pickOpName = (r) => {
                        if (r.exists(x => x.name == Lang.VeName.LT) && r.exists(x => x.name == Lang.VeName.LPAREN)) {
                            r.find(x => x.name == Lang.VeName.LPAREN).name;
                        }
                        return r.eq(0).name;
                    };
                    var leftOp = Lang.VeSyntax.getOperators().find(x => x.name == pickOpName(LR.left));
                    var rightOp = Lang.VeSyntax.getOperators().find(x => x.name == pickOpName(LR.right));
                    var comparePrecedence = leftOp.precedence < rightOp.precedence;
                    if (leftOp.precedence == rightOp.precedence) {
                        if (rightOp.direction == Lang.OperatorDirection.right)
                            comparePrecedence = true;
                        else
                            comparePrecedence = false;
                    }
                    if (comparePrecedence) {
                        var LeftIndex = this.tokens.findIndex(x => x == LR.left.last());
                        var rightExpression = new TokenParseExpress(this.tokens.findAll((x, i) => i > LeftIndex), this.parent).parse(true);
                        this.tokens.removeAll((x, i) => i > LeftIndex);
                        var ns = new Lang.VeArray();
                        ns.append(this.tokens);
                        if (!rightExpression) {
                            console.log(LR, this.tokens);
                            throw 'right expression is not null;error';
                        }
                        ns.append(rightExpression);
                        if (onlyOnce == true)
                            return ns;
                        else
                            return new TokenParseExpress(ns, this.parent).parse();
                    }
                    else {
                        var rightIndex = this.tokens.findIndex(x => x == LR.right.first());
                        var leftExpression = new TokenParseExpress(this.tokens.findAll((x, i) => i < rightIndex), this.parent).parse();
                        if (!leftExpression) {
                            console.log(LR, this.tokens);
                            throw 'left expression is not null;error';
                        }
                        this.tokens.removeAll((x, i) => i < rightIndex);
                        var ns = new Lang.VeArray();
                        ns.append(leftExpression);
                        ns.append(this.tokens);
                        if (onlyOnce == true)
                            return ns;
                        else
                            return new TokenParseExpress(ns, this.parent).parse();
                    }
                }
                else {
                    return TokenParseExpress.parseExpression(this.tokens);
                }
            }
            static parseExpression(ts) {
                if (!ts) {
                    console.trace(ts);
                }
                ts.removeAll(x => x.type == Lang.TokenType.comment || x.type == Lang.TokenType.newLine);
                var token = ts.find(x => x instanceof Lang.Token && (x.type == Lang.TokenType.operator || x.type == Lang.TokenType.block));
                if (token instanceof Lang.Token) {
                    switch (token.name) {
                        case Lang.VeName.LPAREN:
                            if (ts.exists(x => x instanceof Lang.Token && x.name == Lang.VeName.ARROW)) {
                                return Lang.TokenParseExpression.parseArrowMethod(ts);
                            }
                            else {
                                var first = ts.eq(0);
                                if (first instanceof Lang.Token && first.name == Lang.VeName.LPAREN) {
                                    return new TokenParseExpress(first.childs).parse();
                                }
                                else {
                                    return Lang.TokenParseExpression.parseMethod(ts);
                                }
                            }
                        case Lang.VeName.LBRACK:
                            var first = ts.eq(0);
                            if (first instanceof Lang.Token && first.name == Lang.VeName.LBRACK) {
                                return Lang.TokenParseExpression.parseArray(ts);
                            }
                            else {
                                return Lang.TokenParseExpression.parseArrayIndex(ts);
                            }
                        case Lang.VeName.LBRACE:
                            return Lang.TokenParseExpression.parseObject(ts);
                        case Lang.VeName.COLON:
                            console.trace(ts);
                            throw ':操作符不应该出现在这里';
                        case Lang.VeName.PERIOD:
                        case Lang.VeName.NULL_PERIOD:
                            return Lang.TokenParseExpression.parsePropertyReference(ts);
                        case Lang.VeName.ELLIPSIS:
                            throw ("'...'操作符不应该出现在这里");
                        case Lang.VeName.CONDITIONAL:
                            return Lang.TokenParseExpression.parseTernaryOperator(ts);
                        case Lang.VeName.COMMA:
                            throw ("逗号不应该出现在这");
                        case Lang.VeName.NEW:
                            throw ("new不应该出现在这");
                        case Lang.VeName.ARROW:
                            return Lang.TokenParseExpression.parseArrowMethod(ts);
                        case Lang.VeName.ASSIGN:
                        case Lang.VeName.ASSIGN_ADD:
                        case Lang.VeName.ASSIGN_SUB:
                        case Lang.VeName.ASSIGN_MUL:
                        case Lang.VeName.ASSIGN_DIV:
                        case Lang.VeName.ASSIGN_MOD:
                        case Lang.VeName.ASSIGN_EXP:
                        case Lang.VeName.OR:
                        case Lang.VeName.AND:
                        case Lang.VeName.XOR:
                        case Lang.VeName.ADD:
                        case Lang.VeName.SUB:
                        case Lang.VeName.MUL:
                        case Lang.VeName.DIV:
                        case Lang.VeName.MOD:
                        case Lang.VeName.EXP:
                        case Lang.VeName.EQ:
                        case Lang.VeName.NE:
                        case Lang.VeName.GT:
                        case Lang.VeName.LTE:
                        case Lang.VeName.GTE:
                        case Lang.VeName.AS:
                        case Lang.VeName.IS:
                        case Lang.VeName.MATCH:
                        case Lang.VeName.CONTAIN:
                        case Lang.VeName.STATR:
                        case Lang.VeName.END:
                        case Lang.VeName.K_EQ:
                        case Lang.VeName.K_AND:
                        case Lang.VeName.K_OR:
                        case Lang.VeName.K_XOR:
                            return Lang.TokenParseExpression.parseBinaryExpression(ts);
                        case Lang.VeName.LT:
                            if (ts.exists(t => t instanceof Lang.Token && t.name == Lang.VeName.LPAREN)) {
                                return Lang.TokenParseExpression.parseMethod(ts);
                            }
                            else
                                return Lang.TokenParseExpression.parseBinaryExpression(ts);
                        case Lang.VeName.INC:
                        case Lang.VeName.DEC:
                        case Lang.VeName.NOT:
                            return Lang.TokenParseExpression.parseUnaryExpression(ts);
                    }
                }
                ts.removeAll(x => x.name == Lang.VeName.SEMICOLON);
                if (ts.length == 1) {
                    if (ts[0] instanceof Lang.Expression)
                        return ts[0];
                    var exp = Lang.TokenParseExpression.parseOneToken(ts);
                    return exp;
                }
                else {
                    console.trace(ts);
                    throw '表达式最终只能生成一个节点，不可能有多个节点或空节点';
                }
            }
        }
        Lang.TokenParseExpress = TokenParseExpress;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let Modifier;
        (function (Modifier) {
            Modifier[Modifier["private"] = 0] = "private";
            Modifier[Modifier["public"] = 1] = "public";
            Modifier[Modifier["const"] = 2] = "const";
            Modifier[Modifier["readonly"] = 3] = "readonly";
            Modifier[Modifier["static"] = 4] = "static";
            Modifier[Modifier["export"] = 5] = "export";
        })(Modifier = Lang.Modifier || (Lang.Modifier = {}));
        class PackageStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.package;
                this._body = new Lang.VeArray();
            }
            get body() {
                return this._body;
            }
            set body(value) {
                this._body = value;
                this.append(value);
            }
            get lastName() {
                var ns = this.name.split(".");
                return ns[ns.length - 1];
            }
            get classList() {
                if (typeof this.$classList == typeof undefined) {
                    this.$classList = this.findAll(x => x instanceof ClassOrIntrfaceStatement);
                }
                return this.$classList;
            }
            search(name, predict) {
                var c = this.classList.find(x => {
                    if (x.isName(name)) {
                        if (typeof predict == 'function' && predict(x) == false)
                            return false;
                        return true;
                    }
                });
                if (c)
                    return c;
                var p;
                this.classList.each(c => {
                    var r = c.body.find(z => {
                        if (z.isName(name)) {
                            if (typeof predict == 'function' && predict(z) == false)
                                return false;
                            return true;
                        }
                    });
                    if (r) {
                        p = r;
                        return false;
                    }
                });
                if (p) {
                    return p;
                }
                var useList = this.findAll(x => x instanceof UseStatement);
                useList.each(use => {
                    var r = use.search(name, predict);
                    if (r) {
                        p = r;
                        return false;
                    }
                });
                return p;
            }
            searchAll(name, predict) {
                var list = new Lang.VeArray;
                this.classList.each(c => {
                    if (c.isName(name)) {
                        if (typeof predict == 'function' && predict(c) == false)
                            return;
                        list.push(c);
                    }
                    else {
                        c.body.each(cc => {
                            if (typeof predict == 'function' && predict(cc) == false)
                                return;
                            if (cc.isName(name)) {
                                list.push(cc);
                            }
                        });
                    }
                });
                var useList = this.findAll(x => x instanceof UseStatement);
                useList.each(use => {
                    list.append(use.searchAll(name, predict));
                });
                return list;
            }
        }
        Lang.PackageStatement = PackageStatement;
        class UseStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.use;
            }
            search(name, predict) {
                var ns = new Lang.VeArray();
                ns.push(name);
                ns.push(this.name + "." + name);
                if (this.localName) {
                    if (name.startsWith(this.localName)) {
                        ns.push(this.name + name.substring(this.localName.length));
                    }
                }
                if (this.program) {
                    return this.program.find(x => {
                        if (x instanceof ClassOrIntrfaceStatement || x instanceof ClassProperty) {
                            if (ns.exists(n => x.isName(n))) {
                                if (typeof predict == 'function' && predict(x) == false)
                                    return false;
                                return true;
                            }
                        }
                    });
                }
            }
            searchAll(name, predict) {
                var ns = new Lang.VeArray();
                ns.push(name);
                ns.push(this.name + "." + name);
                if (this.localName) {
                    if (name.startsWith(this.localName)) {
                        ns.push(this.name + name.substring(this.localName.length));
                    }
                }
                if (this.program) {
                    return this.program.findAll(x => {
                        if (x instanceof ClassOrIntrfaceStatement || x instanceof ClassProperty) {
                            if (ns.exists(n => x.isName(n))) {
                                if (typeof predict == 'function' && predict(x) == false)
                                    return false;
                                return true;
                            }
                        }
                    });
                }
            }
        }
        Lang.UseStatement = UseStatement;
        class EnumStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.enum;
                this.modifiers = new Lang.VeArray(Modifier.private);
                this.options = new Lang.VeArray();
            }
            get package() {
                var s = this.closest(x => x.type == Lang.StatementType.package);
                return s;
            }
        }
        Lang.EnumStatement = EnumStatement;
        class ClassOrIntrfaceStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.class;
                this.modifiers = new Lang.VeArray(Modifier.private);
                this.attributes = new Lang.VeArray();
                this.generics = new Lang.VeArray();
                this._body = new Lang.VeArray();
            }
            get body() {
                return this._body;
            }
            set body(value) {
                this._body = value;
                this.append(value);
            }
            get package() {
                var s = this.closest(x => x.type == Lang.StatementType.package);
                return s;
            }
            get nicks() {
                var list = new Lang.VeArray;
                var ns = this.attributes.findAll(x => x.name == 'nick');
                if (ns.length > 0) {
                    ns.each(n => {
                        var af = n.args.first();
                        if (af) {
                            list.push(af.value.value);
                        }
                    });
                }
                return list;
            }
            isName(name) {
                if (name == this.name)
                    return true;
                if (this.package.name + "." + this.name == name)
                    return true;
                return this.nicks.exists(nick => {
                    if (nick == name)
                        return true;
                    else if (this.package.name + "." + nick == name)
                        return true;
                });
            }
            get fullName() {
                return this.package.name + "." + this.name;
            }
        }
        Lang.ClassOrIntrfaceStatement = ClassOrIntrfaceStatement;
        let ClassPropertyKind;
        (function (ClassPropertyKind) {
            ClassPropertyKind[ClassPropertyKind["method"] = 0] = "method";
            ClassPropertyKind[ClassPropertyKind["prop"] = 1] = "prop";
            ClassPropertyKind[ClassPropertyKind["field"] = 2] = "field";
        })(ClassPropertyKind = Lang.ClassPropertyKind || (Lang.ClassPropertyKind = {}));
        class ClassContext extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.context;
            }
        }
        Lang.ClassContext = ClassContext;
        class ClassProperty extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.classProperty;
                this.modifiers = new Lang.VeArray(Modifier.private);
                this.generics = new Lang.VeArray();
                this.attributes = new Lang.VeArray();
                this.args = new Lang.VeArray();
                this._get = new Lang.VeArray();
                this._set = new Lang.VeArray();
                this._body_1 = new Lang.VeArray();
            }
            get get() {
                return this._get;
            }
            set get(value) {
                this._get = value;
                this.append(value);
            }
            get set() {
                return this._set;
            }
            set set(value) {
                this._set = value;
                this.append(value);
            }
            get body() {
                return this._body_1;
            }
            set body(value) {
                this._body_1 = value;
                this.append(value);
            }
            get class() {
                return this.closest(x => x instanceof ClassOrIntrfaceStatement);
            }
            get isStatic() {
                return this.modifiers.exists(Modifier.static);
            }
            get isPublic() {
                return this.modifiers.exists(x => x != Modifier.private);
            }
            get isPrivate() {
                return this.modifiers.exists(x => x == Modifier.private);
            }
            get isCtor() {
                return this.name == 'new';
            }
            isName(name) {
                if (name.endsWith(this.name)) {
                    var ns = name.substring(0, name.length - this.name.length);
                    if (ns.endsWith("."))
                        ns = ns.substring(0, ns.length - 1);
                    return this.class.isName(ns);
                }
            }
            get fullName() {
                return this.class.fullName + "." + this.name;
            }
            get unqiueName() {
                var list = new Lang.VeArray;
                var unqiue = this.attributes.find(x => x.name == 'unqiue');
                if (unqiue) {
                    return this.class.fullName + "." + unqiue;
                }
                else {
                    var index = this.class.body.findIndex(this);
                    var len = this.class.body.findAll((x, i) => x.name == this.name && i < index).length;
                    return this.class.fullName + "." + this.name + (len == 0 ? "" : "_" + len);
                }
            }
        }
        Lang.ClassProperty = ClassProperty;
        class FunStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.modifiers = new Lang.VeArray(Modifier.private);
                this.generics = new Lang.VeArray();
                this.args = new Lang.VeArray();
                this.type = Lang.StatementType.fun;
                this._body = new Lang.VeArray();
            }
            get body() {
                return this._body;
            }
            set body(value) {
                this._body = value;
                this.append(value);
            }
            get package() {
                if (this.parent && this.parent.type == Lang.StatementType.package) {
                    return this.parent;
                }
                return null;
            }
        }
        Lang.FunStatement = FunStatement;
        class DeclareVariable extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.declareVariable;
            }
            get value() {
                return this._value;
            }
            set value(value) {
                this._value = value;
                this.append(value);
            }
        }
        Lang.DeclareVariable = DeclareVariable;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class TokenStatementParserDeclaration {
            parsePackageStatement() {
                var ns = this.match(Lang.ParserRegex.package);
                if (ns && ns.length > 0) {
                    var statement = new Lang.PackageStatement(this.parent);
                    var names = ns.range(1, ns.findIndex(x => x.name == Lang.VeName.LBRACE) - 1);
                    statement.name = names.map(x => x.value).join("");
                    statement.body = new Lang.TokenStatementParser(ns.find(x => x.name == Lang.VeName.LBRACE), statement).parse();
                    return statement;
                }
            }
            parseUseStatement() {
                var ns = this.match(Lang.ParserRegex.use);
                if (ns && ns.length > 0) {
                    var statement = new Lang.UseStatement(this.parent);
                    statement.name = ns.range(1, ns.findIndex(x => x.name == Lang.VeName.ASSIGN || x.name == Lang.VeName.SEMICOLON, ns.length) - 1).map(x => x.value).join("");
                    if (ns.exists(x => x.name == Lang.VeName.ASSIGN)) {
                        var lastIndex = ns.findIndex(x => x.name == Lang.VeName.SEMICOLON, ns.length) - 1;
                        var startIndex = ns.findIndex(x => x.name == Lang.VeName.ASSIGN) + 1;
                        statement.localName = ns.range(startIndex, lastIndex).map(x => x.value).join("");
                    }
                    return statement;
                }
            }
            parseEnumStatement() {
                var ns = this.match(Lang.ParserRegex.enum);
                if (ns && ns.length > 0) {
                    var statement = new Lang.EnumStatement(this.parent);
                    statement.modifiers = ns.range(0, ns.findIndex(x => x.name == Lang.VeName.ENUM) - 1).map(x => Lang.Modifier[x.value]);
                    statement.name = ns.range(ns.findIndex(x => x.name == Lang.VeName.ENUM) + 1, ns.findIndex(x => x.name == Lang.VeName.LBRACE)).eq(0).value;
                    statement.options = Lang.TokenParseData.parseEnumOptions(ns.find(x => x.name == Lang.VeName.LBRACE).childs);
                    return statement;
                }
            }
            $parseAttribute(token, parent) {
                var childs = token.childs;
                var ca = { args: new Lang.VeArray };
                ca.name = childs.range(0, childs.findIndex(x => x.name == Lang.VeName.LPAREN, childs.length) - 1).map(x => x.value).join("");
                if (childs.exists(x => x.name == Lang.VeName.LPAREN)) {
                    var tokens = childs.find(x => x.name == Lang.VeName.LPAREN);
                    tokens.childs.split(x => x.name == Lang.VeName.COMMA).each(ts => {
                        if (ts.exists(z => z.name == Lang.VeName.ASSIGN)) {
                            var key = ts.first().value;
                            var index = ts.findIndex(z => z.name == Lang.VeName.ASSIGN);
                            var value = Lang.TokenParseExpression.parseOneToken(ts.findAll((z, i) => i > index));
                            ca.args.push({ key, value });
                        }
                        else {
                            var value = Lang.TokenParseExpression.parseOneToken(ts);
                            ca.args.push({ value });
                        }
                    });
                }
                return ca;
            }
            $parseGeneric(token, parent) {
                var ts = token.childs.split(x => x.name == Lang.VeName.COMMA);
                return ts.map(x => {
                    var cg = {};
                    cg.key = x.eq(0).value;
                    return cg;
                });
            }
            parseClassOrInterfaceStatement() {
                var ns = this.match(Lang.ParserRegex.classOrInterface);
                if (ns && ns.length > 0) {
                    var statement = new Lang.ClassOrIntrfaceStatement(this.parent);
                    if (ns.exists(x => x.value == 'class'))
                        statement.type = Lang.StatementType.class;
                    else {
                        statement.type = Lang.StatementType.interface;
                    }
                    if (ns.exists(x => x.name == Lang.VeName.LBRACK)) {
                        statement.attributes = ns.findAll(x => x.name == Lang.VeName.LBRACK).map(x => this.$parseAttribute(x, statement));
                    }
                    ns.removeAll(x => x.name == Lang.VeName.LBRACK || x.name == Lang.VeName.RBRACK);
                    statement.name = ns.eq(ns.findIndex(x => x.name == Lang.VeName.CLASS || x.name == Lang.VeName.INTERFACE) + 1).value;
                    statement.modifiers = ns.range(0, ns.findIndex(x => x.name == Lang.VeName.CLASS || x.name == Lang.VeName.INTERFACE) - 1).map(x => Lang.Modifier[x.value]);
                    statement.type = ns.exists(x => x.name == Lang.VeName.CLASS) ? Lang.StatementType.class : Lang.StatementType.interface;
                    if (ns.exists(x => x.name == Lang.VeName.LT))
                        statement.generics = this.$parseGeneric(ns.find(x => x.name == Lang.VeName.LT), statement);
                    if (ns.exists(x => x.name == Lang.VeName.EXTENDS)) {
                        statement.extendName = ns.range(ns.findIndex(x => x.name == Lang.VeName.EXTENDS) + 1, ns.findIndex(x => x.name == Lang.VeName.LBRACE) - 1).map(x => x.value).join("");
                    }
                    try {
                        var st = new Lang.TokenStatementParser(ns.find(x => x.name == Lang.VeName.LBRACE), statement).parse();
                        statement.body = st;
                    }
                    catch (e) {
                        console.log(statement);
                        throw e;
                    }
                    return statement;
                }
            }
            parseMethodStatement(ignoreClass) {
                if (ignoreClass == true || (this.parent && (this.parent.type == Lang.StatementType.class || this.parent.type == Lang.StatementType.interface))) {
                    var reg = Lang.ParserRegex.classMethod;
                    if (this.parent.type == Lang.StatementType.interface)
                        reg = Lang.ParserRegex.interfaceMethod;
                    var ns = this.match(reg);
                    if (ns && ns.length > 0) {
                        var statement = new Lang.ClassProperty(this.parent);
                        statement.kind = Lang.ClassPropertyKind.method;
                        if (this.parent.type == Lang.StatementType.interface)
                            statement.isInterface = true;
                        if (ns.exists(x => x.name == Lang.VeName.LBRACK)) {
                            statement.attributes = ns.findAll(x => x.name == Lang.VeName.LBRACK).map(x => this.$parseAttribute(x, statement));
                            ns.removeAll(x => x.name == Lang.VeName.LBRACK || x.name == Lang.VeName.RBRACK);
                        }
                        statement.modifiers = ns.range(0, ns.findIndex(x => x.type == Lang.TokenType.word) - 1).map(x => Lang.Modifier[x.value]);
                        statement.name = ns.find(x => x.type == Lang.TokenType.word || x.value == 'new').value;
                        if (ns.exists(x => x.name == Lang.VeName.LT))
                            statement.generics = this.$parseGeneric(ns.find(x => x.name == Lang.VeName.LT), statement);
                        statement.args = Lang.TokenParseData.parseParameter(ns.find(x => x.name == Lang.VeName.LPAREN).childs);
                        if (ns.exists(x => x.name == Lang.VeName.COLON)) {
                            var nsTs = ns.range(ns.findIndex(x => x.name == Lang.VeName.COLON) + 1, ns.findLastIndex(x => x.name == Lang.VeName.LBRACE, ns.length - 1) - 1);
                            statement.returnType = Lang.TokenParseData.parseType(nsTs);
                        }
                        var bodyToken = ns.findLast(x => x.name == Lang.VeName.LBRACE);
                        if (bodyToken) {
                            statement.body = new Lang.TokenStatementParser(ns.findLast(x => x.name == Lang.VeName.LBRACE).childs, statement).parse();
                            statement.isInterface = false;
                        }
                        return statement;
                    }
                }
                return null;
            }
            parsePropertyStatement(ignoreClass) {
                if (ignoreClass == true || (this.parent && (this.parent.type == Lang.StatementType.class || this.parent.type == Lang.StatementType.interface))) {
                    var ns = this.match(Lang.ParserRegex.classProperty);
                    if (ns && ns.length > 0) {
                        var statement = new Lang.ClassProperty(this.parent);
                        statement.kind = Lang.ClassPropertyKind.prop;
                        if (ns.exists(x => x.name == Lang.VeName.LBRACK)) {
                            statement.attributes = ns.findAll(x => x.name == Lang.VeName.LBRACK).map(x => this.$parseAttribute(x, statement));
                            ns.removeAll(x => x.name == Lang.VeName.LBRACK || x.name == Lang.VeName.RBRACK);
                        }
                        statement.modifiers = ns.range(0, ns.findIndex(x => x.type == Lang.TokenType.word) - 1).map(x => Lang.Modifier[x.value]);
                        statement.name = ns.find(x => x.type == Lang.TokenType.word).value;
                        if (ns.exists(x => x.name == Lang.VeName.COLON)) {
                            var nsTs = ns.range(ns.findIndex(x => x.name == Lang.VeName.COLON) + 1, ns.findIndex(x => x.name == Lang.VeName.ASSIGN || x.name == Lang.VeName.SEMICOLON, ns.length) - 1);
                            statement.propType = Lang.TokenParseData.parseType(nsTs);
                        }
                        if (ns.exists(x => x.name == Lang.VeName.ASSIGN))
                            statement.value = new Lang.TokenParseExpress(ns.range(ns.findIndex(x => x.name == Lang.VeName.ASSIGN) + 1, ns.findIndex(x => x.name == Lang.VeName.SEMICOLON, ns.length) - 1), statement).parse();
                        return statement;
                    }
                }
                return null;
            }
            parseFieldStatement(ignoreClass) {
                if (ignoreClass == true || (this.parent && (this.parent.type == Lang.StatementType.class || this.parent.type == Lang.StatementType.interface))) {
                    var ns = this.match(Lang.ParserRegex.classField);
                    if (ns && ns.length > 0) {
                        var statement = new Lang.ClassProperty(this.parent);
                        statement.kind = Lang.ClassPropertyKind.field;
                        if (ns.exists(x => x.name == Lang.VeName.LBRACK)) {
                            statement.attributes = ns.findAll(x => x.name == Lang.VeName.LBRACK).map(x => this.$parseAttribute(x, statement));
                            ns.removeAll(x => x.name == Lang.VeName.LBRACK || x.name == Lang.VeName.RBRACK);
                        }
                        statement.modifiers = ns.range(0, ns.findIndex(x => x.type == Lang.TokenType.word) - 1).map(x => Lang.Modifier[x.value]);
                        statement.name = ns.find(x => x.type == Lang.TokenType.word).value;
                        if (ns.exists(x => x.name == Lang.VeName.COLON)) {
                            var rangeTs = ns.range(ns.findIndex(x => x.name == Lang.VeName.COLON) + 1, ns.findIndex(x => x.name == Lang.VeName.LBRACE) - 1);
                            statement.propType = Lang.TokenParseData.parseType(rangeTs);
                        }
                        var b = ns.find(x => x.name == Lang.VeName.LBRACE);
                        if (b.childs.exists(x => x.name == Lang.VeName.GET)) {
                            statement.get = new Lang.TokenStatementParser(b.childs.eq(b.childs.findIndex(x => x.name == Lang.VeName.GET) + 1), statement).parse();
                        }
                        else if (b.childs.exists(x => x.name == Lang.VeName.SET)) {
                            statement.set = new Lang.TokenStatementParser(b.childs.eq(b.childs.findIndex(x => x.name == Lang.VeName.SET) + 1), statement).parse();
                        }
                        return statement;
                    }
                }
                return null;
            }
            parseFunStatement() {
                if (this.parent && (this.parent.type == Lang.StatementType.class || this.parent.type == Lang.StatementType.interface || this.parent.type == Lang.StatementType.enum))
                    return null;
                var ns = this.match(Lang.ParserRegex.fun);
                if (ns && ns.length > 0) {
                    var statement = new Lang.FunStatement(this.parent);
                    statement.modifiers = ns.range(0, ns.findIndex(x => x.name == Lang.VeName.FUN) - 1).map(x => Lang.Modifier[x.value]);
                    statement.name = ns.find(x => x.type == Lang.TokenType.word).value;
                    if (ns.exists(x => x.name == Lang.VeName.LT))
                        statement.generics = this.$parseGeneric(ns.find(x => x.name == Lang.VeName.LT), statement);
                    statement.args = Lang.TokenParseData.parseParameter(ns.find(x => x.name == Lang.VeName.LPAREN).childs);
                    if (ns.exists(x => x.name == Lang.VeName.COLON)) {
                        var returnTs = ns.range(ns.findIndex(x => x.name == Lang.VeName.COLON), ns.findLastIndex(x => x.name == Lang.VeName.LBRACE, ns.length - 1) - 1);
                        statement.returnType = Lang.TokenParseData.parseType(returnTs);
                    }
                    if (ns.exists(x => x.name == Lang.VeName.LBRACE))
                        statement.body = new Lang.TokenStatementParser(ns.find(x => x.name == Lang.VeName.LBRACE).childs, statement).parse();
                    return statement;
                }
                return null;
            }
            parseVariableStatement() {
                var ns = this.match(Lang.ParserRegex.variable);
                if (ns && ns.length > 0) {
                    var isConst = ns.exists(x => x.name == Lang.VeName.CONST);
                    ns.removeAll(x => x.name == Lang.VeName.DEF || x.name == Lang.VeName.CONST || x.name == Lang.VeName.SEMICOLON);
                    var exps = new Lang.VeArray();
                    ns.split(x => x.name == Lang.VeName.COMMA).each(nr => {
                        var variable = new Lang.DeclareVariable();
                        variable.name = nr.eq(0).value;
                        variable.isReadonly = isConst ? true : false;
                        if (nr.length > 1) {
                            if (nr.eq(1).name == Lang.VeName.COLON) {
                                var rs = nr.range(2, nr.findIndex(x => x.name == Lang.VeName.ASSIGN, nr.length) - 1);
                                variable.variableType = Lang.TokenParseData.parseType(rs);
                            }
                            if (nr.exists(x => x.name == Lang.VeName.ASSIGN)) {
                                var rs = nr.range(nr.findIndex(x => x.name == Lang.VeName.ASSIGN) + 1, nr.length);
                                variable.value = new Lang.TokenParseExpress(rs, variable).parse();
                            }
                        }
                        exps.push(variable);
                    });
                    return exps;
                }
            }
            parseExpression() {
                var ns = this.match(Lang.ParserRegex.statement);
                if (ns && ns.length > 0) {
                    return new Lang.TokenParseExpress(ns, this.parent).parse();
                }
            }
        }
        Lang.TokenStatementParserDeclaration = TokenStatementParserDeclaration;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class TokenStatementParserStatement {
            parseIf() {
                var ns = this.match(Lang.ParserRegex.if);
                if (Lang.VeArray.isVeArray(ns) && ns.length > 0) {
                    var ifStatement = new Lang.IfStatement();
                    ifStatement.parent = this.parent;
                    ifStatement.ifCondition = new Lang.TokenParseExpress(ns.eq(1).childs, ifStatement).parse();
                    if (ns.eq(3).type == Lang.TokenType.block) {
                        ifStatement.ifStatement = new Lang.TokenStatementParser(ns.eq(3).childs, ifStatement).parse();
                    }
                    else {
                        ns.removeAll((item, i) => i <= 2);
                        var exp = new Lang.TokenParseExpress(ns, ifStatement).parse();
                        if (exp)
                            ifStatement.ifStatement = new Lang.VeArray(exp);
                    }
                    while (true) {
                        var thenNs = this.match(Lang.ParserRegex.else_if);
                        if (Lang.VeArray.isVeArray(thenNs) && thenNs.length > 0) {
                            var thenCondition = new Lang.TokenParseExpress(thenNs.eq(2).childs, ifStatement).parse();
                            var thenStatement = new Lang.VeArray();
                            if (thenNs.eq(4).type == Lang.TokenType.block) {
                                thenStatement = new Lang.TokenStatementParser(thenNs.eq(4).childs, ifStatement).parse();
                            }
                            else {
                                thenNs.removeAll((item, i) => i <= 3);
                                var thenExp = new Lang.TokenParseExpress(thenNs, ifStatement).parse();
                                if (thenExp)
                                    thenStatement = new Lang.VeArray(thenExp);
                            }
                            ifStatement.appendThen(thenCondition, thenStatement);
                        }
                        else {
                            break;
                        }
                    }
                    var elseNs = this.match(Lang.ParserRegex.else);
                    if (Lang.VeArray.isVeArray(elseNs) && elseNs.length > 0) {
                        if (elseNs.eq(1).type == Lang.TokenType.block) {
                            ifStatement.elseStatement = new Lang.TokenStatementParser(elseNs.eq(1).childs, ifStatement).parse();
                        }
                        else {
                            elseNs.removeAll((item, i) => i <= 0);
                            var exp = new Lang.TokenParseExpress(elseNs, ifStatement).parse();
                            if (exp)
                                ifStatement.elseStatement = new Lang.VeArray(exp);
                        }
                    }
                    return ifStatement;
                }
            }
            parseWhile() {
                var ns = this.match(Lang.ParserRegex.while);
                if (ns && ns.length > 0) {
                    var whileStatement = new Lang.WhileStatement(this.parent);
                    whileStatement.condition = new Lang.TokenParseExpress(ns.eq(1), whileStatement).parse();
                    if (ns.eq(3).type == Lang.TokenType.block) {
                        whileStatement.body = new Lang.TokenStatementParser(ns.eq(3).childs, whileStatement).parse();
                    }
                    else {
                        ns.removeAll((item, i) => i <= 2);
                        whileStatement.body = new Lang.TokenStatementParser(ns, whileStatement).parse();
                    }
                    return whileStatement;
                }
            }
            parseDoWhile() {
                var ns = this.match(Lang.ParserRegex.do_while);
                if (ns && ns.length > 0) {
                    var whileStatement = new Lang.DoWhileStatement(this.parent);
                    var whileIndex = ns.findIndex(x => x.type == Lang.TokenType.keyWord && x.name == Lang.VeName.WHILE);
                    whileStatement.condition = new Lang.TokenParseExpress(ns.eq(whileIndex + 1), whileStatement).parse();
                    ns.removeAll((x, i) => i >= whileIndex);
                    if (ns.eq(1).type == Lang.TokenType.block) {
                        whileStatement.body = new Lang.TokenStatementParser(ns.eq(1), whileStatement).parse();
                    }
                    else {
                        ns.removeAll((item, i) => i <= 1);
                        whileStatement.body = new Lang.TokenStatementParser(ns, whileStatement).parse();
                    }
                    return whileStatement;
                }
            }
            parseFor() {
                var ns = this.match(Lang.ParserRegex.for);
                if (ns && ns.length > 0) {
                    var forStatement = new Lang.ForStatement();
                    forStatement.parent = this.parent;
                    var ses = new Lang.TokenStatementParser(ns.eq(1), forStatement).parse();
                    if (ses.length == 3) {
                        forStatement.initStatement = ses.eq(0);
                        forStatement.condition = ses.eq(1);
                        forStatement.nextStatement = ses.eq(2);
                    }
                    else {
                        throw 'for format error....';
                    }
                    if (ns.eq(3).type == Lang.TokenType.block) {
                        forStatement.body = new Lang.TokenStatementParser(ns.eq(3), forStatement).parse();
                    }
                    else {
                        ns.removeAll((item, i) => i <= 2);
                        var exp = new Lang.TokenParseExpress(ns, forStatement).parse();
                        if (exp)
                            forStatement.body = new Lang.VeArray(exp);
                    }
                    return forStatement;
                }
            }
            parseTry() {
                var ns = this.match(Lang.ParserRegex.try);
                if (ns && ns.length > 0) {
                    var tryStatement = new Lang.TryStatement(this.parent);
                    tryStatement.tryStatement = new Lang.TokenStatementParser(ns.eq(1).childs, tryStatement).parse();
                    if (ns.exists(x => x.name == Lang.VeName.CATCH)) {
                        var c = ns.findIndex(x => x.name == Lang.VeName.CATCH);
                        tryStatement.catchParameter = Lang.TokenParseData.parseParameter(ns.eq(c + 1).childs);
                        tryStatement.catchStatement = new Lang.TokenStatementParser(ns.eq(c + 2).childs, tryStatement).parse();
                    }
                    if (ns.exists(x => x.name == Lang.VeName.FINALLY)) {
                        tryStatement.finallyStatement = new Lang.TokenStatementParser(ns.findSkip(x => x.name == Lang.VeName.FINALLY, 1).childs, tryStatement).parse();
                    }
                    return tryStatement;
                }
            }
            parseSwitch() {
                var ns = this.match(Lang.ParserRegex.switch);
                if (ns && ns.length > 0) {
                    var swStatement = new Lang.SwitchStatement();
                    swStatement.parent = this.parent;
                    swStatement.valueExpression = new Lang.TokenParseExpress(ns.eq(1).childs, this.parent).parse();
                    var bs = ns.eq(3).childs;
                    if (bs.length > 0) {
                        if (bs instanceof Lang.VeArray) {
                            var index = 0;
                            while (true) {
                                if (index >= bs.length)
                                    break;
                                var ma = bs.match(Lang.ParserRegex.case, this.getFlag, index);
                                if (ma && ma.length > 0) {
                                    index += ma.length;
                                    var caseIndex = ma.findIndex(x => x.name == Lang.VeName.COLON);
                                    if (ma.eq(0).name == Lang.VeName.CASE) {
                                        var valueExpression = new Lang.TokenParseExpress(ma.range(1, caseIndex - 1), swStatement).parse();
                                        var matchStatement = new Lang.TokenStatementParser(ma.range(caseIndex + 1, ma.length), swStatement).parse();
                                        swStatement.appendCaseStatement(valueExpression, matchStatement);
                                    }
                                    else if (ma.eq(0).name == Lang.VeName.DEFAULT) {
                                        swStatement.defaultStatement = new Lang.TokenStatementParser(ma.range(caseIndex + 1, ma.length), swStatement).parse();
                                    }
                                }
                                else {
                                    break;
                                }
                            }
                        }
                    }
                    return swStatement;
                }
            }
            parseReturn() {
                var ns = this.match(Lang.ParserRegex.return);
                if (ns && ns.length > 0) {
                    var returnStatement = new Lang.ReturnStatement();
                    returnStatement.parent = this.parent;
                    ns.removeAll((x, i) => i == 0 || x.name == Lang.VeName.SEMICOLON);
                    if (ns.length == 0) {
                        throw 'return error;not found return value....';
                    }
                    returnStatement.expression = new Lang.TokenParseExpress(ns, returnStatement).parse();
                    return returnStatement;
                }
            }
            parseThrow() {
                var ns = this.match(Lang.ParserRegex.throw);
                if (ns && ns.length > 0) {
                    var throwStatement = new Lang.ThrowStatement();
                    throwStatement.parent = this.parent;
                    ns.removeAll((x, i) => i == 0 || x.name == Lang.VeName.SEMICOLON);
                    if (ns.length == 0) {
                        throw 'throw error;not found throw value....';
                    }
                    throwStatement.expression = new Lang.TokenParseExpress(ns, throwStatement).parse();
                    return throwStatement;
                }
            }
            parseBreak() {
                var ns = this.match(Lang.ParserRegex.break);
                if (ns && ns.length > 0) {
                    return new Lang.BreakStatement();
                }
            }
            parseContinue() {
                var ns = this.match(Lang.ParserRegex.return);
                if (ns && ns.length > 0) {
                    return new Lang.ContinueStatement();
                }
            }
            parseEmptyStatement() {
                var ns = this.match(Lang.ParserRegex.emptyStatement);
                if (ns && ns.length > 0) {
                    return null;
                }
                return null;
            }
        }
        Lang.TokenStatementParserStatement = TokenStatementParserStatement;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class TokenStatementParser {
            constructor(token, parent) {
                this.index = 0;
                if (!token) {
                    return;
                }
                if (token instanceof Lang.Token) {
                    this.tokens = token.childs.copy();
                }
                else if (token instanceof Lang.VeArray)
                    this.tokens = token.copy();
                if (!this.tokens)
                    console.trace(token);
                if (typeof parent != typeof undefined)
                    this.parent = parent;
                this.preteatment();
            }
            preteatment() {
                this.tokens.removeAll(x => x.type == Lang.TokenType.comment || x.type == Lang.TokenType.newLine);
                for (var i = this.tokens.length - 1; i >= 0; i--) {
                    var token = this.tokens.eq(i);
                    if (token.type == Lang.TokenType.block && token.name == Lang.VeName.STRING_LBRACE) {
                        var tokenClose = this.tokens.eq(i + 1);
                        var blockToken = new Lang.Token(Lang.TokenType.block, { value: "(", name: Lang.VeName.LPAREN, col: token.col, size: 1, row: token.row });
                        token.childs.each(t => blockToken.append(t));
                        var blockCloseToken = new Lang.Token(Lang.TokenType.closeBlock, { name: Lang.VeName.RPAREN, value: ")", col: tokenClose.col, size: 1, row: tokenClose.row });
                        this.tokens.splice(i, 2, new Lang.Token(Lang.TokenType.operator, { value: "+", name: Lang.VeName.ADD }), blockToken, blockCloseToken, new Lang.Token(Lang.TokenType.operator, { value: "+", name: Lang.VeName.ADD }));
                    }
                }
                var ns = new Lang.VeArray();
                var i = 0;
                for (i; i < this.tokens.length; i++) {
                    var token = this.tokens.eq(i);
                    if (token.type == Lang.TokenType.string) {
                        if (this.tokens.eq(i + 1) && this.tokens.eq(i + 1).type == Lang.TokenType.string) {
                            var text = token.value;
                            var n = 1;
                            while (true) {
                                var t = this.tokens.eq(i + n);
                                if (t.type == Lang.TokenType.string) {
                                    text += t.value;
                                    n += 1;
                                }
                                else
                                    break;
                            }
                            ns.push(new Lang.Token(Lang.TokenType.string, { value: text, row: token.row, col: token.col, size: text.length }));
                            i += n;
                            continue;
                        }
                        else
                            ns.push(token);
                    }
                    else
                        ns.push(token);
                }
                this.tokens = ns;
            }
            get current() {
                return this.tokens.eq(this.index);
            }
            next(predicate) {
                if (typeof predicate == typeof undefined) {
                    return this.tokens.eq(this.index + 1);
                }
                else if (typeof predicate == 'number') {
                    return this.tokens.eq(this.index + predicate);
                }
                else {
                    return this.nextAll().find(predicate);
                }
            }
            findIndex(predicate) {
                return this.tokens.findIndex(predicate);
            }
            eq(at) {
                return this.tokens.eq(at);
            }
            nextAll() {
                return this.tokens.map((x, i) => {
                    if (i >= this.index) {
                        return x;
                    }
                    else
                        return undefined;
                });
            }
            match(pattern, getFlag, ignoreSkip) {
                var nextAll = this.nextAll();
                if (typeof getFlag == typeof undefined)
                    getFlag = this.getFlag;
                var nextFlags = nextAll.map(x => getFlag(x)).join("");
                if (typeof pattern == 'string')
                    pattern = new RegExp(pattern);
                var match = nextFlags.match(pattern);
                if (match && match.index == 0) {
                    var matchText = match[0];
                    var ns = new Lang.VeArray();
                    var nt = '';
                    for (var i = 0; i < nextAll.length; i++) {
                        nt += getFlag(nextAll.eq(i));
                        ns.push(nextAll.eq(i));
                        if (nt == matchText) {
                            break;
                        }
                    }
                    if (ignoreSkip != true)
                        this.index += ns.length;
                    return ns;
                }
            }
            get eol() {
                return this.index >= this.tokens.length;
            }
            rest() {
                return this.tokens.range(this.index, this.tokens.length);
            }
            skip(pos) {
                if (typeof pos == typeof undefined) {
                    pos = 1;
                }
                this.index += 1;
            }
            skipToEnd() {
                this.index = this.tokens.length;
            }
            backUp(pos) {
                if (typeof pos == typeof undefined)
                    pos = 1;
                this.index -= pos;
            }
            getFlagText() {
                return this.nextAll().map(x => {
                    var f = this.getFlag(x);
                    return f;
                }).join("");
            }
            getNextValue() {
                return this.nextAll().map(x => x.value).join("");
            }
            getFlag(token) {
                if (!token) {
                    console.trace(token);
                    return '';
                }
                if (!(token instanceof Lang.Token))
                    return 'nt';
                if (token.type == Lang.TokenType.keyWord) {
                    return Lang.VeSyntax.get(token.name, Lang.language.en).string;
                }
                else if (token.type == Lang.TokenType.operator) {
                    return Lang.VeSyntax.get(token.name, Lang.language.en).string;
                }
                else if (token.type == Lang.TokenType.block) {
                    return Lang.VeSyntax.get(token.name, Lang.language.en).string;
                }
                else if (token.type == Lang.TokenType.closeBlock) {
                    return Lang.VeSyntax.get(token.name, Lang.language.en).string;
                }
                else if (token.type == Lang.TokenType.bool)
                    return Lang.TokenType[Lang.TokenType.word];
                else if (token.type == Lang.TokenType.string)
                    return Lang.TokenType[Lang.TokenType.word];
                else if (token.type == Lang.TokenType.null)
                    return Lang.TokenType[Lang.TokenType.word];
                else if (token.type == Lang.TokenType.number)
                    return Lang.TokenType[Lang.TokenType.word];
                else if (token.type == Lang.TokenType.word)
                    return Lang.TokenType[Lang.TokenType.word];
                else if (token.type == Lang.TokenType.unit)
                    return Lang.TokenType[Lang.TokenType.word];
                else if (token.type == Lang.TokenType.program)
                    return Lang.TokenType[Lang.TokenType.program];
            }
            getNextFlag() {
                var nextAll = this.nextAll();
                var nextFlags = nextAll.map(x => this.getFlag(x)).join("");
                return nextFlags;
            }
            parse() {
                var ve = new Lang.VeArray();
                var t = new Date();
                while (!this.eol) {
                    var flagText = this.getNextFlag();
                    var statement = null;
                    if (!statement)
                        statement = this.parseEmptyStatement();
                    if (!statement)
                        statement = this.parsePackageStatement();
                    if (!statement)
                        statement = this.parseUseStatement();
                    if (!statement)
                        statement = this.parseClassOrInterfaceStatement();
                    if (!statement)
                        statement = this.parseEnumStatement();
                    if (!statement)
                        statement = this.parseMethodStatement();
                    if (!statement)
                        statement = this.parseFieldStatement();
                    if (!statement)
                        statement = this.parsePropertyStatement();
                    if (!statement)
                        statement = this.parseVariableStatement();
                    if (!statement)
                        statement = this.parseFunStatement();
                    if (!statement)
                        statement = this.parseIf();
                    if (!statement)
                        statement = this.parseDoWhile();
                    if (!statement)
                        statement = this.parseWhile();
                    if (!statement)
                        statement = this.parseFor();
                    if (!statement)
                        statement = this.parseSwitch();
                    if (!statement)
                        statement = this.parseTry();
                    if (!statement)
                        statement = this.parseReturn();
                    if (!statement)
                        statement = this.parseThrow();
                    if (!statement)
                        statement = this.parseBreak();
                    if (!statement)
                        statement = this.parseContinue();
                    if (!statement)
                        statement = this.parseExpression();
                    if (statement)
                        ve.append(statement);
                    if (new Date().getTime() - t.getTime() > 2e3) {
                        console.trace('over timer....');
                        throw 'over time....';
                    }
                }
                return ve;
            }
            parseAndSave() {
                var r = this.parse();
                this.parent.append(r);
            }
        }
        Lang.TokenStatementParser = TokenStatementParser;
        Lang.applyMixins(TokenStatementParser, Lang.TokenStatementParserDeclaration);
        Lang.applyMixins(TokenStatementParser, Lang.TokenStatementParserStatement);
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class IfStatement extends Lang.Statement {
            constructor() {
                super();
                this.thenConditions = new Lang.VeArray;
                this.thenStatements = new Lang.VeArray();
                this.type = Lang.StatementType.if;
            }
            get ifCondition() {
                return this.$ifCondition;
            }
            set ifCondition(val) {
                this.$ifCondition = val;
                this.append(this.$ifCondition);
            }
            get ifStatement() {
                return this.$ifStatement;
            }
            set ifStatement(val) {
                this.$ifStatement = val;
                this.append(this.$ifStatement);
            }
            get elseStatement() {
                return this.$elseStatement;
            }
            set elseStatement(val) {
                this.$elseStatement = val;
                this.append(this.$elseStatement);
            }
            appendThen(exp, statement) {
                this.append(exp);
                this.append(statement);
                this.thenConditions.push(exp);
                this.thenStatements.push(statement);
            }
        }
        Lang.IfStatement = IfStatement;
        class ForStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this._body = new Lang.VeArray();
                this.type = Lang.StatementType.for;
            }
            get condition() {
                return this.$condition;
            }
            set condition(val) {
                this.$condition = val;
                this.append(this.$condition);
            }
            get nextStatement() {
                return this.$nextStatement;
            }
            set nextStatement(val) {
                this.$nextStatement = val;
                this.append(this.$nextStatement);
            }
            get initStatement() {
                return this.$initStatement;
            }
            set initStatement(val) {
                this.$initStatement = val;
                this.append(this.$initStatement);
            }
            get body() {
                return this._body;
            }
            set body(value) {
                this._body = value;
                this.append(value);
            }
        }
        Lang.ForStatement = ForStatement;
        class ReturnStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.return;
            }
            get expression() {
                return this.$expression;
            }
            set expression(val) {
                this.$expression = val;
                this.append(this.$expression);
            }
        }
        Lang.ReturnStatement = ReturnStatement;
        class ThrowStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.throw;
            }
            get expression() {
                return this.$expression;
            }
            set expression(val) {
                this.$expression = val;
                this.append(this.$expression);
            }
        }
        Lang.ThrowStatement = ThrowStatement;
        class BreakStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.break;
            }
        }
        Lang.BreakStatement = BreakStatement;
        class ContinueStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.StatementType.continue;
            }
        }
        Lang.ContinueStatement = ContinueStatement;
        class SwitchStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.caseStatements = new Lang.VeArray();
                this.type = Lang.StatementType.switch;
            }
            appendCaseStatement(value, matchs) {
                this.append(value);
                this.append(matchs);
                this.caseStatements.push({ value, matchs });
            }
            get valueExpression() {
                return this.$valueExpression;
            }
            set valueExpression(val) {
                this.$valueExpression = val;
                this.append(this.$valueExpression);
            }
            get defaultStatement() {
                return this.$defaultStatement;
            }
            set defaultStatement(val) {
                this.$defaultStatement = val;
                this.append(this.$defaultStatement);
            }
        }
        Lang.SwitchStatement = SwitchStatement;
        class TryStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this._tryStatement = new Lang.VeArray();
                this._catchStatement = new Lang.VeArray();
                this.catchParameter = new Lang.VeArray();
                this._finallyStatement = new Lang.VeArray();
                this.type = Lang.StatementType.try;
            }
            get tryStatement() {
                return this._tryStatement;
            }
            set tryStatement(value) {
                this._tryStatement = value;
            }
            get catchStatement() {
                return this._catchStatement;
            }
            set catchStatement(value) {
                this._catchStatement = value;
            }
            get finallyStatement() {
                return this._finallyStatement;
            }
            set finallyStatement(value) {
                this._finallyStatement = value;
            }
        }
        Lang.TryStatement = TryStatement;
        class WhileStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this._body = new Lang.VeArray();
                this.type = Lang.StatementType.while;
            }
            get condition() {
                return this.$condition;
            }
            set condition(val) {
                this.$condition = val;
                this.append(this.$condition);
            }
            get body() {
                return this._body;
            }
            set body(value) {
                this._body = value;
                this.append(value);
            }
        }
        Lang.WhileStatement = WhileStatement;
        class DoWhileStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this._body = new Lang.VeArray();
                this.type = Lang.StatementType.doWhile;
            }
            get condition() {
                return this.$condition;
            }
            set condition(val) {
                this.$condition = val;
                this.append(this.$condition);
            }
            get body() {
                return this._body;
            }
            set body(value) {
                this._body = value;
                this.append(value);
            }
        }
        Lang.DoWhileStatement = DoWhileStatement;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Outer;
        (function (Outer) {
            function pickVeTypeFromCode(code) {
                var args = `a:${code}`;
                var keyTypes = this.pickArgsFromCode(args);
                return keyTypes.first().type;
            }
            Outer.pickVeTypeFromCode = pickVeTypeFromCode;
            function pickArgsFromCode(code) {
                if (typeof code != 'string')
                    code = '';
                var ast = new Lang.AstParser();
                var node = ast.compileExpress(`(${code})=>void`);
                var keyTypes = [];
                node.args.each(x => {
                    keyTypes.push({ key: x.key, type: Outer.TypeExpressionToVeType(x.default ? x.default.valueType : x.parameterType) });
                });
                return keyTypes;
            }
            Outer.pickArgsFromCode = pickArgsFromCode;
            function pickVePropFromCode(code) {
                if (typeof code != 'string')
                    return null;
                var ast = new Lang.AstParser();
                var node = ast.compileExpress(code);
                return Outer.dataToVeProp(node);
            }
            Outer.pickVePropFromCode = pickVePropFromCode;
            function pickVePropFromExpress(expressCode, args) {
                if (typeof expressCode != 'string')
                    return [];
                var ast = new Lang.AstParser();
                var expressNode = ast.compileExpress(expressCode, args);
                var vs = expressNode.findAll(x => x instanceof Lang.Variable);
                var cs = expressNode.findAll(x => x instanceof Lang.Constant);
                return vs.map(x => Outer.dataToVeProp(x));
            }
            Outer.pickVePropFromExpress = pickVePropFromExpress;
            function inferExpressType(expressCode, args) {
                if (typeof expressCode != 'string')
                    expressCode = '';
                var ast = new Lang.AstParser();
                let express = ast.compileExpress(expressCode, args);
                let expressType = express.parent.infer.expressType;
                return Outer.TypeExpressionToVeType(expressType);
            }
            Outer.inferExpressType = inferExpressType;
        })(Outer = Lang.Outer || (Lang.Outer = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Outer;
        (function (Outer) {
            function TranslateLangCode(code, lang) {
                let lan = parseInt(Ve.Lang.TranstateLanguage[lang].toString());
                var tf = new Lang.TranstateFactory(lan);
                return tf.compile(code);
            }
            Outer.TranslateLangCode = TranslateLangCode;
            function TranslateExpressLangCode(code, args, lang, options) {
                if (typeof options == 'undefined')
                    options = {};
                if (typeof options.argFlag == 'undefined')
                    options.argFlag = '$$$';
                lang = lang.toLowerCase();
                let mode = new Ve.Lang.VeMode({
                    isIgnoreLineBreaks: false,
                    isIgnoreWhiteSpace: false
                });
                let token = new Lang.Tokenizer(code, mode).onParse();
                var newCode = token.getWrapper(function (token, childTemplate) {
                    if (typeof childTemplate == 'undefined')
                        childTemplate = '';
                    let value = '';
                    switch (token.type) {
                        case Lang.TokenType.unit:
                            if (typeof token.value == 'string')
                                value = `${token.value || ''}/${token.unit}`;
                            break;
                        case Lang.TokenType.string:
                            value = typeof token.wholeValue != 'undefined' ? token.wholeValue : token.value;
                            break;
                        case Lang.TokenType.word:
                            if (args.filter(x => x.text == token.value).length > 0)
                                value = `${options.argFlag}${token.value}`;
                            else
                                value = token.value;
                            break;
                        case Lang.TokenType.newLine:
                            value = '\n';
                            break;
                        case Lang.TokenType.closeBlock:
                            if (token.name == Lang.VeName.RBRACE) {
                                value = '}';
                            }
                            else if (token.name == Lang.VeName.RBRACK) {
                                value = ']';
                            }
                            else if (token.name == Lang.VeName.RPAREN) {
                                return ')';
                            }
                            break;
                        case Lang.TokenType.block:
                            if (token.name == Lang.VeName.LBRACE) {
                                value = '{' + childTemplate;
                            }
                            else if (token.name == Lang.VeName.LBRACK) {
                                value = '[' + childTemplate;
                            }
                            else if (token.name == Lang.VeName.LPAREN) {
                                value = '(' + childTemplate;
                            }
                            else if (token.name == Lang.VeName.STRING_LBRACE) {
                                value = '@{' + childTemplate;
                            }
                            break;
                        default:
                            value = (token.value || '') + childTemplate;
                            break;
                    }
                    return value;
                });
                let ma = (FLAG, props) => {
                    return props.map(x => {
                        return {
                            text: FLAG + x.text,
                            type: x.type,
                            value: x.value,
                            props: Array.isArray(x.props) ? ma(FLAG, x.props) : undefined
                        };
                    });
                };
                let newArgs = ma(options.argFlag, args);
                let lan = parseInt(Ve.Lang.TranstateLanguage[lang].toString());
                var tf = new Lang.TranstateFactory(lan);
                return tf.compileExpress(newCode, newArgs);
            }
            Outer.TranslateExpressLangCode = TranslateExpressLangCode;
            function TranslateSQLExpressLangCode(code, args, fields, lang, options) {
                if (typeof options == 'undefined')
                    options = {};
                if (typeof options.argFlag == 'undefined')
                    options.argFlag = '$$$';
                if (typeof options.fieldFlag == 'undefined')
                    options.fieldFlag = '$$';
                lang = lang.toLowerCase();
                let mode = new Ve.Lang.VeMode({
                    isIgnoreLineBreaks: false,
                    isIgnoreWhiteSpace: false
                });
                let token = new Lang.Tokenizer(code, mode).onParse();
                var newCode = token.getWrapper(function (token, childTemplate) {
                    if (typeof childTemplate == 'undefined')
                        childTemplate = '';
                    let value = '';
                    switch (token.type) {
                        case Lang.TokenType.unit:
                            if (typeof token.value == 'string')
                                value = `${token.value || ''}/${token.unit}`;
                            break;
                        case Lang.TokenType.string:
                            value = typeof token.wholeValue != 'undefined' ? token.wholeValue : token.value;
                            break;
                        case Lang.TokenType.word:
                            if (fields.filter(x => x.text == token.value).length > 0)
                                value = `${options.fieldFlag}${token.value}`;
                            else if (args.filter(x => x.text == token.value).length > 0)
                                value = `${options.argFlag}${token.value}`;
                            else
                                value = token.value;
                            break;
                        case Lang.TokenType.newLine:
                            value = '\n';
                            break;
                        case Lang.TokenType.closeBlock:
                            if (token.name == Lang.VeName.RBRACE) {
                                value = '}';
                            }
                            else if (token.name == Lang.VeName.RBRACK) {
                                value = ']';
                            }
                            else if (token.name == Lang.VeName.RPAREN) {
                                return ')';
                            }
                            break;
                        case Lang.TokenType.block:
                            if (token.name == Lang.VeName.LBRACE) {
                                value = '{' + childTemplate;
                            }
                            else if (token.name == Lang.VeName.LBRACK) {
                                value = '[' + childTemplate;
                            }
                            else if (token.name == Lang.VeName.LPAREN) {
                                value = '(' + childTemplate;
                            }
                            else if (token.name == Lang.VeName.STRING_LBRACE) {
                                value = '@{' + childTemplate;
                            }
                            break;
                        default:
                            value = (token.value || '') + childTemplate;
                            break;
                    }
                    return value;
                });
                let ma = (FLAG, props) => {
                    return props.map(x => {
                        return {
                            text: FLAG + x.text,
                            type: x.type,
                            value: x.value,
                            props: Array.isArray(x.props) ? ma(FLAG, x.props) : undefined
                        };
                    });
                };
                fields = ma(options.fieldFlag, fields);
                args = ma(options.argFlag, args);
                fields.forEach(f => args.push(f));
                let lan = parseInt(Ve.Lang.TranstateLanguage[lang].toString());
                var tf = new Lang.TranstateFactory(lan);
                return tf.compileExpress(newCode, args);
            }
            Outer.TranslateSQLExpressLangCode = TranslateSQLExpressLangCode;
        })(Outer = Lang.Outer || (Lang.Outer = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Outer;
        (function (Outer) {
            function VePropToParameter(args) {
                return args.map(arg => {
                    return `${arg.text}:${VeTypeToCode(arg.type)}`;
                }).join(",");
            }
            Outer.VePropToParameter = VePropToParameter;
            function toUnitValue(value, type) {
                if (typeof value == 'string') {
                    if (value.endsWith('/' + type)) {
                        return value;
                    }
                    else {
                        value = value.replace(/\//g, "\\/");
                        if (value == '')
                            value = ' ';
                        return `/${value}/${type}`;
                    }
                }
                else {
                    return `/ /${type}`;
                }
            }
            function VePropToCode(prop) {
                if (typeof prop.type == 'string' && prop.type.toLowerCase() != 'object' && prop.type.toLowerCase() != 'array') {
                    var pt = prop.type.toLowerCase();
                    switch (pt) {
                        case 'int':
                        case 'number':
                            if (typeof prop.value != 'undefined' && prop.value != null)
                                return prop.value.toString();
                            else
                                return '0';
                        case 'string':
                            return `'${prop.value || ""}'`;
                        case 'bool':
                            return prop.value == '是' || prop.value == true || prop.value == 'true' ? 'true' : 'false';
                        case 'date':
                        case 'time':
                            if (typeof prop.value == 'number')
                                prop.value = new Date(prop.value);
                            if (!prop.value)
                                prop.value = new Date();
                            if (prop.value instanceof Date) {
                                return `/${prop.value.getFullYear()}-${prop.value.getMonth() + 1}-${prop.value.getDate()} ${prop.value.getHours()}:${prop.value.getMinutes()}:${prop.value.getSeconds()}/date`;
                            }
                            return toUnitValue(prop.value, prop.type);
                        case 'point':
                            if (typeof prop.value == 'object') {
                                return `/(${prop.value.x},${prop.value.y})/point`;
                            }
                            break;
                        default:
                            return `'${prop.value || ""}'`;
                    }
                }
                var isArray = prop.type == 'array' || prop.type == 'Array';
                if (!isArray) {
                    if (typeof prop.type == 'object')
                        if (prop.type.unionType && (prop.type.unionType == 'Array' || prop.type.unionType == 'array')) {
                            isArray = true;
                        }
                }
                if (isArray) {
                    if (Array.isArray(prop.props)) {
                        return `[${prop.props.map(pro => {
                            return VePropToCode(pro);
                        }).join(",")}]`;
                    }
                    else if (typeof prop.value == 'string') {
                        return prop.value;
                    }
                    else if (Array.isArray(prop.value)) {
                        var vp = jsObjectToVeProp(prop.value);
                        return `[${vp.props.map(pro => {
                            return VePropToCode(pro);
                        }).join(",")}]`;
                    }
                }
                else if (prop.type == 'object' || prop.type == 'Object' || Array.isArray(prop.props)) {
                    if (Array.isArray(prop.props))
                        return `{${prop.props.map(x => {
                            return `'${x.text}':${VePropToCode(x)}`;
                        })}}`;
                    else if (typeof prop.value == 'string') {
                        return prop.value;
                    }
                }
                else if (typeof prop.type == 'object' && Array.isArray(prop.type.args)) {
                    if (typeof prop.value == 'string')
                        return `fun(${prop.type.args.map(x => `${x.key}:${VeTypeToCode(x.type)}`)}){${prop.value}\n}`;
                }
            }
            Outer.VePropToCode = VePropToCode;
            function VePropToVeType(prop) {
                if (prop.props && prop.props.length > 0) {
                    if (prop.type == 'Array' || prop.type == 'array') {
                        return {
                            unionType: 'Array',
                            generics: [VePropToVeType(prop.props[0])]
                        };
                    }
                    else if (prop.type == 'Object' || prop.type == 'object') {
                        return {
                            props: prop.props.map(pro => {
                                return {
                                    key: pro.text,
                                    type: VePropToVeType(pro)
                                };
                            })
                        };
                    }
                }
                else {
                    return prop.type;
                }
            }
            Outer.VePropToVeType = VePropToVeType;
            function VeTypeToCode(veType) {
                if (typeof veType == 'string')
                    return veType;
                else if (Array.isArray(veType.props)) {
                    return `{${veType.props.map(x => `${x.key}:${this.VeTypeToCode(x.type)}`).join(",")}}`;
                }
                else if (Array.isArray(veType.options)) {
                    return `|${veType.options.map(x => `${x.key}${x.value ? `=${x.value}` : ''}`).join(",")}|`;
                }
                else if (Array.isArray(veType.args)) {
                    return `(${veType.args.map(x => `${x.key}:${this.VeTypeToCode(x.type)}`)})=>${veType.returnType ? this.VeTypeToCode(veType.returnType) : 'void'}`;
                }
                else if (veType.unionType) {
                    if (veType.unionType == 'Array' && veType.generics.length == 1) {
                        return `${this.VeTypeToCode(veType.generics[0])}[]`;
                    }
                    else {
                        throw 'not identify union type:' + veType.unionType;
                    }
                }
            }
            Outer.VeTypeToCode = VeTypeToCode;
            function TypeExpressionToVeType(typeExpression) {
                if (typeExpression) {
                    switch (typeExpression.kind) {
                        case Lang.TypeKind.unit:
                            return typeExpression.name;
                        case Lang.TypeKind.object:
                            return {
                                props: typeExpression.props.map(x => {
                                    return {
                                        key: x.key,
                                        type: TypeExpressionToVeType(x.type)
                                    };
                                })
                            };
                        case Lang.TypeKind.fun:
                            return {
                                args: typeExpression.args.map(x => {
                                    return {
                                        key: x.key,
                                        type: TypeExpressionToVeType(x.type)
                                    };
                                })
                            };
                        case Lang.TypeKind.dic:
                            return {
                                options: typeExpression.options.map(x => x)
                            };
                        case Lang.TypeKind.union:
                            return {
                                unionType: TypeExpressionToVeType(typeExpression.unionType),
                                generics: typeExpression.generics.map(gen => TypeExpressionToVeType(gen))
                            };
                    }
                }
                else {
                    console.trace(typeExpression);
                }
                return 'unknow';
            }
            Outer.TypeExpressionToVeType = TypeExpressionToVeType;
            function dataToVeProp(data) {
                var prop;
                if (data instanceof Lang.Constant) {
                    prop = {};
                    prop.type = TypeExpressionToVeType(data.valueType);
                    prop.value = data.value;
                    return prop;
                }
                else if (data instanceof Lang.ObjectExpression) {
                    prop = { props: [], type: TypeExpressionToVeType(data.infer.expressType) };
                    data.propertys.each(pro => {
                        var p = dataToVeProp(pro.value);
                        p.text = pro.key;
                        prop.props.push(p);
                    });
                    return prop;
                }
                else if (data instanceof Lang.ArrayExpression) {
                    prop = { props: [], type: TypeExpressionToVeType(data.infer.expressType) };
                    data.args.each(pro => {
                        var p = dataToVeProp(pro);
                        prop.props.push(p);
                    });
                    return prop;
                }
                else if (data instanceof Lang.Variable) {
                    prop = {};
                    if (data.infer.expressType)
                        prop.type = TypeExpressionToVeType(data.infer.expressType);
                    prop.text = data.name;
                    return prop;
                }
            }
            Outer.dataToVeProp = dataToVeProp;
            function jsObjectToVeProp(jsObject) {
                if (Array.isArray(jsObject)) {
                    var prop = { props: [], text: '', type: 'Array' };
                    prop.props = jsObject.map(x => jsObjectToVeProp(x));
                    return prop;
                }
                else if (jsObject instanceof Date) {
                    var prop = { text: '', type: 'date', value: jsObject.getTime() };
                    return prop;
                }
                else if (jsObject == null || typeof jsObject == 'undefined') {
                    var prop = { text: '', type: 'null', value: null };
                    return prop;
                }
                else if (typeof jsObject == 'object') {
                    if (typeof jsObject.__ve_type == 'string') {
                        var prop = { text: '', type: jsObject.__ve_type, value: jsObject.value };
                        return prop;
                    }
                    else {
                        var prop = { props: [], text: '', type: 'object' };
                        for (var n in jsObject) {
                            var keyProp = jsObjectToVeProp(jsObject[n]);
                            keyProp.text = n;
                            prop.props.push(keyProp);
                        }
                        return prop;
                    }
                }
                else if (typeof jsObject == 'number') {
                    return { text: '', type: 'number', value: jsObject };
                }
                else if (typeof jsObject == 'string') {
                    return { text: '', type: 'string', value: jsObject };
                }
                else if (typeof jsObject == 'boolean') {
                    return { text: '', type: 'bool', value: jsObject };
                }
            }
            Outer.jsObjectToVeProp = jsObjectToVeProp;
        })(Outer = Lang.Outer || (Lang.Outer = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class RazorMode {
            startState() {
                var root = new Lang.Razor();
                root.type = Lang.RazorType.fragment;
                var state = new Lang.State();
                state.root = root;
                state.context = root;
                this.state = state;
                return state;
            }
            token(stream, state) {
                var match;
                var pos = stream.pos;
                match = this.walk(stream, state);
                if (match) {
                    match.col = pos;
                    if (match.value)
                        match.size = match.value.length;
                    if (typeof stream.row != typeof undefined)
                        match.row = stream.row;
                    if (new Lang.VeArray(Lang.RazorType.if, Lang.RazorType.elseif, Lang.RazorType.else, Lang.RazorType.block, Lang.RazorType.bracket, Lang.RazorType.blockLeft, Lang.RazorType.bracketLeft, Lang.RazorType.for, Lang.RazorType.while, Lang.RazorType.lineText, Lang.RazorType.helper, Lang.RazorType.section, Lang.RazorType.method, Lang.RazorType.blockText, Lang.RazorType.quote).exists(match.type)) {
                        state.context.append(match);
                        state.context = match;
                        state.current = null;
                    }
                    else if (new Lang.VeArray(Lang.RazorType.blockRight, Lang.RazorType.bracketRight, Lang.RazorType.lineEnd, Lang.RazorType.quoteEnd).exists(match.type)) {
                        state.current = state.context;
                        state.context = state.context.parent;
                    }
                    else {
                        state.context.append(match);
                        state.current = match;
                    }
                    return match;
                }
            }
            tokenEnd(stream, state) {
                this.onInferRazorEnv();
            }
            walk(stream, state) {
                var token = null;
                if ((token = this.matchEscape(stream, state)))
                    return token;
                if ((token = this.matchStatement(stream, state)))
                    return token;
                if ((token = this.matchELseStatement(stream, state)))
                    return token;
                if ((token = this.matchBracket(stream, state)))
                    return token;
                if ((token = this.matchBlock(stream, state)))
                    return token;
                if ((token = this.matchMethod(stream, state)))
                    return token;
                if ((token = this.matchValue(stream, state)))
                    return token;
                if ((token = this.matchStringTextBlock(stream, state)))
                    return token;
                if ((token = this.matchStringText(stream, state)))
                    return token;
                if ((token = this.matchHelper(stream, state)))
                    return token;
                if ((token = this.matchSection(stream, state)))
                    return token;
                if ((token = this.matchTextBlock(stream, state)))
                    return token;
                if ((token = this.matchQuote(stream, state)))
                    return token;
                if ((token = this.matchClose(stream, state)))
                    return token;
                if ((token = this.matchText(stream, state)))
                    return token;
                return token;
            }
            matchEscape(stream, state) {
                var text = stream.match(/^@[@\}\)'"`]/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.escape;
                    razor.value = text.substring(1);
                    return razor;
                }
                text = stream.match(/^@(\{\{|\(\()/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.escape;
                    if (text.indexOf('{') > -1)
                        razor.value = '{';
                    else
                        razor.value = '(';
                    return razor;
                }
            }
            matchStatement(stream, state) {
                var text = stream.match(/^@(if|while|for)[\s\n]*\(/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType[text.replace(/[\s@\(]/g, '')];
                    return razor;
                }
            }
            matchELseStatement(stream, state) {
                if (state.current) {
                    var prev = state.current.prevSearch(x => {
                        return !x.isWhiteText;
                    }, true);
                    if (prev && prev.type == Lang.RazorType.blockLeft) {
                        prev = prev.prevSearch(x => !x.isWhiteText);
                        if (prev && new Lang.VeArray(Lang.RazorType.if, Lang.RazorType.elseif).exists(prev.type)) {
                            var text = stream.match(/^[\s]*else[\s\n]+if[\s\n]*\(/);
                            if (text) {
                                var razor = new Lang.Razor();
                                razor.type = Lang.RazorType.elseif;
                                return razor;
                            }
                            else {
                                text = stream.match(/^[\s]*else[\s\n]*\{/);
                                if (text) {
                                    var razor = new Lang.Razor();
                                    razor.type = Lang.RazorType.else;
                                    return razor;
                                }
                            }
                        }
                    }
                }
            }
            matchBracket(stream, state) {
                var text = stream.match(/^@[\s]*\(/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.bracket;
                    return razor;
                }
            }
            matchBlock(stream, state) {
                var text = stream.match(/^@[\s]*\{/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.block;
                    return razor;
                }
            }
            matchValue(stream, state) {
                var text = stream.match(/^@[\w\$](([\s]*\.[\s]*)?[\w\$]+)*/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.value;
                    razor.text = text;
                    razor.value = razor.text.replace(/[@]/g, '');
                    return razor;
                }
            }
            matchMethod(stream, state) {
                var text = stream.match(/^@[\w\$](([\s\n]*\.[\s\n]*)?[\w\$]+)*[\s\n]*\(/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.method;
                    razor.text = text;
                    razor.value = razor.text.replace(/[\s@\(]/g, '');
                    return razor;
                }
            }
            matchStringTextBlock(stream, state) {
                var text = stream.match(/^@:\{/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.blockText;
                    return razor;
                }
            }
            matchStringText(stream, state) {
                var text = stream.match(/^@:/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.lineText;
                    return razor;
                }
            }
            matchHelper(stream, state) {
                var text = stream.match(/^@helper[\s]+[\w\$]+[\s]*\(([\s]*[\w\$]+[\s]*\,)*([\s]*[\w\$]+[\s]*)?\)[\s]*\{/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.helper;
                    razor.text = text;
                    razor.value = text.replace(/(@helper|\{)/g, '');
                    return razor;
                }
            }
            matchSection(stream, state) {
                var text = stream.match(/^@section[\s]+[\w\$]+[\s]*\{/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.section;
                    razor.text = text;
                    razor.value = text.replace(/(@section|\{)/g, '');
                    return razor;
                }
            }
            matchTextBlock(stream, state) {
                var text = stream.match(/^\(/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.bracketLeft;
                    razor.text = text;
                    razor.value = razor.text;
                    return razor;
                }
                text = stream.match(/^\{/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.blockLeft;
                    razor.text = text;
                    razor.value = razor.text;
                    return razor;
                }
            }
            matchQuote(stream, state) {
                var text = stream.match(new Lang.VeArray('\'', '"', '`'));
                if (text) {
                    if (state.context && state.context.type == Lang.RazorType.quote && state.context.text == text) {
                        var razor = new Lang.Razor();
                        razor.type = Lang.RazorType.quoteEnd;
                        razor.text = text;
                        razor.value = text;
                        return razor;
                    }
                    else {
                        var razor = new Lang.Razor();
                        razor.type = Lang.RazorType.quote;
                        razor.text = text;
                        razor.value = text;
                        return razor;
                    }
                }
            }
            matchClose(stream, state) {
                var text = stream.match(/^\}/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.blockRight;
                    razor.text = text;
                    razor.value = razor.text;
                    return razor;
                }
                text = stream.match(/^\)/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.bracketRight;
                    razor.text = text;
                    razor.value = razor.text;
                    return razor;
                }
                if (state.context && new Lang.VeArray(Lang.RazorType.lineText).exists(state.context.type)) {
                    var text = stream.match(/^\n/);
                    if (text) {
                        var razor = new Lang.Razor();
                        razor.type = Lang.RazorType.lineEnd;
                        razor.value = text;
                        razor.text = text;
                        return razor;
                    }
                }
                else {
                    var text = stream.match(/^[\n]+/);
                    if (text) {
                        var razor = new Lang.Razor();
                        razor.type = Lang.RazorType.text;
                        razor.value = text;
                        razor.text = text;
                        return razor;
                    }
                }
            }
            matchText(stream, state) {
                var text = stream.match(/[^@\(\)\{\}'"`\n]+/);
                if (text) {
                    var razor = new Lang.Razor();
                    razor.type = Lang.RazorType.text;
                    razor.text = text;
                    razor.value = text;
                    return razor;
                }
            }
            onInferRazorEnv() {
                Lang._.arrayJsonEach([this.state.root], 'childs', razor => {
                    if (typeof razor.env == typeof undefined) {
                        switch (razor.type) {
                            case Lang.RazorType.if:
                            case Lang.RazorType.elseif:
                            case Lang.RazorType.for:
                            case Lang.RazorType.while:
                                razor.env = Lang.RazorEnviroment.code;
                                var nextBlock = razor.nextSearch(x => !x.isWhiteText);
                                if (nextBlock && nextBlock.type == Lang.RazorType.blockLeft) {
                                    var ts = Lang.VeArray.asVeArray(razor.parent.childs).range(razor.index + 1, nextBlock.index - 1);
                                    ts.each(t => {
                                        t.env = Lang.RazorEnviroment.code;
                                    });
                                    nextBlock.env = Lang.RazorEnviroment.code;
                                    nextBlock.contentEnv = Lang.RazorEnviroment.text;
                                }
                                break;
                            case Lang.RazorType.else:
                                razor.env = Lang.RazorEnviroment.text;
                                break;
                            case Lang.RazorType.block:
                            case Lang.RazorType.bracket:
                            case Lang.RazorType.method:
                            case Lang.RazorType.value:
                                razor.env = Lang.RazorEnviroment.code;
                                break;
                            case Lang.RazorType.blockLeft:
                            case Lang.RazorType.bracketLeft:
                                break;
                            case Lang.RazorType.lineText:
                            case Lang.RazorType.helper:
                            case Lang.RazorType.section:
                            case Lang.RazorType.blockText:
                            case Lang.RazorType.fragment:
                                razor.env = Lang.RazorEnviroment.text;
                                break;
                        }
                    }
                });
                Lang._.arrayJsonEach([this.state.root], 'childs', razor => {
                    if (typeof razor.env == typeof undefined) {
                        var p = razor.closest(x => typeof x.env != typeof undefined || typeof x.contentEnv != typeof undefined);
                        if (p) {
                            if (typeof p.contentEnv != typeof undefined)
                                razor.env = p.contentEnv;
                            else
                                razor.env = p.env;
                        }
                        else {
                        }
                    }
                });
            }
        }
        Lang.RazorMode = RazorMode;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class RazorContext {
            constructor(razorTemplate) {
                this.ViewBag = {};
                this.section = {};
                this.razorTemplate = razorTemplate;
            }
            renderBody() {
                if (typeof this.layoutBody == 'string')
                    return this.layoutBody;
                else {
                    console.warn('not found layout body content...');
                    return '';
                }
                ;
            }
            renderSection(sectionName) {
                if (typeof this.section[sectionName] == 'function') {
                    this.section[sectionName].apply(this.razorTemplate.caller || this.razorTemplate, []);
                }
                else {
                    console.warn('not found section:' + sectionName);
                    return '';
                }
            }
            sectionRegister(name, fn) {
                this.section[name] = fn;
            }
            clear() {
                delete this.section;
                delete this.layoutBody;
                delete this.layout;
                this.ViewBag = {};
            }
        }
        Lang.RazorContext = RazorContext;
        let RazorTemplateType;
        (function (RazorTemplateType) {
            RazorTemplateType[RazorTemplateType["View"] = 0] = "View";
            RazorTemplateType[RazorTemplateType["LayoutMaster"] = 1] = "LayoutMaster";
            RazorTemplateType[RazorTemplateType["PartialView"] = 2] = "PartialView";
        })(RazorTemplateType = Lang.RazorTemplateType || (Lang.RazorTemplateType = {}));
        class RazorTemplate {
            constructor(options) {
                this.compilerParms = [];
                this.imports = {};
                if (typeof options == 'object') {
                    if (typeof options.caller != typeof undefined)
                        this.caller = options.caller;
                    if (typeof options.context != typeof undefined)
                        this.context = options.context;
                    if (typeof options.type != typeof undefined)
                        this.type = options.type;
                    if (typeof options.dir != typeof undefined)
                        this.dir = options.dir;
                    if (typeof options.printFunCodeFilePath != typeof undefined)
                        this.printFunCodeFilePath = options.printFunCodeFilePath;
                    if (typeof options.printTokenCodeFilePath != typeof undefined)
                        this.printTokenCodeFilePath = options.printTokenCodeFilePath;
                }
                if (typeof this.context == typeof undefined)
                    this.context = new RazorContext(this);
                if (typeof this.type == typeof undefined)
                    this.type = RazorTemplateType.View;
            }
            import(methodName, obj) {
                if (typeof methodName == 'object') {
                    for (var n in methodName)
                        this.import(n, methodName[n]);
                }
                else {
                    this.import[methodName] = obj;
                }
            }
            render(template, data, ViewBag) {
                if (typeof template == 'string')
                    return this.compile(template, data);
                else {
                    if (typeof data == 'object')
                        ViewBag = data;
                    if (typeof template == 'object')
                        data = template;
                    var dataArgs = this.getDataArgs(data);
                    var parms = dataArgs.map(x => x.key);
                    if (parms.every(x => this.compilerParms.filter(c => c == x).length > 0)) {
                        var args = [this, this.context];
                        this.compilerParms.forEach(cp => {
                            if (typeof parms[cp] == typeof undefined)
                                args.push(undefined);
                            else
                                args.push(dataArgs.find(x => x.key == cp).value);
                        });
                        this.context.clear();
                        if (typeof ViewBag == 'object')
                            this.context.ViewBag = ViewBag;
                        return this.compilerFunction.apply(this.caller || this, args);
                    }
                }
            }
            compile(template, data, ViewBag) {
                if (typeof data != 'object')
                    data = {};
                var dataArgs = this.getDataArgs(data);
                var mode = new Lang.RazorMode;
                var tokenizer = new Lang.Tokenizer(template, mode, false);
                var razor = tokenizer.onParse();
                var razorWriter = new Lang.RazorWriter();
                razorWriter.write(razor);
                var code = razorWriter.outputCode();
                this.excuteFunction(code, dataArgs);
                var args = [this, this.context];
                dataArgs.forEach(key => args.push(key.value));
                this.context.clear();
                if (typeof ViewBag == 'object')
                    this.context.ViewBag = ViewBag;
                return this.compilerFunction.apply(this.caller || this, args);
            }
            excuteFunction(code, dataArgs) {
                var ms = [];
                var keys = Object.getOwnPropertyNames(Object.getPrototypeOf(this.context));
                Lang._.remove(keys, 'constructor');
                keys.forEach(n => {
                    if (typeof RazorContext.prototype[n] == 'function')
                        ms.push(`var ${n}=function(){ return context.${n}.apply(context,arguments);};`);
                });
                for (var n in this.imports) {
                    ms.push(`var ${n}=razorTemplate.imports[n];`);
                }
                var funCode = `function()
        { 
             var razorTemplate=arguments[0];
             var context=arguments[1];
             var ViewBag=context.ViewBag;
             var layout=context.layout;
${ms.map(x => `             ${x}\n`).join("")}
             var innerFunction=function(${dataArgs.map(x => x.key).join(",")})
             {
                 ${code}
             };
             var args=Array.from(arguments);
             args.splice(0,2);
             var result=innerFunction.apply(this,args);
             if(razorTemplate.type==${RazorTemplateType.View}&&layout)
             {
                context.layoutBody=result;
                result=layoutRegister(layout);
             }
             return result;
         }`;
                try {
                    var fx = eval('(' + funCode + ')');
                    this.compilerFunction = fx;
                }
                catch (e) {
                    console.log(funCode);
                    throw e;
                }
                this.compilerParms = dataArgs.map(x => x.key);
            }
            getDataArgs(data) {
                var prototypes = [];
                var current = data.__proto__;
                while (true) {
                    if (current === Object.prototype) {
                        break;
                    }
                    else {
                        prototypes.push(current);
                        current = current.__proto__;
                        if (!current)
                            break;
                    }
                }
                var keys = [];
                for (var n in data) {
                    if (!(keys.filter(x => x == n).length > 0))
                        keys.push(n);
                }
                prototypes.forEach(pro => {
                    var ps = Reflect.ownKeys(pro);
                    Lang._.remove(ps, "constructor");
                    ps.forEach(m => {
                        if ((keys.filter(x => x == m).length == 0))
                            keys.push(m);
                    });
                });
                var maps = [];
                keys.forEach(key => {
                    (function (key) {
                        var map = { key };
                        if (typeof data[key] == 'function') {
                            map.value = function () {
                                return data[key].apply(data, arguments);
                            };
                        }
                        else
                            map.value = data[key];
                        maps.push(map);
                    })(key);
                });
                return maps;
            }
        }
        Lang.RazorTemplate = RazorTemplate;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let RazorType;
        (function (RazorType) {
            RazorType[RazorType["fragment"] = 0] = "fragment";
            RazorType[RazorType["text"] = 1] = "text";
            RazorType[RazorType["quote"] = 2] = "quote";
            RazorType[RazorType["quoteEnd"] = 3] = "quoteEnd";
            RazorType[RazorType["lineText"] = 4] = "lineText";
            RazorType[RazorType["lineEnd"] = 5] = "lineEnd";
            RazorType[RazorType["blockText"] = 6] = "blockText";
            RazorType[RazorType["blockLeft"] = 7] = "blockLeft";
            RazorType[RazorType["blockRight"] = 8] = "blockRight";
            RazorType[RazorType["bracketLeft"] = 9] = "bracketLeft";
            RazorType[RazorType["bracketRight"] = 10] = "bracketRight";
            RazorType[RazorType["if"] = 11] = "if";
            RazorType[RazorType["elseif"] = 12] = "elseif";
            RazorType[RazorType["else"] = 13] = "else";
            RazorType[RazorType["while"] = 14] = "while";
            RazorType[RazorType["for"] = 15] = "for";
            RazorType[RazorType["block"] = 16] = "block";
            RazorType[RazorType["bracket"] = 17] = "bracket";
            RazorType[RazorType["comment"] = 18] = "comment";
            RazorType[RazorType["value"] = 19] = "value";
            RazorType[RazorType["method"] = 20] = "method";
            RazorType[RazorType["escape"] = 21] = "escape";
            RazorType[RazorType["helper"] = 22] = "helper";
            RazorType[RazorType["section"] = 23] = "section";
        })(RazorType = Lang.RazorType || (Lang.RazorType = {}));
        let RazorEnviroment;
        (function (RazorEnviroment) {
            RazorEnviroment[RazorEnviroment["text"] = 0] = "text";
            RazorEnviroment[RazorEnviroment["code"] = 1] = "code";
        })(RazorEnviroment = Lang.RazorEnviroment || (Lang.RazorEnviroment = {}));
        class Razor {
            constructor() {
                this.childs = [];
            }
            get prev() {
                return this.parent.childs[(this.index - 1)];
            }
            get index() {
                return Lang._.findIndex(this.parent.childs, x => x == this);
            }
            get isWhiteText() {
                if (this.type == RazorType.text)
                    return /^[\s\n]+$/.test(this.text);
            }
            prevSearch(fx, isInclude = false) {
                var index = this.index;
                for (let i = index + (isInclude ? 0 : -1); i >= 0; i--) {
                    var x = this.parent.childs[i];
                    if (fx(x) == true)
                        return x;
                }
            }
            nextSearch(fx, isInclude = false) {
                var index = this.index;
                for (let i = index + (isInclude ? 0 : 1); i < this.parent.childs.length; i++) {
                    var x = this.parent.childs[i];
                    if (fx(x) == true)
                        return x;
                }
            }
            append(razor) {
                this.childs.push(razor);
                razor.parent = this;
            }
            closest(predict) {
                if (predict(this) == true)
                    return this;
                var p = this.parent;
                while (true) {
                    if (p) {
                        if (predict(p) == true)
                            return p;
                        else
                            p = p.parent;
                    }
                    else {
                        break;
                    }
                }
            }
            gs() {
                var json = {};
                json.type = RazorType[this.type];
                json.value = this.value;
                json.text = this.text;
                json.childs = this.childs.map(x => x.gs());
                json.env = RazorEnviroment[this.env];
                return json;
            }
        }
        Lang.Razor = Razor;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let Variable_COUNTER = 0;
        class RazorWriter {
            constructor(options) {
                if (typeof options == 'object') {
                    if (typeof options.writeVariable != typeof undefined) {
                        this.writeVariable = options.writeVariable;
                    }
                }
                if (typeof this.writeVariable == typeof undefined)
                    this.writeVariable = `__$$rt${++Variable_COUNTER}`;
                this.codes = [`\nvar ${this.writeVariable}=[];\n`];
            }
            writeExpress(text) {
                this.codes.push(`\n${this.writeVariable}.push(${text});\n`);
            }
            writeString(text) {
                text = text.replace(/(\n|"|\\|\t|\r)/g, function ($0, $1) {
                    switch ($1) {
                        case '\n':
                            return '\\n';
                        case '"':
                            return "\\\"";
                        case '\\':
                            return '\\\\';
                        case '\t':
                            return '\\t';
                        case '\r':
                            return '\\\r';
                    }
                    return $0;
                });
                this.codes.push(`\n${this.writeVariable}.push(\"${text}\");\n`);
            }
            writeCode(text) {
                this.codes.push(text);
            }
            write(razor) {
                if (razor.env == Lang.RazorEnviroment.text) {
                    switch (razor.type) {
                        case Lang.RazorType.quote:
                            this.writeString(razor.value);
                            razor.childs.forEach(r => this.write(r));
                            this.writeString(razor.value);
                            break;
                        case Lang.RazorType.text:
                        case Lang.RazorType.escape:
                            this.writeString(razor.value);
                            break;
                        case Lang.RazorType.blockLeft:
                            this.writeString('{');
                            razor.childs.forEach(r => this.write(r));
                            this.writeString('}');
                            break;
                        case Lang.RazorType.bracketLeft:
                            this.writeString('(');
                            razor.childs.forEach(r => this.write(r));
                            this.writeString(')');
                            break;
                        case Lang.RazorType.helper:
                            this.writeCode(`function ${razor.value}{`);
                            var rw = new RazorWriter();
                            razor.childs.forEach(x => rw.write(x));
                            this.writeCode(rw.outputCode());
                            this.writeCode('}');
                            break;
                        case Lang.RazorType.section:
                            this.writeCode(`sectionRegister('${razor.value}',function(){`);
                            var rw = new RazorWriter();
                            razor.childs.forEach(x => rw.write(x));
                            this.writeCode(rw.outputCode());
                            this.writeCode(`})`);
                            break;
                        case Lang.RazorType.lineText:
                        case Lang.RazorType.blockText:
                        case Lang.RazorType.fragment:
                            razor.childs.forEach(r => this.write(r));
                            break;
                    }
                }
                else {
                    switch (razor.type) {
                        case Lang.RazorType.quote:
                            this.writeCode(razor.value);
                            razor.childs.forEach(r => this.write(r));
                            this.writeCode(razor.value);
                            break;
                        case Lang.RazorType.text:
                        case Lang.RazorType.escape:
                            this.writeCode(razor.value);
                            break;
                        case Lang.RazorType.if:
                        case Lang.RazorType.elseif:
                        case Lang.RazorType.for:
                        case Lang.RazorType.while:
                            this.writeCode(Lang.RazorType.elseif == razor.type ? 'else if' : Lang.RazorType[razor.type]);
                            this.writeCode('(');
                            razor.childs.forEach(r => this.write(r));
                            this.writeCode(')');
                            break;
                        case Lang.RazorType.else:
                            this.writeCode('else {');
                            razor.childs.forEach(r => this.write(r));
                            this.writeCode('}');
                        case Lang.RazorType.block:
                            razor.childs.forEach(r => this.write(r));
                            break;
                        case Lang.RazorType.bracket:
                            this.writeExpress(razor.childs.map(x => x.value).join(""));
                            break;
                        case Lang.RazorType.value:
                            this.writeExpress(razor.value);
                            break;
                        case Lang.RazorType.method:
                            this.writeExpress(`${razor.value}(${razor.childs.map(x => this.read(x)).join("")})`);
                            break;
                        case Lang.RazorType.blockLeft:
                            this.writeCode('{');
                            razor.childs.forEach(r => this.write(r));
                            this.writeCode('}');
                            break;
                        case Lang.RazorType.bracketLeft:
                            this.writeCode('(');
                            razor.childs.forEach(r => this.write(r));
                            this.writeCode(')');
                            break;
                    }
                }
            }
            read(razor) {
                var text = razor.value || '';
                if (razor.childs && razor.childs.length > 0)
                    razor.childs.forEach(r => {
                        text += this.read(r);
                    });
                switch (razor.type) {
                    case Lang.RazorType.quote:
                        text += razor.value;
                        break;
                    case Lang.RazorType.blockLeft:
                        text += "}";
                    case Lang.RazorType.bracketLeft:
                        text += ')';
                }
                return text;
            }
            outputCode() {
                return this.codes.join('') + `\nreturn ${this.writeVariable}.join("");\n`;
            }
        }
        Lang.RazorWriter = RazorWriter;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Run;
        (function (Run) {
            Run.Run$Binary = {
                binary(express) {
                    if (express.kind == Lang.VeName.ASSIGN) {
                        this.accept(express.right);
                    }
                    else {
                        this.accept(express.left);
                        this.accept(express.right);
                    }
                    switch (express.kind) {
                        case Lang.VeName.ASSIGN:
                            express.runResult.value = express.right.runResult.value;
                            break;
                        case Lang.VeName.ADD:
                            express.runResult.value = express.left.runResult.value + express.right.runResult.value;
                            break;
                        case Lang.VeName.SUB:
                            express.runResult.value = express.left.runResult.value - express.right.runResult.value;
                            break;
                        case Lang.VeName.MUL:
                            express.runResult.value = express.left.runResult.value * express.right.runResult.value;
                            break;
                        case Lang.VeName.MOD:
                            express.runResult.value = express.left.runResult.value % express.right.runResult.value;
                            break;
                        case Lang.VeName.EXP:
                            express.runResult.value = Math.pow(express.left.runResult.value, express.right.runResult.value);
                            break;
                        case Lang.VeName.DIV:
                            express.runResult.value = express.left.runResult.value / express.right.runResult.value;
                            break;
                        case Lang.VeName.ASSIGN_ADD:
                            express.runResult.value = express.left.runResult.value = express.left.runResult.value + express.right.runResult.value;
                            break;
                        case Lang.VeName.ASSIGN_SUB:
                            express.runResult.value = express.left.runResult.value = express.left.runResult.value - express.right.runResult.value;
                            break;
                        case Lang.VeName.ASSIGN_MUL:
                            express.runResult.value = express.left.runResult.value = express.left.runResult.value * express.right.runResult.value;
                            break;
                        case Lang.VeName.ASSIGN_DIV:
                            express.runResult.value = express.left.runResult.value = express.left.runResult.value / express.right.runResult.value;
                            break;
                        case Lang.VeName.ASSIGN_MOD:
                            express.runResult.value = express.left.runResult.value = express.left.runResult.value % express.right.runResult.value;
                            break;
                        case Lang.VeName.ASSIGN_EXP:
                            express.runResult.value = express.left.runResult.value = Math.pow(express.left.runResult.value, express.right.runResult.value);
                            break;
                        case Lang.VeName.OR:
                        case Lang.VeName.K_OR:
                            express.runResult.value = express.left.runResult.value || express.right.runResult.value;
                            break;
                        case Lang.VeName.AND:
                        case Lang.VeName.K_AND:
                            express.runResult.value = express.left.runResult.value && express.right.runResult.value;
                            break;
                        case Lang.VeName.XOR:
                        case Lang.VeName.K_XOR:
                            express.runResult.value = express.left.runResult.value != express.right.runResult.value;
                            break;
                        case Lang.VeName.K_EQ:
                        case Lang.VeName.EQ:
                            express.runResult.value = express.left.runResult.value == express.right.runResult.value;
                            break;
                        case Lang.VeName.NE:
                            express.runResult.value = express.left.runResult.value != express.right.runResult.value;
                            break;
                        case Lang.VeName.LT:
                            express.runResult.value = express.left.runResult.value < express.right.runResult.value;
                            break;
                        case Lang.VeName.GT:
                            express.runResult.value = express.left.runResult.value > express.right.runResult.value;
                            break;
                        case Lang.VeName.LTE:
                            express.runResult.value = express.left.runResult.value <= express.right.runResult.value;
                            break;
                        case Lang.VeName.GTE:
                            express.runResult.value = express.left.runResult.value >= express.right.runResult.value;
                            break;
                        case Lang.VeName.AS:
                            break;
                        case Lang.VeName.IS:
                            break;
                        case Lang.VeName.MATCH:
                            express.runResult.value = express.left.runResult.value.match(express.right.runResult.value);
                            break;
                        case Lang.VeName.CONTAIN:
                            express.runResult.value = express.left.runResult.value.indexOf(express.right.runResult.value) > -1;
                            break;
                        case Lang.VeName.STATR:
                            express.runResult.value = express.left.runResult.value.startsWith(express.right.runResult.value);
                            break;
                        case Lang.VeName.END:
                            express.runResult.value = express.left.runResult.value.endsWith(express.right.runResult.value);
                            break;
                        default:
                    }
                },
                unary(express) {
                    switch (express.kind) {
                        case Lang.VeName.INC:
                            this.accept(express.exp);
                            if (express.arrow == Lang.UnaryArrow.left) {
                                express.runResult.value = express.exp.runResult.value + 1;
                            }
                            else {
                                express.runResult.value = express.exp.runResult.value;
                            }
                            express.exp.runResult.value += 1;
                            break;
                        case Lang.VeName.DEC:
                            if (express.arrow == Lang.UnaryArrow.left) {
                                express.runResult.value = express.exp.runResult.value - 1;
                            }
                            else {
                                express.runResult.value = express.exp.runResult.value;
                            }
                            express.exp.runResult.value -= 1;
                            break;
                        case Lang.VeName.NOT:
                            this.accept(express.exp);
                            express.runResult.value = !express.exp.runResult.value;
                            break;
                    }
                },
                ternary(express) {
                    this.accept(express.where);
                    this.accept(express.trueCondition);
                    this.accept(express.falseCondition);
                    if (express.where.runResult.value) {
                        express.runResult.value = express.trueCondition.runResult.value;
                    }
                    else {
                        express.runResult.value = express.falseCondition.runResult.value;
                    }
                }
            };
        })(Run = Lang.Run || (Lang.Run = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Run;
        (function (Run) {
            Run.Run$Data = {
                constant(express) {
                    var name = express.infer.expressType.name.toLowerCase();
                    if (name == 'string' || name == 'number' || name == 'bool') {
                        express.runResult.value = express.value;
                    }
                    else {
                        express.runResult.value = { __$type: name, value: express.value };
                    }
                },
                arrowMethod(express) {
                    express.returnType.runResult.value = { __$type: 'fun', caller: express };
                },
                array(express) {
                    express.args.each(arg => this.accept(arg));
                    express.runResult.value = express.args.map(arg => arg.runResult.value);
                },
                Object(express) {
                    express.propertys.each(pro => this.accept(pro.value));
                    express.runResult.value = {};
                    express.propertys.each(pro => {
                        express.runResult.value[pro.key] = pro.value.runResult.value;
                    });
                },
                arrayIndex(node) {
                    this.accept(node.indexExpress);
                },
                declareVariable(express) {
                    if (express.value) {
                        this.accept(express.value);
                        express.runResult.value = express.value.runResult.value;
                    }
                },
                variable(express) {
                    if (typeof express.infer.referenceStatement != typeof undefined) {
                        switch (express.infer.referenceStatement.kind) {
                            case Lang.StatementReferenceKind.FunArgs:
                            case Lang.StatementReferenceKind.currentClassMethodArgs:
                                express.runResult.value = express.infer.referenceStatement.target.runResult.value;
                                break;
                            case Lang.StatementReferenceKind.outerClassProperty:
                                var cp = express.infer.referenceStatement.referenceStatement;
                                if (cp.value) {
                                    this.accept(cp.value);
                                    express.runResult.value = cp.value.runResult.value;
                                }
                                else {
                                    express.runResult.value = null;
                                }
                                break;
                        }
                    }
                }
            };
        })(Run = Lang.Run || (Lang.Run = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Run;
        (function (Run) {
            Run.Run$ObjectReferenceProperty = {
                objectReferenceProperty(express) {
                    var referenceType;
                    var rv = express.runResult;
                    var names = new Lang.VeArray;
                    for (var i = 0; i < express.propertys.length; i++) {
                        var ep = express.propertys.eq(i);
                        if (typeof ep == 'string') {
                            if (typeof referenceType != typeof undefined) {
                                switch (referenceType.kind) {
                                    case Lang.TypeKind.unit:
                                        var typeClass = Lang.Statement.search(express, referenceType.name, x => { if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                            return false; }).referenceStatement;
                                        if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                        }
                                        else {
                                            var cp = typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method);
                                            if (cp) {
                                                referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                rv.value = this.callObjectProp(express, cp, rv.value);
                                            }
                                            else
                                                this.error(`not found class ${typeClass.name} property:${ep}`);
                                        }
                                        break;
                                    case Lang.TypeKind.union:
                                        var typeClass = Lang.Statement.search(express, referenceType.unionType.name, x => { if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                            return false; }).referenceStatement;
                                        if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                        }
                                        else {
                                            var cp = typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method);
                                            if (cp) {
                                                referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                var map = {};
                                                typeClass.generics.each((gen, i) => map[gen.key] = referenceType.generics.eq(i));
                                                if (referenceType)
                                                    referenceType = referenceType.injectGenericImplement(map);
                                                rv.value = this.callObjectProp(express, cp, rv.value);
                                            }
                                            else {
                                                this.error(`not found class ${typeClass.name} property:${ep}`);
                                            }
                                        }
                                        break;
                                    case Lang.TypeKind.object:
                                        var prop = referenceType.props.find(x => x.type == name);
                                        if (prop) {
                                            referenceType = prop.type;
                                            if (typeof rv.value[prop.key] != typeof undefined)
                                                rv.value = rv.value[prop.key];
                                            else
                                                rv.value = null;
                                        }
                                        break;
                                }
                            }
                            else {
                                names.push(ep);
                                var referenceStatement = Lang.Statement.search(express, names.join("."));
                                if (referenceStatement) {
                                    switch (referenceStatement.kind) {
                                        case Lang.StatementReferenceKind.FunArgs:
                                        case Lang.StatementReferenceKind.currentClassMethodArgs:
                                            var target = referenceStatement.target;
                                            referenceType = target.parameterType || (target.default ? target.default.valueType : undefined);
                                            rv.value = target.runResult.value;
                                            break;
                                        case Lang.StatementReferenceKind.outerClass:
                                            if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                            }
                                            break;
                                        case Lang.StatementReferenceKind.outerClassProperty:
                                            var cp = referenceStatement.referenceStatement;
                                            referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                            this.accept(referenceStatement.referenceStatement);
                                            rv.value = referenceStatement.referenceStatement.runResult.value;
                                            break;
                                        case Lang.StatementReferenceKind.DeclareVariable:
                                            referenceType = referenceStatement.referenceStatement.infer.expressType;
                                            rv.value = referenceStatement.referenceStatement.runResult.value;
                                            break;
                                    }
                                }
                            }
                        }
                        else if (ep instanceof Lang.Expression) {
                            this.accept(ep);
                            referenceType = ep.infer.expressType;
                            rv.value = ep.runResult.value;
                        }
                    }
                    if (referenceType)
                        express.infer.expressType = referenceType;
                },
                callMethod(express) {
                    express.args.each(arg => this.accept(arg));
                    if (typeof express.name == 'string') {
                        this.accept(express.infer.referenceStatement.referenceStatement);
                    }
                    else if (express.name instanceof Lang.PropertyExpression) {
                        this.accept(express.name);
                    }
                    if (typeof express.infer.referenceStatement != typeof undefined) {
                        switch (express.infer.referenceStatement.kind) {
                            case Lang.StatementReferenceKind.DeclareFun:
                                this.accept(express.infer.referenceStatement.referenceStatement);
                                var caller = express.infer.referenceStatement.referenceStatement.runResult.caller;
                                if (typeof caller != typeof undefined) {
                                    express.runResult.value = this.callMethod(express, caller, ...express.args.map(x => x.runResult.value));
                                }
                                break;
                            case Lang.StatementReferenceKind.currentClassMethodArgs:
                            case Lang.StatementReferenceKind.FunArgs:
                                var ca = express.infer.referenceStatement.target.caller;
                                if (typeof caller != typeof undefined) {
                                    express.runResult.value = this.callMethod(express, ca, ...express.args.map(x => x.runResult.value));
                                }
                                break;
                            case Lang.StatementReferenceKind.outerClassProperty:
                                var cp = express.infer.referenceStatement.referenceStatement;
                                if (cp.isCtor) {
                                    var $this = JSON.parse(JSON.stringify(cp.class.runResult.value));
                                    this.callObjectProp(express, cp, $this, ...express.args.map(x => x.runResult.value));
                                    express.runResult.value = $this;
                                }
                                else {
                                    var context = express.name.runResult.value;
                                    express.runResult.value = this.callObjectProp(express, cp, context, ...express.args.map(x => x.runResult.value));
                                }
                                break;
                            case Lang.StatementReferenceKind.outerClass:
                                var cl = express.infer.referenceStatement.referenceStatement;
                                this.accept(cl);
                                var $this = JSON.parse(JSON.stringify(cl.runResult.value));
                                if (cl.body.exists(x => x instanceof Lang.ClassProperty && x.isCtor && x.args.length == 0)) {
                                    var cp = cl.body.find(x => x instanceof Lang.ClassProperty && x.isCtor && x.args.length == 0);
                                    this.callObjectProp(express, cp, $this, ...express.args.map(x => x.runResult.value));
                                }
                                express.runResult.value = $this;
                                break;
                        }
                    }
                }
            };
        })(Run = Lang.Run || (Lang.Run = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Run;
        (function (Run) {
            Run.Run$Statement = {
                return(statement) {
                    this.accept(statement.expression);
                    statement.runResult.value - statement.expression.runResult.value;
                    statement.scope.runResult.return = true;
                    statement.scope.runResult.value = statement.expression.runResult.value;
                },
                continue(statement) {
                    var c = statement.closest(x => x instanceof Lang.ForStatement || x instanceof Lang.WhileStatement || x instanceof Lang.DoWhileStatement);
                    if (c) {
                        c.runResult.continue = true;
                    }
                },
                break(statement) {
                    var c = statement.closest(x => x instanceof Lang.SwitchStatement || x instanceof Lang.ForStatement || x instanceof Lang.WhileStatement || x instanceof Lang.DoWhileStatement);
                    if (c) {
                        c.runResult.continue = true;
                    }
                },
                context(statement) {
                    var ci = statement.closest(x => x instanceof Lang.ClassOrIntrfaceStatement);
                    statement.runResult.value = ci.runResult.context;
                },
                throw(statement) {
                    this.accept(statement.expression);
                    statement.scope.runResult.throw = true;
                    statement.scope.runResult.traces.push({ statement: statement, value: statement.expression.runResult.value });
                },
                if(statement) {
                    this.accept(statement.ifCondition);
                    if (statement.ifCondition.runResult.value == true) {
                        this.runStatements(statement.ifStatement);
                        return;
                    }
                    for (let i = 0; i < statement.thenConditions.length; i++) {
                        var c = statement.thenConditions[i];
                        this.accept(c);
                        if (c.runResult.value == true) {
                            this.runStatements(statement.thenStatements.eq(i));
                            return;
                        }
                    }
                    statement.elseStatement.each(s => this.accept(s));
                },
                for(statement) {
                    this.accept(statement.initStatement);
                    while (true) {
                        this.accept(statement.condition);
                        if (statement.condition.runResult.value == true) {
                            for (let i = 0; i < statement.body.length; i++) {
                                this.accept(statement.body[i]);
                                if (statement.runResult.continue == true) {
                                    this.accept(statement.next);
                                    continue;
                                }
                                else if (statement.runResult.break == true) {
                                    this.accept(statement.next);
                                    break;
                                }
                                else if (statement.scope.runResult.return == true) {
                                    break;
                                }
                                else if (statement.scope.runResult.throw == true) {
                                    break;
                                }
                            }
                            this.accept(statement.next);
                        }
                        else {
                            this.accept(statement.next);
                            break;
                        }
                    }
                },
                while(statement) {
                    while (true) {
                        this.accept(statement.condition);
                        if (statement.condition.runResult.value == true) {
                            for (let i = 0; i < statement.body.length; i++) {
                                this.accept(statement.body[i]);
                                if (statement.runResult.continue == true) {
                                    continue;
                                }
                                else if (statement.runResult.break == true) {
                                    this.accept(statement.next);
                                    break;
                                }
                                else if (statement.scope.runResult.return == true) {
                                    break;
                                }
                                else if (statement.scope.runResult.throw == true) {
                                    break;
                                }
                            }
                        }
                        else {
                            break;
                        }
                    }
                },
                doWhile(statement) {
                    while (true) {
                        if (statement.condition.runResult.value == true) {
                            for (let i = 0; i < statement.body.length; i++) {
                                this.accept(statement.body[i]);
                                if (statement.runResult.continue == true) {
                                    continue;
                                }
                                else if (statement.runResult.break == true) {
                                    this.accept(statement.next);
                                    break;
                                }
                                else if (statement.scope.runResult.return == true) {
                                    break;
                                }
                                else if (statement.scope.runResult.throw == true) {
                                    break;
                                }
                            }
                        }
                        this.accept(statement.condition);
                        if (statement.condition.runResult.value != true) {
                            break;
                        }
                    }
                },
                fun(statement) {
                    statement.returnType.runResult.value = { __$type: statement.name, caller: statement };
                },
                switch(statement) {
                    this.accept(statement.valueExpression);
                    statement.caseStatements.each(s => this.accept(s.value));
                    var caseIndex = statement.caseStatements.findIndex(x => x.value.runResult.value == statement.valueExpression.runResult.value);
                    if (caseIndex > -1) {
                        for (let i = caseIndex; i < statement.caseStatements.length; i++) {
                            var isbreak = false;
                            statement.caseStatements[i].matchs.each(match => {
                                this.accept(match);
                                if (statement.runResult.break == true) {
                                    isbreak = true;
                                    return false;
                                }
                                else if (statement.scope.runResult.return == true) {
                                    isbreak = true;
                                    return false;
                                }
                                else if (statement.scope.runResult.throw == true) {
                                    isbreak = true;
                                    return false;
                                }
                            });
                            if (isbreak) {
                                break;
                            }
                        }
                    }
                    else {
                        for (let i = 0; i < statement.defaultStatement.length; i++) {
                            this.accept(statement[i]);
                            if (statement.runResult.break == true) {
                                isbreak = true;
                                return false;
                            }
                            else if (statement.scope.runResult.return == true) {
                                isbreak = true;
                                return false;
                            }
                        }
                    }
                },
                try(statement) {
                    var isReturn = false;
                    for (let i = 0; i < statement.tryStatement.length; i++) {
                        this.accept(statement.tryStatement[i]);
                        if (statement.scope.runResult.return == true) {
                            isReturn = true;
                            break;
                        }
                        else if (statement.scope.runResult.throw == true) {
                            break;
                        }
                    }
                    if (isReturn != true) {
                        if (statement.scope.runResult.throw == true) {
                            statement.catchParameter.first().runResult.value = statement.scope.runResult.traces[0].value;
                            statement.scope.runResult.throw = false;
                            statement.scope.runResult.traces = [];
                            this.runStatements(statement.catchStatement);
                        }
                        this.runStatements(statement.finallyStatement);
                    }
                },
                use(statement) {
                },
                package(statement) {
                },
                class(statement) {
                    statement.runResult.value = {};
                    statement.body.each(s => {
                        if (s.kind == Lang.ClassPropertyKind.prop) {
                            this.accept(s);
                            statement.runResult.value[s.name] = s.runResult.value;
                        }
                    });
                },
                classProperty(statement) {
                    if (statement.value) {
                        this.accept(statement.value);
                        statement.runResult.value = statement.value.runResult.value;
                    }
                }
            };
        })(Run = Lang.Run || (Lang.Run = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class RunResult {
            constructor() {
                this.context = null;
                this.value = null;
                this.continue = false;
                this.break = false;
                this.return = false;
                this.throw = false;
                this.traces = new Lang.VeArray();
            }
        }
        Lang.RunResult = RunResult;
        class Runner {
            compile(code, ...args) {
                var ast = new Lang.AstParser();
                var node = ast.compile(code);
                var cp;
                var fm = (x) => {
                    return x instanceof Lang.ClassProperty && x.isStatic == true && x.name == 'Main' && x.kind == Lang.ClassPropertyKind.method;
                };
                if (Array.isArray(node)) {
                    node.each(n => {
                        var c = n.find(fm);
                        if (c) {
                            cp = c;
                            return false;
                        }
                    });
                }
                else {
                    cp = node.find(fm);
                }
                if (cp) {
                    var rv = new RunVisitor(cp);
                    return rv.callMethod(cp, cp, ...args);
                }
                else {
                    throw 'not found static main method';
                }
            }
            compileExpress(code, ...args) {
                var ast = new Lang.AstParser();
                var node = ast.compileExpress(code, args);
                var cp = node.parent.parent;
                var rv = new RunVisitor(cp);
                return rv.callMethod(cp, cp, ...args.map(x => {
                    return x.value;
                }));
            }
        }
        Lang.Runner = Runner;
        class RunVisitor extends Lang.AstVisitor {
            constructor() {
                super(...arguments);
                this.accepter = Lang.RunAccepter;
            }
            callObjectProp(node, statement, $this, ...args) {
                statement.class.runResult.context = $this;
                statement.args.each((arg, i) => {
                    arg.runResult.value = args[i];
                });
                var className = statement.class.fullName;
                var rc = Lang.Run.runMethod.find(x => x.name == className);
                if (rc) {
                    var propName = statement.unqiueName.replace(className + ".", "");
                    if (typeof rc.props[propName] == 'function') {
                        try {
                            statement.runResult.value = rc.props[propName].apply(this, [$this, ...args]);
                        }
                        catch (e) {
                            statement.runResult.throw = false;
                            statement.runResult.traces.push({ statement: node, value: e });
                        }
                        return statement.runResult.value;
                    }
                }
                statement.body.each(s => {
                    this.accept(s);
                    if (statement.runResult.return == true) {
                        return false;
                    }
                });
                if (statement.runResult.throw == true) {
                    node.scope.runResult.throw = true;
                    node.scope.runResult.traces.push({ statement: node });
                }
                return statement.runResult.value;
            }
            callMethod(node, statement, ...args) {
                statement.args.each((arg, i) => {
                    arg.runResult.value = args[i];
                });
                statement.body.each(s => {
                    this.accept(s);
                    if (statement.runResult.return == true) {
                        return false;
                    }
                });
                if (statement.runResult.throw == true) {
                    node.scope.runResult.throw = true;
                }
                return statement.runResult.value;
            }
            runStatements(sts) {
                for (let i = 0; i < sts.length; i++) {
                    this.accept(sts[i]);
                    if (sts[i].scope.runResult.return == true) {
                        break;
                    }
                    else if (sts[i].scope.runResult.throw == true) {
                        break;
                    }
                }
            }
        }
        Lang.RunVisitor = RunVisitor;
        Lang.RunAccepter = {};
        Lang.applyExtend(Lang.RunAccepter, Lang.Run.Run$Statement, Lang.Run.Run$ObjectReferenceProperty, Lang.Run.Run$Data, Lang.Run.Run$Binary);
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Run;
        (function (Run) {
            Run.runMethod = [{
                    name: 'Ve.String',
                    props: {
                        length($this) {
                            return $this.length;
                        },
                        count(value) {
                            var len = 0;
                            for (var i = 0; i < value.length; i++) {
                                if (value.charCodeAt(i) > 127 || value.charCodeAt(i) == 94) {
                                    len += 2;
                                }
                                else {
                                    len++;
                                }
                            }
                            return len;
                        }
                    }
                }];
        })(Run = Lang.Run || (Lang.Run = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class VeArray extends Array {
            constructor(...args) {
                super();
                if (args.length > 1) {
                    args.forEach(arg => this.push(arg));
                }
                else if (args.length == 1) {
                    if (args[0] instanceof VeArray) {
                        args[0].forEach(x => this.push(x));
                    }
                    else if (Array.isArray(args[0])) {
                        args[0].forEach(x => this.push(x));
                    }
                    else
                        this.push(args[0]);
                }
            }
            predicateMatch(item, index, array, predicate) {
                if (typeof predicate == 'function') {
                    return predicate(item, index, array);
                }
                else
                    return predicate == item;
            }
            last() {
                return this.eq(this.length - 1);
            }
            first() {
                return this.eq(0);
            }
            eq(pos) {
                return this[pos];
            }
            map(predicate) {
                var ve = new VeArray();
                for (var i = 0; i < this.length; i++) {
                    var r = predicate(this.eq(i), i, this);
                    if (typeof r != typeof undefined) {
                        ve.push(r);
                    }
                }
                return ve;
            }
            append(a, pos) {
                this.insertAt(pos || this.length, a);
                return this;
            }
            insertAt(pos, a) {
                if (a instanceof VeArray) {
                    var args = [pos, 0];
                    a.forEach(x => args.push(x));
                    Array.prototype.splice.apply(this, args);
                }
                else if (a instanceof Array) {
                    var args = [pos, 0];
                    a.forEach(x => args.push(x));
                    Array.prototype.splice.apply(this, args);
                }
                else {
                    this.splice(pos, 0, a);
                }
                return this;
            }
            replaceAt(pos, a) {
                this[pos] = a;
                return this;
            }
            appendArray(a, pos) {
                this.insertArrayAt(pos || this.length, a);
                return this;
            }
            insertArrayAt(pos, a) {
                this.splice(pos, 0, a);
                return this;
            }
            removeAt(pos) {
                this.splice(pos, 1);
                return this;
            }
            remove(predicate) {
                var i = this.length - 1;
                for (i; i >= 0; i--) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                        this.removeAt(i);
                        break;
                    }
                }
                return this;
            }
            removeAll(predicate) {
                var i = this.length - 1;
                for (i; i >= 0; i--) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                        this.removeAt(i);
                    }
                }
                return this;
            }
            removeBefore(predicate, isIncludeFind) {
                var index = this.findIndex(predicate);
                if (isIncludeFind == true)
                    this.removeAll((x, i) => i <= index);
                else
                    this.removeAll((x, i) => i < index);
                return this;
            }
            removeAfter(predicate, isIncludeFind) {
                var index = this.findIndex(predicate);
                if (isIncludeFind == true)
                    this.removeAll((x, i) => i >= index);
                else
                    this.removeAll((x, i) => i > index);
                return this;
            }
            exists(predicate) {
                return this.findIndex(predicate) >= 0;
            }
            find(predicate) {
                for (let i = 0; i < this.length; i++) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                        return this.eq(i);
                    }
                }
                return null;
            }
            findLast(predicate) {
                for (var i = this.length - 1; i >= 0; i--) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                        return this.eq(i);
                    }
                }
                return null;
            }
            findBefore(indexPredict, predict, isIncludeSelf = false) {
                var index = this.findIndex(indexPredict);
                for (let i = 0; i < index - (isIncludeSelf == true ? 0 : 1); i++) {
                    if (this.predicateMatch(this.eq(i), i, this, predict) == true) {
                        return this.eq(i);
                    }
                }
                return null;
            }
            findAfter(indexPredict, predict, isIncludeSelf = false) {
                var index = this.findIndex(indexPredict);
                for (let i = index + (isIncludeSelf == true ? 0 : 1); i < this.length; i++) {
                    if (this.predicateMatch(this.eq(i), i, this, predict) == true) {
                        return this.eq(i);
                    }
                }
                return null;
            }
            findSkip(predicate, skip = 1) {
                var index = this.findIndex(predicate);
                return this.eq(index + skip);
            }
            findRange(predicate, predicate2) {
                var start = this.findIndex(predicate);
                var end = this.findIndex(predicate2);
                return this.range(start, end);
            }
            findAll(predicate) {
                var result = new VeArray();
                for (var i = 0; i < this.length; i++) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                        result.push(this.eq(i));
                    }
                }
                return result;
            }
            findIndex(predicate, defaultIndex) {
                for (var i = 0; i < this.length; i++) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                        return i;
                    }
                }
                if (typeof defaultIndex == 'number')
                    return defaultIndex;
                return -1;
            }
            findLastIndex(predicate, defaultIndex) {
                var i = this.length - 1;
                for (i; i >= 0; i--) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                        return i;
                    }
                }
                if (typeof defaultIndex == 'number')
                    return defaultIndex;
                return -1;
            }
            forEach(predicate) {
                this.each(predicate);
            }
            each(predicate) {
                for (var i = 0; i < this.length; i++) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate) == false) {
                        break;
                    }
                }
            }
            reach(predicate) {
                this.eachReverse(predicate);
            }
            recursion(predicate) {
                var next = (i) => {
                    if (i < this.length)
                        predicate(this.eq(i), i, next);
                };
                predicate(this.eq(0), 0, next);
            }
            eachReverse(predicate) {
                for (var i = this.length - 1; i >= 0; i--) {
                    if (this.predicateMatch(this.eq(i), i, this, predicate)) {
                        break;
                    }
                }
            }
            limit(index, size) {
                if (size <= 0) {
                    return new VeArray();
                }
                return this.range(index, index + size - 1);
            }
            range(start, end) {
                var arr = new VeArray();
                if (typeof end == typeof undefined)
                    end = this.length;
                this.each(function (val, i) {
                    if (i >= start && i <= end) {
                        arr.push(val);
                    }
                });
                return arr;
            }
            split(predicate) {
                var list = new VeArray();
                var gs = new VeArray();
                var self = this;
                this.each(function (val, i, arr) {
                    if (self.predicateMatch(val, i, arr, predicate) == true) {
                        if (gs.length > 0)
                            list.appendArray(gs);
                        gs = new VeArray();
                    }
                    else
                        gs.append(val);
                });
                if (gs.length > 0)
                    list.appendArray(gs);
                return list;
            }
            matchIndex(regex, map, startIndex) {
                if (typeof startIndex == typeof undefined)
                    startIndex = 0;
                var text = this.findAll((x, i) => i >= startIndex).map(map).join("");
                if (typeof regex == 'string')
                    regex = new RegExp(regex);
                var match = text.match(regex);
                if (match && match.index == 0) {
                    var mt = match[0];
                    var rt = '';
                    for (var i = startIndex; i < this.length; i++) {
                        rt += map(this.eq(i), i, this);
                        if (rt == mt) {
                            return i;
                        }
                    }
                }
                return -1;
            }
            match(regex, map, startIndex) {
                if (typeof startIndex == typeof undefined)
                    startIndex = 0;
                var mi = this.matchIndex(regex, map, startIndex);
                return this.range(startIndex, mi);
            }
            copy() {
                return this.map(x => x);
            }
            asArray() {
                var as = new Array();
                this.each(t => {
                    as.push(t);
                });
                return as;
            }
            arrayJsonEach(arrayJsonName, fn, parent, defaultDeep, defaultIndex) {
                var maxDeep = defaultDeep == undefined ? 0 : defaultDeep;
                var index = defaultIndex == undefined ? 0 : defaultIndex;
                var isBreak = false;
                var fc = function (arr, deep, parent) {
                    if (deep > maxDeep) {
                        maxDeep = deep;
                    }
                    var sort = 0;
                    Lang._.each(arr, function (a) {
                        if (isBreak) {
                            return false;
                        }
                        var r = fn(a, deep, index, sort, parent, arr);
                        if (r && r.break == true) {
                            isBreak = true;
                        }
                        if (isBreak) {
                            return false;
                        }
                        if (r && r.continue == true) {
                            return;
                        }
                        index += 1;
                        sort += 1;
                        if (a && Array.isArray(a[arrayJsonName]) && a[arrayJsonName].length > 0) {
                            fc(a[arrayJsonName], deep + 1, r && r.returns ? r.returns : undefined);
                        }
                    });
                };
                fc(this, maxDeep, parent);
                return { total: index, deep: maxDeep };
            }
            static isVeArray(t) {
                return t instanceof VeArray;
            }
            static asVeArray(t) {
                if (t instanceof VeArray)
                    return t;
                else
                    return new VeArray(t);
            }
        }
        Lang.VeArray = VeArray;
        Lang._ = {
            remove(array, predict) {
                var index = this.findIndex(array, predict);
                if (index > -1)
                    array.splice(index, 1);
            },
            removeAll(array, predict) {
                for (let i = array.length - 1; i >= 0; i--) {
                    if (typeof predict == 'function') {
                        var r = predict(array[i], i, array);
                        if (r == true)
                            array.splice(i, 1);
                    }
                    else if (predict === array[i]) {
                        array.splice(i, 1);
                    }
                }
            },
            each(array, predict) {
                for (let i = 0; i < array.length; i++) {
                    let data = array[i];
                    if (typeof predict == 'function') {
                        var result = predict(data, i, array);
                        if (result == false)
                            break;
                    }
                }
            },
            addRange(array, newArray) {
                newArray.forEach(t => array.push(t));
            },
            find(array, predict) {
                for (let i = 0; i < array.length; i++) {
                    if (typeof predict == 'function') {
                        var r = predict(array[i], i, array);
                        if (r == true)
                            return array[i];
                    }
                }
            },
            findIndex(array, predict) {
                for (let i = 0; i < array.length; i++) {
                    if (typeof predict == 'function') {
                        var r = predict(array[i], i, array);
                        if (r == true)
                            return i;
                    }
                    else if (predict === array[i]) {
                        return i;
                    }
                }
            },
            exists(array, predict) {
                return this.findIndex(array, predict) > -1 ? true : false;
            },
            arrayJsonEach(array, arrayJsonName, fn, parent, defaultDeep, defaultIndex) {
                var maxDeep = defaultDeep == undefined ? 0 : defaultDeep;
                var index = defaultIndex == undefined ? 0 : defaultIndex;
                var isBreak = false;
                var fc = function (arr, deep, parent) {
                    if (deep > maxDeep) {
                        maxDeep = deep;
                    }
                    var sort = 0;
                    arr.forEach(function (a) {
                        if (isBreak) {
                            return false;
                        }
                        var r = fn(a, deep, index, sort, parent, arr);
                        if (r && r.break == true) {
                            isBreak = true;
                        }
                        if (isBreak) {
                            return false;
                        }
                        if (r && r.continue == true) {
                            return;
                        }
                        index += 1;
                        sort += 1;
                        if (a && Array.isArray(a[arrayJsonName])) {
                            fc(a[arrayJsonName], deep + 1, r && r.returns ? r.returns : undefined);
                        }
                    });
                };
                fc(array, maxDeep, parent);
                return { total: index, deep: maxDeep };
            }
        };
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let SymbolType;
        (function (SymbolType) {
            SymbolType[SymbolType["statement"] = 0] = "statement";
            SymbolType[SymbolType["constant"] = 1] = "constant";
            SymbolType[SymbolType["accessor"] = 2] = "accessor";
            SymbolType[SymbolType["declaration"] = 3] = "declaration";
            SymbolType[SymbolType["unary"] = 4] = "unary";
            SymbolType[SymbolType["tertiary"] = 5] = "tertiary";
            SymbolType[SymbolType["binary"] = 6] = "binary";
            SymbolType[SymbolType["block"] = 7] = "block";
            SymbolType[SymbolType["closeBlock"] = 8] = "closeBlock";
            SymbolType[SymbolType["modifier"] = 9] = "modifier";
            SymbolType[SymbolType["multiple"] = 10] = "multiple";
            SymbolType[SymbolType["quote"] = 11] = "quote";
            SymbolType[SymbolType["escape"] = 12] = "escape";
            SymbolType[SymbolType["keyWord"] = 13] = "keyWord";
        })(SymbolType = Lang.SymbolType || (Lang.SymbolType = {}));
        let OperatorDirection;
        (function (OperatorDirection) {
            OperatorDirection[OperatorDirection["left"] = 0] = "left";
            OperatorDirection[OperatorDirection["right"] = 1] = "right";
        })(OperatorDirection = Lang.OperatorDirection || (Lang.OperatorDirection = {}));
        let VeName;
        (function (VeName) {
            VeName[VeName["FOR"] = 0] = "FOR";
            VeName[VeName["WHILE"] = 1] = "WHILE";
            VeName[VeName["DO"] = 2] = "DO";
            VeName[VeName["IF"] = 3] = "IF";
            VeName[VeName["ELSE"] = 4] = "ELSE";
            VeName[VeName["ELSE_ZH"] = 5] = "ELSE_ZH";
            VeName[VeName["ELSEIF"] = 6] = "ELSEIF";
            VeName[VeName["SWITCH"] = 7] = "SWITCH";
            VeName[VeName["CASE"] = 8] = "CASE";
            VeName[VeName["DEFAULT"] = 9] = "DEFAULT";
            VeName[VeName["TRY"] = 10] = "TRY";
            VeName[VeName["CATCH"] = 11] = "CATCH";
            VeName[VeName["FINALLY"] = 12] = "FINALLY";
            VeName[VeName["CONTINUE"] = 13] = "CONTINUE";
            VeName[VeName["BREAK"] = 14] = "BREAK";
            VeName[VeName["RETURN"] = 15] = "RETURN";
            VeName[VeName["THROW"] = 16] = "THROW";
            VeName[VeName["NULL_LITERAL"] = 17] = "NULL_LITERAL";
            VeName[VeName["TRUE_LITERAL"] = 18] = "TRUE_LITERAL";
            VeName[VeName["FALSE_LITERAL"] = 19] = "FALSE_LITERAL";
            VeName[VeName["AS"] = 20] = "AS";
            VeName[VeName["IS"] = 21] = "IS";
            VeName[VeName["NEW"] = 22] = "NEW";
            VeName[VeName["MATCH"] = 23] = "MATCH";
            VeName[VeName["CONTAIN"] = 24] = "CONTAIN";
            VeName[VeName["STATR"] = 25] = "STATR";
            VeName[VeName["END"] = 26] = "END";
            VeName[VeName["EXTENDS"] = 27] = "EXTENDS";
            VeName[VeName["K_EQ"] = 28] = "K_EQ";
            VeName[VeName["K_AND"] = 29] = "K_AND";
            VeName[VeName["K_OR"] = 30] = "K_OR";
            VeName[VeName["K_XOR"] = 31] = "K_XOR";
            VeName[VeName["SUPER"] = 32] = "SUPER";
            VeName[VeName["THIS"] = 33] = "THIS";
            VeName[VeName["VALUE"] = 34] = "VALUE";
            VeName[VeName["GET"] = 35] = "GET";
            VeName[VeName["SET"] = 36] = "SET";
            VeName[VeName["FUN"] = 37] = "FUN";
            VeName[VeName["CLASS"] = 38] = "CLASS";
            VeName[VeName["PACKAGE"] = 39] = "PACKAGE";
            VeName[VeName["USE"] = 40] = "USE";
            VeName[VeName["DEF"] = 41] = "DEF";
            VeName[VeName["INTERFACE"] = 42] = "INTERFACE";
            VeName[VeName["ENUM"] = 43] = "ENUM";
            VeName[VeName["PUBLIC"] = 44] = "PUBLIC";
            VeName[VeName["PRIVATE"] = 45] = "PRIVATE";
            VeName[VeName["PROTECTED"] = 46] = "PROTECTED";
            VeName[VeName["SEALED"] = 47] = "SEALED";
            VeName[VeName["CONST"] = 48] = "CONST";
            VeName[VeName["STATIC"] = 49] = "STATIC";
            VeName[VeName["READONLY"] = 50] = "READONLY";
            VeName[VeName["OVERRIDE"] = 51] = "OVERRIDE";
            VeName[VeName["EXPORT"] = 52] = "EXPORT";
            VeName[VeName["IN"] = 53] = "IN";
            VeName[VeName["LPAREN"] = 54] = "LPAREN";
            VeName[VeName["RPAREN"] = 55] = "RPAREN";
            VeName[VeName["LBRACK"] = 56] = "LBRACK";
            VeName[VeName["RBRACK"] = 57] = "RBRACK";
            VeName[VeName["LBRACE"] = 58] = "LBRACE";
            VeName[VeName["STRING_LBRACE"] = 59] = "STRING_LBRACE";
            VeName[VeName["RBRACE"] = 60] = "RBRACE";
            VeName[VeName["COLON"] = 61] = "COLON";
            VeName[VeName["SEMICOLON"] = 62] = "SEMICOLON";
            VeName[VeName["PERIOD"] = 63] = "PERIOD";
            VeName[VeName["NULL_PERIOD"] = 64] = "NULL_PERIOD";
            VeName[VeName["ELLIPSIS"] = 65] = "ELLIPSIS";
            VeName[VeName["CONDITIONAL"] = 66] = "CONDITIONAL";
            VeName[VeName["INC"] = 67] = "INC";
            VeName[VeName["DEC"] = 68] = "DEC";
            VeName[VeName["ARROW"] = 69] = "ARROW";
            VeName[VeName["ASSIGN"] = 70] = "ASSIGN";
            VeName[VeName["ASSIGN_ADD"] = 71] = "ASSIGN_ADD";
            VeName[VeName["ASSIGN_SUB"] = 72] = "ASSIGN_SUB";
            VeName[VeName["ASSIGN_MUL"] = 73] = "ASSIGN_MUL";
            VeName[VeName["ASSIGN_DIV"] = 74] = "ASSIGN_DIV";
            VeName[VeName["ASSIGN_MOD"] = 75] = "ASSIGN_MOD";
            VeName[VeName["ASSIGN_EXP"] = 76] = "ASSIGN_EXP";
            VeName[VeName["COMMA"] = 77] = "COMMA";
            VeName[VeName["OR"] = 78] = "OR";
            VeName[VeName["AND"] = 79] = "AND";
            VeName[VeName["XOR"] = 80] = "XOR";
            VeName[VeName["ADD"] = 81] = "ADD";
            VeName[VeName["SUB"] = 82] = "SUB";
            VeName[VeName["MUL"] = 83] = "MUL";
            VeName[VeName["DIV"] = 84] = "DIV";
            VeName[VeName["MOD"] = 85] = "MOD";
            VeName[VeName["EXP"] = 86] = "EXP";
            VeName[VeName["EQ"] = 87] = "EQ";
            VeName[VeName["NOT"] = 88] = "NOT";
            VeName[VeName["NE"] = 89] = "NE";
            VeName[VeName["LT"] = 90] = "LT";
            VeName[VeName["GT"] = 91] = "GT";
            VeName[VeName["LTE"] = 92] = "LTE";
            VeName[VeName["GTE"] = 93] = "GTE";
            VeName[VeName["COMMENT"] = 94] = "COMMENT";
            VeName[VeName["COMMENT_BLOCK"] = 95] = "COMMENT_BLOCK";
            VeName[VeName["COMMENT_CLOSEBLOCK"] = 96] = "COMMENT_CLOSEBLOCK";
            VeName[VeName["SINGLE_QUOTE"] = 97] = "SINGLE_QUOTE";
            VeName[VeName["DOUBLE_QUOTE"] = 98] = "DOUBLE_QUOTE";
            VeName[VeName["ESCAPTE"] = 99] = "ESCAPTE";
            VeName[VeName["SPLIIT"] = 100] = "SPLIIT";
        })(VeName = Lang.VeName || (Lang.VeName = {}));
        let VeBaseTypeKind;
        (function (VeBaseTypeKind) {
            VeBaseTypeKind[VeBaseTypeKind["value"] = 0] = "value";
            VeBaseTypeKind[VeBaseTypeKind["ref"] = 1] = "ref";
        })(VeBaseTypeKind = Lang.VeBaseTypeKind || (Lang.VeBaseTypeKind = {}));
        let language;
        (function (language) {
            language[language["en"] = 0] = "en";
            language[language["zh"] = 1] = "zh";
        })(language = Lang.language || (Lang.language = {}));
        class _VeSyntax {
            constructor() {
                this.keywords = new Lang.VeArray();
                this.operators = new Lang.VeArray();
                this.blocks = new Lang.VeArray();
                this.word = /^[a-zA-Z_\$@\u4E00-\u9FA5][a-zA-Z_\$@\u4E00-\u9FA5\d]*/;
                this.unit = '([a-zA-Z_\\\$@\\\u4E00-\\\u9FA5][a-zA-Z_\\\$@\\\u4E00-\\\u9FA5\\\d]*)';
                this.notWord = /[^a-zA-Z_\$@\u4E00-\u9FA5\d]+/;
                this.number = /\d+(\.[\d]+)?(e[\d]+)?/;
                this.negativeNumber = /\-\d+(\.[\d]+)?(e[\d]+)?/;
                var K = (name, string, type, precedence, lang, direction) => {
                    if (typeof precedence == typeof undefined)
                        precedence = -1;
                    if (typeof direction == typeof undefined)
                        direction = OperatorDirection.left;
                    this.keywords.append({ name, string, type: Lang.VeArray.asVeArray(type), precedence, lang: lang || language.en, direction });
                };
                var O = (name, string, type, precedence, lang, direction) => {
                    if (typeof precedence == typeof undefined)
                        precedence = -1;
                    if (typeof direction == typeof undefined)
                        direction = OperatorDirection.left;
                    this.operators.append({ name, string, type: Lang.VeArray.asVeArray(type), precedence, lang: lang || language.en, direction });
                };
                O(VeName.LPAREN, "(", SymbolType.block, 16);
                O(VeName.RPAREN, ")", SymbolType.closeBlock, 0);
                O(VeName.LBRACK, "[", SymbolType.block, 16);
                O(VeName.RBRACK, "]", SymbolType.closeBlock, 0);
                O(VeName.LBRACE, "{", SymbolType.block, 4);
                O(VeName.STRING_LBRACE, '@{', SymbolType.block, 0);
                O(VeName.RBRACE, "}", SymbolType.closeBlock, 0);
                O(VeName.SPLIIT, "|", [SymbolType.block, SymbolType.closeBlock], 0);
                O(VeName.COLON, ":", SymbolType.binary, 3);
                O(VeName.SEMICOLON, ";", SymbolType.statement, 0);
                O(VeName.PERIOD, ".", SymbolType.binary, 16);
                O(VeName.ELLIPSIS, "...", SymbolType.modifier, 2);
                O(VeName.CONDITIONAL, "?", SymbolType.tertiary, 3, undefined, OperatorDirection.right);
                O(VeName.INC, "++", SymbolType.unary, 0, undefined, OperatorDirection.right);
                O(VeName.DEC, "--", SymbolType.unary, 0, undefined, OperatorDirection.right);
                O(VeName.ARROW, "=>", SymbolType.binary, 0, undefined, OperatorDirection.right);
                O(VeName.ASSIGN, "=", SymbolType.binary, 2, undefined, OperatorDirection.right);
                O(VeName.ASSIGN_ADD, "+=", SymbolType.binary, 2, undefined, OperatorDirection.right);
                O(VeName.ASSIGN_SUB, "-=", SymbolType.binary, 2, undefined, OperatorDirection.right);
                O(VeName.ASSIGN_MUL, "*=", SymbolType.binary, 2, undefined, OperatorDirection.right);
                O(VeName.ASSIGN_DIV, "/=", SymbolType.binary, 2, undefined, OperatorDirection.right);
                O(VeName.ASSIGN_MOD, "%=", SymbolType.binary, 2, undefined, OperatorDirection.right);
                O(VeName.ASSIGN_EXP, "**=", SymbolType.binary, 2, undefined, OperatorDirection.right);
                O(VeName.COMMA, ",", SymbolType.multiple, 1);
                O(VeName.OR, "||", SymbolType.binary, 4);
                O(VeName.AND, "&&", SymbolType.binary, 5);
                O(VeName.XOR, "&|", SymbolType.binary, 7);
                O(VeName.ADD, "+", SymbolType.binary, 12);
                O(VeName.SUB, "-", SymbolType.binary, 12);
                O(VeName.MUL, "*", SymbolType.binary, 13);
                O(VeName.DIV, "/", SymbolType.binary, 13);
                O(VeName.MOD, "%", SymbolType.binary, 13);
                O(VeName.EXP, "**", SymbolType.binary, 14);
                O(VeName.EQ, "==", SymbolType.binary, 9);
                O(VeName.NE, "!=", SymbolType.binary, 9);
                O(VeName.NOT, "!", SymbolType.unary, 15, undefined, OperatorDirection.right);
                O(VeName.LT, "<", [SymbolType.block, SymbolType.binary], 10);
                O(VeName.GT, ">", [SymbolType.closeBlock, SymbolType.binary], 10);
                O(VeName.LTE, "<=", SymbolType.binary, 10);
                O(VeName.GTE, ">=", SymbolType.binary, 10);
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
                K(VeName.FOR, "环", SymbolType.statement, undefined, language.zh);
                K(VeName.WHILE, '当', SymbolType.statement, undefined, language.zh);
                K(VeName.DO, "执行", SymbolType.statement, undefined, language.zh);
                K(VeName.IF, "若", SymbolType.statement, undefined, language.zh);
                K(VeName.ELSE_ZH, "否则", SymbolType.statement, undefined, language.zh);
                K(VeName.ELSEIF, "如若", SymbolType.statement, undefined, language.zh);
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
                O(VeName.LPAREN, "（", SymbolType.block, 16, language.zh);
                O(VeName.RPAREN, "）", SymbolType.closeBlock, 0, language.zh);
                O(VeName.LBRACK, "【", SymbolType.block, 16, language.zh);
                O(VeName.RBRACK, "】", SymbolType.closeBlock, 0, language.zh);
                O(VeName.COLON, "：", SymbolType.binary, 3, language.zh);
                O(VeName.SEMICOLON, "；", SymbolType.statement, 0, language.zh);
                O(VeName.ELLIPSIS, "……", SymbolType.modifier, 2, language.zh);
                O(VeName.CONDITIONAL, "？", SymbolType.tertiary, 3, language.zh);
                O(VeName.ARROW, "=》", SymbolType.binary, 0, language.zh);
                O(VeName.ASSIGN_DIV, "~=", SymbolType.binary, 2, language.zh);
                O(VeName.COMMA, "，", SymbolType.multiple, 1, language.zh);
                O(VeName.DIV, "~", SymbolType.binary, 13, language.zh);
                O(VeName.NE, "！=", SymbolType.binary, 9, language.zh);
                O(VeName.NOT, "！", SymbolType.unary, 15, language.zh);
                O(VeName.LT, "《", [SymbolType.block, SymbolType.binary], 10, language.zh);
                O(VeName.GT, "》", [SymbolType.closeBlock, SymbolType.binary], 10, language.zh);
                O(VeName.LTE, "《=", SymbolType.binary, 10, language.zh);
                O(VeName.GTE, "》=", SymbolType.binary, 10, language.zh);
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
                if (typeof this.blocks.appendArray != 'function')
                    console.log(this.blocks, Lang.VeArray);
                this.blocks.appendArray(new Lang.VeArray(this.get(VeName.LPAREN), this.get(VeName.RPAREN)));
                this.blocks.appendArray(new Lang.VeArray(this.get(VeName.LBRACK), this.get(VeName.RBRACK)));
                this.blocks.appendArray(new Lang.VeArray(this.get(VeName.LPAREN, language.zh), this.get(VeName.RPAREN, language.zh)));
                this.blocks.appendArray(new Lang.VeArray(this.get(VeName.LBRACK, language.zh), this.get(VeName.RBRACK, language.zh)));
                this.blocks.appendArray(new Lang.VeArray(this.get(VeName.LBRACE), this.get(VeName.RBRACE)));
                this.blocks.appendArray(new Lang.VeArray(this.get(VeName.LT), this.get(VeName.GT)));
                this.blocks.appendArray(new Lang.VeArray(this.get(VeName.LT, language.zh), this.get(VeName.GT, language.zh)));
            }
            getKeyWords() {
                return this.keywords;
            }
            getOperators() {
                return this.operators;
            }
            getBlocks() {
                return this.blocks;
            }
            find(predict) {
                var r = this.keywords.find(predict);
                if (r)
                    return r;
                r = this.operators.find(predict);
                return r;
            }
            get(name, lang) {
                lang = lang || language.en;
                var k = this.keywords.find(x => x.name == name && x.lang == lang);
                if (k)
                    return k;
                return this.operators.find(x => x.name == name && x.lang == lang);
            }
            getAll(name) {
                var ks = this.keywords.findAll(x => x.name == name);
                if (ks.length > 0)
                    return ks;
                return this.operators.findAll(x => x.name == name);
            }
            static create() {
                return new _VeSyntax;
            }
        }
        Lang._VeSyntax = _VeSyntax;
        Lang.VeSyntax = _VeSyntax.create();
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        Lang.VeBaseCode = new Lang.VeArray;
        Lang.VeBaseCode.push({
            name: '/Any.ve', code: `package Ve{
	[nick("any")]
   export  interface Any{
	   toString():string;
   }
   [nick("int")]
   export  interface Int{
       new():int;
	   new(value:string):int;
   }
   [nick("number")]
   export  interface Number{
       new():number;
	   new(value:string):number;
   }
}





`
        });
        Lang.VeBaseCode.push({
            name: '/Array.ve', code: `package Ve{
    export interface Array<T>{
        readonly length:int;
        clear():void;
        exists(item:T):bool;
        exists(predict:(item:T)=>bool):bool;
        findIndex(item:T):int;
        findLastIndex(item:T):int;
        findIndex(predict:(item:T)=>bool):bool;
        find(predict:(item:T,at:int)=>bool):T;
        findLast(predict:(item:T,at:int)=>bool):T;
        findAll(predict:(item:T,at:int)=>bool):T[];
        append(item:T):void;
        prepend(item:T):void;
        insertAt(item:T,at:int):void;
        set(at:int,item:T):void;
        get(at:int):T;
        sum(predict:(item:T,at:int)=>number):number;
        avg(predict:(item:T,at:int)=>number):number;
        max(predict:(item:T,at:int)=>number):number;
        min(predict:(item:T,at:int)=>number):number;
        count(predict:(item:T,at:int)=>bool):number;
        sort(predict:(item:T,at:int)=>any,order:int):T[];
    }
}
`
        });
        Lang.VeBaseCode.push({
            name: '/Console.ve', code: `package Ve{
    export interface Console{
        log(message:any):void;
    }
}`
        });
        Lang.VeBaseCode.push({
            name: '/Date.ve', code: `package Ve {
    [nick("date")]
    export interface Date{
          new(dateString:string):Date;
          static readonly now:Date;
          year:int;
          month:int;
          day:int;
          weekday:int;
          readonly week:int;
          hour:int;
          minute:int;
          second:int;
          millis:int;
          add(format:string,num:int):Date;
          diff(from:date,to:date,format:string='day'):number;
          gap(from:date,to:date,format:string='day'):int;
          toString(format:string):string
    }
    [nick('color')]
    export interface Color{
         new():Color;
         new(colorFormat:string):Color;
         r:int;
         g:int;
         b:int;
         a:int;
         h:int;
         s:int;
         l:int;
         rgb:string;
         rgba:string;
         hex:string;
         hsl:string;
    }
}
`
        });
        Lang.VeBaseCode.push({
            name: '/File.ve', code: `package Ve{
   export  interface File{
	    new(filePath:string):File;
        content:string;
   }
}`
        });
        Lang.VeBaseCode.push({
            name: '/Math.ve', code: `package Ve{
    export interface Math{
        static PI:number;
        pow(a:number,index:number):number;
        add(...a:number[]):number;
        div(a:number,b:number):number;
        mul(a:number,b:number):number;
        sub(a:number,b:number):number;
        max(...a:number[]):number;
        min(...a:number[]):number;
        sum(...a:number[]):number;
        avg(...a:number[]):number;
        /**中位数*/
        media(...a:number[]):number;
        /**众数*/
        mode(...a:number[]):number[];
        sin(angle:number):number;
        cos(angle:number):number;
        tan(angle:number):number;
        asin(value:number):number;
        acos(value:number):number;
        atan(value:number):number;
        random(a:int,b:int):int;
    }
}`
        });
        Lang.VeBaseCode.push({
            name: '/Object.ve', code: `package Ve{
    export interface Object{
        
    }
}`
        });
        Lang.VeBaseCode.push({
            name: '/String.ve', code: `
package Ve {
    [nick("string")]
    export interface String {
        new():string;
        new(val:string):string;
        readonly length:int;
        readonly count:int;
        readonly chars:string[];
        replace(old:String,newString:string):string;
        [unqiue("replace1")]
        replace(match:Regex,newString:string):string;
        contain(...str:string[]):bool;
        containOfAny(...str:string[]):bool;
        indexOf(str:String):int;
        lastIndexOf(str:String):int;
        indexOfAny(...str:string[]):int;
        lastIndexOfAny(...str:string[]):int;
        toLower():String;
        toUpper():String;
        match(regex:Regex):bool;
        split(...str:string[]):string[];
        filter(...str:string[]):string;
        substring(from:int,size:int):string;
        substring(from:int):string;
        reserve():string;
        pick(...regex:Regex[]):string[];
        at(pos:int):string;
        start(...str:string[]):bool;
        end(...str:string[]):bool;
    }
    [nick('regex')]
    export interface Regex{
         new(regexString:string):Regex;
    }
}
`
        });
        Lang.VeBaseCode.push({
            name: '/Url.ve', code: `package Ve {
    [nick("url")]
    export interface Url {
        new(val:string):url;     
    }
}
`
        });
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class StringStream {
            constructor(str, row) {
                this.pos = 0;
                this.str = str;
                if (typeof row != typeof undefined)
                    this.row = row;
            }
            till(text, consider = false, predict) {
                var pos = this.pos;
                var index = pos;
                var ts = typeof text == 'string' ? new Lang.VeArray(text) : text;
                var rest = this.rest();
                while (!this.eol()) {
                    var findText, findIndex;
                    ts.each(t => {
                        if (rest.indexOf(t) > -1) {
                            findText = t;
                            findIndex = rest.indexOf(t);
                            return false;
                        }
                    });
                    if (typeof findIndex == 'number') {
                        index += findIndex;
                        if (typeof predict == 'function') {
                            var matchedText = this.slice(pos, index + (consider ? findText.length : 0));
                            if (predict(matchedText) != false) {
                                if (consider == true)
                                    index += findText.length;
                                this.pos = index;
                                return this.slice(pos, this.pos);
                            }
                            else {
                                index += 1;
                                rest = this.str.substring(index);
                            }
                        }
                        else {
                            this.pos = index;
                            if (consider == true)
                                this.pos += findText.length;
                            return this.slice(pos, this.pos);
                        }
                    }
                    else {
                        break;
                    }
                }
                return ``;
            }
            match(pattern, matchAfterPattern) {
                if (typeof pattern == 'string') {
                    return this.match(new Lang.VeArray(pattern), matchAfterPattern);
                }
                else if (pattern instanceof Lang.VeArray) {
                    var restStr = this.rest();
                    var text;
                    pattern.each(p => {
                        if (restStr.indexOf(p) == 0) {
                            if (typeof matchAfterPattern != typeof undefined) {
                                var next = restStr.substring(p.length);
                                if (next) {
                                    var c = next[0];
                                    if (typeof matchAfterPattern == 'string') {
                                        if (c.indexOf(matchAfterPattern) == 0) {
                                            text = p;
                                            return false;
                                        }
                                    }
                                    else if (matchAfterPattern instanceof Lang.VeArray) {
                                        if (matchAfterPattern.exists(x => c.indexOf(x) == 0)) {
                                            text = p;
                                            return false;
                                        }
                                    }
                                    else if (matchAfterPattern instanceof RegExp) {
                                        if (matchAfterPattern.test(c)) {
                                            text = p;
                                            return false;
                                        }
                                    }
                                    else if (typeof matchAfterPattern == 'function') {
                                        if (matchAfterPattern(c)) {
                                            text = p;
                                            return false;
                                        }
                                    }
                                }
                                else {
                                    text = p;
                                    return false;
                                }
                            }
                            else {
                                text = p;
                                return false;
                            }
                        }
                    });
                    if (typeof text == 'string') {
                        this.pos += text.length;
                    }
                    return text;
                }
                else if (pattern instanceof RegExp) {
                    let match = this.rest().match(pattern);
                    if (match && match.index > 0)
                        return null;
                    if (!match)
                        return null;
                    this.pos += match[0].length;
                    return match[0];
                }
            }
            startWith(pattern) {
                var text = this.match(pattern);
                if (text && text) {
                    this.backUp(text.length);
                    return true;
                }
                return false;
            }
            skipToEnd() {
                if (this.eol())
                    return '';
                var pos = this.pos;
                this.pos = this.str.length;
                var r = this.slice(pos, this.pos);
                if (typeof r == 'string')
                    return r;
                else
                    return '';
            }
            rest() {
                return this.str.slice(this.pos, this.str.length);
            }
            eol() {
                return this.pos >= this.str.length;
            }
            slice(from, to) {
                return this.str.slice(from, to);
            }
            eatSpace() {
                let start = this.pos;
                while (/[\s\u00a0]/.test(this.str.charAt(this.pos)))
                    ++this.pos;
                if (this.pos > start) {
                    return this.slice(start, this.pos);
                }
                else
                    return null;
            }
            next() {
                if (this.pos < this.str.length)
                    return this.str.charAt(this.pos++);
                else
                    return null;
            }
            backUp(n) {
                this.pos -= n;
            }
            current() {
                return this.str.slice(0, this.pos);
            }
        }
        Lang.StringStream = StringStream;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class State {
        }
        Lang.State = State;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        const NEWLINE = /\n|(\r\n)|\r/g;
        class Tokenizer {
            constructor(code, mode, isNewLineParse = true) {
                this.code = code;
                this.mode = mode;
                this.lines = new Lang.VeArray();
                this.isNewLineParse = isNewLineParse;
            }
            onStartState() {
                return this.mode.startState();
            }
            onToken(sr, state) {
                this.mode.token(sr, state);
            }
            onTokenStart(sr, state) {
                if (typeof this.mode.tokenStart == 'function')
                    this.mode.tokenStart(sr, state);
            }
            onTokenEnd(sr, state) {
                if (typeof this.mode.tokenEnd == 'function')
                    this.mode.tokenEnd(sr, state);
            }
            onParse() {
                this.state = this.onStartState();
                if (this.isNewLineParse == true) {
                    this.code.split(NEWLINE).forEach(x => this.lines.push(x));
                    this.lines.each((text, row) => {
                        if (typeof text == 'string') {
                            var sr = new Lang.StringStream(text, row + 1);
                            this.onTokenStart(sr, this.state);
                            while (!sr.eol()) {
                                var p = sr.pos;
                                this.onToken(sr, this.state);
                                if (sr.pos == p) {
                                    console.log(text, sr, sr.pos);
                                    break;
                                }
                            }
                            this.onTokenEnd(sr, this.state);
                        }
                    });
                }
                else {
                    var sr = new Lang.StringStream(this.code);
                    this.onTokenStart(sr, this.state);
                    while (!sr.eol()) {
                        var p = sr.pos;
                        this.onToken(sr, this.state);
                        if (sr.pos == p) {
                            console.log(this.code, sr, sr.pos);
                            break;
                        }
                    }
                    this.onTokenEnd(sr, this.state);
                }
                if (typeof this.mode.revise == 'function')
                    this.mode.revise();
                return this.state.root;
            }
        }
        Lang.Tokenizer = Tokenizer;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let CodeMode;
        (function (CodeMode) {
            CodeMode[CodeMode["code"] = 0] = "code";
            CodeMode[CodeMode["data"] = 1] = "data";
            CodeMode[CodeMode["express"] = 2] = "express";
        })(CodeMode = Lang.CodeMode || (Lang.CodeMode = {}));
        const NEWLINE = '\n';
        const TABCHAR = '\t';
        class TokenFormat {
            constructor(options) {
                for (var n in options)
                    this[n] = options[n];
            }
            format(to) {
                if (this.codeMode == CodeMode.code) {
                    return this.codeFormat(to);
                }
                else if (this.codeMode == CodeMode.data) {
                    return this.dataFormat(to);
                }
            }
            codeFormat(to, deep) {
                if (typeof deep == typeof undefined)
                    deep = 0;
                var html = '';
                to.childs.each((token, index) => {
                    var before = to.childs.eq(index - 1);
                    if (before) {
                        if (new Lang.VeArray(Lang.TokenType.keyWord, Lang.TokenType.bool, Lang.TokenType.null, Lang.TokenType.operator, Lang.TokenType.word).exists(before.type)
                            &&
                                new Lang.VeArray(Lang.TokenType.keyWord, Lang.TokenType.number, Lang.TokenType.null, Lang.TokenType.operator, Lang.TokenType.word).exists(token.type)) {
                            var is = false;
                            if (before.type == Lang.TokenType.operator) {
                                if (!new Lang.VeArray(Lang.VeName.IS, Lang.VeName.AS, Lang.VeName.NOT, Lang.VeName.CONTAIN, Lang.VeName.STATR, Lang.VeName.MATCH, Lang.VeName.END).exists(before.name)) {
                                    is = true;
                                }
                            }
                            if (token.type == Lang.TokenType.operator) {
                                if (!new Lang.VeArray(Lang.VeName.IS, Lang.VeName.AS, Lang.VeName.NOT, Lang.VeName.CONTAIN, Lang.VeName.STATR, Lang.VeName.MATCH, Lang.VeName.END).exists(token.name)) {
                                    is = true;
                                }
                            }
                            if (is == false)
                                html += ' ';
                        }
                    }
                    switch (token.type) {
                        case Lang.TokenType.keyWord:
                            if (this.chineseKeyWordIsReplaceEnglish == true)
                                html += Lang.VeSyntax.get(token.name, Lang.language.en).string;
                            else
                                html += token.value;
                            break;
                        case Lang.TokenType.bool:
                            if (this.chineseBoolIsReplaceEnglish == true)
                                html += Lang.VeSyntax.get(token.name, Lang.language.en).string;
                            else
                                html += token.value;
                            break;
                        case Lang.TokenType.number:
                        case Lang.TokenType.null:
                        case Lang.TokenType.word:
                            html += token.value;
                            break;
                        case Lang.TokenType.separator:
                        case Lang.TokenType.operator:
                            if (this.chineseOperatorIsReplaceEnglish == true)
                                html += Lang.VeSyntax.get(token.name, Lang.language.en).string;
                            else
                                html += token.value;
                            break;
                        case Lang.TokenType.string:
                            html += token.value;
                            break;
                        case Lang.TokenType.comment:
                            html += token.value;
                            break;
                        case Lang.TokenType.block:
                            if (token.name == Lang.VeName.LBRACE) {
                                html += token.value;
                                html += this.codeFormat(token, deep + 1);
                            }
                            else {
                                html += token.value;
                                html += this.codeFormat(token, deep + 1);
                            }
                            break;
                        case Lang.TokenType.closeBlock:
                            if (before && before.name == Lang.VeName.LBRACE) {
                                if (before.childs.last() && before.childs.last().type != Lang.TokenType.newLine) {
                                    html += NEWLINE;
                                }
                                html += this.getNumberChar(TABCHAR, deep);
                            }
                            if (this.chineseOperatorIsReplaceEnglish == true)
                                html += Lang.VeSyntax.get(token.name, Lang.language.en).string;
                            else
                                html += token.value;
                            break;
                        case Lang.TokenType.program:
                            break;
                        case Lang.TokenType.newLine:
                            if (to.childs.length - 1 == index)
                                html += NEWLINE;
                            else
                                html += NEWLINE + this.getNumberChar(TABCHAR, deep);
                            break;
                    }
                });
                return html;
            }
            getNumberChar(char, num) {
                var str = '';
                for (var i = 0; i < num; i++) {
                    str += char;
                }
                return str;
            }
            dataFormat(token, deep) {
                if (typeof deep == typeof undefined)
                    deep = 0;
                var html = '';
                switch (token.type) {
                    case Lang.TokenType.keyWord:
                        if (this.chineseKeyWordIsReplaceEnglish == true)
                            html += Lang.VeSyntax.get(token.name, Lang.language.en).string;
                        else
                            html += token.value;
                        break;
                    case Lang.TokenType.bool:
                        if (this.chineseBoolIsReplaceEnglish == true)
                            html += Lang.VeSyntax.get(token.name, Lang.language.en).string;
                        else
                            html += token.value;
                        break;
                    case Lang.TokenType.number:
                    case Lang.TokenType.null:
                    case Lang.TokenType.word:
                        html += token.value;
                        break;
                    case Lang.TokenType.separator:
                    case Lang.TokenType.operator:
                        if (this.chineseOperatorIsReplaceEnglish == true)
                            html += Lang.VeSyntax.get(token.name, Lang.language.en).string;
                        else
                            html += token.value;
                        break;
                    case Lang.TokenType.string:
                        if (this.chineseQuoteIsReplaceEnglish == true) {
                            var v = token.value;
                            if (token.stringQuote == '’' || token.stringQuote == '‘') {
                                v = token.value.substring(1, token.value.length - 2);
                                v = v.replace(/(#|\\)(’|‘)/g, function (_$, $1, $2) { return $2; });
                                v = v.replace(/'/g, "\\'");
                                v = `'${v}'`;
                            }
                            else if (token.stringQuote == '“' || token.stringQuote == '”') {
                                v = token.value.substring(1, token.value.length - 2);
                                v = v.replace(/(#|\\)(“|”)/g, function (_$, $1, $2) { return $2; });
                                v = v.replace(/"/g, "\\\"");
                                v = `"${v}"`;
                            }
                            html += v;
                        }
                        else {
                            html += token.value;
                        }
                        break;
                    case Lang.TokenType.comment:
                        html += token.value;
                        break;
                    case Lang.TokenType.block:
                        if (token.name == Lang.VeName.LBRACE) {
                            html += this.getNumberChar(TABCHAR, deep);
                            html += token.value;
                            html += NEWLINE;
                            html += token.childs.map(c => {
                                var str = this.getNumberChar(TABCHAR, deep + 1) + this.codeFormat(c);
                                return str;
                            }).join(NEWLINE);
                            html += NEWLINE + this.getNumberChar(TABCHAR, deep) + '}';
                        }
                        else {
                            if (this.chineseOperatorIsReplaceEnglish == true)
                                html += Lang.VeSyntax.get(token.name, Lang.language.en).string;
                            else
                                html += token.value;
                            html += token.childs.map(c => this.dataFormat(c)).join("");
                            var closeText = '';
                            if (token.value == '【')
                                closeText = '】';
                            else if (token.value == '《')
                                closeText = '>';
                            else if (token.value == '[')
                                closeText = ']';
                            else if (token.value == '<')
                                closeText = '>';
                            else if (token.value == '@{')
                                closeText = '}';
                            else if (token.value == '{')
                                closeText = '}';
                            if (this.chineseOperatorIsReplaceEnglish == true) {
                                var vs = Lang.VeSyntax.find(x => x.string == closeText);
                                var ve = Lang.VeSyntax.get(vs.name);
                                html += ve.string;
                            }
                            else
                                html += closeText;
                        }
                        break;
                    case Lang.TokenType.closeBlock:
                        break;
                    case Lang.TokenType.program:
                        break;
                    case Lang.TokenType.newLine:
                        break;
                }
                return html;
            }
        }
        Lang.TokenFormat = TokenFormat;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let TokenType;
        (function (TokenType) {
            TokenType[TokenType["program"] = 0] = "program";
            TokenType[TokenType["keyWord"] = 1] = "keyWord";
            TokenType[TokenType["block"] = 2] = "block";
            TokenType[TokenType["closeBlock"] = 3] = "closeBlock";
            TokenType[TokenType["operator"] = 4] = "operator";
            TokenType[TokenType["number"] = 5] = "number";
            TokenType[TokenType["string"] = 6] = "string";
            TokenType[TokenType["word"] = 7] = "word";
            TokenType[TokenType["comment"] = 8] = "comment";
            TokenType[TokenType["separator"] = 9] = "separator";
            TokenType[TokenType["bool"] = 10] = "bool";
            TokenType[TokenType["null"] = 11] = "null";
            TokenType[TokenType["newLine"] = 12] = "newLine";
            TokenType[TokenType["unit"] = 13] = "unit";
            TokenType[TokenType["whiteSpace"] = 14] = "whiteSpace";
        })(TokenType = Lang.TokenType || (Lang.TokenType = {}));
        class Token {
            constructor(tokenType, options) {
                this.childs = new Lang.VeArray();
                this.type = tokenType;
                if (typeof options == 'object') {
                    for (var n in options) {
                        this[n] = options[n];
                    }
                }
            }
            get typeString() {
                return TokenType[this.type];
            }
            get nameString() {
                return Lang.VeName[this.name];
            }
            static isConstantType(token) {
                return new Lang.VeArray(TokenType.bool, TokenType.null, TokenType.string, TokenType.number).exists(token.type);
            }
            append(token) {
                if (token instanceof Lang.VeArray) {
                    token.each(t => { this.childs.push(t); t.parent = this; });
                }
                else {
                    token.parent = this;
                    this.childs.push(token);
                }
            }
            prev(pos) {
                if (typeof pos == typeof undefined) {
                    pos = this.index - 1;
                }
                return this.parent.childs.eq(pos);
            }
            prevAll(fx) {
                if (!this.parent) {
                    if (this.type != TokenType.program) {
                        console.log(this);
                    }
                    return new Lang.VeArray();
                }
                var ps = this.parent.childs.findAll((x, i) => i < this.index);
                if (typeof fx == 'function')
                    return ps.findAll(fx);
                else
                    return ps;
            }
            next(pos) {
                if (typeof pos == typeof undefined) {
                    pos = this.index + 1;
                }
                return this.parent.childs.eq(pos);
            }
            nextAll(fx) {
                var ps = this.parent.childs.findAll((x, i) => i > this.index);
                if (typeof fx == 'function')
                    return ps.findAll(fx);
                else
                    return ps;
            }
            get index() {
                if (this.parent) {
                    return this.parent.childs.findIndex(x => x == this);
                }
                else
                    return -1;
            }
            get isRowspan() {
                return typeof this._rowSpanToken != typeof undefined;
            }
            get rowSpanToken() {
                return this._rowSpanToken;
            }
            set rowSpanToken(value) {
                this._rowSpanToken = value;
            }
            clearRowSpan(rowSpanToken) {
                if (this.isRowspan) {
                    if (this._rowSpanToken == rowSpanToken) {
                        delete this._rowSpanToken;
                    }
                }
                if (this.parent)
                    this.parent.childs.findAll(x => x._rowSpanToken == rowSpanToken).each(x => { delete x._rowSpanToken; });
            }
            closest(fx) {
                if (fx(this) == true)
                    return this;
                var t = this.parent;
                while (true) {
                    if (t && fx(t) == true)
                        return t;
                    else {
                        if (!t.parent)
                            return null;
                        t = t.parent;
                    }
                }
            }
            parents(fx) {
                var t = this.parent;
                var list = new Lang.VeArray();
                while (true) {
                    if (!t)
                        return list;
                    else {
                        if (fx(t) == true)
                            list.push(t);
                        t = t.parent;
                    }
                }
            }
            each(predict) {
                predict(this);
                if (this.childs.length > 0) {
                    this.childs.eachReverse(x => x.each(predict));
                }
            }
            parentsUntil(fx) {
                var t = this.parent;
                var list = new Lang.VeArray();
                while (true) {
                    if (!t)
                        return list;
                    else {
                        if (fx(t) == true)
                            list.push(t);
                        else
                            return list;
                        t = t.parent;
                    }
                }
            }
            get() {
                var json = {};
                json.type = this.type;
                json.name = this.name;
                json.col = this.col;
                json.size = this.size;
                json.row = this.row;
                json.value = this.value;
                json.childs = this.childs.map(x => x.get());
                return json;
            }
            getValue() {
                return (this.value || '') + this.childs.map(x => x.getValue()).join("");
            }
            getWrapper(wp) {
                var cs = this.childs.map(c => {
                    let result = c.getWrapper(wp);
                    return result;
                }).join("");
                var result = wp(this, cs);
                return result;
            }
        }
        Lang.Token = Token;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        const NewLine = '\n';
        class VeMode {
            constructor(options) {
                this.isIgnoreLineBreaks = true;
                this.isIgnoreWhiteSpace = true;
                if (typeof options == 'object')
                    for (var n in options)
                        this[n] = options[n];
            }
            startState() {
                var root = new Lang.Token(Lang.TokenType.program);
                var state = new Lang.State();
                state.root = root;
                state.context = root;
                this.root = root;
                return state;
            }
            token(stream, state) {
                var pos = stream.pos;
                var token = this.walk(stream, state);
                if (token) {
                    token.col = pos;
                    token.size = stream.pos - pos;
                    if (typeof stream.row != typeof undefined)
                        token.row = stream.row;
                    if (token.type == Lang.TokenType.block) {
                        state.context.append(token);
                        state.context = token;
                        state.current = null;
                    }
                    else if (token.type == Lang.TokenType.closeBlock) {
                        state.context = state.context.parent;
                        state.context.append(token);
                        state.current = token;
                    }
                    else {
                        state.context.append(token);
                        state.current = token;
                    }
                    return token;
                }
            }
            tokenStart(stream, state) {
                var isAdd = false;
                if (state && state.current && state.current.isRowspan) {
                    if (state.current.rowSpanToken.type == Lang.TokenType.string) {
                        if (state.current.type == Lang.TokenType.string) {
                            state.current.value = state.current.value + NewLine;
                            state.current.size += NewLine.length;
                            isAdd = true;
                        }
                        else if (state.current.type == Lang.TokenType.closeBlock) {
                            var token = new Lang.Token(Lang.TokenType.string);
                            token.value = NewLine;
                            token.row = stream.row;
                            token.col = 0;
                            token.size = token.value.length;
                            token.rowSpanToken = state.current.rowSpanToken;
                            state.current.parent.append(token);
                            state.current = token;
                            isAdd = true;
                        }
                    }
                }
                if (isAdd == false && state && (state.current || state.context.type != Lang.TokenType.program) && this.isIgnoreLineBreaks != true) {
                    var token = new Lang.Token(Lang.TokenType.newLine);
                    token.value = NewLine;
                    token.row = stream.row;
                    token.col = 0;
                    token.size = NewLine.length;
                    if (state.current) {
                        if (state.current.rowSpanToken)
                            token.rowSpanToken = state.current.rowSpanToken;
                        state.current.parent.append(token);
                    }
                    else
                        state.context.append(token);
                    state.current = token;
                }
            }
            tokenEnd(stream, state) {
            }
            walk(stream, state) {
                var token = null;
                if (state.current && state.current.isRowspan) {
                    if (state.current.rowSpanToken.type == Lang.TokenType.comment) {
                        if ((token = this.matchRowspanComment(stream, state)))
                            return token;
                    }
                    if (state.current.rowSpanToken.type == Lang.TokenType.string) {
                        if ((token = this.matchStringBlock(stream, state)))
                            return token;
                        if ((token = this.matchString(stream, state)))
                            return token;
                    }
                }
                else {
                    var es = stream.eatSpace();
                    if (typeof es == 'string') {
                        if (this.isIgnoreWhiteSpace == false) {
                            var whiteToken = new Lang.Token(Lang.TokenType.whiteSpace);
                            whiteToken.value = es;
                            return whiteToken;
                        }
                        return;
                    }
                }
                if (state.context && state.context.type == Lang.TokenType.block) {
                    if (state.context.value == Lang.VeSyntax.get(Lang.VeName.STRING_LBRACE).string) {
                        if ((token = this.matchStringBlock(stream, state)))
                            return token;
                    }
                    if (state.context.value == Lang.VeSyntax.get(Lang.VeName.SPLIIT).string) {
                        if ((token = this.mathEnum(stream, state)))
                            return token;
                    }
                    if ((token = this.matchBlock(stream, state)))
                        return token;
                }
                if ((token = this.matchKeyWords(stream, state)))
                    return token;
                if ((token = this.matchComment(stream, state)))
                    return token;
                if ((token = this.matchRowspanComment(stream, state)))
                    return token;
                if ((token = this.matchUnit(stream, state)))
                    return token;
                if ((token = this.matchStringBlock(stream, state)))
                    return token;
                if ((token = this.matchString(stream, state)))
                    return token;
                if ((token = this.matchDoubleOperators(stream, state)))
                    return token;
                if ((token = this.mathEnum(stream, state)))
                    return token;
                if ((token = this.matchBlock(stream, state)))
                    return token;
                if ((token = this.matchNegativeNumber(stream, state)))
                    return token;
                if ((token = this.matchOperators(stream, state)))
                    return token;
                if ((token = this.matchNumber(stream, state)))
                    return token;
                if ((token = this.matchWord(stream, state)))
                    return token;
                return token;
            }
            matchKeyWords(stream, state) {
                var token = null;
                var text = stream.match(Lang.VeSyntax.getKeyWords().map(x => x.string), Lang.VeSyntax.notWord);
                if (text) {
                    token = new Lang.Token(Lang.TokenType.keyWord);
                    token.name = Lang.VeSyntax.getKeyWords().find(x => x.string == text).name;
                    token.value = text;
                }
                return token;
            }
            matchComment(stream, state) {
                var token = null;
                var text = stream.match(Lang.VeSyntax.getAll(Lang.VeName.COMMENT).map(x => x.string));
                if (text) {
                    token = new Lang.Token(Lang.TokenType.comment);
                    token.name = Lang.VeName.COMMENT;
                    token.value = text + stream.skipToEnd();
                }
                return token;
            }
            matchRowspanComment(stream, state) {
                var token = null;
                var text = null;
                var restText = '';
                if (state.current && state.current.isRowspan && state.current.rowSpanToken.type == Lang.TokenType.comment) {
                    text = '';
                    var lang = state.current.rowSpanToken.lang;
                    var mtext = stream.match(Lang.VeSyntax.get(Lang.VeName.COMMENT_CLOSEBLOCK, state.current.rowSpanToken.lang).string);
                    if (mtext)
                        restText = mtext;
                }
                else {
                    text = stream.match(Lang.VeSyntax.getAll(Lang.VeName.COMMENT_BLOCK).map(x => x.string));
                    if (text) {
                        var lang = Lang.VeSyntax.find(x => x.string == text).lang;
                        restText = stream.till(Lang.VeSyntax.get(Lang.VeName.COMMENT_CLOSEBLOCK, lang).string, true);
                    }
                }
                if (text != null) {
                    token = new Lang.Token(Lang.TokenType.comment);
                    if (restText) {
                        token.value = text + restText;
                        if (state.current && state.current.rowSpanToken)
                            token.clearRowSpan(state.current.rowSpanToken);
                    }
                    else {
                        token.value = text + stream.skipToEnd();
                        if (text) {
                            var lang = Lang.VeSyntax.find(x => x.string == text).lang;
                            token.lang = lang;
                        }
                        token.rowSpanToken = state.current && state.current.rowSpanToken ? state.current.rowSpanToken : token;
                    }
                }
                return token;
            }
            matchStringBlock(stream, state) {
                var token = null;
                if (state.context) {
                    if (state.context.type == Lang.TokenType.block) {
                        if (state.context.value == Lang.VeSyntax.get(Lang.VeName.STRING_LBRACE).string) {
                            var text = stream.match(Lang.VeSyntax.get(Lang.VeName.RBRACE).string);
                            if (text) {
                                token = new Lang.Token(Lang.TokenType.closeBlock);
                                token.value = text;
                                token.name = Lang.VeName.RBRACE;
                                if (state.context.rowSpanToken)
                                    token.rowSpanToken = state.context.rowSpanToken;
                                return token;
                            }
                        }
                    }
                }
                if (state.current) {
                    var is = false;
                    if (state.current.type == Lang.TokenType.string) {
                        is = true;
                    }
                    else if (state.current.type == Lang.TokenType.closeBlock) {
                        var prev = state.current.prev();
                        if (prev && prev.type == Lang.TokenType.block && prev.value == Lang.VeSyntax.get(Lang.VeName.STRING_LBRACE).string) {
                            is = true;
                        }
                    }
                    if (is) {
                        var text = stream.match(Lang.VeSyntax.get(Lang.VeName.STRING_LBRACE).string);
                        if (text) {
                            token = new Lang.Token(Lang.TokenType.block);
                            token.value = text;
                            token.name = Lang.VeName.STRING_LBRACE;
                            if (state.current.rowSpanToken)
                                token.rowSpanToken = state.current.rowSpanToken;
                            return token;
                        }
                    }
                }
                return token;
            }
            matchString(stream, state) {
                var token = null;
                var text = null;
                var restText = null;
                var self = this;
                var isStringBlock = false;
                var quoteRs = Lang.VeSyntax.getOperators().findAll(x => x.type.exists(Lang.SymbolType.quote)).map(x => x.string);
                var isRow = false;
                function quoteMap(quoteText) {
                    var qs = new Lang.VeArray();
                    if (quoteText == '‘' || quoteText == '’') {
                        qs.push('‘');
                        qs.push('’');
                    }
                    else if (quoteText == '“' || quoteText == '”') {
                        qs.push('“');
                        qs.push('”');
                    }
                    else if (quoteText)
                        qs.push(quoteText);
                    return qs;
                }
                if (state.current && state.current.isRowspan && state.current.rowSpanToken.type == Lang.TokenType.string) {
                    text = state.current.rowSpanToken.stringQuote;
                    isStringBlock = true;
                    isRow = true;
                }
                else {
                    text = stream.match(quoteRs);
                }
                if (text != null) {
                    if (stream.startWith(Lang.VeSyntax.get(Lang.VeName.STRING_LBRACE).string)) {
                        restText = '';
                        isStringBlock = true;
                    }
                    else {
                        restText = stream.till(Lang.VeSyntax.get(Lang.VeName.STRING_LBRACE).string, false, function (str) {
                            var last = str[str.length - 1];
                            if (typeof last == 'string') {
                                if (last == Lang.VeSyntax.get(Lang.VeName.ESCAPTE).string
                                    ||
                                        last == Lang.VeSyntax.get(Lang.VeName.ESCAPTE, Lang.language.zh).string)
                                    return false;
                            }
                        });
                        if (!restText) {
                            var quoteText = text ? text : state.current.rowSpanToken.stringQuote;
                            var qs = quoteMap(quoteText);
                            restText = stream.till(qs, true, function (str) {
                                var last = str[str.length - 1];
                                var lastSecond = str[str.length - 2];
                                if (typeof last == 'string' && typeof lastSecond == 'string') {
                                    if (qs.exists(last)
                                        &&
                                            (lastSecond == Lang.VeSyntax.get(Lang.VeName.ESCAPTE).string
                                                ||
                                                    lastSecond == Lang.VeSyntax.get(Lang.VeName.ESCAPTE, Lang.language.zh).string))
                                        return false;
                                }
                            });
                            if (restText)
                                isStringBlock = false;
                        }
                        else
                            isStringBlock = true;
                        if (!restText)
                            restText = null;
                    }
                }
                if (text != null) {
                    token = new Lang.Token(Lang.TokenType.string);
                    if (restText != null) {
                        token.value = (isRow ? "" : text) + restText;
                        token.stringQuote = text;
                        var qs = quoteMap(token.stringQuote);
                        token.stringValue = qs.exists(x => restText.endsWith(x)) ? restText.substring(0, restText.length - 1) : restText;
                        if (isStringBlock) {
                            token.rowSpanToken = state.current && state.current.isRowspan ? state.current.rowSpanToken : token;
                        }
                        else if (state.current && state.current.isRowspan) {
                            token.clearRowSpan(state.current.rowSpanToken);
                        }
                    }
                    else {
                        var endText = stream.skipToEnd();
                        token.value = (isRow ? "" : text) + endText;
                        token.stringValue = endText;
                        token.stringQuote = text;
                        token.rowSpanToken = state.current && state.current.rowSpanToken ? state.current.rowSpanToken : token;
                    }
                }
                return token;
            }
            matchBlock(stream, state) {
                var token = null;
                if (state.context) {
                    if (state.context.type == Lang.TokenType.block) {
                        var mb = Lang.VeSyntax.getBlocks().find(x => x.eq(0).string == state.context.value);
                        if (mb) {
                            var text = stream.match(mb.eq(1).string);
                            if (text) {
                                token = new Lang.Token(Lang.TokenType.closeBlock);
                                token.value = text;
                                token.name = mb.eq(1).name;
                                return token;
                            }
                        }
                    }
                }
                var text = stream.match(Lang.VeSyntax.getBlocks().map(x => x.eq(0).string));
                if (text) {
                    if (text == '<' || text == '《') {
                        var isGen = false;
                        if (state && state.current.type == Lang.TokenType.word) {
                            if (state && state.current.prev() && new Lang.VeArray("fun", 'class', 'interface').exists(state.current.prev().value)) {
                                isGen = true;
                            }
                            else if (state && state.context.parent && state.context.prevAll().exists(x => x.value == 'interface' || x.value == 'class')) {
                                isGen = true;
                            }
                            else {
                                var unit = Lang.VeSyntax.unit;
                                var wu = `${unit}([\\\s]*\\\.[\\\s]*${unit})*`;
                                var regex = `^(${wu}([\\\s]*,[\\\s]*${wu})*)?>[\\\s]*\\\([^\\\)]*\\\)`;
                                var genText = stream.match(new RegExp(regex));
                                if (genText) {
                                    isGen = true;
                                    stream.backUp(genText.length);
                                }
                            }
                        }
                        if (isGen == false) {
                            stream.backUp(1);
                            return token;
                        }
                    }
                    token = new Lang.Token(Lang.TokenType.block);
                    token.value = text;
                    token.name = Lang.VeSyntax.getBlocks().find(x => x.eq(0).string == text).eq(0).name;
                }
                return token;
            }
            matchNegativeNumber(stream, state) {
                if (state.current && state.current.type == Lang.TokenType.word)
                    return;
                var token = null;
                var text = stream.match(Lang.VeSyntax.negativeNumber);
                if (text) {
                    token = new Lang.Token(Lang.TokenType.number);
                    token.value = text;
                }
                return token;
            }
            matchNumber(stream, state) {
                var token = null;
                var text = stream.match(Lang.VeSyntax.number);
                if (text) {
                    token = new Lang.Token(Lang.TokenType.number);
                    token.value = text;
                }
                return token;
            }
            matchDoubleOperators(stream, state) {
                var token = null;
                var text = stream.match(Lang.VeSyntax.getOperators().findAll(x => x.string.length >= 2 && !x.type.exists(Lang.SymbolType.keyWord)).map(x => x.string));
                if (!text) {
                    var ops = Lang.VeSyntax.getOperators().findAll(x => x.string.length >= 2 && x.type.exists(Lang.SymbolType.keyWord));
                    text = stream.match(ops.map(x => x.string), Lang.VeSyntax.notWord);
                }
                if (text) {
                    token = new Lang.Token(Lang.TokenType.operator);
                    token.value = text;
                    token.name = Lang.VeSyntax.getOperators().find(x => x.string == token.value).name;
                }
                return token;
            }
            matchOperators(stream, state) {
                var token = null;
                var text = stream.match(Lang.VeSyntax.getOperators().findAll(x => x.string.length == 1).map(x => x.string));
                if (text) {
                    token = new Lang.Token(Lang.TokenType.operator);
                    token.value = text;
                    token.name = Lang.VeSyntax.getOperators().find(x => x.string == token.value).name;
                }
                return token;
            }
            matchWord(stream, state) {
                var token = null;
                var text = stream.match(Lang.VeSyntax.word);
                if (text) {
                    token = new Lang.Token(Lang.TokenType.word);
                    token.value = text;
                }
                return token;
            }
            matchUnit(stream, state) {
                var token = null;
                var char = '/';
                if (stream.startWith(char)) {
                    var text = '';
                    text += stream.next();
                    var str = stream.till(char, true, function (str) {
                        if (str.endsWith('\\/')) {
                            return false;
                        }
                        return true;
                    });
                    if (str) {
                        text += str;
                        var word = stream.match(Lang.VeSyntax.word);
                        if (word) {
                            token = new Lang.Token(Lang.TokenType.unit);
                            token.value = text.substring(1, text.length - 1);
                            token.unit = word;
                            return token;
                        }
                    }
                    stream.backUp(text.length);
                }
            }
            mathEnum(stream, state) {
                var token = null;
                var char = '|';
                if (state.context) {
                    if (state.context.type == Lang.TokenType.block) {
                        if (state.context.value == char) {
                            var mb = stream.match(char);
                            if (mb) {
                                token = new Lang.Token(Lang.TokenType.closeBlock);
                                token.value = mb;
                                token.name = Lang.VeName.SPLIIT;
                                return token;
                            }
                        }
                    }
                }
                var text = stream.match(char);
                if (text) {
                    token = new Lang.Token(Lang.TokenType.block);
                    token.value = text;
                    token.name = Lang.VeName.SPLIIT;
                }
                return token;
            }
            onTraverse(fx) {
                function traverse(token) {
                    fx(token);
                    token.childs.each(x => traverse(x));
                }
                traverse(this.root);
            }
            revise() {
                let rv = (token) => {
                    switch (token.type) {
                        case Lang.TokenType.keyWord:
                            if (token.value == 'null') {
                                token.type = Lang.TokenType.null;
                                token.name = Lang.VeName.NULL_LITERAL;
                            }
                            else if (new Lang.VeArray("true", 'false', '是', '否').exists(token.value)) {
                                token.type = Lang.TokenType.bool;
                                if (token.value == 'true')
                                    token.name = Lang.VeName.TRUE_LITERAL;
                                else
                                    token.name = Lang.VeName.FALSE_LITERAL;
                            }
                            else if (new Lang.VeArray("get", 'set').exists(token.value)) {
                                if (!(token.parent && token.parent.parent && token.parent.parent.prevAll().exists(x => x.value == 'class'))) {
                                    token.type = Lang.TokenType.word;
                                    delete token.name;
                                }
                            }
                            else if (token.value == 'value') {
                                var setToken = token.closest(x => x.prevAll().exists(x => x.value == 'set'));
                                if (!setToken) {
                                    token.type = Lang.TokenType.word;
                                    delete token.name;
                                }
                            }
                            break;
                        case Lang.TokenType.string:
                            if (typeof token.stringValue != typeof undefined) {
                                token.wholeValue = token.value;
                                token.value = token.stringValue;
                            }
                            break;
                    }
                };
                this.onTraverse(x => rv(x));
            }
        }
        Lang.VeMode = VeMode;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var js;
            (function (js) {
                js.method$File = [
                    {
                        name: 'Ve.File',
                        props: {
                            new(node, $this, ...args) {
                                return `{__$ve:true,$type:'file',value:'${$this}'}`;
                            },
                            content(node, $this, ...args) {
                                var declareName = node.langeRender.delclare('__ReadFileContent');
                                var err = node.langeRender.delclare('err');
                                node.currentStatement.langeRender.appendWrapper(`fs.readFile(${$this}.value,function(${err},${declareName})
                    {    
                        if(${err})
                        {

                        }
                        else{
                            @wrapper()
                        }  
                    })`);
                                return declareName;
                            }
                        }
                    }
                ];
            })(js = Transtate.js || (Transtate.js = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var js;
            (function (js) {
                js.methodAccepter = [
                    {
                        name: 'Ve.String',
                        props: {
                            length(node, $this, ...args) {
                                return `${$this}.length`;
                            },
                            count(node, $this, ...args) {
                                this.appendResource({
                                    name: '__$Ve.String.count',
                                    items: [
                                        {
                                            type: 'code',
                                            code: `
                            (function()
                            {   
                                if(typeof __$Ve==typeof undefined)__$ve={ };
                                if(typeof __$Ve.String==typeof undefined)__$Ve.String={ };
                                __$Ve.String.count=function (value)
                                {
                                    var length = 0;
                                    for (var i = 0; i < value.length; i++) {
                                        var iCode = value.charCodeAt(i);
                                        if ((iCode >= 0 && iCode <= 255) || (iCode >= 0xff61 && iCode <= 0xff9f)) {
                                            length += 1;
                                        } else {
                                            length += 2;
                                        }
                                    }
                                    return length;
                                };
                            })()                            
                            `
                                        }
                                    ]
                                });
                                return `__$Ve.String.count(${$this})`;
                            },
                            indexOf(node, $this, ...args) {
                                return `${$this}.indexOf(${args[0]})`;
                            },
                            lastIndexOf(node, $this, ...args) {
                                return `${$this}.lastIndexOf(${args[0]})`;
                            }
                        }
                    },
                    {
                        name: 'Ve.Date',
                        props: {
                            new(node, value) {
                                this.appendResource({
                                    name: '__$ve.Date.new',
                                    items: [
                                        {
                                            type: 'code',
                                            code: `                           
                            (function()
                            {   
                                if(typeof __$Ve==typeof undefined)__$ve={ };
                                if(typeof __$Ve.Date==typeof undefined)__$Ve.Date={ };
                                __$Ve.Date.new=function (dateString){ };
                            })()                            
                            `
                                        }
                                    ]
                                });
                                return `__$Ve.Date.newDate("${value}")`;
                            },
                            now(node, $this) {
                                return `new Date()`;
                            },
                            year(node, $this) {
                                return `${$this}.getFullYear()`;
                            },
                            month(node, $this) {
                                return `(${$this}.getMonth()+1)`;
                            },
                            week(node, $this) {
                                return `(${$this}.getDay()+1)`;
                            }
                        }
                    },
                    {
                        name: 'Ve.Math',
                        props: {
                            PI(node, $this) {
                                return `Math.PI`;
                            },
                            E(node, $this) {
                                return `Math.E`;
                            },
                            abs(node, $this, ...args) {
                                return `Math.abs(${args.join(",")})`;
                            },
                            pow(node, $this, ...args) {
                                return `Math.pow(${args.join(",")})`;
                            },
                            ceil(node, $this, ...args) {
                                return `Math.ceil(${args.join(",")})`;
                            },
                            floor(node, $this, ...args) {
                                return `Math.floor(${args.join(",")})`;
                            },
                            round(node, $this, ...args) {
                                return `Math.round(${args.join(",")})`;
                            },
                            sin(node, $this, ...args) {
                                return `Math.sin((Math.PI/180)*${args[0]})`;
                            },
                            cos(node, $this, ...args) {
                                return `Math.cos((Math.PI/180)${args[0]})`;
                            },
                            tan(node, $this, ...args) {
                                return `Math.tan((Math.PI/180)${args[0]})`;
                            },
                            asin(node, $this, ...args) {
                                return `Math.asin(${args[0]})*180/Math.PI `;
                            },
                            acos(node, $this, ...args) {
                                return `Math.acos(${args[0]})*180/Math.PI `;
                            },
                            atan(node, $this, ...args) {
                                return `Math.atan(${args[0]})*180/Math.PI `;
                            },
                            min(node, $this, ...args) {
                                return `Math.min(${args.join(",")})`;
                            },
                            max(node, $this, ...args) {
                                return `Math.max(${args.join(",")})`;
                            },
                            sum(node, $this, ...args) {
                                return `(${args.join("+")})`;
                            },
                            avg(node, $this, ...args) {
                                return `(${args.join("+")})/${args.length}`;
                            }
                        }
                    }
                ];
                Lang._.addRange(js.methodAccepter, js.method$File);
            })(js = Transtate.js || (Transtate.js = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var js;
            (function (js) {
                js.accepter$method = {
                    objectReferenceProperty(express) {
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var express = this.node;
                                    var preCode = '';
                                    var referenceType;
                                    var names = new Lang.VeArray;
                                    for (var i = 0; i < express.propertys.length; i++) {
                                        var ep = express.propertys.eq(i);
                                        if (typeof ep == 'string') {
                                            if (typeof referenceType != typeof undefined) {
                                                switch (referenceType.kind) {
                                                    case Lang.TypeKind.unit:
                                                        var result = Lang.Statement.search(express, referenceType.name, x => {
                                                            if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                                                return false;
                                                        });
                                                        if (result) {
                                                            var typeClass = result.referenceStatement;
                                                            if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                                            }
                                                            else {
                                                                var cp = typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method);
                                                                if (cp) {
                                                                    referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                                    preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                                }
                                                            }
                                                        }
                                                        break;
                                                    case Lang.TypeKind.union:
                                                        var typeClass = Lang.Statement.search(express, referenceType.unionType.name, x => { if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                                            return false; }).referenceStatement;
                                                        if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                                        }
                                                        else {
                                                            var cp = typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method);
                                                            if (cp) {
                                                                referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                                var map = {};
                                                                typeClass.generics.each((gen, i) => map[gen.key] = referenceType.generics.eq(i));
                                                                if (referenceType)
                                                                    referenceType = referenceType.injectGenericImplement(map);
                                                                preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                            }
                                                        }
                                                        break;
                                                    case Lang.TypeKind.object:
                                                        var prop = referenceType.props.find(x => x.type == name);
                                                        if (prop) {
                                                            referenceType = prop.type;
                                                            preCode = preCode + `.${name}`;
                                                        }
                                                        break;
                                                }
                                            }
                                            else {
                                                names.push(ep);
                                                var referenceStatement = Lang.Statement.search(express, names.join("."));
                                                if (referenceStatement) {
                                                    switch (referenceStatement.kind) {
                                                        case Lang.StatementReferenceKind.FunArgs:
                                                        case Lang.StatementReferenceKind.currentClassMethodArgs:
                                                            var target = referenceStatement.target;
                                                            referenceType = target.parameterType || (target.default ? target.default.valueType : undefined);
                                                            preCode = names.join(".");
                                                            break;
                                                        case Lang.StatementReferenceKind.outerClass:
                                                            if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                                            }
                                                            else {
                                                            }
                                                            break;
                                                        case Lang.StatementReferenceKind.outerClassProperty:
                                                            var cp = referenceStatement.referenceStatement;
                                                            referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                            preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                            break;
                                                        case Lang.StatementReferenceKind.DeclareVariable:
                                                            referenceType = referenceStatement.referenceStatement.infer.expressType;
                                                            preCode = names.join(".");
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                        else if (ep instanceof Lang.Expression) {
                                            this.visitor.accept(ep);
                                            this.call(ep);
                                            referenceType = ep.infer.expressType;
                                            preCode += ep.langeRender.render();
                                        }
                                    }
                                    if (referenceType)
                                        express.infer.expressType = referenceType;
                                    return preCode;
                                }
                            }
                        });
                    },
                    callMethod(express) {
                        express.args.each(arg => this.accept(arg));
                        if (typeof express.name == 'string') {
                            Lang.LangRender.create(express, { template: `${express.name}(${express.args.map(x => x.langeRender.render()).join(",")})` });
                        }
                        else if (express.name instanceof Lang.PropertyExpression) {
                            this.accept(express.name);
                            if (typeof express.infer.referenceStatement != typeof undefined) {
                                switch (express.infer.referenceStatement.kind) {
                                    case Lang.StatementReferenceKind.DeclareFun:
                                    case Lang.StatementReferenceKind.currentClassMethodArgs:
                                    case Lang.StatementReferenceKind.FunArgs:
                                        Lang.LangRender.create(express, {
                                            template: `@preCode@{}(@args())`,
                                            props: {
                                                preCode() {
                                                    var express = this.node;
                                                    if (express.name instanceof Lang.Expression) {
                                                        return express.name.langeRender.render();
                                                    }
                                                },
                                                args() {
                                                    var express = this.node;
                                                    return express.args.map(arg => arg.langeRender.render()).join(",");
                                                }
                                            }
                                        });
                                        break;
                                    case Lang.StatementReferenceKind.outerClassProperty:
                                        var cp = express.infer.referenceStatement.referenceStatement;
                                        var args = new Lang.VeArray('@arg(-1)').append(express.args.map((a, i) => `@arg(${i})`));
                                        var template = this.acceptMethod(cp.unqiueName, express, ...args);
                                        Lang.LangRender.create(express, {
                                            template,
                                            props: {
                                                arg(pos) {
                                                    var express = this.node;
                                                    if (pos == -1) {
                                                        if (express.name instanceof Lang.Expression)
                                                            return express.name.langeRender.render();
                                                        else if (typeof express.name == 'string')
                                                            return express.name;
                                                    }
                                                    else {
                                                        return express.args.eq(pos).langeRender.render();
                                                    }
                                                }
                                            }
                                        });
                                        break;
                                    case Lang.StatementReferenceKind.outerClass:
                                        var args = new Lang.VeArray('@arg(-1)').append(express.args.map((a, i) => `@arg(${i})`));
                                        var ci = express.infer.referenceStatement.referenceStatement;
                                        var template = this.acceptMethod(ci.fullName, express, ...args);
                                        Lang.LangRender.create(express, {
                                            template: template,
                                            props: {
                                                arg(pos) {
                                                    var express = this.node;
                                                    if (pos == -1) {
                                                        if (express.name instanceof Lang.Expression)
                                                            return express.name.langeRender.render();
                                                        else if (typeof express.name == 'string')
                                                            return express.name;
                                                    }
                                                    else {
                                                        return express.args.eq(pos).langeRender.render();
                                                    }
                                                }
                                            }
                                        });
                                }
                            }
                        }
                    }
                };
            })(js = Transtate.js || (Transtate.js = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var js;
            (function (js) {
                js.accepter$binary = {
                    binary(express) {
                        this.accept(express.left);
                        this.accept(express.right);
                        Lang.LangRender.create(express, {
                            template: `@content(node)`,
                            props: {
                                content() {
                                    var express = this.node;
                                    var left = this.call(express.left);
                                    var right = this.call(express.right);
                                    console.log(Lang.VeName[express.kind]);
                                    switch (express.kind) {
                                        case Lang.VeName.ASSIGN:
                                        case Lang.VeName.ASSIGN_ADD:
                                        case Lang.VeName.ASSIGN_SUB:
                                        case Lang.VeName.ASSIGN_MUL:
                                        case Lang.VeName.ASSIGN_DIV:
                                        case Lang.VeName.ASSIGN_MOD:
                                        case Lang.VeName.OR:
                                        case Lang.VeName.AND:
                                        case Lang.VeName.XOR:
                                        case Lang.VeName.ADD:
                                        case Lang.VeName.SUB:
                                        case Lang.VeName.MUL:
                                        case Lang.VeName.DIV:
                                        case Lang.VeName.MOD:
                                        case Lang.VeName.EQ:
                                        case Lang.VeName.NE:
                                        case Lang.VeName.GT:
                                        case Lang.VeName.LT:
                                        case Lang.VeName.LTE:
                                        case Lang.VeName.GTE:
                                            return `${left}${Lang.VeSyntax.get(express.kind).string}${right}`;
                                        case Lang.VeName.ASSIGN_EXP:
                                            return `${left}=Math.pow(${left},${right})`;
                                        case Lang.VeName.EXP:
                                            return `Math.pow(${left},${right})`;
                                        case Lang.VeName.AS:
                                            break;
                                        case Lang.VeName.IS:
                                            break;
                                        case Lang.VeName.MATCH:
                                            break;
                                        case Lang.VeName.CONTAIN:
                                            return `${left}.indexOf(${right})>-1`;
                                        case Lang.VeName.STATR:
                                            return `${left}.indexOf(${right})==0`;
                                        case Lang.VeName.END:
                                            return `${left}.endsWith(${right})`;
                                        case Lang.VeName.K_EQ:
                                        case Lang.VeName.K_AND:
                                        case Lang.VeName.K_OR:
                                            var sy = '==';
                                            if (express.kind == Lang.VeName.K_AND)
                                                sy = '&&';
                                            else if (express.kind == Lang.VeName.K_OR)
                                                sy = '||';
                                            return `${left}${sy}${right}`;
                                        case Lang.VeName.K_XOR:
                                            return `${left}!==${right}`;
                                    }
                                }
                            }
                        });
                    },
                    unary(express) {
                        this.accept(express.exp);
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var express = this.node;
                                    switch (express.kind) {
                                        case Lang.VeName.INC:
                                        case Lang.VeName.DEC:
                                        case Lang.VeName.NOT:
                                            if (express.arrow == Lang.UnaryArrow.left) {
                                                return `${this.call(express.exp)}${Lang.VeSyntax.get(express.kind).string}`;
                                            }
                                            else {
                                                return `${Lang.VeSyntax.get(express.kind).string}${this.call(express.exp)}`;
                                            }
                                    }
                                }
                            }
                        });
                    },
                    constant(express) {
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var statement = this.node;
                                    switch (statement.valueType.name) {
                                        case 'String':
                                        case 'string':
                                            return (`\`${statement.value.replace(/`/g, "\\`")}\``);
                                        case 'Bool':
                                        case 'bool':
                                            return statement.value ? 'true' : 'false';
                                        case 'null':
                                            return 'null';
                                        case 'int':
                                        case 'Int':
                                        case 'Number':
                                        case 'number':
                                            return statement.value;
                                        case 'Url':
                                        case 'url':
                                            return "{__ve_type:'url',value:" + (`\`${statement.value.replace(/\\\//g, "/").replace(/`/g, "\\`")}\``) + "}";
                                        case 'date':
                                        case 'Date':
                                            if (typeof statement.value == 'number')
                                                return `new Date(${statement.value})`;
                                            else if (typeof statement.value == 'string')
                                                return `new Date("${statement.value}")`;
                                        default:
                                            var cr = Lang.Statement.search(statement, statement.valueType.name, x => x instanceof Lang.ClassOrIntrfaceStatement ? true : false);
                                            if (cr) {
                                                var cp = cr.referenceStatement;
                                                var cpp = cp.body.find(x => x.isCtor && x.args.length == 1);
                                                if (cpp) {
                                                    return this.visitor.acceptMethod(cpp.unqiueName, statement, statement.value);
                                                }
                                            }
                                            else {
                                                console.log('not found class', statement, statement.valueType.name);
                                            }
                                    }
                                }
                            }
                        });
                    },
                    ternary(express) {
                        this.accept(express.where);
                        this.accept(express.trueCondition);
                        this.accept(express.falseCondition);
                        Lang.LangRender.create(express, {
                            template: `@call(node.where)?@call(node.trueCondition):@call(node.falseCondition)`
                        });
                    },
                    arrayIndex(express) {
                        if (typeof express.name != 'string')
                            this.accept(express.name);
                        this.accept(express.indexExpress);
                        Lang.LangRender.create(express, {
                            template: `@if(typeof node.name=='string')
        {@node.name[@call(node.indexExpress)]}
        else{@call(node.name)[@call(node.indexExpress)]} 
       `
                        });
                    },
                    variable(express) {
                        return Lang.LangRender.create(express, {
                            template: `@node.name`
                        });
                    },
                    arrowMethod(express) {
                        express.args.each(arg => this.accept(arg));
                        express.body.each(m => this.accept(m));
                        Lang.LangRender.create(express, {
                            template: `(@parameter())=>{@body()}`,
                            props: {
                                parameter() {
                                    var express = this.node;
                                    return express.args.map(arg => arg.langeRender.render()).join(",");
                                },
                                body() {
                                    var express = this.node;
                                    return this.renderList(express.body);
                                }
                            }
                        });
                    },
                    array(express) {
                        express.args.each(arg => this.accept(arg));
                        Lang.LangRender.create(express, {
                            template: `[@content(node)]`,
                            props: {
                                content() {
                                    var express = this.node;
                                    return express.args.map(arg => arg.langeRender.render()).join(",");
                                }
                            }
                        });
                    },
                    Object(express) {
                        express.propertys.each(pro => {
                            this.accept(pro.value);
                        });
                        Lang.LangRender.create(express, {
                            template: `{@content(node)}`,
                            props: {
                                content() {
                                    var express = this.node;
                                    return express.propertys.map(pro => `"${pro.key}":${pro.value.langeRender.render()}`).join(",");
                                }
                            }
                        });
                    },
                    parameter(express) {
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var exp = this.node;
                                    return `${exp.isParameter ? "..." : ""}${exp.key}`;
                                }
                            }
                        });
                    }
                };
            })(js = Transtate.js || (Transtate.js = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var js;
            (function (js) {
                js.accepter$statement = {
                    $if(express) {
                        Lang.LangRender.create(express, {
                            template: `if(@call(node.ifCondition)){@statement(node.ifStatement)}@for(var i=0;i<node.thenConditions.length;i++){
            else if(@call(node.thenConditions.eq(i))){@statement(node.thenConditions.eq(i))}
        }@if(node.elseStatement.length > 0){
             else{@statement(node.elseStatement)}
        }`
                        });
                    },
                    switch(express) {
                        Lang.LangRender.create(express, {
                            template: `switch(@call(node.valueExpression)) { 
        @for(var i=0;i<node.caseStatements.length;i++){
             case @call(node.caseStatements.eq(i).value):
             @statement(node.caseStatements.eq(i).matchs)
             break;
        }
        @if(node.defaultStatement&&node.defaultStatement.length>0){
            default:
            @statement(node.defaultStatement)
        }
    }`
                        });
                    },
                    for(express) {
                        Lang.LangRender.create(express, {
                            template: `for(@call(node.initStatement);@call(node.condition);@call(nextStatement)){@statement(node.body)}`
                        });
                    },
                    $try(express) {
                        Lang.LangRender.create(express, {
                            template: `if(@call(node.ifCondition)){@statement(node.ifStatement)}@for(var i=0;i<node.thenConditions.length;i++){
            else if(@call(node.thenConditions.eq(i))){@statement(node.thenConditions.eq(i))}
        }@if(node.elseStatement.length > 0){
             else{@statement(node.elseStatement)}
        }`
                        });
                    },
                    while(express) {
                        this.accept(express.condition);
                        express.body.each(s => this.accept(s));
                        Lang.LangRender.create(express, {
                            template: `while(@call(node.condition)){@statement(node.body)}`
                        });
                    },
                    doWhile(express) {
                        Lang.LangRender.create(express, {
                            template: `do{@statement(node.body)}while(@call(node.condition))`
                        });
                    },
                    break(express) {
                        Lang.LangRender.create(express, {
                            template: 'break'
                        });
                    },
                    throw(express) {
                        this.accept(express.expression);
                        Lang.LangRender.create(express, {
                            template: `throw @call(node.expression)`
                        });
                    },
                    continue(express) {
                        Lang.LangRender.create(express, {
                            template: `continue;`
                        });
                    },
                    return(express) {
                        this.accept(express.expression);
                        Lang.LangRender.create(express, {
                            template: `return @call(node.expression)`
                        });
                    }
                };
            })(js = Transtate.js || (Transtate.js = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var js;
            (function (js) {
                js.accepter = {
                    package(express) {
                        var content = '';
                        var ns = Lang.VeArray.asVeArray(express.name.split("."));
                        ns.recursion((name, i, next) => {
                            var pre = i > 0 ? ns.eq(i - 1) : '';
                            content += (`var ${name};`);
                            content += (`(function(${name}){`);
                            next(i + 1);
                            if (i == ns.length - 1) {
                                content += '@content()';
                            }
                            if (pre)
                                content += (`})(${name}=${pre}.${name}||(${pre}.${name}={}))`);
                            else
                                content += (`})(${name}||(${name}={}))`);
                        });
                        express.body.map(x => this.accept(x));
                        return Lang.LangRender.create(express, {
                            template: `${content}`,
                            props: {
                                content() {
                                    return this.renderList(express.body);
                                }
                            }
                        });
                    },
                    context(express) {
                        return Lang.LangRender.create(express, {
                            template: `${express.name}`
                        });
                    },
                    use(express) {
                        return Lang.LangRender.create(express, {
                            template: `@if(node.localName)
                {
                    var @node.localName=@node.name;
                }
                `,
                            props: {
                                node: express
                            }
                        });
                    },
                    $class(express) {
                        express.body.each(s => this.accept(s));
                        var className = express.name;
                        var lastName = express.package.lastName;
                        Lang.LangRender.create(express, {
                            template: `class ${className == lastName ? className + "1" : className}  @if(node.extendName) { extends @node.extendName } 
                {
                     @content()
                }
                ${lastName}.${express.name}=${className == lastName ? className + "1" : className}
                `,
                            props: {
                                content() {
                                    return this.renderList(express.body);
                                }
                            }
                        });
                    },
                    enum(express) {
                        Lang.LangRender.create(express, {
                            template: `var @node.name;
                (function(@node.name){
                    @content(node);
                })(@node.name=@node.package.lastName@{}.@node.name||(@node.package.lastName@{}.@node.name={ }))
               `,
                            props: {
                                content() {
                                    if (this.node instanceof Lang.EnumStatement) {
                                        return express.options.map(pro => {
                                            return `${express.name}[${express.name}["${pro.key}"]=${this.visitor.accept(pro.value)}]="${pro.key}";`;
                                        }).join("");
                                    }
                                }
                            }
                        });
                    },
                    classProperty(express) {
                        if (express.kind == Lang.ClassPropertyKind.prop) {
                        }
                        else if (express.kind == Lang.ClassPropertyKind.method) {
                            express.body.each(s => this.accept(s));
                        }
                        else if (express.kind == Lang.ClassPropertyKind.field) {
                            if (express.get.length > 0) {
                                express.get.each(s => this.accept(s));
                            }
                            if (express.set.length > 0) {
                                express.set.each(s => this.accept(s));
                            }
                        }
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    if (this.node instanceof Lang.ClassProperty) {
                                        var express = this.node;
                                        if (express.kind == Lang.ClassPropertyKind.prop) {
                                        }
                                        else if (express.kind == Lang.ClassPropertyKind.method) {
                                            var argsString = express.args.map(arg => this.visitor.accept(arg)).join(",");
                                            return `${express.name}(${argsString}){${this.renderList(express.body)}}`;
                                        }
                                        else if (express.kind == Lang.ClassPropertyKind.field) {
                                            var code = '';
                                            if (express.get.length > 0) {
                                                code += `get ${express.name}(){${this.renderList(express.get)}}`;
                                            }
                                            else {
                                                code += `set ${express.name}(value){${this.renderList(express.set)}}`;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    },
                    fun(express) {
                        express.body.each(exp => this.accept(exp));
                        return Lang.LangRender.create(express, {
                            template: `function @node.name@{}(@parameter()){@statement(node.body)}`,
                            props: {
                                parameter() {
                                    var express = this.node;
                                    return express.args.map(arg => this.visitor.accept(arg)).join(",");
                                },
                                statement(body) {
                                    return this.renderList(express.body);
                                }
                            }
                        });
                    },
                    declareVariable(express) {
                        if (express.value)
                            this.accept(express.value);
                        return Lang.LangRender.create(express, {
                            template: `var @node.name@if(node.value){=@call(node.value)}`,
                        });
                    }
                };
                Lang.applyExtend(js.accepter, js.accepter$binary, js.accepter$statement, js.accepter$method);
            })(js = Transtate.js || (Transtate.js = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let TranstateLanguage;
        (function (TranstateLanguage) {
            TranstateLanguage[TranstateLanguage["nodejs"] = 0] = "nodejs";
            TranstateLanguage[TranstateLanguage["js"] = 1] = "js";
            TranstateLanguage[TranstateLanguage["java"] = 2] = "java";
            TranstateLanguage[TranstateLanguage["csharp"] = 3] = "csharp";
            TranstateLanguage[TranstateLanguage["php"] = 4] = "php";
            TranstateLanguage[TranstateLanguage["python"] = 5] = "python";
            TranstateLanguage[TranstateLanguage["mysql"] = 6] = "mysql";
            TranstateLanguage[TranstateLanguage["mongodb"] = 7] = "mongodb";
            TranstateLanguage[TranstateLanguage["mssql"] = 8] = "mssql";
        })(TranstateLanguage = Lang.TranstateLanguage || (Lang.TranstateLanguage = {}));
        class LangRender {
            constructor(statement, options) {
                this.wrappers = new Lang.VeArray();
                this.node = statement;
                this.node.langeRender = this;
                if (typeof options.template == 'string')
                    this.template = options.template;
                if (typeof options.props == 'object')
                    for (var p in options.props)
                        this[p] = options.props[p];
            }
            render() {
                var rt = new Lang.RazorTemplate({ caller: this });
                var text = rt.compile(this.template, this);
                for (let i = this.wrappers.length - 1; i >= 0; i--) {
                    var w = this.wrappers[i];
                    text = w.replace('@wrapper()', text);
                }
                return text;
            }
            renderList(statement) {
                statement.each(s => this.visitor.accept(s));
                return statement.map(s => s.langeRender.render()).join("\n");
            }
            call(statement) {
                if (statement.langeRender)
                    return statement.langeRender.render();
                else
                    console.trace(statement);
            }
            delclare(name) {
                const ARGS_NAME = '__$args';
                if (typeof this.node[ARGS_NAME] == typeof undefined)
                    this.node[ARGS_NAME] = new Lang.VeArray();
                var ng = this.node[ARGS_NAME].find(x => x.name == name);
                if (ng)
                    return ng.map;
                var contextNode = this.node.scope;
                if (contextNode) {
                    const DELCLARE_NAME = '__$delclare';
                    if (typeof contextNode[DELCLARE_NAME] == typeof undefined)
                        contextNode[DELCLARE_NAME] = new Lang.VeArray();
                    var list = contextNode[DELCLARE_NAME];
                    var newName = Lang.getAvailableName(name, list, x => x);
                    list.push(newName);
                    this.node[ARGS_NAME].push({ name: name, map: newName });
                    return newName;
                }
                else {
                }
            }
            static create(statement, options) {
                return new LangRender(statement, options);
            }
            appendWrapper(wrapperCode) {
                this.wrappers.push(wrapperCode);
            }
        }
        Lang.LangRender = LangRender;
        class VisitorLange extends Lang.AstVisitor {
            constructor() {
                super(...arguments);
                this.methodAccepter = [];
                this.resources = new Lang.VeArray();
            }
            onInit() {
                this.on('accept', (express) => {
                    if (typeof express.langeRender == 'object')
                        express.langeRender.visitor = this;
                    else
                        console.trace(express);
                });
            }
            acceptMethod(methodName, statement, ...args) {
                var mn;
                this.methodAccepter.forEach(m => {
                    if (methodName.startsWith(m.name)) {
                        var restName = methodName.replace(m.name + ".", "");
                        if (typeof m.props[restName] == 'function') {
                            mn = m.props[restName];
                            return false;
                        }
                    }
                });
                if (mn)
                    return mn.apply(this, [statement, ...args]);
                else {
                    console.warn(`not found Transtate method:${methodName}`);
                }
            }
            appendResource(resource) {
                if (!this.resources.exists(x => x.name == resource.name)) {
                    this.resources.push(resource);
                }
            }
        }
        Lang.VisitorLange = VisitorLange;
        class TranstateFactory {
            constructor(lang) {
                this.lang = lang;
            }
            compile(code) {
                var ast = new Lang.AstParser();
                var node = ast.compile(code);
                var vl = this.createVisitorLange(node);
                vl.start();
                var temp = '';
                if (Array.isArray(node))
                    temp = node[0].langeRender.render();
                else if (node instanceof Lang.Statement)
                    temp = node.langeRender.render();
                temp = vl.resources.map(x => {
                    return x.items.map(x => x.type == 'code' && x.code).join("");
                }).join("") + temp;
                return temp;
            }
            compileExpress(express, args) {
                var ast = new Lang.AstParser();
                var node = ast.compileExpress(express, args);
                var vl = this.createVisitorLange(node);
                var lr = vl.start();
                var temp = node.langeRender.render();
                temp = vl.resources.map(x => {
                    return x.items.map(x => x.type == 'code' && x.code).join("");
                }).join("") + temp;
                return temp;
            }
            createVisitorLange(express) {
                var vl = new VisitorLange(express);
                switch (this.lang) {
                    case TranstateLanguage.nodejs:
                        vl.accepter = Ve.Lang.Transtate.nodejs.accepter;
                        vl.methodAccepter = Ve.Lang.Transtate.nodejs.methodAccepter;
                        break;
                    case TranstateLanguage.js:
                        vl.accepter = Ve.Lang.Transtate.js.accepter;
                        vl.methodAccepter = Ve.Lang.Transtate.js.methodAccepter;
                        break;
                    case TranstateLanguage.csharp:
                        break;
                    case TranstateLanguage.mongodb:
                        vl.accepter = Ve.Lang.Transtate.mongodb.accepter;
                        vl.methodAccepter = Ve.Lang.Transtate.mongodb.methodAccepter;
                        break;
                }
                return vl;
            }
        }
        Lang.TranstateFactory = TranstateFactory;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var mongodb;
            (function (mongodb) {
                mongodb.methodAccepter = [
                    {
                        name: 'Ve.String',
                        props: {
                            length(node, $this, ...args) {
                                return `$strLenBytes:[${$this}]`;
                            },
                            count(node, $this, ...args) {
                                return `$strLenBytes:[${$this}]`;
                            }
                        }
                    },
                    {
                        name: 'Ve.Date',
                        props: {
                            new(node, value) {
                                return `__$Ve.Date.newDate("${value}")`;
                            },
                            now(node, $this) {
                                return `new Date()`;
                            },
                            year(node, $this) {
                                return `$year:[${$this}]`;
                            },
                            month(node, $this) {
                                return `$month:[${$this}]`;
                            },
                            week(node, $this) {
                                return `$week:[${$this}]`;
                            },
                            weekday(node, $this) {
                                return `$dayOfWeek:[${$this}]`;
                            },
                            day(node, $this) {
                                return `$dayOfMonth:[${$this}]`;
                            },
                            hour(node, $this) {
                                return `hour:[${$this}]`;
                            },
                            minute(node, $this) {
                                return `$minute:[${$this}]`;
                            },
                            second(node, $this) {
                                return `$second:[${$this}]`;
                            },
                            millis(node, $this) {
                                return `$millisecond:[${$this}]`;
                            }
                        }
                    },
                    {
                        name: "Ve.Math", props: {
                            abs(node, value) {
                                return `$abs:[${value}]`;
                            },
                            pow(node, value, value2) {
                                return `$pow:[${value},${value2}]`;
                            },
                            add(node, value, value2) {
                                return `$add:[${value},${value2}]`;
                            },
                            div(node, value, value2) {
                                return `$divide:[${value},${value2}]`;
                            },
                            mul(node, value, value2) {
                                return `$multiply:[${value},${value2}]`;
                            },
                            sub(node, value, value2) {
                                return `$subtract:[${value},${value2}]`;
                            },
                            max(node, ...a) {
                                return `$max:[${a.join(",")}]`;
                            },
                            min(node, ...a) {
                                return `$min:[${a.join(",")}]`;
                            },
                            sum(node, ...a) {
                                return `$sum:[${a.join(",")}]`;
                            },
                            avg(node, ...a) {
                                return `$avg:[${a.join(",")}]`;
                            }
                        }
                    }
                ];
            })(mongodb = Transtate.mongodb || (Transtate.mongodb = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var mongodb;
            (function (mongodb) {
                mongodb.accepter = {
                    binary(express) {
                        this.accept(express.left);
                        this.accept(express.right);
                        Lang.LangRender.create(express, {
                            template: `@content(node)`,
                            props: {
                                content() {
                                    var express = this.node;
                                    var left = this.call(express.left);
                                    var right = this.call(express.right);
                                    var leftType = express.left.infer.expressType;
                                    var rightType = express.right.infer.expressType;
                                    switch (express.kind) {
                                        case Lang.VeName.ASSIGN:
                                        case Lang.VeName.ASSIGN_ADD:
                                        case Lang.VeName.ASSIGN_SUB:
                                        case Lang.VeName.ASSIGN_MUL:
                                        case Lang.VeName.ASSIGN_DIV:
                                        case Lang.VeName.ASSIGN_MOD:
                                        case Lang.VeName.ASSIGN_EXP:
                                            return `mongodb:${Lang.VeName[express.kind]} not  can't be here`;
                                        case Lang.VeName.OR:
                                        case Lang.VeName.K_OR:
                                            return `{$or:[${left},${right}]}`;
                                        case Lang.VeName.AND:
                                        case Lang.VeName.K_AND:
                                            return `{$and:[${left},${right}]}`;
                                        case Lang.VeName.XOR:
                                        case Lang.VeName.K_XOR:
                                            return `{$nor:[${left},${right}]}`;
                                        case Lang.VeName.ADD:
                                            if (leftType && rightType && (leftType.name == 'int' || leftType.name == 'number') && (rightType.name == 'int' || rightType.name == 'number'))
                                                return `{$add:[${left},${right}]}`;
                                            else
                                                return `{$concat:[${left},${right}]}`;
                                        case Lang.VeName.SUB:
                                            return `{$subtract:[${left},${right}]}`;
                                        case Lang.VeName.MUL:
                                            return `{$multiply:[${left},${right}]}`;
                                        case Lang.VeName.DIV:
                                            return `{$divide:[${left},${right}]}`;
                                        case Lang.VeName.MOD:
                                            return `{$mod:[${left},${right}]}`;
                                        case Lang.VeName.EQ:
                                        case Lang.VeName.K_EQ:
                                            return `{$eq:[${left},${right}]}`;
                                        case Lang.VeName.NE:
                                            return `{$ne:[${left},${right}]}`;
                                        case Lang.VeName.GT:
                                            return `{$gt:[${left},${right}]}`;
                                        case Lang.VeName.LTE:
                                            return `{$lte:[${left},${right}]}`;
                                        case Lang.VeName.GTE:
                                            return `{$gte:[${left},${right}]}`;
                                        case Lang.VeName.EXP:
                                            return `{$pow:[${left},${right}]}`;
                                        case Lang.VeName.AS:
                                            break;
                                        case Lang.VeName.IS:
                                            break;
                                        case Lang.VeName.MATCH:
                                            return `{${left}:{$regex:${right}}}`;
                                        case Lang.VeName.CONTAIN:
                                            return `{$search:[${left},${right}]}`;
                                        case Lang.VeName.STATR:
                                            return `{${left}:{$regex:/^${right}/}}`;
                                        case Lang.VeName.END:
                                            return `{${left}:{$regex:/${right}$/}}`;
                                    }
                                }
                            }
                        });
                    },
                    unary(express) {
                        this.accept(express.exp);
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var express = this.node;
                                    switch (express.kind) {
                                        case Lang.VeName.INC:
                                            return `$add:[${this.call(express.exp)},1]`;
                                        case Lang.VeName.DEC:
                                            return `$add:[${this.call(express.exp)},-1]`;
                                        case Lang.VeName.NOT:
                                            return `$not:${this.call(express.exp)}`;
                                    }
                                }
                            }
                        });
                    },
                    constant(express) {
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var statement = this.node;
                                    switch (statement.valueType.name) {
                                        case 'String':
                                        case 'string':
                                            return (`{$literal:\`${statement.value.replace(/`/g, "\\`")}\`}`);
                                        case 'Bool':
                                        case 'bool':
                                            return statement.value ? '{$literal:true}' : '{$literal:false}';
                                        case 'null':
                                            return '{$literal:null}';
                                        case 'Number':
                                        case 'number':
                                        case 'int':
                                        case 'Int':
                                            return `{$literal:${statement.value}}`;
                                        default:
                                            var cp = Lang.Statement.search(statement, statement.valueType.name, x => x instanceof Lang.ClassOrIntrfaceStatement ? true : false).referenceStatement;
                                            var cpp = cp.body.find(x => x.isCtor && x.args.length == 1);
                                            if (cpp) {
                                                return this.visitor.acceptMethod(cpp.unqiueName, statement, statement.value);
                                            }
                                    }
                                }
                            }
                        });
                    },
                    ternary(express) {
                        this.accept(express.where);
                        this.accept(express.trueCondition);
                        this.accept(express.falseCondition);
                        Lang.LangRender.create(express, {
                            template: `
                {
                    $cond: {
                      if:@call(node.where),
                      then:@call(node.trueCondition),
                      else:@call(node.falseCondition)
                    }
                  }
               `
                        });
                    },
                    arrayIndex(express) {
                        if (typeof express.name != 'string')
                            this.accept(express.name);
                        this.accept(express.indexExpress);
                        Lang.LangRender.create(express, {
                            template: `mongodb: arrayIndex not  can't be here`
                        });
                    },
                    variable(express) {
                        return Lang.LangRender.create(express, {
                            template: `@node.name`
                        });
                    },
                    arrowMethod(express) {
                        express.args.each(arg => this.accept(arg));
                        express.body.each(m => this.accept(m));
                        Lang.LangRender.create(express, {
                            template: `mongodb: arrow method not  can't be here`
                        });
                    },
                    array(express) {
                        return Lang.LangRender.create(express, {
                            template: `mongodb: variable not  can't be here`
                        });
                    },
                    Object(express) {
                        express.propertys.each(pro => {
                            this.accept(pro.value);
                        });
                        Lang.LangRender.create(express, {
                            template: `{@content(node)}`,
                            props: {
                                content() {
                                    var express = this.node;
                                    return express.propertys.map(pro => `"${pro.key}":${pro.value.langeRender.render()}`).join(",");
                                }
                            }
                        });
                    },
                    parameter(express) {
                        return Lang.LangRender.create(express, {
                            template: `mongodb: parameter not  can't be here`
                        });
                    }
                };
            })(mongodb = Transtate.mongodb || (Transtate.mongodb = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var nodejs;
            (function (nodejs) {
                nodejs.method$File = [
                    {
                        name: 'Ve.File',
                        props: {
                            new(node, $this, ...args) {
                                return `{__$ve:true,$type:'file',value:'${$this}'}`;
                            },
                            content(node, $this, ...args) {
                                var declareName = node.langeRender.delclare('__ReadFileContent');
                                var err = node.langeRender.delclare('err');
                                node.currentStatement.langeRender.appendWrapper(`fs.readFile(${$this}.value,function(${err},${declareName})
                    {    
                        if(${err})
                        {

                        }
                        else{
                            @wrapper()
                        }  
                    })`);
                                return declareName;
                            }
                        }
                    }
                ];
            })(nodejs = Transtate.nodejs || (Transtate.nodejs = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var nodejs;
            (function (nodejs) {
                nodejs.methodAccepter = [
                    {
                        name: 'Ve.String',
                        props: {
                            length(node, $this, ...args) {
                                return `${$this}.length`;
                            },
                            count(node, $this, ...args) {
                                this.appendResource({
                                    name: '__$Ve.String.count',
                                    items: [
                                        {
                                            type: 'code',
                                            code: `
                            (function()
                            {   
                                if(typeof __$Ve==typeof undefined)__$ve={ };
                                if(typeof __$Ve.String==typeof undefined)__$Ve.String={ };
                                __$Ve.String.count=function (value)
                                {
                                    var length = 0;
                                    for (var i = 0; i < value.length; i++) {
                                        var iCode = value.charCodeAt(i);
                                        if ((iCode >= 0 && iCode <= 255) || (iCode >= 0xff61 && iCode <= 0xff9f)) {
                                            length += 1;
                                        } else {
                                            length += 2;
                                        }
                                    }
                                    return length;
                                };
                            })()                            
                            `
                                        }
                                    ]
                                });
                                return `__$Ve.String.count(${$this})`;
                            },
                            indexOf(node, $this, ...args) {
                                return `${$this}.indexOf(${args[0]})`;
                            },
                            lastIndexOf(node, $this, ...args) {
                                return `${$this}.lastIndexOf(${args[0]})`;
                            }
                        }
                    },
                    {
                        name: 'Ve.Date',
                        props: {
                            new(node, value) {
                                this.appendResource({
                                    name: '__$ve.Date.new',
                                    items: [
                                        {
                                            type: 'code',
                                            code: `                           
                            (function()
                            {   
                                if(typeof __$Ve==typeof undefined)__$ve={ };
                                if(typeof __$Ve.Date==typeof undefined)__$Ve.Date={ };
                                __$Ve.Date.new=function (dateString){ };
                            })()                            
                            `
                                        }
                                    ]
                                });
                                return `__$Ve.Date.newDate("${value}")`;
                            },
                            now(node, $this) {
                                return `new Date()`;
                            },
                            year(node, $this) {
                                return `${$this}.getFullYear()`;
                            },
                            month(node, $this) {
                                return `(${$this}.getMonth()+1)`;
                            },
                            week(node, $this) {
                                return `(${$this}.getDay()+1)`;
                            }
                        }
                    },
                    {
                        name: 'Ve.Math',
                        props: {
                            PI(node, $this) {
                                return `Math.PI`;
                            },
                            E(node, $this) {
                                return `Math.E`;
                            },
                            abs(node, $this, ...args) {
                                return `Math.abs(${args.join(",")})`;
                            },
                            pow(node, $this, ...args) {
                                return `Math.pow(${args.join(",")})`;
                            },
                            ceil(node, $this, ...args) {
                                return `Math.ceil(${args.join(",")})`;
                            },
                            floor(node, $this, ...args) {
                                return `Math.floor(${args.join(",")})`;
                            },
                            round(node, $this, ...args) {
                                return `Math.round(${args.join(",")})`;
                            },
                            sin(node, $this, ...args) {
                                return `Math.sin((Math.PI/180)*${args[0]})`;
                            },
                            cos(node, $this, ...args) {
                                return `Math.cos((Math.PI/180)${args[0]})`;
                            },
                            tan(node, $this, ...args) {
                                return `Math.tan((Math.PI/180)${args[0]})`;
                            },
                            asin(node, $this, ...args) {
                                return `Math.asin(${args[0]})*180/Math.PI `;
                            },
                            acos(node, $this, ...args) {
                                return `Math.acos(${args[0]})*180/Math.PI `;
                            },
                            atan(node, $this, ...args) {
                                return `Math.atan(${args[0]})*180/Math.PI `;
                            },
                            min(node, $this, ...args) {
                                return `Math.min(${args.join(",")})`;
                            },
                            max(node, $this, ...args) {
                                return `Math.max(${args.join(",")})`;
                            },
                            sum(node, $this, ...args) {
                                return `(${args.join("+")})`;
                            },
                            avg(node, $this, ...args) {
                                return `(${args.join("+")})/${args.length}`;
                            }
                        }
                    }
                ];
                Lang._.addRange(nodejs.methodAccepter, nodejs.method$File);
            })(nodejs = Transtate.nodejs || (Transtate.nodejs = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var nodejs;
            (function (nodejs) {
                nodejs.accepter$binary = {
                    binary(express) {
                        this.accept(express.left);
                        this.accept(express.right);
                        Lang.LangRender.create(express, {
                            template: `@content(node)`,
                            props: {
                                content() {
                                    var express = this.node;
                                    var left = this.call(express.left);
                                    var right = this.call(express.right);
                                    switch (express.kind) {
                                        case Lang.VeName.ASSIGN:
                                        case Lang.VeName.ASSIGN_ADD:
                                        case Lang.VeName.ASSIGN_SUB:
                                        case Lang.VeName.ASSIGN_MUL:
                                        case Lang.VeName.ASSIGN_DIV:
                                        case Lang.VeName.ASSIGN_MOD:
                                        case Lang.VeName.OR:
                                        case Lang.VeName.AND:
                                        case Lang.VeName.XOR:
                                        case Lang.VeName.ADD:
                                        case Lang.VeName.SUB:
                                        case Lang.VeName.MUL:
                                        case Lang.VeName.DIV:
                                        case Lang.VeName.MOD:
                                        case Lang.VeName.EQ:
                                        case Lang.VeName.NE:
                                        case Lang.VeName.GT:
                                        case Lang.VeName.LT:
                                        case Lang.VeName.LTE:
                                        case Lang.VeName.GTE:
                                            return `${left}${Lang.VeSyntax.get(express.kind).string}${right}`;
                                        case Lang.VeName.ASSIGN_EXP:
                                            return `${left}=Math.pow(${left},${right})`;
                                        case Lang.VeName.EXP:
                                            return `Math.pow(${left},${right})`;
                                        case Lang.VeName.AS:
                                            break;
                                        case Lang.VeName.IS:
                                            break;
                                        case Lang.VeName.MATCH:
                                            break;
                                        case Lang.VeName.CONTAIN:
                                            return `${left}.indexOf(${right})>-1`;
                                        case Lang.VeName.STATR:
                                            return `${left}.indexOf(${right})==0`;
                                        case Lang.VeName.END:
                                            return `${left}.endsWith(${right})`;
                                        case Lang.VeName.K_EQ:
                                        case Lang.VeName.K_AND:
                                        case Lang.VeName.K_OR:
                                            var sy = '==';
                                            if (express.kind == Lang.VeName.K_AND)
                                                sy = '&&';
                                            else if (express.kind == Lang.VeName.K_OR)
                                                sy = '||';
                                            return `${left}${sy}${right}`;
                                        case Lang.VeName.K_XOR:
                                            return `${left}!==${right}`;
                                    }
                                }
                            }
                        });
                    },
                    unary(express) {
                        this.accept(express.exp);
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var express = this.node;
                                    switch (express.kind) {
                                        case Lang.VeName.INC:
                                        case Lang.VeName.DEC:
                                        case Lang.VeName.NOT:
                                            if (express.arrow == Lang.UnaryArrow.left) {
                                                return `${this.call(express.exp)}${Lang.VeSyntax.get(express.kind).string}`;
                                            }
                                            else {
                                                return `${Lang.VeSyntax.get(express.kind).string}${this.call(express.exp)}`;
                                            }
                                    }
                                }
                            }
                        });
                    },
                    constant(express) {
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var statement = this.node;
                                    switch (statement.valueType.name) {
                                        case 'String':
                                        case 'string':
                                            return (`\`${statement.value.replace(/`/g, "\\`")}\``);
                                        case 'Bool':
                                        case 'bool':
                                            return statement.value ? 'true' : 'false';
                                        case 'null':
                                            return 'null';
                                        case 'Number':
                                        case 'number':
                                        case 'int':
                                        case 'Int':
                                            return statement.value;
                                        case 'Url':
                                        case 'url':
                                            return "{__ve_type:'url',value:" + (`\`${statement.value.replace(/`/g, "\\`")}\``) + "}";
                                        case 'date':
                                        case 'Date':
                                            if (typeof statement.value == 'number')
                                                return `new Date(${statement.value})`;
                                            else if (typeof statement.value == 'string')
                                                return `new Date("${statement.value}")`;
                                        default:
                                            var cr = Lang.Statement.search(statement, statement.valueType.name, x => x instanceof Lang.ClassOrIntrfaceStatement ? true : false);
                                            if (cr) {
                                                var cp = cr.referenceStatement;
                                                var cpp = cp.body.find(x => x.isCtor && x.args.length == 1);
                                                if (cpp) {
                                                    return this.visitor.acceptMethod(cpp.unqiueName, statement, statement.value);
                                                }
                                            }
                                            else {
                                                console.log('not found class', statement, statement.valueType.name);
                                            }
                                    }
                                }
                            }
                        });
                    },
                    ternary(express) {
                        this.accept(express.where);
                        this.accept(express.trueCondition);
                        this.accept(express.falseCondition);
                        Lang.LangRender.create(express, {
                            template: `@call(node.where)?@call(node.trueCondition):@call(node.falseCondition)`
                        });
                    },
                    arrayIndex(express) {
                        if (typeof express.name != 'string')
                            this.accept(express.name);
                        this.accept(express.indexExpress);
                        Lang.LangRender.create(express, {
                            template: `@if(typeof node.name=='string')
        {@node.name[@call(node.indexExpress)]}
        else{@call(node.name)[@call(node.indexExpress)]} 
       `
                        });
                    },
                    variable(express) {
                        return Lang.LangRender.create(express, {
                            template: `@node.name`
                        });
                    },
                    arrowMethod(express) {
                        express.args.each(arg => this.accept(arg));
                        express.body.each(m => this.accept(m));
                        Lang.LangRender.create(express, {
                            template: `(@parameter())=>{@body()}`,
                            props: {
                                parameter() {
                                    var express = this.node;
                                    return express.args.map(arg => arg.langeRender.render()).join(",");
                                },
                                body() {
                                    var express = this.node;
                                    return this.renderList(express.body);
                                }
                            }
                        });
                    },
                    array(express) {
                        express.args.each(arg => this.accept(arg));
                        Lang.LangRender.create(express, {
                            template: `[@content(node)]`,
                            props: {
                                content() {
                                    var express = this.node;
                                    return express.args.map(arg => arg.langeRender.render()).join(",");
                                }
                            }
                        });
                    },
                    Object(express) {
                        express.propertys.each(pro => {
                            this.accept(pro.value);
                        });
                        Lang.LangRender.create(express, {
                            template: `{@content(node)}`,
                            props: {
                                content() {
                                    var express = this.node;
                                    return express.propertys.map(pro => `${pro.key}:${pro.value.langeRender.render()}`).join(",");
                                }
                            }
                        });
                    },
                    parameter(express) {
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var exp = this.node;
                                    return `${exp.isParameter ? "..." : ""}${exp.key}`;
                                }
                            }
                        });
                    }
                };
            })(nodejs = Transtate.nodejs || (Transtate.nodejs = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var nodejs;
            (function (nodejs) {
                nodejs.accepter$statement = {
                    $if(express) {
                        Lang.LangRender.create(express, {
                            template: `if(@call(node.ifCondition)){@statement(node.ifStatement)}@for(var i=0;i<node.thenConditions.length;i++){
            else if(@call(node.thenConditions.eq(i))){@statement(node.thenConditions.eq(i))}
        }@if(node.elseStatement.length > 0){
             else{@statement(node.elseStatement)}
        }`
                        });
                    },
                    switch(express) {
                        Lang.LangRender.create(express, {
                            template: `switch(@call(node.valueExpression)) { 
        @for(var i=0;i<node.caseStatements.length;i++){
             case @call(node.caseStatements.eq(i).value):
             @statement(node.caseStatements.eq(i).matchs)
             break;
        }
        @if(node.defaultStatement&&node.defaultStatement.length>0){
            default:
            @statement(node.defaultStatement)
        }
    }`
                        });
                    },
                    for(express) {
                        Lang.LangRender.create(express, {
                            template: `for(@call(node.initStatement);@call(node.condition);@call(nextStatement)){@statement(node.body)}`
                        });
                    },
                    $try(express) {
                        Lang.LangRender.create(express, {
                            template: `if(@call(node.ifCondition)){@statement(node.ifStatement)}@for(var i=0;i<node.thenConditions.length;i++){
            else if(@call(node.thenConditions.eq(i))){@statement(node.thenConditions.eq(i))}
        }@if(node.elseStatement.length > 0){
             else{@statement(node.elseStatement)}
        }`
                        });
                    },
                    while(express) {
                        this.accept(express.condition);
                        express.body.each(s => this.accept(s));
                        Lang.LangRender.create(express, {
                            template: `while(@call(node.condition)){@statement(node.body)}`
                        });
                    },
                    doWhile(express) {
                        Lang.LangRender.create(express, {
                            template: `do{@statement(node.body)}while(@call(node.condition))`
                        });
                    },
                    break(express) {
                        Lang.LangRender.create(express, {
                            template: 'break'
                        });
                    },
                    throw(express) {
                        this.accept(express.expression);
                        Lang.LangRender.create(express, {
                            template: `throw @call(node.expression)`
                        });
                    },
                    continue(express) {
                        Lang.LangRender.create(express, {
                            template: `continue;`
                        });
                    },
                    return(express) {
                        this.accept(express.expression);
                        Lang.LangRender.create(express, {
                            template: `return @call(node.expression)`
                        });
                    }
                };
            })(nodejs = Transtate.nodejs || (Transtate.nodejs = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var nodejs;
            (function (nodejs) {
                nodejs.accepter$method = {
                    objectReferenceProperty(express) {
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    var express = this.node;
                                    var preCode = '';
                                    var referenceType;
                                    var names = new Lang.VeArray;
                                    for (var i = 0; i < express.propertys.length; i++) {
                                        var ep = express.propertys.eq(i);
                                        if (typeof ep == 'string') {
                                            if (typeof referenceType != typeof undefined) {
                                                switch (referenceType.kind) {
                                                    case Lang.TypeKind.unit:
                                                        var result = Lang.Statement.search(express, referenceType.name, x => {
                                                            if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                                                return false;
                                                        });
                                                        if (result) {
                                                            var typeClass = result.referenceStatement;
                                                            if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                                            }
                                                            else {
                                                                var cp = typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method);
                                                                if (cp) {
                                                                    referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                                    preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                                }
                                                            }
                                                        }
                                                        break;
                                                    case Lang.TypeKind.union:
                                                        var typeClass = Lang.Statement.search(express, referenceType.unionType.name, x => { if (!(x instanceof Lang.ClassOrIntrfaceStatement))
                                                            return false; }).referenceStatement;
                                                        if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                                        }
                                                        else {
                                                            var cp = typeClass.body.find(x => x.name == ep && x.kind != Lang.ClassPropertyKind.method);
                                                            if (cp) {
                                                                referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                                var map = {};
                                                                typeClass.generics.each((gen, i) => map[gen.key] = referenceType.generics.eq(i));
                                                                if (referenceType)
                                                                    referenceType = referenceType.injectGenericImplement(map);
                                                                preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                            }
                                                        }
                                                        break;
                                                    case Lang.TypeKind.object:
                                                        var prop = referenceType.props.find(x => x.type == name);
                                                        if (prop) {
                                                            referenceType = prop.type;
                                                            preCode = preCode + `.${name}`;
                                                        }
                                                        break;
                                                }
                                            }
                                            else {
                                                names.push(ep);
                                                var referenceStatement = Lang.Statement.search(express, names.join("."));
                                                if (referenceStatement) {
                                                    switch (referenceStatement.kind) {
                                                        case Lang.StatementReferenceKind.FunArgs:
                                                        case Lang.StatementReferenceKind.currentClassMethodArgs:
                                                            var target = referenceStatement.target;
                                                            referenceType = target.parameterType || (target.default ? target.default.valueType : undefined);
                                                            preCode = names.join(".");
                                                            break;
                                                        case Lang.StatementReferenceKind.outerClass:
                                                            if (i == express.propertys.length - 1 && express.parent instanceof Lang.CallMethodExpression) {
                                                            }
                                                            else {
                                                            }
                                                            break;
                                                        case Lang.StatementReferenceKind.outerClassProperty:
                                                            var cp = referenceStatement.referenceStatement;
                                                            referenceType = cp.propType || (cp.value ? cp.value.valueType : undefined);
                                                            preCode = this.visitor.acceptMethod(cp.unqiueName, express, preCode);
                                                            break;
                                                        case Lang.StatementReferenceKind.DeclareVariable:
                                                            referenceType = referenceStatement.referenceStatement.infer.expressType;
                                                            preCode = names.join(".");
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                        else if (ep instanceof Lang.Expression) {
                                            this.visitor.accept(ep);
                                            this.call(ep);
                                            referenceType = ep.infer.expressType;
                                            preCode += ep.langeRender.render();
                                        }
                                    }
                                    if (referenceType)
                                        express.infer.expressType = referenceType;
                                    return preCode;
                                }
                            }
                        });
                    },
                    callMethod(express) {
                        express.args.each(arg => this.accept(arg));
                        if (typeof express.name == 'string') {
                            Lang.LangRender.create(express, { template: `${express.name}(${express.args.map(x => x.langeRender.render()).join(",")})` });
                        }
                        else if (express.name instanceof Lang.PropertyExpression) {
                            this.accept(express.name);
                            if (typeof express.infer.referenceStatement != typeof undefined) {
                                switch (express.infer.referenceStatement.kind) {
                                    case Lang.StatementReferenceKind.DeclareFun:
                                    case Lang.StatementReferenceKind.currentClassMethodArgs:
                                    case Lang.StatementReferenceKind.FunArgs:
                                        Lang.LangRender.create(express, {
                                            template: `@preCode@{}(@args())`,
                                            props: {
                                                preCode() {
                                                    var express = this.node;
                                                    if (express.name instanceof Lang.Expression) {
                                                        return express.name.langeRender.render();
                                                    }
                                                },
                                                args() {
                                                    var express = this.node;
                                                    return express.args.map(arg => arg.langeRender.render()).join(",");
                                                }
                                            }
                                        });
                                        break;
                                    case Lang.StatementReferenceKind.outerClassProperty:
                                        var cp = express.infer.referenceStatement.referenceStatement;
                                        var lr = Lang.LangRender.create(express, {
                                            props: {
                                                arg(pos) {
                                                    var express = this.node;
                                                    if (pos == -1) {
                                                        if (express.name instanceof Lang.Expression)
                                                            return express.name.langeRender.render();
                                                    }
                                                    else {
                                                        return express.args.eq(pos).langeRender.render();
                                                    }
                                                }
                                            }
                                        });
                                        var args = new Lang.VeArray('arg(-1)').append(express.args.map((a, i) => `arg(${i})`));
                                        lr.template = this.acceptMethod(cp.unqiueName, express, ...args);
                                        break;
                                    case Lang.StatementReferenceKind.outerClass:
                                        var args = new Lang.VeArray('arg(-1)').append(express.args.map((a, i) => `arg(${i})`));
                                        var ci = express.infer.referenceStatement.referenceStatement;
                                        var lr = Lang.LangRender.create(express, {
                                            props: {
                                                arg(pos) {
                                                    var express = this.node;
                                                    if (pos == -1) {
                                                        if (express.name instanceof Lang.Expression)
                                                            return express.name.langeRender.render();
                                                    }
                                                    else {
                                                        return express.args.eq(pos).langeRender.render();
                                                    }
                                                }
                                            }
                                        });
                                        lr.template = this.acceptMethod(ci.fullName, express, ...args);
                                }
                            }
                        }
                    }
                };
            })(nodejs = Transtate.nodejs || (Transtate.nodejs = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Transtate;
        (function (Transtate) {
            var nodejs;
            (function (nodejs) {
                nodejs.accepter = {
                    package(express) {
                        var content = '';
                        var ns = Lang.VeArray.asVeArray(express.name.split("."));
                        ns.recursion((name, i, next) => {
                            var pre = i > 0 ? ns.eq(i - 1) : '';
                            content += (`var ${name};`);
                            content += (`(function(${name}){`);
                            next(i + 1);
                            if (i == ns.length - 1) {
                                content += '@content()';
                            }
                            if (pre)
                                content += (`})(${name}=${pre}.${name}||(${pre}.${name}={}))`);
                            else
                                content += (`})(${name}||(${name}={}))`);
                        });
                        express.body.map(x => this.accept(x));
                        return Lang.LangRender.create(express, {
                            template: `${content}`,
                            props: {
                                content() {
                                    return this.renderList(express.body);
                                }
                            }
                        });
                    },
                    context(express) {
                        return Lang.LangRender.create(express, {
                            template: `${express.name}`
                        });
                    },
                    use(express) {
                        return Lang.LangRender.create(express, {
                            template: `@if(node.localName)
                {
                    var @node.localName=@node.name;
                }
                `,
                            props: {
                                node: express
                            }
                        });
                    },
                    $class(express) {
                        express.body.each(s => this.accept(s));
                        var className = express.name;
                        var lastName = express.package.lastName;
                        Lang.LangRender.create(express, {
                            template: `class ${className == lastName ? className + "1" : className}  @if(node.extendName) { extends @node.extendName } 
                {
                     @content()
                }
                ${lastName}.${express.name}=${className == lastName ? className + "1" : className}
                `,
                            props: {
                                content() {
                                    return this.renderList(express.body);
                                }
                            }
                        });
                    },
                    enum(express) {
                        Lang.LangRender.create(express, {
                            template: `var @node.name;
                (function(@node.name){
                    @content(node);
                })(@node.name=@node.package.lastName@{}.@node.name||(@node.package.lastName@{}.@node.name={ }))
               `,
                            props: {
                                content() {
                                    if (this.node instanceof Lang.EnumStatement) {
                                        return express.options.map(pro => {
                                            return `${express.name}[${express.name}["${pro.key}"]=${this.visitor.accept(pro.value)}]="${pro.key}";`;
                                        }).join("");
                                    }
                                }
                            }
                        });
                    },
                    classProperty(express) {
                        if (express.kind == Lang.ClassPropertyKind.prop) {
                        }
                        else if (express.kind == Lang.ClassPropertyKind.method) {
                            express.body.each(s => this.accept(s));
                        }
                        else if (express.kind == Lang.ClassPropertyKind.field) {
                            if (express.get.length > 0) {
                                express.get.each(s => this.accept(s));
                            }
                            if (express.set.length > 0) {
                                express.set.each(s => this.accept(s));
                            }
                        }
                        Lang.LangRender.create(express, {
                            template: `@content()`,
                            props: {
                                content() {
                                    if (this.node instanceof Lang.ClassProperty) {
                                        var express = this.node;
                                        if (express.kind == Lang.ClassPropertyKind.prop) {
                                        }
                                        else if (express.kind == Lang.ClassPropertyKind.method) {
                                            var argsString = express.args.map(arg => this.visitor.accept(arg)).join(",");
                                            return `${express.name}(${argsString}){${this.renderList(express.body)}}`;
                                        }
                                        else if (express.kind == Lang.ClassPropertyKind.field) {
                                            var code = '';
                                            if (express.get.length > 0) {
                                                code += `get ${express.name}(){${this.renderList(express.get)}}`;
                                            }
                                            else {
                                                code += `set ${express.name}(value){${this.renderList(express.set)}}`;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    },
                    fun(express) {
                        express.body.each(exp => this.accept(exp));
                        return Lang.LangRender.create(express, {
                            template: `function @node.name@{}(@parameter()){@statement(node.body)}`,
                            props: {
                                parameter() {
                                    var express = this.node;
                                    return express.args.map(arg => this.visitor.accept(arg)).join(",");
                                },
                                statement(body) {
                                    return this.renderList(express.body);
                                }
                            }
                        });
                    },
                    declareVariable(express) {
                        if (express.value)
                            this.accept(express.value);
                        return Lang.LangRender.create(express, {
                            template: `var @node.name@if(node.value){=@call(node.value)}`,
                        });
                    }
                };
                Lang.applyExtend(nodejs.accepter, nodejs.accepter$binary, nodejs.accepter$statement, nodejs.accepter$method);
            })(nodejs = Transtate.nodejs || (Transtate.nodejs = {}));
        })(Transtate = Lang.Transtate || (Lang.Transtate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=ve.js.map
module.exports=Ve;