var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Util;
        (function (Util) {
            class List {
                constructor(...args) {
                    this.$ = new Array();
                    if (args.length > 1) {
                        args.forEach(arg => this.push(arg));
                    }
                    else if (args.length == 1) {
                        if (args[0] instanceof List) {
                            args[0].forEach(x => this.push(x));
                        }
                        else if (Array.isArray(args[0])) {
                            args[0].forEach(x => this.push(x));
                        }
                        else
                            this.push(args[0]);
                    }
                }
                push(item) {
                    return this.$.push(item);
                }
                get length() {
                    return this.$.length;
                }
                splice(start, deleteCount, ...items) {
                    this.$.splice(start, deleteCount, ...items);
                    return this;
                }
                join(separator, predict) {
                    if (typeof predict == 'function')
                        return this.map(predict).join(separator);
                    else
                        return this.$.join(separator);
                }
                reverse() {
                    this.$.reverse();
                    return this;
                }
                /**
                 * Sorts an array.
                 * @param compareFn Function used to determine the order of the elements. It is expected to return
                 * a negative value if first argument is less than second argument, zero if they're equal and a positive
                 * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
                 * ```ts
                 * List[11,2,22,1].sort((a, b) => a - b)
                 * ```
                 */
                sort(compareFn) {
                    this.$.sort(compareFn);
                    return this;
                }
                eq(pos) {
                    return this.$[pos];
                }
                predicateMatch(item, index, list, predicate) {
                    if (typeof predicate == 'function') {
                        return predicate(item, index, list);
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
                toArray(predicate) {
                    var ve = new List();
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
                    if (a instanceof List) {
                        var args = [pos, 0];
                        a.forEach(x => args.push(x));
                        this.splice.apply(this, args);
                    }
                    else if (a instanceof Array) {
                        var args = [pos, 0];
                        a.forEach(x => args.push(x));
                        this.splice.apply(this, args);
                    }
                    else {
                        this.splice(pos, 0, a);
                    }
                    return this;
                }
                replaceAt(pos, a) {
                    this.$[pos] = a;
                    return this;
                }
                appendArray(a, pos) {
                    //将数组添加进来
                    this.insertArrayAt(pos || this.length, a);
                    return this;
                }
                insertArrayAt(pos, a) {
                    //将数组添加到指定位置
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
                trueForAll(predicate) {
                    for (var i = 0; i < this.length; i++) {
                        if (this.predicateMatch(this.eq(i), i, this, predicate) !== true)
                            return false;
                    }
                    return true;
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
                    var result = new List();
                    for (var i = 0; i < this.length; i++) {
                        if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                            result.push(this.eq(i));
                        }
                    }
                    return result;
                }
                findAt(predicate, defaultIndex) {
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
                        return new List();
                    }
                    return this.range(index, index + size - 1);
                }
                /***
                 * 包含start,end
                 */
                range(start, end) {
                    var arr = new List();
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
                    var list = new List();
                    var gs = new List();
                    var self = this;
                    this.each(function (val, i, arr) {
                        if (self.predicateMatch(val, i, arr, predicate) == true) {
                            if (gs.length > 0)
                                list.appendArray(gs);
                            gs = new List();
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
                /**
                 * 两个集合相减
                 */
                subtract(arr) {
                    return this.findAll(x => !arr.exists(x));
                }
                sum(predicate) {
                    var s = 0;
                    this.each((r, i) => {
                        if (typeof predicate == 'undefined')
                            s += r;
                        else if (typeof predicate == 'function')
                            s += predicate(r, i, this);
                        else
                            s += r;
                    });
                    return s;
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
                treeEach(treeChildName, fn, parent, defaultDeep, defaultIndex) {
                    var maxDeep = defaultDeep == undefined ? 0 : defaultDeep;
                    var index = defaultIndex == undefined ? 0 : defaultIndex;
                    var isBreak = false;
                    var fc = function (arr, deep, parent) {
                        if (deep > maxDeep) {
                            maxDeep = deep;
                        }
                        var sort = 0;
                        arr.each(function (a) {
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
                            if (a && a[treeChildName] && a[treeChildName].length > 0) {
                                fc(a[treeChildName], deep + 1, r && r.returns ? r.returns : undefined);
                            }
                        });
                    };
                    fc(this, maxDeep, parent);
                    return { total: index, deep: maxDeep };
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
                find(predicate) {
                    for (let i = 0; i < this.length; i++) {
                        if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                            return this.eq(i);
                        }
                    }
                    return null;
                }
                map(predicate) {
                    var ve = new List();
                    for (var i = 0; i < this.length; i++) {
                        var r = predicate(this.eq(i), i, this);
                        if (typeof r != typeof undefined) {
                            ve.push(r);
                        }
                    }
                    return ve;
                }
                static isList(t) {
                    return t instanceof List;
                }
                static asList(t) {
                    if (t instanceof List)
                        return t;
                    else
                        return new List(t);
                }
                static treeEach(list, treeChildName, fn, parent, defaultDeep, defaultIndex) {
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
                            if (a && a[treeChildName] && a[treeChildName].length > 0) {
                                fc(a[treeChildName], deep + 1, r && r.returns ? r.returns : undefined);
                            }
                        });
                    };
                    fc(list, maxDeep, parent);
                    return { total: index, deep: maxDeep };
                }
            }
            Util.List = List;
            Util._ = {
                remove(list, predict) {
                    var index = this.findIndex(list, predict);
                    if (index > -1)
                        list.splice(index, 1);
                },
                removeAll(list, predict) {
                    for (let i = list.length - 1; i >= 0; i--) {
                        if (typeof predict == 'function') {
                            var r = predict(list[i], i, list);
                            if (r == true)
                                list.splice(i, 1);
                        }
                        else if (predict === list[i]) {
                            list.splice(i, 1);
                        }
                    }
                },
                each(list, predict) {
                    for (let i = 0; i < list.length; i++) {
                        let data = list[i];
                        if (typeof predict == 'function') {
                            var result = predict(data, i, list);
                            if (result == false)
                                break;
                        }
                    }
                },
                addRange(list, newArray) {
                    newArray.forEach(t => list.push(t));
                },
                find(list, predict) {
                    for (let i = 0; i < list.length; i++) {
                        if (typeof predict == 'function') {
                            var r = predict(list[i], i, list);
                            if (r == true)
                                return list[i];
                        }
                    }
                },
                findIndex(list, predict) {
                    for (let i = 0; i < list.length; i++) {
                        if (typeof predict == 'function') {
                            var r = predict(list[i], i, list);
                            if (r == true)
                                return i;
                        }
                        else if (predict === list[i]) {
                            return i;
                        }
                    }
                },
                exists(list, predict) {
                    return this.findIndex(list, predict) > -1 ? true : false;
                },
                treeEach(list, treeChildName, fn, parent, defaultDeep, defaultIndex) {
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
                            if (a && Array.isArray(a[treeChildName])) {
                                fc(a[treeChildName], deep + 1, r && r.returns ? r.returns : undefined);
                            }
                        });
                    };
                    fc(list, maxDeep, parent);
                    return { total: index, deep: maxDeep };
                }
            };
        })(Util = Lang.Util || (Lang.Util = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Util;
        (function (Util) {
            function Inherit(Mix, ...mixins) {
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
            Util.Inherit = Inherit;
            function Mixin(cla, baseCla, keys) {
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    var desc = Object.getOwnPropertyDescriptor(baseCla, key);
                    if (!desc)
                        desc = Object.getOwnPropertyDescriptor(baseCla.prototype, key);
                    if (desc)
                        Object.defineProperty(cla, key, desc);
                    else
                        console.log(desc, baseCla, key);
                }
            }
            Util.Mixin = Mixin;
            function Extend(mix, ...mixins) {
                mixins.forEach(mi => {
                    for (var n in mi) {
                        mix[n] = mi[n];
                    }
                });
                return mix;
            }
            Util.Extend = Extend;
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
            Util.getAvailableName = getAvailableName;
            function nullSafe(value, def) {
                return value === null || value === undefined ? def : value;
            }
            Util.nullSafe = nullSafe;
            let counter = 0;
            function getId() {
                return (counter += 1).toString();
            }
            Util.getId = getId;
        })(Util = Lang.Util || (Lang.Util = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Util;
        (function (Util) {
            class BaseEvent {
                constructor() {
                    this.__$events = new Util.List();
                }
                on(name, cb, isReplace) {
                    if (typeof name == 'object') {
                        for (var n in name)
                            this.on(n, name[n]);
                        return;
                    }
                    else {
                        var ev = this.__$events.find(x => x.name == name);
                        if (isReplace == true && ev) {
                            Util.Extend(ev, { name, cb });
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
                        if (isReplace == true && ev) {
                            Util.Extend(ev, { name, cb, once: true });
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
                    else if (typeof name == 'function') {
                        this.__$events.removeAll(x => x.cb == name);
                    }
                    return this;
                }
                emit(name, ...args) {
                    var ev = this.__$events.find(x => typeof name == 'string' && x.name == name);
                    if (ev) {
                        var result = ev.cb.apply(this, args);
                        if (ev.once == true)
                            this.__$events.remove(ev);
                        return result;
                    }
                }
                in(name) {
                    return this.__$events.find(x => x.name == name) ? true : false;
                }
            }
            Util.BaseEvent = BaseEvent;
        })(Util = Lang.Util || (Lang.Util = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../util/list.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Ve.Lang.Util.List;
        class Token {
            constructor() {
                this.childs = new List;
            }
            get prev() {
                if (this.parent) {
                    var index = this.parent.childs.findIndex(x => x === this);
                    return this.parent.childs.eq(index - 1);
                }
            }
            get next() {
                if (this.parent) {
                    var index = this.parent.childs.findIndex(x => x === this);
                    return this.parent.childs.eq(index + 1);
                }
            }
            nextFindAll(predict) {
                if (this.parent) {
                    var ns = this.parent.childs.findAll((t, i) => i > this.index);
                    return ns.findAll(predict);
                }
            }
            nextFind(predict) {
                if (this.parent) {
                    return this.parent.childs.findAfter(x => x == this, predict);
                }
            }
            prevExists(predict) {
                if (this.parent) {
                    var index = this.parent.childs.findIndex(x => x == this);
                    for (var i = 0; i < index; i++) {
                        if (predict(this.parent.childs.eq(i)) == true)
                            return true;
                    }
                }
                return false;
            }
            /***incluse self */
            isPrevMatch(match) {
                if (this.parent) {
                    var index = this.parent.childs.findIndex(x => x === this);
                    var rs = this.parent.childs.range(0, index);
                    var flags = this.prevFlags();
                    var mr = (m) => {
                        if (Array.isArray(m)) {
                            for (var i = 0; i < m.length; i++) {
                                var r = mr(m[i]);
                                if (typeof r != 'undefined')
                                    return r;
                            }
                        }
                        else if (typeof m == 'string' && m.endsWith(flags))
                            return flags;
                        else if (m instanceof RegExp) {
                            var t = flags.match(m);
                            if (t && t[0] && (t.index == flags.length - t[0].length)) {
                                return t;
                            }
                        }
                    };
                    return mr(match) ? true : false;
                }
                return false;
            }
            prevFlags() {
                if (this.parent) {
                    var index = this.parent.childs.findIndex(x => x === this);
                    var rs = this.parent.childs.range(0, index);
                    return rs.map(x => x.flag).join("");
                }
                return '';
            }
            closest(predict, considerSelf = true) {
                var t = considerSelf == true ? this : this.parent;
                while (true) {
                    if (predict(t) == true)
                        return t;
                    else {
                        t = t.parent;
                        if (!t)
                            return null;
                    }
                }
            }
            parents(predict, tillPredict) {
                var tokens = new List();
                var t = this.parent;
                while (true) {
                    if (!t)
                        break;
                    if (typeof tillPredict == 'function' && tillPredict(t) == true)
                        break;
                    if (predict(t)) {
                        tokens.push(t);
                    }
                    t = t.parent;
                }
                return tokens;
            }
            get() {
                var json = {};
                json.col = this.col;
                json.size = this.size;
                json.row = this.row;
                json.value = this.value;
                json.name = this.name;
                json.childs = this.childs.map(x => x.get());
                return json;
            }
            get flag() {
                var cmap = {
                    '《=': "<=",
                    '》=': ">=",
                    '！=': "!=",
                    '-》': "->",
                    '、': "/",
                    '！': "!",
                    "？": "?",
                    "：": ":",
                    "、=": "/=",
                    "。。。": "...",
                    "？？": "??",
                    "？。": "?.",
                    "。。": "..",
                    "《": "<",
                    "》": ">",
                    "（": "(",
                    "【": "]",
                    "）": ")",
                    "】": "]",
                    "，": ",",
                    "；": ";",
                    "。": ".",
                };
                var self = this;
                var gv = () => {
                    if (typeof cmap[self.value] == 'string')
                        return cmap[self.value];
                    return self.value;
                };
                if (this.name == 'operators') {
                    return gv();
                }
                else if (this.name == 'keywords') {
                    if (['any', 'Any', 'bool', 'Bool', 'number', 'Number', 'string', 'String', 'double', 'Double', 'Int', 'int',
                        'Object', 'Array', 'Date'].find(x => x == this.value) ? true : false)
                        return 'type';
                    return gv();
                }
                else if (this.name == 'delimiter') {
                    return gv();
                }
                else if (this.name.startsWith('comment')) {
                    return 'comment';
                }
                else if (this.name.startsWith('string')) {
                    if (this.name == 'string.single.open' || this.name == 'string.double.open')
                        return '"';
                    else if (this.name == 'string.single.close' || this.name == 'string.double.close')
                        return '\'';
                    else if (this.name == 'string.escape')
                        return 'escape';
                    else if (this.name == 'string.variable')
                        return 'variable';
                    else if (this.name == 'string.template.open')
                        return '@{';
                    else if (this.name == 'string.template.close')
                        return '}';
                    return 'string';
                }
                else if (this.name.startsWith('number')) {
                    return 'number';
                }
                else if (this.name.startsWith('white')) {
                    return 'space';
                }
                else if (this.name == 'line') {
                    return 'line';
                }
                else if (this.name == 'bracket.open' || this.name == 'bracket.close') {
                    return gv();
                }
                else if (this.name.startsWith('generic')) {
                    if (this.name == 'generic.type')
                        return 'word';
                    else
                        return gv();
                }
                else if (this.name == 'word')
                    return this.name;
            }
            get index() {
                if (this.parent) {
                    return this.parent.childs.findIndex(x => x == this);
                }
            }
        }
        Lang.Token = Token;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        function getLangSyntaxRegex(syntax, r) {
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
                        else
                            return $1;
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
        Lang.getLangSyntaxRegex = getLangSyntaxRegex;
        function convertLangSyntax(syntax) {
            for (var key in syntax) {
                if (syntax[key] instanceof RegExp)
                    syntax[key] = getLangSyntaxRegex(syntax, syntax[key]);
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
                        else if (z.match)
                            z.match = getLangSyntaxRegex(syntax, z.match);
                    });
                }
            });
        }
        Lang.convertLangSyntax = convertLangSyntax;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='tokenizer.ts'/>
///<reference path='syntax.regex.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let keywords = [
            'async', 'await',
            'break', "when", 'switch', 'case', 'default', 'try', 'catch', 'finally', 'continue', 'const',
            'ctor', 'do', 'if', 'for', 'else', 'while', 'fun',
            'use', 'in', 'null',
            'return', 'decorate', 'package', 'super', 'new', 'this', 'throw', 'true', 'false',
            'def', 'void', 'not', 'is', 'as', 'and', 'or', 'xor', 'readonly',
            'out', 'inner', 'extends', 'enum', 'class', 'interface', 'super',
            'this', 'get', 'set', 'then', 'of', 'static', 'public', 'protected', 'private', 'sealed', 'operator',
            /**
             * 类型
             * */
            'any', 'Any', 'bool', 'Bool', 'number', 'Number', 'string', 'String', 'double', 'Double', 'Int', 'int',
            'Object', 'Array', 'Date',
        ].sort((x, y) => x.length > y.length ? -1 : 1);
        Lang.VeTokenSyntax = {
            keywords: new RegExp(keywords.join("|")),
            operators: [
                '<=', '>=', '==', '!=', '->', '+', '-', '**',
                '*', '/', '%', '++', '--', '!', '~~', '&&', '||', '?', ':', '=', '+=', '-=',
                '*=', '**=', '/=', '%=',
                '#', '@', '...', '??', '?.', '..', '<', '>'
            ],
            escapes: /\\\\([abfnrtv@\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            white: /[ \t\f\v]/,
            unit: /[a-zA-Z_\$\u4E00-\u9FA5]/,
            word: /@unit[a-zA-Z_\$\u4E00-\u9FA5\d]*/,
            namespace: /@word(@white\.@white@word)*/,
            number: /\d+(\.\d+)?([eE][\-+]?\d+)?/,
            root: [
                { match: /@white+/, name: 'white' },
                { match: /\/\/.*$/, name: 'comment.line' },
                { match: /\/\*/, next: '@comment', name: 'comment.open', push: true },
                { match: /[\{\(\[]/, name: 'bracket.open', push: true },
                { match: /[\)\]]/, name: 'bracket.close', pop: true },
                /**
                 *  主要是区分}来源于{},还是@{}
                 */
                {
                    match: /}/,
                    name: 'bracket.close',
                    pop: true,
                    action(contextToken) {
                        if (contextToken && contextToken.value == '@{') {
                            var next = '@string_double_block';
                            if (contextToken.parent && contextToken.parent.value == '\'')
                                next = '@string_single_block';
                            return {
                                next,
                                name: 'string.template.close'
                            };
                        }
                    }
                },
                /****
                 * 泛型<word(,word)*>
                 */
                { match: /\<(?=@namespace(@white*\,@white*@namespace)*>)/, name: 'generic.bracket.open', next: '@generic', push: true },
                { match: /@number@word/, name: 'number.unit' },
                { match: /@number/, name: 'number' },
                { match: /@keywords(?![a-zA-Z_\$\u4E00-\u9FA5\d])/, name: 'keywords' },
                // { match: /@types(?![a-zA-Z_\$\u4E00-\u9FA5\d])/, name: 'keywords' },
                { match: '@operators', name: 'operators' },
                { match: /[;,\.]/, name: 'delimiter' },
                { match: /@word/, name: 'word' },
                { match: '"', name: 'string.double.open', next: '@string_double_block', push: true },
                { match: '\'', name: 'string.single.open', next: '@string_single_block', push: true },
            ],
            comment: [
                { match: /[^\/\*]+/, name: 'comment' },
                { match: /\*\//, name: 'comment.end', pop: true, next: '@root' },
                { match: /[\/\*]/, name: 'comment.escape' }
            ],
            string_double_block: [
                { match: /[^"\\@]+/, name: 'string.text' },
                { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
                { match: /@escapes/, name: 'string.escape' },
                { match: /@@word/, name: 'string.variable' },
                { match: /\\./, name: 'string.escape.invalid' },
                { match: '@', name: 'string.text' },
                { match: '"', name: 'string.double.close', pop: true, next: '@root' }
            ],
            string_single_block: [
                { match: /[^'\\@]+/, name: 'string.text' },
                { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
                { match: /@escapes/, name: 'string.escape' },
                { match: /@@word/, name: 'string.variable' },
                { match: /\\./, name: 'string.escape.invalid' },
                { match: '@', name: 'string.text' },
                { match: '\'', name: 'string.single.close', pop: true, next: '@root' }
            ],
            generic: [
                {
                    match: /@namespace/,
                    name: 'generic.type'
                },
                { match: ',', name: 'generic.delimiter' },
                { match: '>', name: 'generic.bracket.close', pop: true, next: '@root' },
                { match: /@white+/, name: 'generic.white' },
            ]
        };
        Lang.convertLangSyntax(Lang.VeTokenSyntax);
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='tokenizer.ts'/>
///<reference path='syntax.regex.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let keywords = [
            'async', 'await',
            'break', "when", 'switch', 'case', 'default', 'try', 'catch', 'finally', 'continue', 'const',
            'ctor', 'do', 'if', 'for', 'else', 'while', 'fun',
            'use', 'in', 'null',
            'return', 'decorate', 'package', 'super', 'new', 'this', 'throw', 'true', 'false',
            'def', 'void', 'not', 'is', 'as', 'and', 'or', 'xor', 'readonly',
            'out', 'inner', 'extends', 'enum', 'class', 'interface', 'super',
            'this', 'get', 'set', 'then', 'of', 'static', 'public', 'protected', 'private', 'sealed', 'operator',
            /**
             * 类型
             * */
            'any', 'Any', 'bool', 'Bool', 'number', 'Number', 'string', 'String', 'double', 'Double', 'Int', 'int',
            'Object', 'Array', 'Date'
        ].sort((x, y) => x.length > y.length ? -1 : 1);
        /**
         * 中文语法 token syntax
         *
         */
        Lang.VeZhTokenSyntax = {
            keywords: new RegExp(keywords.join("|")),
            operators: [
                '<=', '>=', '==', '!=', '->', '+', '-', '**',
                '*', '/', '%', '++', '--', '!', '~~', '&&', '||', '?', ':', '=', '+=', '-=',
                '*=', '**=', '/=', '%=',
                '#', '@', '...', '??', '?.', '..', '<', '>',
                /***中文符号 */
                '《=', '》=', '！=', '-》', '、', '！', '？', '：', '、=', '。。。', '？？', '？。', '。。', '《', '》',
            ],
            escapes: /\\\\([abfnrtv@\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            white: /[ \t\f\v]/,
            unit: /[a-zA-Z_\$￥\u4E00-\u9FA5]/,
            word: /@unit[a-zA-Z_\$￥\u4E00-\u9FA5\d]*/,
            namespace: /@word(@white(\.|。)@white@word)*/,
            number: /\d+((\.|。)\d+)?([eE][\-+]?\d+)?/,
            root: [
                { match: /@white+/, name: 'white' },
                { match: /(\/\/|、、).*$/, name: 'comment.line' },
                { match: /\/\*|、\*/, next: '@comment', name: 'comment.open', push: true },
                { match: /[\{\(\[（【]/, name: 'bracket.open', push: true },
                { match: /[\)\]）】]/, name: 'bracket.close', pop: true },
                /**
                 *  主要是区分}来源于{},还是@{}
                 */
                {
                    match: /}/,
                    name: 'bracket.close',
                    pop: true,
                    action(contextToken) {
                        if (contextToken && contextToken.value == '@{') {
                            var next = '@string_double_block';
                            if (contextToken.parent && contextToken.parent.value == '\'')
                                next = '@string_single_block';
                            return {
                                next,
                                name: 'string.template.close'
                            };
                        }
                    }
                },
                /****
                 * 泛型<word(,word)*>
                 */
                { match: /(\<|《)(?=@namespace(@white*(\,|，)@white*@namespace)*>)/, name: 'generic.bracket.open', next: '@generic', push: true },
                { match: /@number@word/, name: 'number.unit' },
                { match: /@number/, name: 'number' },
                { match: /@keywords(?![a-zA-Z_\$￥\u4E00-\u9FA5\d])/, name: 'keywords' },
                // { match: /@types(?![[a-zA-Z_\$\u4E00-\u9FA5\d])/, name: 'keywords' },
                { match: '@operators', name: 'operators' },
                { match: /[;,\.；，。]/, name: 'delimiter' },
                { match: /@word/, name: 'word' },
                { match: '"', name: 'string.double.open', next: '@string_double_block', push: true },
                { match: '\'', name: 'string.single.open', next: '@string_single_block', push: true },
                { match: /[“”]/, name: 'string.double.open', next: '@zh_string_double_block', push: true },
                { match: /[‘’]/, name: 'string.single.open', next: '@zh_string_single_block', push: true },
            ],
            comment: [
                { match: /[^\/\*、]+/, name: 'comment' },
                { match: /\*\/|\*、/, name: 'comment.end', pop: true, next: '@root' },
                { match: /[\/\*、]/, name: 'comment.escape' }
            ],
            string_double_block: [
                { match: /[^"\\@]+/, name: 'string.text' },
                { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
                { match: /@escapes/, name: 'string.escape' },
                { match: /@@word/, name: 'string.variable' },
                { match: /\\./, name: 'string.escape.invalid' },
                { match: '@', name: 'string.text' },
                { match: '"', name: 'string.double.close', pop: true, next: '@root' }
            ],
            string_single_block: [
                { match: /[^'\\@]+/, name: 'string.text' },
                { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
                { match: /@escapes/, name: 'string.escape' },
                { match: /@@word/, name: 'string.variable' },
                { match: /\\./, name: 'string.escape.invalid' },
                { match: '@', name: 'string.text' },
                { match: '\'', name: 'string.single.close', pop: true, next: '@root' }
            ],
            zh_string_double_block: [
                { match: /[^”“\\@]+/, name: 'string.text' },
                { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
                { match: /@escapes/, name: 'string.escape' },
                { match: /@@word/, name: 'string.variable' },
                { match: /\\./, name: 'string.escape.invalid' },
                { match: '@', name: 'string.text' },
                { match: /[”“]/, name: 'string.double.close', pop: true, next: '@root' }
            ],
            zh_string_single_block: [
                { match: /[^‘’\\@]+/, name: 'string.text' },
                { match: /@\{/, name: 'string.template.open', next: '@root', push: true },
                { match: /@escapes/, name: 'string.escape' },
                { match: /@@word/, name: 'string.variable' },
                { match: /\\./, name: 'string.escape.invalid' },
                { match: '@', name: 'string.text' },
                { match: /[‘’]/, name: 'string.single.close', pop: true, next: '@root' }
            ],
            generic: [
                {
                    match: /@namespace/,
                    name: 'generic.type'
                },
                { match: /[,，]/, name: 'generic.delimiter' },
                { match: /[>》]/, name: 'generic.bracket.close', pop: true, next: '@root' },
                { match: /@white+/, name: 'generic.white' },
            ]
        };
        Lang.convertLangSyntax(Lang.VeZhTokenSyntax);
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../util/list.ts'/>
///<reference path='../util/declare.ts'/>
///<reference path='../util/common.ts'/>
///<reference path='../util/event.ts'/>
///<reference path='token.ts'/>
///<reference path='syntax.ts'/>
///<reference path='syntax.zh.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class Tokenizer extends Lang.Util.BaseEvent {
            constructor() {
                super();
                this.pos = 0;
                this.len = 0;
                this.code = '';
                this.line = '';
                this.lineCount = 0;
                this.row = 0;
                this.init();
            }
            init() {
                this.load(Ve.Lang.VeZhTokenSyntax);
            }
            load(syntax) {
                this.syntax = syntax;
            }
            createToken() {
                return new Lang.Token();
            }
            parse(code) {
                if (typeof code != 'string')
                    return this.emit('error', new Error('the tokenizer code require string'));
                this.pos = 0;
                this.row = 0;
                this.code = code;
                this.lines = this.code.split(/\r\n|\n|\r/g);
                this.lineCount = this.lines.length;
                this.line = this.lines[this.row];
                this.len = this.line.length;
                this.contextToken = this.rootToken = this.createToken();
                this.contextToken.row = this.contextToken.col = 0;
                this.contextToken.name = 'root';
                while (!(this.lineIsEol && this.rowIsEol)) {
                    var pos = this.pos;
                    var row = this.row;
                    this.matchMode();
                    this.nextLine();
                    /**
                     * 没有区配到任意的token ,则转到非法的token
                     * */
                    if (this.pos == pos && row === this.row)
                        this.matchInvalid();
                }
                this.llegalTermination();
                return this.rootToken;
            }
            matchMode() {
                var rest = this.line.slice(this.pos);
                if (rest == '' || rest.length == 0)
                    return;
                var matchText;
                if (!this.contextMode) {
                    this.contextMode = this.syntax['root'];
                }
                var mode = this.contextMode.find(x => {
                    var r = this.match(rest, x.match);
                    if (typeof r != 'undefined') {
                        matchText = r;
                        return true;
                    }
                    return false;
                });
                mode = Object.assign({}, mode);
                var beforeMode = (mode, token) => {
                    if (typeof mode.action == 'function') {
                        var newMode = mode.action(this.contextToken);
                        if (typeof newMode != 'undefined') {
                            for (var n in newMode) {
                                if (typeof newMode[n] != 'undefined')
                                    mode[n] = newMode[n];
                            }
                        }
                    }
                    if (mode.nextTurn && mode.nextTurn.startsWith('@')) {
                        this.contextMode = this.syntax[mode.nextTurn.replace('@', '')];
                        if (!this.contextMode) {
                            this.emit('error', new Error(`没有找到转向处理"${mode.nextTurn}"`), { col: token.pos, row: token.row }, token);
                        }
                        else {
                            this.matchMode();
                            return true;
                        }
                    }
                    if (mode.pop == true) {
                        if (this.contextToken.parent)
                            this.contextToken = this.contextToken.parent;
                        else {
                            this.emit('error', new Error(`没有找到字符"${token.value}"的启始字符`), { col: token.pos, row: token.row }, token);
                        }
                    }
                };
                var afterMode = (mode, token) => {
                    if (mode.push == true) {
                        this.contextToken = token;
                    }
                    if (mode.next && mode.next.startsWith('@')) {
                        this.contextMode = this.syntax[mode.next.replace('@', '')];
                        if (!this.contextMode) {
                            throw 'not found turn :' + mode.next;
                        }
                    }
                };
                if (matchText && mode) {
                    var token = this.createToken();
                    token.value = matchText;
                    token.size = matchText.length;
                    token.col = this.pos;
                    token.row = this.row;
                    token.name = mode.name;
                    if (beforeMode(mode, token) == true)
                        return;
                    token.parent = this.contextToken;
                    this.contextToken.childs.push(token);
                    this.pos += matchText.length;
                    afterMode(mode, token);
                }
                else {
                    //如果什么都没匹配到，则需要查询match等于空的情况
                    mode = this.contextMode.find(x => typeof x.match == 'undefined' ? true : false);
                    if (mode && beforeMode(mode, undefined) == true)
                        return;
                    this.emit('error', new Error(`the code "${rest}" is not found tokernizer match at row ${this.row} col ${this.pos}`), { col: this.pos, row: this.row });
                }
            }
            match(code, match) {
                if (Array.isArray(match)) {
                    /***排序，如果匹配多个时，先从长的文本串开始 */
                    match.sort((x, y) => {
                        if (typeof x == 'string' && typeof y == 'string') {
                            if (x.length > y.length)
                                return -1;
                            else
                                return 1;
                        }
                        return 0;
                    });
                    for (var i = 0; i < match.length; i++) {
                        var m = this.match(code, match[i]);
                        if (typeof m != 'undefined')
                            return m;
                    }
                    return undefined;
                }
                else if (match instanceof RegExp) {
                    var r = code.match(match);
                    if (r && r[0] && r.index == 0)
                        return r[0];
                }
                else if (typeof match == 'string') {
                    if (code.startsWith(match))
                        return match;
                }
                else
                    return undefined;
            }
            matchInvalid() {
                var invalidToken = this.createToken();
                invalidToken.col = this.pos;
                invalidToken.row = this.row;
                invalidToken.value = this.line.charAt(this.pos);
                invalidToken.name = 'invalid';
                this.emit('error', new Error('invalid token'), { col: this.pos, row: this.row, token: invalidToken });
                if (this.contextToken) {
                    invalidToken.parent = this.contextToken;
                    this.contextToken.childs.push(invalidToken);
                }
                this.pos += 1;
            }
            nextLine() {
                if (this.lineIsEol) {
                    while (true) {
                        if (this.row < this.lineCount - 1) {
                            //如果不是当前最后一行，需要填加一个行的token
                            var token = this.createToken();
                            token.value = '\n';
                            token.col = this.pos + 1;
                            token.row = this.row;
                            token.name = 'line';
                            token.size = token.value.length;
                            if (this.contextToken) {
                                token.parent = this.contextToken;
                                this.contextToken.childs.push(token);
                            }
                        }
                        if (this.lineCount == this.row + 1)
                            return false;
                        this.row += 1;
                        this.line = this.lines[this.row];
                        this.pos = 0;
                        this.len = this.line.length;
                        //如果当前的行是空字符串，那么继续
                        if (this.line !== '')
                            return true;
                    }
                }
                return false;
            }
            get lineIsEol() {
                return this.len <= this.pos;
            }
            get rowIsEol() {
                return this.row == this.lines.length - 1;
            }
            llegalTermination() {
                if (this.contextToken && this.contextToken.name != 'root') {
                    this.emit('error', new Error(`not match context open:"${this.contextToken.value}" at row:${this.contextToken.row} col:${this.contextToken.col}`), { col: this.contextToken.col, row: this.contextToken.row, token: this.contextToken });
                }
            }
        }
        Lang.Tokenizer = Tokenizer;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='token/tokenizer.ts' />
if (typeof module != 'undefined' && module.exports) {
    module.exports = Ve;
}
///<reference path='../../util/list.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Lang.Util.List;
        class Node {
            constructor(options) {
                this.childs = new List;
                this.tokens = new List;
                this.$cache = {};
                if (typeof options == 'object') {
                    for (var n in options) {
                        this.set(n, options[n]);
                    }
                }
            }
            inferType(classGenerics, methodGenerics) {
                return null;
            }
            append(statement) {
                if (statement instanceof List) {
                    statement.each(s => { this.append(s); });
                }
                else if (statement instanceof Node)
                    this.childs.append(statement);
                this.childs.each(c => {
                    c.parent = this;
                });
            }
            /**
             * ast 节点引用的token
             * 建议一个ast节点只关注具体标识性的一个token
             *
             * */
            ref(tokens) {
                if (tokens instanceof List)
                    tokens.each(t => { this.tokens.push(t); t.node = this; });
                else {
                    this.tokens.push(tokens);
                    tokens.node = this;
                }
            }
            set(name, statement) {
                this[name] = statement;
                this.append(statement);
            }
            /***
             * 先判断当前节点，
             * 然后判断当前节点前面的所有节点
             * 然后找到父节点，
             * 再判断父节点前面的
             *
             */
            closest(predict, considerSelf = true) {
                var p = considerSelf ? this : this.parent;
                while (true) {
                    if (!p)
                        break;
                    if (predict(p) == true)
                        return p;
                    else {
                        var ps = p.prevs;
                        if (Array.isArray(ps)) {
                            var g = ps.find(x => predict(x) == true);
                            if (g)
                                return g;
                        }
                        p = p.parent;
                    }
                    if (!p)
                        break;
                }
                return null;
            }
            cache(key, value) {
                if (typeof value == 'undefined') {
                    return this.$cache[key];
                }
                else {
                    this.$cache[key] = value;
                    return value;
                }
            }
            get root() {
                var root = this.cache('root');
                if (root)
                    return root;
                var p = this.parent;
                while (true) {
                    if (p instanceof Program) {
                        break;
                    }
                    else {
                        p = p.parent;
                    }
                }
                this.cache('root', p);
                return p;
            }
            /****
             *
             * @param name 通过名称查找申明的变量名，形参名，类，类的静态参数,枚举，申明的函数
             * @param types 主要是指定查询的类型范围
             *
             */
            queryName(name, types) {
                var rd;
                var isType = (x) => types ? (typeof types == 'function' ? types(x) : types.exists(x.type)) : true;
                if (name.indexOf('.') == -1) {
                    var c = this.closest(x => {
                        if (x instanceof Lang.DeclareVariable && isType(x)) {
                            if (x.name == name)
                                return true;
                        }
                        else if (x instanceof Lang.FunStatement && isType(x)) {
                            if (x.parameters.exists(p => p.name == name))
                                return true;
                            if (x.name == name)
                                return true;
                        }
                        else if (x instanceof Lang.ClassMethod && isType(x)) {
                            if (x.parameters.exists(p => p.name == name))
                                return true;
                        }
                        else if (x instanceof Lang.AnonymousFunExpress && isType(x)) {
                            if (x.parameters.exists(p => p.name == name))
                                return true;
                        }
                    }, false);
                    if (c) {
                        if (c instanceof Lang.DeclareVariable && isType(c))
                            rd = c;
                        else if ((c instanceof Lang.FunStatement || c instanceof Lang.AnonymousFunExpress || c instanceof Lang.ClassMethod) && isType(c) && c.parameters.exists(x => x.name == name))
                            rd = c.parameters.find(x => x.name == name);
                        else if (c instanceof Lang.FunStatement && c.name == name && isType(c))
                            rd = c;
                    }
                    if (rd)
                        return rd;
                }
                if (!rd) {
                    var pa = this.closest(x => x instanceof Lang.PackageStatement);
                    if (pa) {
                        var ns = pa.getReferenceNames(name);
                        var pas = this.root.childs.findAll(x => x instanceof Lang.PackageStatement && ns.exists(n => n.startsWith(x.name)));
                        var r;
                        pas.each(pps => {
                            if (r)
                                return false;
                            var classList = pps.classList;
                            classList.each(cla => {
                                if (ns.exists(n => cla.isFullName(n) && isType(cla))) {
                                    r = cla;
                                    return false;
                                }
                                if (cla instanceof Lang.EnumStatement) {
                                    if (types && types instanceof List && types.exists(Lang.NodeType.enum))
                                        return;
                                    var op = cla.items.find(it => isType(it) && ns.exists(n => it.isFullName(n)));
                                    if (op) {
                                        r = op;
                                        return false;
                                    }
                                }
                                if (cla instanceof Lang.ClassStatement) {
                                    if (types && types instanceof List && types.exists(Lang.NodeType.class))
                                        return;
                                    var pros = cla.propertys;
                                    var pro = pros.find(x => isType(x) && (x instanceof Lang.ClassMethod || x instanceof Lang.ClassProperty) && x.isStatic && ns.exists(n => x.isFullName(n)));
                                    if (pro && isType(pro)) {
                                        r = pro;
                                        return false;
                                    }
                                }
                            });
                        });
                        return r;
                    }
                }
            }
            findAll(predict) {
                var nodes = new List();
                List.treeEach(this.childs, 'childs', (item) => {
                    if (predict(item) == true)
                        nodes.push(item);
                });
                return nodes;
            }
            find(predict) {
                var node;
                List.treeEach(this.childs, 'childs', (item) => {
                    if (predict(item) == true) {
                        node = item;
                        return { break: true };
                    }
                });
                return node;
            }
            get prevs() {
                if (this.parent) {
                    var index = this.parent.childs.findIndex(x => x == this);
                    return this.parent.childs.range(0, index - 1);
                }
                return new List();
            }
            get next() {
                if (this.parent) {
                    var index = this.parent.childs.findIndex(x => x == this);
                    return this.parent.childs.eq(index + 1);
                }
            }
        }
        Lang.Node = Node;
        class Express extends Node {
        }
        Lang.Express = Express;
        class Statement extends Node {
        }
        Lang.Statement = Statement;
        class Program extends Node {
            constructor() {
                super(...arguments);
                this.packages = new List;
            }
            append(node) {
                if (node instanceof List) {
                    node.forEach(c => { this.packages.append(c); super.append(c); });
                }
                else {
                    this.packages.push(node);
                    super.append(node);
                }
            }
            remove(node) {
                if (node instanceof List) {
                    node.forEach(c => { this.packages.remove(c); super.childs.remove(c); });
                }
                else {
                    this.packages.remove(node);
                    super.childs.remove(node);
                }
            }
        }
        Lang.Program = Program;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../ast/node/node.ts'/>
///<reference path='../token/tokenizer.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class VeLangError {
            static create(data) {
                var err = new VeLangError();
                for (var n in data) {
                    err[n] = data[n];
                }
                return err;
            }
        }
        Lang.VeLangError = VeLangError;
        class Compiler extends Lang.Util.BaseEvent {
            constructor() {
                super();
                this.id = Lang.Util.getId();
            }
            /**
             *
             * @param code 编辑的代码，最好是一个类（可以多个类）文件，最好是这样
             *
             */
            compile(code) {
                var tokenizer = new Lang.Tokenizer();
                tokenizer.on('error', (error, pos, token) => {
                    this.emit('error', VeLangError.create({ error, pos, token, stage: 'token' }));
                });
                var rootToken;
                try {
                    rootToken = tokenizer.parse(code);
                }
                catch (e) {
                    this.emit('error', VeLangError.create({ error: e, stage: 'token' }));
                }
                var parser = new Lang.StatementParser();
                parser.on('error', (error, pos, token) => {
                    this.emit('error', VeLangError.create({ error, pos, token, stage: 'node' }));
                });
                var nodes;
                try {
                    if (rootToken)
                        nodes = parser.parse(rootToken.childs);
                }
                catch (e) {
                    this.emit('error', VeLangError.create({ error: e, stage: 'node' }));
                }
                if (nodes)
                    Lang.coreCompile.importNodes(nodes, Lang.LibType.code);
                return { nodes, tokens: rootToken ? rootToken.childs : undefined };
            }
            /**
             * 由于ve语言是面向对象语言，不能直接执行脚本，需要模拟一个静态方法
             * @param isExpressOrBlock 是表达式还是语句（类似于函数体)
             * @param code
             * @param args
             * @param thisObjectArgs 当前方法的this对象
             *
             */
            simulateClass(isExpressOrBlock, code, args, thisObjectArgs) {
                var simulateArgs = new Lang.Util.List();
                if (thisObjectArgs) {
                    simulateArgs.push({ name: 'this', type: Lang.Outer.VeTypeToCode({ props: thisObjectArgs.map(x => { return { key: x.text, type: x.type }; }) }) });
                }
                if (args) {
                    args.forEach(arg => {
                        if (simulateArgs.exists(x => x.name == arg.text)) {
                            throw 'duplicate parameter :' + arg.text;
                        }
                        simulateArgs.push({ name: arg.text, type: Lang.Outer.VeTypeToCode(arg.type) });
                    });
                }
                var namespace = `Ve.__SimulatePackage${Lang.Util.getId() + "_" + this.id}`;
                return `
            package ${namespace};
            use Ve.Core;
            use Ve.Math;
            out class SimulateClass{
               static SimulateExpress(${simulateArgs.map(s => `${s.name}:${s.type}`).join(",")})
                {${isExpressOrBlock ? "return " : ""}${code}}
            }
            `;
            }
            /**
             * 编译表达式，因为是面向对象语言，不能直接运行表达式脚本，故模拟一个类静态方法，表达式做为返回值
             * @param code
             * @param args
             * @param thisObjectArgs 当前方法的this对象
             *
             */
            express(code, args, thisObjectArgs) {
                code = this.simulateClass.apply(this, [true, ...Array.from(arguments)]);
                var cn = this.compile(code);
                try {
                    var pa = cn.nodes.first();
                    var cla = pa.classList.find(x => x instanceof Lang.ClassStatement);
                    var cm = cla.propertys.find(x => x.name == 'SimulateExpress');
                    var returnStatement = cm.content.first();
                    var tokens = returnStatement.tokens.first().next.nextFindAll(x => true);
                    return { express: returnStatement.result, tokens: tokens };
                }
                catch (e) {
                    this.emit('error', VeLangError.create({ error: e, stage: 'node' }));
                }
            }
            /**
             * 编译代码块(函数体)，需要模拟类，构造静态方法
             * @param code
             * @param args
             * @param thisObjectArgs 当前方法的this对象
             *
             */
            block(code, args, thisObjectArgs) {
                code = this.simulateClass.apply(this, [true, ...Array.from(arguments)]);
                var cn = this.compile(code);
                try {
                    var pa = cn.nodes.first();
                    var cla = pa.classList.find(x => x instanceof Lang.ClassStatement);
                    var cm = cla.propertys.find(x => x.name == 'SimulateExpress');
                    var contentToken = cm.tokens.first().nextFind(x => x.flag == '{');
                    return { nodes: cm.content, tokens: contentToken.childs, classMethod: cm };
                }
                catch (e) {
                    this.emit('error', VeLangError.create({ error: e, stage: 'node' }));
                }
            }
            /**
             * 编译类型代码
             * @param code  类型代码
             */
            type(code) {
                var code = this.simulateClass(true, 'true', [{ text: 'arg', type: code }]);
                var cn = this.compile(code);
                try {
                    var pa = cn.nodes.first();
                    var cla = pa.classList.find(x => x instanceof Lang.ClassStatement);
                    var cm = cla.propertys.find(x => x.name == 'SimulateExpress');
                    var type = cm.parameters.first().valueType;
                    return { nodes: new Ve.Lang.Util.List(type), tokens: type.tokens };
                }
                catch (e) {
                    this.emit('error', VeLangError.create({ error: e, stage: 'node' }));
                }
            }
            /**
             * 不用了，记得注销掉,谢谢
             */
            dispose() {
                Lang.coreCompile.removeNodes(this.id);
            }
        }
        Lang.Compiler = Compiler;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        /**
        * @enum o core 是整个Ve语言的核心库，是不可缺少的，打包时，会一起打包进去，主要是一些基本的类型
        * @enum o lib 库，主要是一些平台类型的库，如html环境，后台io，android环境等，会根据使用情况选择性的导入加载
        * @enum o code 用户编写的代码
        *
        */
        let LibType;
        (function (LibType) {
            LibType[LibType["core"] = 0] = "core";
            LibType[LibType["lib"] = 1] = "lib";
            LibType[LibType["code"] = 2] = "code";
        })(LibType = Lang.LibType || (Lang.LibType = {}));
        class CoreCompile extends Lang.Util.BaseEvent {
            constructor() {
                super();
                this.program = new Ve.Lang.Program();
                /**
                 * 存储导入所有类库等信息
                 */
                this.packages = new Lang.Util.List();
            }
            importNodes(nodes, type, id) {
                this.program.append(nodes);
                this.packages.append({ nodes, type, id });
            }
            importPackage(code, type) {
                var tokenizer = new Lang.Tokenizer();
                tokenizer.on('error', (...args) => { this.emit('error', ...args); });
                var rootToken = tokenizer.parse(code);
                var parser = new Lang.StatementParser();
                parser.on('error', (...args) => { this.emit('error', ...args); });
                var nodes = parser.parse(rootToken.childs);
                this.importNodes(nodes, type);
                return nodes;
            }
            removeNodes(id) {
                this.packages.removeAll(x => x.id == id);
            }
        }
        Lang.coreCompile = new CoreCompile();
        /**
        * 核心库一般导入编译是不会出错的，
        * 这里出错，直接抛出来
        */
        Lang.coreCompile.on('error', (...args) => {
            console.error(...args);
            throw args[0];
        });
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class NodeDiagnose {
            program(node) { }
            package(node) { }
            use(node) { }
            $if(node) {
                if (!Lang.TypeExpress.typeIsEqual(node, node.ifCondition.inferType(), Lang.TypeExpress.create({ name: 'bool' })))
                    throw Lang.Exception.create([Lang.ExceptionCode.conditionIsNotBool, node, '条件表达式类型不是bool值']);
                node.elseIFConditions.each(ec => {
                    if (!Lang.TypeExpress.typeIsEqual(node, ec.inferType(), Lang.TypeExpress.create({ name: 'bool' })))
                        throw Lang.Exception.create([Lang.ExceptionCode.conditionIsNotBool, node, '条件表达式类型不是bool值']);
                });
            }
            while(node) {
                if (!Lang.TypeExpress.typeIsEqual(node, node.condition.inferType(), Lang.TypeExpress.create({ name: 'bool' })))
                    throw Lang.Exception.create([Lang.ExceptionCode.conditionIsNotBool, node, 'while条件表达式不是bool值']);
            }
            for(node) {
                if (!Lang.TypeExpress.typeIsEqual(node, node.condition.inferType(), Lang.TypeExpress.create({ name: 'bool' })))
                    throw Lang.Exception.create([Lang.ExceptionCode.conditionIsNotBool, node, 'for条件表达式不是bool值']);
            }
            switch(node) { }
            when(node) {
                node.whens.each(wh => {
                    wh.value.each(va => {
                        if (!Lang.TypeExpress.typeIsEqual(va, va.inferType(), Lang.TypeExpress.create({ name: 'bool' })))
                            throw Lang.Exception.create([Lang.ExceptionCode.conditionIsNotBool, node, 'when条件表达式不是bool值']);
                    });
                });
            }
            continue(node) { }
            break(node) { }
            return(node) { }
            $throw(node) { }
            try(node) { }
            class(node) {
                /***检查方法如果是继承，那么与继承的方法类型否保持一致性 */
                if (node.extend) {
                }
                /****私有方法是不能被继承重载的 */
                /***继承的类是否为密封类 */
            }
            enum(node) {
                /***枚举的项的值是否有相同的 */
            }
            classProperty(node) {
                /****字段get是否为空参数 */
                /****字段set是否为空返回*/
            }
            classMethod(node) {
                /***检测方法里的返回类型是否唯一 */
                /****检测方法的返回类型和申明的返回类型是否兼容 */
            }
            classOperator(node) {
                /****检测操作符的参数个数*/
                /****操作符方法必须有返回值，不能为void */
            }
            fun(node) {
                /****同classMethod */
            }
            anonymousFun(node) { }
            'new'(node) {
                /***初始化的对象类是否存在 */
            }
            at(node) {
                /***检测at是否出现在类中 */
                var cm = node.closest(x => x instanceof Lang.ClassMethod);
                if (!cm) {
                    throw Lang.Exception.create([Lang.ExceptionCode.syntaxError, node, '@只能在类方法中使用', {}]);
                }
            }
            block(node) { }
            object(node) { }
            array(node) {
                /****检查数组里面的每一项，类型是否兼容，一致 */
            }
            objectCall(node) { }
            arrayCall(node) {
                /***检测调用进是否为集合类型，是不能支持[] */
                /***检查arrayIndex是否是数字，或者key呢 */
                if (Lang.TypeExpress.typeIsEqual(node, node.caller.inferType().unionType, Lang.TypeExpress.create({ name: "Array" }))) {
                    if (!Lang.TypeExpress.typeIsEqual(node, node.arrayIndex.inferType(), Lang.TypeExpress.create({ name: 'int' }))) {
                        throw Lang.Exception.create([Lang.ExceptionCode.arrayIndexNotNumber, node, '数组索引项不为数字', {}]);
                    }
                }
            }
            nameCall(node) {
                /****检测申明的变量名是否存在 */
                if (!(node.parent instanceof Lang.ObjectCallExpress)) {
                    var ref = node.queryName(node.name);
                    if (!ref) {
                        throw Lang.Exception.create([Lang.ExceptionCode.notDeclareVariable, node, '未找到变量名@{name}', { name: node.name }]);
                    }
                }
            }
            thisCall(node) {
                /***检测this是否出现在类中 */
                var cm = node.closest(x => x instanceof Lang.ClassMethod);
                if (!cm) {
                    throw Lang.Exception.create([Lang.ExceptionCode.syntaxError, node, 'this关键词只能在类方法中使用', {}]);
                }
            }
            superCall(node) {
                /***检测super是否应该出现在继承类中 */
                var cm = node.closest(x => x instanceof Lang.ClassMethod);
                if (!cm) {
                    throw Lang.Exception.create([Lang.ExceptionCode.syntaxError, node, 'super关键词只能在类的方法中使用', {}]);
                }
            }
            methodCall(node) { }
            constant(node) { }
            declareVariable(node) {
                /***申明的变量类型，与表达值的类型是否兼容一致*/
                if (node.value && node.declareType) {
                    if (!Lang.TypeExpress.typeIsEqual(node, node.value.inferType(), node.declareType, true)) {
                        throw Lang.Exception.create([Lang.ExceptionCode.declareTypeNotEqual, node, '@{name}申明的类型和赋值的类型不一致', { name: node.name }]);
                    }
                }
            }
            stringTemplate(node) { }
            ternary(node) { }
            unary(node) { }
            binary(node) {
                /***检测当前的操作符是否存在 */
                var cp = Lang.InferType.InferTypeOperatorBinaryExpress(node);
                if (!cp) {
                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundOperator, node, '@{type}类型不支持操作符@{operator}', { type: node.left.inferType().toString(), name: node.operator }]);
                }
                var right = cp.parameters.eq(1);
                if (!Lang.TypeExpress.typeIsEqual(node, node.right.inferType(), right.inferType(), true)) {
                    throw Lang.Exception.create([Lang.ExceptionCode.declareTypeNotEqual, node, '操作符@{operator}支持的类型不兼容', { name: node.left.inferType() }]);
                }
            }
            bracket(node) { }
            assign(node) { }
            type(node) { }
            parameter(node) { }
            spread(node) {
                /***展开的对象是否为object,array */
                /***展开符是否用在object,array中 */
            }
            emptyStatement(node) { }
        }
        Lang.NodeDiagnose = NodeDiagnose;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let ExceptionCode;
        (function (ExceptionCode) {
            /***未实现类、方法泛型 */
            ExceptionCode[ExceptionCode["notImplementGenerics"] = 0] = "notImplementGenerics";
            ExceptionCode[ExceptionCode["conditionIsNotBool"] = 1] = "conditionIsNotBool";
            ExceptionCode[ExceptionCode["notDeclareVariable"] = 2] = "notDeclareVariable";
            ExceptionCode[ExceptionCode["arrayIndexNotNumber"] = 3] = "arrayIndexNotNumber";
            /***语法错误 */
            ExceptionCode[ExceptionCode["syntaxError"] = 4] = "syntaxError";
            ExceptionCode[ExceptionCode["declareTypeNotEqual"] = 5] = "declareTypeNotEqual";
            /***找不到相应的操作符 */
            ExceptionCode[ExceptionCode["notFoundOperator"] = 6] = "notFoundOperator";
            /****操作符运算类型不一致 */
            ExceptionCode[ExceptionCode["operatorTypeNotEqual"] = 7] = "operatorTypeNotEqual";
            /****查找不到方法 */
            ExceptionCode[ExceptionCode["notFoundMethod"] = 8] = "notFoundMethod";
            ExceptionCode[ExceptionCode["notFoundClassProperty"] = 9] = "notFoundClassProperty";
            /****方法形参不适配 */
            ExceptionCode[ExceptionCode["methodArgementNotCompatibility"] = 10] = "methodArgementNotCompatibility";
            /***object对象无法找到key */
            ExceptionCode[ExceptionCode["objectNotFoundKey"] = 11] = "objectNotFoundKey";
            /****找到不类型 */
            ExceptionCode[ExceptionCode["notFoundType"] = 12] = "notFoundType";
        })(ExceptionCode = Lang.ExceptionCode || (Lang.ExceptionCode = {}));
        let ExceptionLevel;
        (function (ExceptionLevel) {
            ExceptionLevel[ExceptionLevel["error"] = 1] = "error";
            ExceptionLevel[ExceptionLevel["warn"] = 2] = "warn";
            ExceptionLevel[ExceptionLevel["info"] = 0] = "info";
        })(ExceptionLevel = Lang.ExceptionLevel || (Lang.ExceptionLevel = {}));
        class Exception extends Error {
            constructor() {
                super(...arguments);
                this.object = {};
            }
            static create(data, level = ExceptionLevel.error) {
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
                var token = this.node instanceof Lang.Node ? this.node.tokens.first() : this.node;
                var row = token.row;
                var col = token.col;
                var level = this.level == ExceptionLevel.error ? "错误" : '警告';
                return Ve.Lang.Razor.RazorTemplate.compile(this.template, Object.assign({ row, col, level }, this.object));
            }
        }
        Lang.Exception = Exception;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../../util/list.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Ve.Lang.Util.List;
        class InferType {
            static InferTypeStatements(statement) {
                var st = statement instanceof List ? statement : new List(statement);
                if (st.length == 1 && st.first() instanceof Lang.Express) {
                    return st.first().inferType();
                }
                var r;
                st.each(s => {
                    if (s instanceof Lang.ReturnStatement) {
                        r = s;
                        return false;
                    }
                    var re = s.find(x => x instanceof Lang.ReturnStatement);
                    if (re) {
                        r = re;
                        return false;
                    }
                });
                if (r)
                    return r.result.inferType();
                else
                    return Lang.TypeExpress.create({ name: 'void' });
            }
            static InferTypeOperatorBinaryExpress(binary) {
                var leftType = binary.left.inferType();
                var rightType = binary.right.inferType();
                var typeName = leftType.name;
                /****类型不一致，先检测是否是父类与子类 */
                if (!Lang.TypeExpress.typeIsEqual(binary, leftType, rightType)) {
                    if (Lang.TypeExpress.typeIsEqual(binary, leftType, rightType, true)) {
                        //说明leftType继承于rightType
                        typeName = rightType.name;
                    }
                    else if (Lang.TypeExpress.typeIsEqual(binary, rightType, leftType, true)) {
                    }
                    else if (Lang.TypeExpress.typeIsEqual(binary, leftType, Lang.TypeExpress.create({ name: 'string' }))
                        ||
                            Lang.TypeExpress.typeIsEqual(binary, rightType, Lang.TypeExpress.create({ name: 'string' }))) {
                        //这里有字符串，那么操作符返回的就是字符串
                        typeName = Lang.TypeExpress.create({ name: 'string' }).name;
                    }
                }
                var cla = binary.queryName(typeName, new List(Lang.NodeType.class));
                var op = cla.propertys.find(x => (x instanceof Lang.ClassOperator) && x.name == binary.operator);
                if (op)
                    return op;
            }
            static InferTypeObjectKeyType(node, callExpress) {
                var callers = node.nameCallers;
                var names = new List();
                var inferType;
                var searchKey = (key, last) => {
                    if (inferType) {
                        /**
                         * 推断unit类型
                         */
                        if (inferType.name) {
                            if (last == true && callExpress instanceof Lang.MethodCallExpress) {
                                var cla = node.queryName(inferType.name, new List(Lang.NodeType.class));
                                var pros = cla.propertys.findAll(x => (x instanceof Lang.ClassMethod) && x.isPublic && !x.isStatic && x.name == key);
                                if (pros.length == 0) {
                                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundMethod, node, '"@{className}"类中无法找到方法"${name}"', { name: key, className: cla.fullNames.first() }]);
                                }
                                var pro = pros.find(x => this.InferTypeMethodCallFunTypeIsCompatibility(callExpress, x, inferType.generics));
                                if (pro) {
                                    inferType = pro.inferType().returnType;
                                }
                                else {
                                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundMethod, node, '调用"@{className}"类中的方法"${name}"方法不兼容', { name: key, className: cla.fullNames.first() }]);
                                }
                            }
                            else if (last == true && callExpress instanceof Lang.NewCallExpress) {
                                var cla = node.queryName(inferType.name, new List(Lang.NodeType.class));
                                var pros = cla.propertys.findAll(x => (x instanceof Lang.ClassMethod) && x.isCtor && x.isPublic);
                                if (pros.length == 0) {
                                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundMethod, node, '"@{className}"类中无法找到方法"${name}"', { name: key, className: cla.fullNames.first() }]);
                                }
                                var pro = pros.find(x => this.InferTypeMethodCallFunTypeIsCompatibility(callExpress.caller, x, inferType.generics));
                                if (pro) {
                                    inferType = pro.inferType().retunType;
                                }
                                else {
                                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundMethod, node, '调用"@{className}"类中的方法"${name}"方法不兼容', { name: key, className: cla.fullNames.first() }]);
                                }
                            }
                            else {
                                var cla = node.queryName(inferType.name, new List(Lang.NodeType.class));
                                if (!cla) {
                                    throw `not found class name:${inferType.name}`;
                                }
                                var pro = cla.propertys.find(x => x instanceof Lang.ClassProperty && x.isPublic && !x.isStatic && x.isName(key));
                                if (pro) {
                                    inferType = pro.inferType();
                                }
                                else {
                                    throw `this class ${cla.fullNames.first()} not found ${key} `;
                                }
                            }
                        }
                        else if (inferType.generics.length > 0) {
                            /***
                             *  这里处理的是数组类型
                             *
                             */
                            var name = inferType.unionType.name;
                            if (last == true && callExpress instanceof Lang.MethodCallExpress) {
                                var cla = node.queryName(name, new List(Lang.NodeType.class));
                                var pros = cla.propertys.findAll(x => (x instanceof Lang.ClassMethod) && x.isPublic && !x.isStatic && x.name == key);
                                if (pros.length == 0) {
                                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundMethod, node, '"@{className}"类中无法找到方法"${name}"', { name: key, className: cla.fullNames.first() }]);
                                }
                                var pro = pros.find(x => this.InferTypeMethodCallFunTypeIsCompatibility(callExpress, x, inferType.generics));
                                if (pro) {
                                    inferType = pro.inferType().returnType;
                                }
                                else {
                                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundMethod, node, '调用"@{className}"类中的方法"${name}"方法不兼容', { name: key, className: cla.fullNames.first() }]);
                                }
                            }
                            else if (last == true && callExpress instanceof Lang.NewCallExpress) {
                                var cla = node.queryName(name, new List(Lang.NodeType.class));
                                var pros = cla.propertys.findAll(x => (x instanceof Lang.ClassMethod) && x.isCtor && x.isPublic);
                                if (pros.length == 0) {
                                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundMethod, node, '"@{className}"类中无法找到方法"${name}"', { name: key, className: cla.fullNames.first() }]);
                                }
                                var pro = pros.find(x => this.InferTypeMethodCallFunTypeIsCompatibility(callExpress.caller, x, inferType.generics));
                                if (pro) {
                                    inferType = pro.inferType().retunType;
                                }
                                else {
                                    throw Lang.Exception.create([Lang.ExceptionCode.notFoundMethod, node, '调用"@{className}"类中的方法"${name}"方法不兼容', { name: key, className: cla.fullNames.first() }]);
                                }
                            }
                            else if (name) {
                                var cla = node.queryName(name, new List(Lang.NodeType.class));
                                if (!cla) {
                                    throw `not found class name:${name}`;
                                }
                                var pro = cla.propertys.find(x => x instanceof Lang.ClassProperty && x.isPublic && !x.isStatic && x.isName(key));
                                if (pro) {
                                    inferType = pro.inferType();
                                }
                                else {
                                    throw `this class ${cla.fullNames.first()} not found ${key} `;
                                }
                            }
                        }
                    }
                    else {
                        names.push(key);
                        var cp = node.queryName(names.join("."), (x) => x instanceof Lang.ClassProperty && x.isStatic && x.isPublic);
                        if (cp) {
                            inferType = cp.inferType();
                        }
                    }
                };
                for (let i = 0; i < callers.length; i++) {
                    if (i == 0) {
                        var caller = callers.eq(i);
                        if (caller instanceof Lang.AtExpress) {
                            inferType = caller.inferType();
                        }
                        else if (caller instanceof Lang.NameCall) {
                            var nb = caller.queryName(caller.name);
                            if (nb) {
                                inferType = nb.inferType();
                            }
                            else {
                                names.push(caller.name);
                            }
                        }
                        else {
                            inferType = caller.inferType();
                        }
                    }
                    else
                        searchKey(callers.eq(i).key.name);
                }
                searchKey(node.key.name, true);
                return inferType;
            }
            /***判断函数调用的类型是否与函数类型相一致 */
            static InferTypeMethodCallFunTypeIsCompatibility(methodCall, fun, classGen) {
                var gens;
                var imps;
                if (methodCall.caller instanceof Lang.NameCall) {
                    /***函数调用的泛型实现，需要判断fun是否提供泛型，至于泛型的约束类型，暂不考虑 */
                    if (methodCall.caller.implementGeneric && fun.generics) {
                        gens = fun.generics;
                        imps = methodCall.caller.implementGeneric;
                        if (methodCall.caller.implementGeneric.length != fun.generics.length)
                            return false;
                    }
                    else
                        throw Lang.Exception.create([Lang.ExceptionCode.notImplementGenerics, methodCall, '未实现方法@{name}的泛型参数<@{gens}>', { name: methodCall.caller.name, gens: fun.generics.map(g => g.name).join(",") }]);
                    var cla = fun.class;
                    if (classGen && cla.generics && cla.generics.length > 0) {
                        if (!gens)
                            gens = new List();
                        if (!imps)
                            imps = new List();
                        gens.insertArrayAt(0, cla.generics);
                        imps.insertAt(0, classGen);
                    }
                }
                var len = Math.max(fun.parameters.length, methodCall.argements.length);
                var restBaseType;
                for (var i = 0; i < len; i++) {
                    var arg = methodCall.argements.eq(i);
                    var parm = fun.parameters.eq(i);
                    var argType, parmType;
                    if (!arg && parm) {
                        /***说明函数的参数没有调用完 */
                        //看看是否是可选参数，有没有初始值
                        if (parm.optional == true)
                            //说明是可选的，那么默认值为Null
                            continue;
                        else if (parm.default)
                            //有初始值
                            continue;
                        else
                            return false;
                    }
                    else if (arg && !parm) {
                        //如果函数参数用完了，则判断有没有剩余的扩展参数
                        if (!restBaseType)
                            return false;
                        parmType = restBaseType;
                        argType = arg.inferType();
                    }
                    else if (arg && parm) {
                        argType = arg.inferType();
                        if (parm.rest)
                            parmType = parm.inferType().generics.first();
                        else
                            parmType = parm.inferType();
                        if (gens)
                            parmType = parmType.injectImplementGenerics(gens, imps);
                    }
                    if (!Lang.TypeExpress.typeIsEqual(methodCall, argType, parmType, true))
                        return false;
                }
                return true;
            }
            /***判断类型参数数组与函数参数类型相一致 */
            static InterTypeListTypeFunTypeIsCompatibility(listType, fun) {
                var len = Math.max(fun.parameters.length, listType.length);
                var restBaseType;
                for (var i = 0; i < len; i++) {
                    var parm = fun.parameters.eq(i);
                    var arg, parmType;
                    arg = listType.eq(i);
                    if (!arg && parm) {
                        /***说明函数的参数没有调用完 */
                        //看看是否是可选参数，有没有初始值
                        if (parm.optional == true)
                            //说明是可选的，那么默认值为Null
                            continue;
                        else if (parm.default)
                            //有初始值
                            continue;
                        else
                            return false;
                    }
                    else if (arg && !parm) {
                        //如果函数参数用完了，则判断有没有剩余的扩展参数
                        if (!restBaseType)
                            return false;
                        parmType = restBaseType;
                    }
                    else if (arg && parm) {
                        if (parm.rest)
                            parmType = parm.inferType().generics.first();
                        else
                            parmType = parm.inferType();
                    }
                    if (!Lang.TypeExpress.typeIsEqual(fun, arg, parmType, true))
                        return false;
                }
                return true;
            }
        }
        Lang.InferType = InferType;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        let NodeType;
        (function (NodeType) {
            NodeType[NodeType["program"] = 0] = "program";
            NodeType[NodeType["package"] = 1] = "package";
            NodeType[NodeType["use"] = 2] = "use";
            NodeType[NodeType["if"] = 3] = "if";
            NodeType[NodeType["while"] = 4] = "while";
            NodeType[NodeType["for"] = 5] = "for";
            NodeType[NodeType["switch"] = 6] = "switch";
            NodeType[NodeType["when"] = 7] = "when";
            NodeType[NodeType["continue"] = 8] = "continue";
            NodeType[NodeType["break"] = 9] = "break";
            NodeType[NodeType["return"] = 10] = "return";
            NodeType[NodeType["throw"] = 11] = "throw";
            NodeType[NodeType["try"] = 12] = "try";
            NodeType[NodeType["class"] = 13] = "class";
            NodeType[NodeType["enum"] = 14] = "enum";
            NodeType[NodeType["enumItem"] = 15] = "enumItem";
            NodeType[NodeType["classProperty"] = 16] = "classProperty";
            NodeType[NodeType["classMethod"] = 17] = "classMethod";
            NodeType[NodeType["classOperator"] = 18] = "classOperator";
            NodeType[NodeType["fun"] = 19] = "fun";
            NodeType[NodeType["anonymousFun"] = 20] = "anonymousFun";
            NodeType[NodeType["new"] = 21] = "new";
            NodeType[NodeType["at"] = 22] = "at";
            NodeType[NodeType["block"] = 23] = "block";
            NodeType[NodeType["express"] = 24] = "express";
            NodeType[NodeType["object"] = 25] = "object";
            NodeType[NodeType["array"] = 26] = "array";
            NodeType[NodeType["objectCall"] = 27] = "objectCall";
            NodeType[NodeType["arrayCall"] = 28] = "arrayCall";
            NodeType[NodeType["nameCall"] = 29] = "nameCall";
            NodeType[NodeType["thisCall"] = 30] = "thisCall";
            NodeType[NodeType["superCall"] = 31] = "superCall";
            NodeType[NodeType["methodCall"] = 32] = "methodCall";
            NodeType[NodeType["constant"] = 33] = "constant";
            NodeType[NodeType["declareVariable"] = 34] = "declareVariable";
            NodeType[NodeType["stringTemplate"] = 35] = "stringTemplate";
            NodeType[NodeType["ternary"] = 36] = "ternary";
            NodeType[NodeType["unary"] = 37] = "unary";
            NodeType[NodeType["binary"] = 38] = "binary";
            NodeType[NodeType["bracket"] = 39] = "bracket";
            NodeType[NodeType["assign"] = 40] = "assign";
            NodeType[NodeType["type"] = 41] = "type";
            NodeType[NodeType["parameter"] = 42] = "parameter";
            NodeType[NodeType["spread"] = 43] = "spread";
            NodeType[NodeType["emptyStatement"] = 44] = "emptyStatement";
        })(NodeType = Lang.NodeType || (Lang.NodeType = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Ve.Lang.Util.List;
        class ArrayCallExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.arrayCall;
            }
            inferType() {
                var arrayType = this.caller.inferType();
                return arrayType.generics.first();
            }
        }
        Lang.ArrayCallExpress = ArrayCallExpress;
        /****
         *
         * a.length.toString.length.toString
         *
         */
        class ObjectCallExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.objectCall;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                it = Lang.InferType.InferTypeObjectKeyType(this);
                this.cache('inferType', it);
                return it;
            }
            get nameCallers() {
                var ns = this.cache('nameCallers');
                if (ns)
                    return ns;
                ns = new List();
                var p = this.caller;
                while (true) {
                    if (p instanceof ObjectCallExpress) {
                        ns.push(p);
                        p = p.caller;
                    }
                    else {
                        ns.push(p);
                        break;
                    }
                }
                ns.reverse();
                this.cache('nameCallers', ns);
                return ns;
            }
        }
        Lang.ObjectCallExpress = ObjectCallExpress;
        class MethodCallExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.methodCall;
                this.argements = new List;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                if (this.caller instanceof ObjectCallExpress) {
                    it = Lang.InferType.InferTypeObjectKeyType(this.caller, this);
                }
                else if (this.caller instanceof NameCall) {
                    var cla = this.queryName(this.caller.name, new List(Lang.NodeType.class, Lang.NodeType.fun));
                    if (this.caller.implementGeneric) {
                        it = Lang.TypeExpress.create({
                            unionType: Lang.TypeExpress.create({ name: cla.fullNames.first() }),
                            generics: this.caller.implementGeneric.copy()
                        });
                    }
                    else {
                        it = Lang.TypeExpress.create({ name: cla.fullNames.first() });
                    }
                }
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.MethodCallExpress = MethodCallExpress;
        class NewCallExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.new;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                if (this.caller instanceof NameCall) {
                    var cla = this.queryName(this.caller.name, new List(Lang.NodeType.class, Lang.NodeType.fun));
                    if (this.caller.implementGeneric) {
                        it = Lang.TypeExpress.create({
                            unionType: Lang.TypeExpress.create({ name: cla.fullNames.first() }),
                            generics: this.caller.implementGeneric.copy()
                        });
                    }
                    else {
                        it = Lang.TypeExpress.create({ name: cla.fullNames.first() });
                    }
                }
                else if (this.caller instanceof MethodCallExpress) {
                    it = Lang.InferType.InferTypeObjectKeyType(this.caller.caller, this);
                }
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.NewCallExpress = NewCallExpress;
        /***
         * 调用的变量申明
         * a+b;
         * Math.PI
         * 注意命名空间的首名也是NameCall
         * 命名空间的全称没法初始能很好的判断出来
         * @param implementGeneric泛型实现
         *
         */
        class NameCall extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.nameCall;
            }
            /**
            * 能够被调用，说明是变量名，来源申明的变量名，方法参数名
            * */
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                var rname = this.queryName(this.name);
                if (!rname)
                    console.log(this, rname, this.name);
                it = rname.inferType();
                this.cache('inferType', it);
                return it;
            }
            /**
            * 能够被调用，说明是变量名，来源申明的变量名，方法参数名
            **/
            get refNode() {
                var it = this.cache('refNode');
                if (it)
                    return it;
                it = this.queryName(this.name);
                this.cache('refNode', it);
                return it;
            }
        }
        Lang.NameCall = NameCall;
        class ThisCall extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.thisCall;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                var classStatement = this.closest(x => x instanceof Lang.ClassStatement);
                it = Lang.TypeExpress.create({ name: classStatement.fullNames.first() });
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.ThisCall = ThisCall;
        class SuperCall extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.superCall;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                var cla = this.closest(x => x instanceof Lang.ClassStatement);
                it = cla.extend.inferType();
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.SuperCall = SuperCall;
        /****
         * 类的@属性
         */
        class AtExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.at;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                if (this.at instanceof NameCall) {
                    var nc = this.at;
                    //这里查找类属性，或者this参数
                    var fun = this.closest(x => (x instanceof Lang.AnonymousFunExpress || x instanceof Lang.FunStatement || x instanceof Lang.ClassMethod) && x.parameters.length > 0 && x.parameters.exists(x => x.name == 'this' && x.inferType().props && x.inferType().props.exists(pro => pro.key == nc.name)));
                    if (fun) {
                        it = fun.parameters.find(x => x.name == 'this').inferType().props.find(pro => pro.key == nc.name).type;
                    }
                    else {
                        var cla = this.closest(x => x instanceof Lang.ClassStatement);
                        if (cla) {
                            var pro = cla.propertys.find(x => x instanceof Lang.ClassProperty && x.isName(nc.name));
                            if (pro) {
                                it = pro.inferType();
                            }
                        }
                    }
                }
                else if (this.at instanceof MethodCallExpress) {
                    /**
                     *
                     * 基本上是类方法了
                     *
                     ***/
                    var mc = this.at;
                    var name = mc.caller.name;
                    var cla = this.closest(x => x instanceof Lang.ClassStatement);
                    if (cla) {
                        var proMethod = cla.propertys.find(x => x instanceof Lang.ClassMethod && x.isName(name) && Lang.InferType.InferTypeMethodCallFunTypeIsCompatibility(mc, x));
                        if (proMethod) {
                            it = proMethod.inferType().returnType;
                        }
                    }
                }
                else if (this.at instanceof ThisCall) {
                    var fun = this.closest(x => (x instanceof Lang.AnonymousFunExpress || x instanceof Lang.FunStatement || x instanceof Lang.ClassMethod) && x.parameters.length > 0 && x.parameters.exists(x => x.name == 'this'));
                    if (fun) {
                        it = fun.parameters.find(x => x.name == 'this').inferType();
                    }
                    else {
                        var cla = this.closest(x => x instanceof Lang.ClassStatement);
                        it = cla.inferType();
                    }
                }
                else if (this.at instanceof SuperCall) {
                    it = this.at.inferType();
                }
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.AtExpress = AtExpress;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Ve.Lang.Util.List;
        class Constant extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.constant;
            }
            get isNumber() {
                var name = this.constantType.name;
                return name == 'int' || name == 'number' || name == 'double';
            }
            inferType() { return this.constantType; }
        }
        Lang.Constant = Constant;
        /***形参 */
        class Parameter extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.parameter;
            }
            inferType() {
                if (this.valueType)
                    return this.valueType;
                else if (this.default)
                    return this.default.inferType;
                var it = this.cache('inferType');
                if (it)
                    return it;
                it = Lang.TypeExpress.create({ name: 'any' });
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.Parameter = Parameter;
        /***
         * 申明一个变量
         */
        class DeclareVariable extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.declareVariable;
                this.modifys = new List;
            }
            get isConst() {
                return this.modifys.exists(Lang.Modify.const);
            }
            inferType() {
                if (this.declareType)
                    return this.declareType;
                else if (this.value)
                    return this.value.inferType;
                var it = this.cache('inferType');
                if (it)
                    return it;
                it = Lang.TypeExpress.create({ name: 'any' });
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.DeclareVariable = DeclareVariable;
        class ObjectExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.object;
                this.items = new List;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                it = new Lang.TypeExpress();
                it.props = new List();
                this.items.each(i => {
                    if (i.value instanceof Lang.SpreadExpress) {
                    }
                    else
                        it.props.push({ key: i.key, type: i.value.inferType() });
                });
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.ObjectExpress = ObjectExpress;
        class ArrayExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.array;
                this.items = new List;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                it = new Lang.TypeExpress();
                it.unionType = Lang.TypeExpress.create({ name: "Array" });
                it.generics = new List();
                if (this.items.length > 0)
                    it.generics.push(this.items.first().inferType());
                else
                    it.generics.push(Lang.TypeExpress.create({ name: 'any' }));
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.ArrayExpress = ArrayExpress;
        /****
         * 匿名函数
         */
        class AnonymousFunExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.anonymousFun;
                this.content = new List;
                this.parameters = new List;
                /****是否为箭头函数 */
                this.isArrow = false;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                it = new Lang.TypeExpress();
                it.args = this.parameters.toArray(x => {
                    return {
                        key: x.name,
                        type: x.inferType()
                    };
                });
                if (this.returnType)
                    it.returnType = this.returnType;
                else
                    it.returnType = Lang.InferType.InferTypeStatements(this.content);
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.AnonymousFunExpress = AnonymousFunExpress;
        class StringTemplateExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.stringTemplate;
                this.strings = new List;
            }
            inferType() {
                if (this.stringType)
                    return this.stringType;
                var it = this.cache('inferType');
                if (it)
                    return it;
                it = Lang.TypeExpress.create({ name: 'string' });
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.StringTemplateExpress = StringTemplateExpress;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        /**
         * 操作符也可以是关键词 as is
         *
         */
        /***
         * 三元运算符
         */
        class TernaryExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.ternary;
            }
            inferType() {
                /**
                 * 如果trueExpress类型继承于falseExpress类型，那么返回的类型falseExpress
                 *  */
                if (Lang.TypeExpress.typeIsEqual(this, this.trueExpress.inferType(), this.falseExpress.inferType(), true))
                    return this.falseExpress.inferType();
                else
                    return this.trueExpress.inferType();
            }
        }
        Lang.TernaryExpress = TernaryExpress;
        /***
         * 一元运算符
         */
        class UnaryExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.unary;
                /*运算方向，向左为true !true */
                this.direction = true;
            }
            inferType() {
                return this.express.inferType();
            }
        }
        Lang.UnaryExpress = UnaryExpress;
        /****特指小括号 */
        class BracketExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.bracket;
            }
            inferType() {
                return this.express.inferType();
            }
        }
        Lang.BracketExpress = BracketExpress;
        /***
         * 二元运算符
         */
        class BinaryExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.binary;
            }
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                var op = Lang.InferType.InferTypeOperatorBinaryExpress(this);
                if (!op)
                    console.log(`not found binary express,operator:${this.operator}`, this.left, this.right);
                it = op.returnType;
                this.cache('inferType', it);
                return it;
            }
        }
        Lang.BinaryExpress = BinaryExpress;
        class AssignExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.assign;
            }
            inferType() {
                return this.left.inferType();
            }
        }
        Lang.AssignExpress = AssignExpress;
        class SpreadExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.spread;
            }
            inferType() {
                return this.express.inferType();
            }
        }
        Lang.SpreadExpress = SpreadExpress;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Ve.Lang.Util.List;
        let TypeKind;
        (function (TypeKind) {
            TypeKind[TypeKind["union"] = 0] = "union";
            TypeKind[TypeKind["fun"] = 1] = "fun";
            TypeKind[TypeKind["object"] = 2] = "object";
            TypeKind[TypeKind["unit"] = 3] = "unit";
        })(TypeKind = Lang.TypeKind || (Lang.TypeKind = {}));
        class TypeExpress extends Lang.Express {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.type;
            }
            static create(options) {
                var te = new TypeExpress();
                var sysNames = new List('any', 'Null', 'Any', 'bool', 'Bool', 'number', 'Number', 'string', 'String', 'double', 'Double', 'Int', 'int', 'Object', 'Array', 'Date');
                for (var n in options) {
                    if (n == 'name') {
                        if (sysNames.exists(options[n])) {
                            te[n] = `Ve.Core.` + (options[n].replace(/^([a-z])/, ($, $1) => $1.toUpperCase()));
                        }
                        else
                            te[n] = options[n];
                    }
                    else
                        te[n] = options[n];
                }
                return te;
            }
            toString() {
                if (this.name)
                    return this.name;
                else if (this.args)
                    return `(${this.args.map(arg => arg.type.toString()).join(",")})->${this.returnType ? this.returnType.toString() : "void"}`;
                else if (this.props)
                    return `{${this.props.map(pro => `${pro.key}:${pro.type.toString()}`).join(",")}}`;
                else if (this.unionType) {
                    if (this.unionType.name == 'Array')
                        return `${this.generics.first().toString()}[]`;
                    else
                        return `${this.unionType.toString()}<${this.generics.map(g => g.toString()).join(",")}>`;
                }
            }
            injectImplementGenerics(Generics, ImplementGenerics) {
                if (this.name) {
                    var genIndex = Generics.findIndex(x => x.name == this.name);
                    if (genIndex > -1) {
                        return ImplementGenerics.eq(genIndex);
                    }
                    else
                        return TypeExpress.create({ name: this.name });
                }
                else if (this.props) {
                    return TypeExpress.create({
                        props: this.props.toArray(pro => {
                            return {
                                key: pro.key,
                                type: pro.type.injectImplementGenerics(Generics, ImplementGenerics)
                            };
                        })
                    });
                }
                else if (this.args) {
                    return TypeExpress.create({
                        args: this.args.toArray(pro => {
                            return {
                                key: pro.key,
                                type: pro.type.injectImplementGenerics(Generics, ImplementGenerics)
                            };
                        }),
                        returnType: this.returnType.injectImplementGenerics(Generics, ImplementGenerics)
                    });
                }
                else if (this.unionType) {
                    return TypeExpress.create({
                        unionType: this.unionType.injectImplementGenerics(Generics, ImplementGenerics),
                        generics: this.generics.toArray(x => x.injectImplementGenerics(Generics, ImplementGenerics))
                    });
                }
            }
            /****
             * 判断类型是否相等
             * @param isCompatibility 类型是否兼容 如int兼容number，因为int继成number
             */
            static typeIsEqual(node, type1, type2, isCompatibility = false) {
                if (type1.name && type2.name) {
                    if (type1.name == type2.name)
                        return true;
                    var cla = node.queryName(type1.name, new List(Lang.NodeType.class, Lang.NodeType.enum));
                    if (!cla) {
                        throw 'not found type name' + type1.name;
                    }
                    if (cla.isName(type2.name))
                        return true;
                    if (isCompatibility == true) {
                        var exs = cla.extends;
                        var c2 = node.queryName(type2.name, new List(Lang.NodeType.class, Lang.NodeType.enum));
                        if (exs.exists(x => x.isFullName(c2.fullNames.first())))
                            return true;
                    }
                    return false;
                }
                else if (type1.props && type2.props) {
                    if (type1.props.length != type2.props.length)
                        return false;
                    if (type1.props.trueForAll(x => type2.props.exists(y => y.key == x.key && this.typeIsEqual(node, y.type, x.type))))
                        return true;
                }
                else if (type1.args && type2.args) {
                    if (type1.args.length != type2.args.length)
                        return false;
                    if (type1.args.trueForAll(x => type2.args.exists(y => y.key == x.key && this.typeIsEqual(node, y.type, x.type)))) {
                        if (!type1.returnType && type2.returnType && type2.returnType.name == 'void')
                            return true;
                        else if (!type2.returnType && type1.returnType && type1.returnType.name == 'void')
                            return true;
                        else if (this.typeIsEqual(node, type1.returnType, type2.returnType))
                            return true;
                    }
                    return false;
                }
                else if (type1.unionType && type2.unionType) {
                    if (!this.typeIsEqual(node, type1.unionType, type2.unionType))
                        return false;
                    if (type1.generics.trueForAll(g => type2.generics.exists(x => this.typeIsEqual(node, g, x))))
                        return true;
                }
            }
        }
        Lang.TypeExpress = TypeExpress;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../../../util/common.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Ve.Lang.Util.List;
        let Modify;
        (function (Modify) {
            Modify[Modify["readonly"] = 0] = "readonly";
            Modify[Modify["static"] = 1] = "static";
            Modify[Modify["public"] = 2] = "public";
            Modify[Modify["protected"] = 3] = "protected";
            Modify[Modify["private"] = 4] = "private";
            Modify[Modify["out"] = 5] = "out";
            Modify[Modify["inner"] = 6] = "inner";
            Modify[Modify["const"] = 7] = "const";
            /****密封类*/
            Modify[Modify["sealed"] = 8] = "sealed";
            Modify[Modify["class"] = 9] = "class";
            Modify[Modify["interface"] = 10] = "interface";
            Modify[Modify["enum"] = 11] = "enum";
            /***自定义类操作符 */
            Modify[Modify["operator"] = 12] = "operator";
            Modify[Modify["fun"] = 13] = "fun";
            /***申明 */
            Modify[Modify["def"] = 14] = "def";
            /***表示重载 */
            Modify[Modify["override"] = 15] = "override";
            /***通常表示当前类为装饰类 */
            Modify[Modify["decorate"] = 16] = "decorate";
            Modify[Modify["async"] = 17] = "async";
            Modify[Modify["await"] = 18] = "await";
            /****属性get,set */
            Modify[Modify["get"] = 19] = "get";
            Modify[Modify["set"] = 20] = "set";
            Modify[Modify["field"] = 21] = "field";
        })(Modify = Lang.Modify || (Lang.Modify = {}));
        class DecorateStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.arguments = new List;
            }
        }
        Lang.DecorateStatement = DecorateStatement;
        class Generic extends Lang.Statement {
        }
        Lang.Generic = Generic;
        class PackageStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.package;
                this.content = new List;
            }
            get lastName() {
                var ns = this.name.split(".");
                return ns[ns.length - 1];
            }
            getReferenceNames(name) {
                var uses = this.childs.findAll(x => x instanceof UseStatement);
                var ns = new List(name);
                /***当前的 name有可能会在当前的库里面 */
                ns.push(this.name + "." + name);
                /***通过use的引用来确定查找范围 */
                uses.each(use => {
                    if (use.aliasName) {
                        ns.push(name.replace(use.aliasName, use.packageName));
                    }
                    else {
                        ns.push(use.packageName + "." + name);
                    }
                });
                return ns;
            }
            get classList() {
                var classList = this.cache('classList');
                if (classList)
                    return classList;
                classList = this.childs.findAll(x => x instanceof ClassStatement || x instanceof EnumStatement || x instanceof FunStatement);
                this.cache('classList', classList);
                return classList;
            }
        }
        Lang.PackageStatement = PackageStatement;
        class UseStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.use;
            }
        }
        Lang.UseStatement = UseStatement;
        class ClassStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.class;
                this.content = new List;
                this.decorates = new List;
                this.modifys = new List;
                this.generics = new List;
            }
            get names() {
                var decs = this.decorates.findAll(x => x.name == 'alias' || x.name == 'Alias' || x.name == '别名');
                var ns = decs.toArray(dec => dec.arguments.first().value);
                if (!ns.exists(this.name))
                    ns.insertAt(0, this.name);
                return ns;
            }
            get extend() {
                var ex = this.cache('extend');
                if (ex)
                    return ex;
                if (typeof this.extendName == 'undefined')
                    this.extendName = 'Ve.Core.Any';
                ex = this.queryName(this.extendName, new List(Lang.NodeType.class));
                this.cache('extend', ex);
                return ex;
            }
            get extends() {
                var exs = new List();
                var p = this.extend;
                while (true) {
                    if (p && !exs.exists(p)) {
                        exs.push(p);
                        p = p.extend;
                    }
                    else
                        break;
                }
                return exs;
            }
            get package() {
                var pa = this.cache('package');
                if (pa)
                    return pa;
                pa = this.closest(x => x.type == Lang.NodeType.package);
                this.cache('package', pa);
                return pa;
            }
            get fullNames() {
                var names = this.cache('fullNames');
                if (names)
                    return names;
                var ns = this.names;
                names = ns.map(n => this.package.name + "." + n);
                this.cache('fullNames', names);
                return names;
            }
            get isOut() {
                if (this.modifys.exists(Modify.inner))
                    return false;
                return true;
            }
            isFullName(name) {
                return this.fullNames.exists(name);
            }
            isName(name) {
                return this.names.exists(name);
            }
            get propertys() {
                //需要考虑继承的属性
                var pros = this.cache('propertys');
                if (pros)
                    return pros;
                pros = new List();
                var p = this;
                var ps = new List();
                ps.push(p);
                while (true) {
                    if (!p)
                        break;
                    p.content.each(c => {
                        if (c instanceof ClassMethod) {
                            if (c.isCtor)
                                return;
                            var pro = pros.find(x => x instanceof ClassMethod && x.name == c.name && (x.isStatic && c.isStatic || !x.isStatic && !c.isStatic) && Lang.TypeExpress.typeIsEqual(c, x.inferType(), c.inferType(), true));
                            if (!pro) {
                                pros.push(c);
                            }
                        }
                        else if (c instanceof ClassOperator) {
                            var pro = pros.find(x => x instanceof ClassOperator && x.name == c.name && Lang.TypeExpress.typeIsEqual(c, x.inferType(), c.inferType(), true));
                            if (!pro) {
                                pros.push(c);
                            }
                        }
                        else if (c instanceof ClassProperty) {
                            var pro = pros.find(x => x instanceof ClassMethod && x.name == c.name && (x.isStatic && c.isStatic || !x.isStatic && !c.isStatic) && Lang.TypeExpress.typeIsEqual(c, x.inferType(), c.inferType(), true));
                            if (!pro) {
                                pros.push(c);
                            }
                        }
                    });
                    p = p.extend;
                    if (ps.exists(p))
                        break;
                    if (p)
                        ps.push(p);
                }
                this.cache('propertys', pros);
                return pros;
            }
            methods(onlySelfClass = false) {
                if (onlySelfClass != true)
                    return this.propertys.findAll(x => x instanceof ClassMethod);
                else
                    return this.content.findAll(x => x instanceof ClassMethod);
            }
            operators(onlySelfClass = false) {
                if (onlySelfClass != true)
                    return this.propertys.findAll(x => x instanceof ClassOperator);
                else
                    return this.content.findAll(x => x instanceof ClassOperator);
            }
            props(onlySelfClass = false) {
                if (onlySelfClass != true)
                    return this.propertys.findAll(x => x instanceof ClassProperty);
                else
                    return this.content.findAll(x => x instanceof ClassProperty);
            }
            inferType() {
                if (this.generics && this.generics.length > 0) {
                    return Lang.TypeExpress.create({ unionType: Lang.TypeExpress.create({ name: this.fullNames.first() }), generics: this.generics.toArray(x => Lang.TypeExpress.create({ name: x.name })) });
                }
                else {
                    return Lang.TypeExpress.create({ name: this.fullNames.first() });
                }
            }
        }
        Lang.ClassStatement = ClassStatement;
        class EnumStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.enum;
                this.items = new List;
                this.decorates = new List;
            }
        }
        Lang.EnumStatement = EnumStatement;
        class EnumItem extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.enumItem;
            }
            get fullNames() {
                return this.parent.fullNames.toArray(x => x + "." + this.name);
            }
            isFullName(name) {
                return this.fullNames.exists(name);
            }
        }
        Lang.EnumItem = EnumItem;
        ;
        Ve.Lang.Util.Mixin(EnumStatement, ClassStatement, ['package', 'fullNames', 'names', 'isName', 'isFullName', 'isOut']);
        class FunStatement extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.fun;
                this.decorates = new List;
                this.modifys = new List;
                this.content = new List;
                this.parameters = new List;
                this.generics = new List;
            }
            inferType() {
                var ti = Lang.TypeExpress.create({
                    args: this.parameters.toArray(x => { return { key: x.name, type: x.inferType() }; }),
                    returnType: this.returnType ? this.returnType : Lang.InferType.InferTypeStatements(this.content)
                });
                return ti;
            }
        }
        Lang.FunStatement = FunStatement;
        ;
        Ve.Lang.Util.Mixin(FunStatement, ClassStatement, ['package', 'fullNames', 'names', 'isName', 'isFullName', 'isOut']);
        class ClassMethod extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.classMethod;
                this.content = new List;
                this.parameters = new List;
                this.decorates = new List;
                this.modifys = new List;
                this.generics = new List;
            }
            get class() {
                var cla = this.cache('class');
                if (cla)
                    return cla;
                cla = this.closest(x => x instanceof ClassStatement);
                this.cache('class', cla);
                return cla;
            }
            get package() {
                return this.class.package;
            }
            get fullNames() {
                var names = this.cache('fullNames');
                if (names)
                    return names;
                var ns = this.names;
                names = new List();
                this.class.fullNames.each(fn => { ns.each(n => { names.push(fn + "." + n); }); });
                this.cache('fullNames', names);
                return names;
            }
            get names() {
                var decs = this.decorates.findAll(x => x.name == 'alias' || x.name == 'Alias' || x.name == '别名');
                var ns = decs.toArray(dec => dec.arguments.first().value);
                if (!ns.exists(this.name))
                    ns.insertAt(0, this.name);
                return ns;
            }
            get onlyName() {
                var only = this.cache('onlyName');
                if (!only) {
                    var dec = this.decorates.find(x => x.name == 'only' || x.name == 'Only');
                    if (dec) {
                        only = dec.arguments.first().value;
                    }
                    if (!only)
                        only = this.names.first();
                }
                this.cache('onlyName', only);
                return this.class.fullNames.first() + "." + only;
            }
            get isStatic() {
                return this.modifys.exists(Modify.static);
            }
            get isPublic() {
                return this.isProtected || this.isPrivate ? false : true;
            }
            get isProtected() {
                return this.modifys.exists(Modify.protected);
            }
            get isPrivate() {
                return this.modifys.exists(Modify.private);
            }
            get isOverride() {
                return this.modifys.exists(Modify.override);
            }
            get isInterface() {
                return this.modifys.exists(Modify.interface);
            }
            isName(name) {
                return this.names.exists(name);
            }
            isFullName(name) {
                return this.fullNames.exists(name);
            }
            /***
             * 方法inferType表示当前方法的类型
             */
            inferType() {
                var ti = Lang.TypeExpress.create({
                    args: this.parameters.toArray(x => { return { key: x.name, type: x.inferType() }; }),
                    returnType: this.returnType ? this.returnType : Lang.InferType.InferTypeStatements(this.content)
                });
                return ti;
            }
            get isCtor() {
                if (this.name == 'ctor')
                    return true;
                if (this.class.name == this.name)
                    return true;
                return false;
            }
        }
        Lang.ClassMethod = ClassMethod;
        class ClassProperty extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.classProperty;
                /****注解 */
                this.decorates = new List;
                this.modifys = new List;
            }
            get isGet() {
                if (this.modifys.exists(Modify.field) && this.modifys.exists(Modify.get))
                    return true;
                return true;
            }
            get isSet() {
                if (this.modifys.exists(Modify.field) && this.modifys.exists(Modify.set))
                    return true;
                if (this.modifys.exists(Modify.readonly))
                    return false;
                return true;
            }
            get class() {
                var cla = this.cache('class');
                if (cla)
                    return cla;
                cla = this.closest(x => x instanceof ClassStatement);
                this.cache('class', cla);
                return cla;
            }
            get package() {
                return this.class.package;
            }
            get fullNames() {
                var names = this.cache('fullNames');
                if (names)
                    return names;
                var ns = this.names;
                names = new List();
                this.class.fullNames.each(fn => { ns.each(n => { names.push(fn + "." + n); }); });
                this.cache('fullNames', names);
                return names;
            }
            get names() {
                var decs = this.decorates.findAll(x => x.name == 'alias' || x.name == 'Alias' || x.name == '别名');
                var ns = decs.toArray(dec => dec.arguments.first().value);
                if (!ns.exists(this.name))
                    ns.insertAt(0, this.name);
                return ns;
            }
            get onlyName() {
                var only = this.cache('onlyName');
                if (!only) {
                    var dec = this.decorates.find(x => x.name == 'only' || x.name == 'Only');
                    if (dec) {
                        only = dec.arguments.first().value;
                    }
                    if (!only)
                        only = this.names.first();
                }
                this.cache('onlyName', only);
                return this.class.fullNames.first() + "." + only;
            }
            get isStatic() {
                return this.modifys.exists(Modify.static);
            }
            get isPublic() {
                return this.modifys.exists(Modify.public) || !this.isProtected && !this.isPrivate;
            }
            get isProtected() {
                return this.modifys.exists(Modify.protected);
            }
            get isPrivate() {
                return this.modifys.exists(Modify.private);
            }
            get isOverride() {
                return this.modifys.exists(Modify.override);
            }
            get isInterface() {
                return this.modifys.exists(Modify.interface);
            }
            isName(name) {
                return this.names.exists(name);
            }
            isFullName(name) {
                return this.fullNames.exists(name);
            }
            inferType() {
                if (this.modifys.exists(Modify.field)) {
                    if (this.returnType)
                        this.returnType;
                    else {
                        var it = this.cache('inferType');
                        if (it)
                            return it;
                        it = Lang.InferType.InferTypeStatements(this.content);
                        this.cache('inferType', it);
                        return it;
                    }
                }
                else {
                    if (this.propType)
                        return this.propType;
                    else if (this.propValue)
                        return this.propValue;
                    var it = this.cache('inferType');
                    if (it)
                        return it;
                    it = Lang.TypeExpress.create({ name: 'any' });
                    this.cache('inferType', it);
                    return it;
                }
            }
        }
        Lang.ClassProperty = ClassProperty;
        class ClassOperator extends Lang.Statement {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.classOperator;
                this.parameters = new List;
                this.decorates = new List;
                this.modifys = new List;
                this.content = new List;
            }
            /***
             * 推导的是操作符返回值的类型，
             * 不是操作符本身方法类型
             */
            inferType() {
                var it = this.cache('inferType');
                if (it)
                    return it;
                if (this.returnType)
                    it = this.returnType;
                if (!it) {
                    if (this.content && this.content.length > 0)
                        it = Lang.InferType.InferTypeStatements(this.content);
                    else
                        it = Lang.TypeExpress.create({ name: 'void' });
                }
                this.cache('inferType', it);
                return it;
            }
            get class() {
                var cla = this.cache('class');
                if (cla)
                    return cla;
                cla = this.closest(x => x instanceof ClassStatement);
                this.cache('class', cla);
                return cla;
            }
            get package() {
                return this.class.package;
            }
            get fullNames() {
                var names = this.cache('fullNames');
                if (names)
                    return names;
                var ns = this.names;
                names = new List();
                this.class.fullNames.each(fn => { ns.each(n => { names.push(fn + "." + n); }); });
                this.cache('fullNames', names);
                return names;
            }
            get names() {
                var decs = this.decorates.findAll(x => x.name == 'alias' || x.name == 'Alias' || x.name == '别名');
                var ns = decs.toArray(dec => dec.arguments.first().value);
                if (!ns.exists(this.name))
                    ns.insertAt(0, this.name);
                return ns;
            }
            get onlyName() {
                var only = this.cache('onlyName');
                if (!only) {
                    var dec = this.decorates.find(x => x.name == 'only' || x.name == 'Only');
                    if (dec) {
                        only = dec.arguments.first().value;
                    }
                    if (!only)
                        only = this.names.first();
                }
                this.cache('onlyName', only);
                return this.class.fullNames.first() + "." + only;
            }
            get isStatic() {
                return this.modifys.exists(Modify.static);
            }
            get isPublic() {
                return this.modifys.exists(Modify.public);
            }
            get isProtected() {
                return this.modifys.exists(Modify.protected);
            }
            get isPrivate() {
                return this.modifys.exists(Modify.private);
            }
            get isOverride() {
                return this.modifys.exists(Modify.override);
            }
            get isInterface() {
                return this.modifys.exists(Modify.interface);
            }
            isName(name) {
                return this.names.exists(name);
            }
            isFullName(name) {
                return this.fullNames.exists(name);
            }
        }
        Lang.ClassOperator = ClassOperator;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Ve.Lang.Util.List;
        class IFStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.if;
                this.ifContent = new List;
                this.elseIFConditions = new List;
                this.elseIFContents = new List;
                this.elseConent = new List;
            }
        }
        Lang.IFStatement = IFStatement;
        class WhenStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.when;
                this.whens = new List;
            }
            set(name, value) {
                this.whens = value;
                this.whens.each(wh => {
                    wh.value.each(v => this.append(v));
                    wh.content.each(v => this.append(v));
                });
            }
        }
        Lang.WhenStatement = WhenStatement;
        class WhileStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.while;
                this.content = new List;
            }
        }
        Lang.WhileStatement = WhileStatement;
        class ForStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.init = new List;
                this.post = new List;
                this.content = new List;
            }
        }
        Lang.ForStatement = ForStatement;
        class SwitchStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.switch;
                this.cases = new List;
                this.default = new List;
            }
            set(name, value) {
                if (name == 'cases') {
                    this.cases = value;
                    this.cases.each(wh => {
                        wh.case.each(v => this.append(v));
                        wh.content.each(v => this.append(v));
                    });
                }
                else {
                    super.set(name, value);
                }
            }
        }
        Lang.SwitchStatement = SwitchStatement;
        class TryStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.try;
                this.try = new List;
                this.catchs = new List;
                this.finally = new List;
            }
            set(name, value) {
                if (name == 'catchs') {
                    this.catchs = value;
                    this.catchs.each(c => {
                        if (c.paramete)
                            this.append(c.paramete);
                        c.content.each(cc => this.append(cc));
                    });
                }
                else {
                    super.set(name, value);
                }
            }
        }
        Lang.TryStatement = TryStatement;
        class BreadkStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.break;
            }
        }
        Lang.BreadkStatement = BreadkStatement;
        class EmptyStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.emptyStatement;
            }
        }
        Lang.EmptyStatement = EmptyStatement;
        class ContinueStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.continue;
            }
        }
        Lang.ContinueStatement = ContinueStatement;
        class ReturnStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.return;
            }
            inferType() {
                return this.result.inferType();
            }
        }
        Lang.ReturnStatement = ReturnStatement;
        class ThrowStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.throw;
            }
        }
        Lang.ThrowStatement = ThrowStatement;
        class BlockStatement extends Lang.Node {
            constructor() {
                super(...arguments);
                this.type = Lang.NodeType.block;
                this.content = new List();
            }
        }
        Lang.BlockStatement = BlockStatement;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Lang.Util.List;
        class StatementParser$Express {
            express() {
                return this.nextExpress();
            }
            eatExpressUnit() {
                this.eatBlank();
                var unit = this.commonUnitExpress();
                if (unit)
                    return unit;
                var af = this.arrowFun();
                if (af)
                    return af;
                af = this.funExpress();
                if (af)
                    return af;
            }
            eatExpressSymbol() {
                this.eatBlank();
                var index = this.index;
                var op = Lang.veOperatorPrecedences.find(x => {
                    if (x.match && this.eat(x.match))
                        return true;
                });
                if (op) {
                    return {
                        operator: this.range(index, this.index - 1),
                        op
                    };
                }
            }
            nextExpress() {
                var es = new List();
                while (true) {
                    var unit = this.eatExpressUnit();
                    if (unit) {
                        es.push(unit);
                        continue;
                    }
                    var expressSymbol = this.eatExpressSymbol();
                    if (expressSymbol) {
                        es.push(expressSymbol);
                        continue;
                    }
                    break;
                }
                var index = 0;
                function getAdjoin() {
                    var leftExpress = new List();
                    var rightExpress = new List();
                    var operator;
                    var i = index;
                    for (; i < es.length; i++) {
                        if (es.eq(i) instanceof Lang.Node) {
                            if (operator)
                                rightExpress.push(es.eq(i));
                            else
                                leftExpress.push(es.eq(i));
                        }
                        else if (!operator)
                            operator = es.eq(i);
                        else
                            break;
                    }
                    if (leftExpress.length > 1) {
                        //连续两个unit表达式（中间没有操作符进行连接，这应该是个错误）
                        console.log(this.units);
                        throw new Error('the unit express not found operator');
                    }
                    if (rightExpress.length > 1) {
                        //连续两个unit表达式（中间没有操作符进行连接，这应该是个错误）
                        console.log(this.units);
                        throw new Error('the unit express not found operator');
                    }
                    return {
                        operator,
                        lefts: leftExpress,
                        rights: rightExpress,
                        start: index,
                        end: i
                    };
                }
                function backOperator(index) {
                    var op;
                    for (var i = index; i >= 0; i--) {
                        var e = es.eq(i);
                        if (e instanceof Lang.Node)
                            continue;
                        else if (!op)
                            op = e;
                        else
                            break;
                    }
                    return i + 1;
                }
                if (es.length == 0)
                    return;
                while (true) {
                    var left = getAdjoin();
                    index = left.end;
                    var right = getAdjoin();
                    if (!right.operator && !left.operator && left.lefts) {
                        break;
                    }
                    else if (!right.operator && left.operator) {
                        var newExp = this.parseOperatorExpress(left.operator, { leftExpress: left.lefts.first(), rightExpress: left.rights.first() });
                        var at = es.findIndex(x => x == left.operator);
                        es.insertAt(at, newExp);
                        es.removeAll(x => x == left.operator || left.lefts.exists(z => z == x) || left.rights.exists(z => z == x));
                        index = backOperator(es.findIndex(x => x == newExp) - 1);
                    }
                    else {
                        if (left.operator.op.name == '?:' && left.operator.op.match == '?' && right.operator.op.name == '?:' && right.operator.op.match == ':') {
                            /**
                             * 三元运算符
                             */
                            var newExp = this.parseTernary(left, right);
                            var at = es.findIndex(x => x == left.operator);
                            es.insertAt(at, newExp);
                            es.removeAll(x => x == left.operator || left.lefts.exists(z => z == x) || left.rights.exists(z => z == x));
                            es.removeAll(x => x == right.operator || right.lefts.exists(z => z == x) || right.rights.exists(z => z == x));
                            index = backOperator(es.findIndex(x => x == newExp) - 1);
                        }
                        else if (this.comparePrecedence([left.operator.op, right.operator.op])) {
                            /**
                            * 左边优先级较高，左边变成express
                            * a+b+c
                            * g+c
                             */
                            var newExp = this.parseOperatorExpress(left.operator, { leftExpress: left.lefts.first(), rightExpress: left.rights.first() });
                            var at = es.findIndex(x => x == left.operator);
                            es.insertAt(at, newExp);
                            es.removeAll(x => x == left.operator || left.lefts.exists(z => z == x) || left.rights.exists(z => z == x));
                            //退到此时right运算符前面的一个运算符
                            index = backOperator(es.findIndex(x => x == newExp) - 1);
                        }
                        else {
                            /**
                             * 右边较高，
                             * !!!!!!a
                            */
                            /**
                             * 自动跳到下一个
                             */
                            index = es.findIndex(x => x == left.operator) + 1;
                        }
                    }
                }
                return es.eq(0);
            }
            /**
             *
             * 逗号分割表达式
             *
             * */
            commasExpress() {
                var exps = new List;
                while (true) {
                    var exp = this.nextExpress();
                    if (exp) {
                        exps.push(exp);
                    }
                    var commas = this.eat(/@blank*\,@blank*/);
                    if (commas)
                        continue;
                    else
                        break;
                }
                return exps;
            }
            commonUnitExpress() {
                this.eatBlank();
                var tokens = this.eat(/number|true|false|this|super|null|@word@blank*(\<\>)?|("'@word?)/);
                if (tokens)
                    return this.parseCommonUnit(tokens);
                return null;
            }
            parseCommonUnit(tokens) {
                var token = tokens.first();
                if (token.flag == "\"") {
                    var quoteToken = tokens.first();
                    var quoteTokenUnit = tokens.eq(2);
                    var typeName = 'string';
                    if (quoteTokenUnit)
                        typeName = quoteTokenUnit.value;
                    if (quoteToken) {
                        if (quoteToken.childs.exists(x => x.flag == '@{' || x.flag == 'variable')) {
                            //说明上面是string.template
                            var cte = new Lang.StringTemplateExpress();
                            cte.ref(quoteToken);
                            var strings = new List;
                            quoteToken.childs.each(ch => {
                                if (ch.flag == '}')
                                    return;
                                if (ch.flag == '@{') {
                                    strings.push(this.TM.express(ch.childs));
                                }
                                else if (ch.flag == 'variable') {
                                    var nc = new Lang.NameCall();
                                    nc.ref(ch);
                                    nc.name = ch.value;
                                    if (nc.name.startsWith('@'))
                                        nc.name = nc.name.substring(1);
                                    strings.push(nc);
                                }
                                else {
                                    var constant = new Lang.Constant();
                                    constant.ref(ch);
                                    constant.constantType = Lang.TypeExpress.create({ name: 'string' });
                                    constant.value = ch.value;
                                    strings.push(constant);
                                }
                            });
                            cte.set('strings', strings);
                            cte.stringType = Lang.TypeExpress.create({ name: typeName });
                            return cte;
                        }
                        else {
                            //下面是纯字符串
                            var str = quoteToken.childs.toArray(x => x.value).join("");
                            var constant = new Lang.Constant();
                            constant.ref(quoteToken);
                            constant.constantType = Lang.TypeExpress.create({ name: typeName });
                            constant.value = str;
                            return constant;
                        }
                    }
                }
                else if (token.flag == 'number') {
                    //数字
                    var cs = new Lang.Constant();
                    var numberToken = tokens.first();
                    cs.ref(numberToken);
                    cs.value = numberToken.value.match(/\d+((\.|。)\d+)?([eE][\-+]?\d+)?/)[0];
                    var typeName = numberToken.value.replace(cs.value, '');
                    cs.value = parseFloat(numberToken.value);
                    if (!typeName) {
                        if (cs.value.toString().indexOf('.') > -1)
                            typeName = 'number';
                        else
                            typeName = 'int';
                    }
                    cs.constantType = Lang.TypeExpress.create({ name: typeName });
                    return cs;
                }
                else if (token.flag == 'true' || token.flag == 'false') {
                    //是否
                    var con = new Lang.Constant();
                    con.ref(tokens.find(x => x.flag == 'true' || token.flag == 'false'));
                    con.value = tokens.exists(x => x.flag == 'true') ? true : false;
                    con.constantType = Lang.TypeExpress.create({ name: 'bool' });
                    return con;
                }
                else if (token.flag == 'null') {
                    //空值
                    var con = new Lang.Constant();
                    con.ref(tokens.find(x => x.flag == 'null'));
                    con.value = null;
                    con.constantType = Lang.TypeExpress.create({ name: 'Null' });
                    return con;
                }
                else if (token.flag == 'this') {
                    var call = new Lang.ThisCall();
                    call.ref(tokens.find(x => x.flag == 'this'));
                    return call;
                }
                else if (token.flag == 'super') {
                    var ca = new Lang.SuperCall();
                    ca.ref(tokens.find(x => x.flag == 'super'));
                    return ca;
                }
                else if (token.flag == 'word' || token.flag == 'type') {
                    //变量名或类型名
                    var nc = new Lang.NameCall();
                    nc.ref(tokens.find(token => token.flag == 'word' || token.flag == 'type'));
                    nc.name = tokens.first().value;
                    var tg = tokens.find(x => x.flag == '<');
                    if (tg) {
                        nc.implementGeneric = new List();
                        var gs = tg.childs.split(x => x.flag == ',');
                        gs.each(dss => {
                            nc.implementGeneric.push(this.TM.typeExpress(dss));
                        });
                    }
                    return nc;
                }
                return null;
            }
            parseOperatorExpress(treeNode, extendTreeNode) {
                var node = Lang.Util.Extend(treeNode, extendTreeNode);
                let operand = node.op.operand;
                let leftIsExists = node.leftExpress || node.leftUnitExpress && node.leftUnitExpress.length > 0;
                let rightIsExists = node.rightExpress || node.rightUnitExpress && node.rightUnitExpress.length > 0;
                let getLeftExpress = () => leftIsExists ? (node.leftExpress ? node.leftExpress : node.leftUnitExpress.last()) : null;
                let getRightExpress = () => rightIsExists ? (node.rightExpress ? node.rightExpress : node.rightUnitExpress.first()) : null;
                let op = node.op;
                let operator = node.operator;
                if (typeof operand == 'undefined') {
                    /***括号["(","[","{"]*/
                    return this.parseBracket(operator, op, getLeftExpress());
                }
                else {
                    if (op.name == '-') {
                        //'-'比较特殊，需要判断前面有没有货，决定是负号还是减号
                        if (leftIsExists)
                            operand = 2;
                        else
                            operand = 1;
                    }
                    if (operand == 1) {
                        //单元运算符
                        if (op.name == '++' || op.name == '--') {
                            //如果左边有货，那么就是++i
                            if (leftIsExists)
                                return this.parseUnary(operator, op, getLeftExpress(), null);
                            //如果右边有货i++
                            else
                                return this.parseUnary(operator, op, null, getRightExpress());
                        }
                        else
                            return this.parseUnary(operator, op, getLeftExpress(), getRightExpress());
                    }
                    else if (operand == 2) {
                        //二元运算符
                        return this.parseBinary(operator, op, getLeftExpress(), getRightExpress());
                    }
                    else if (operand == 3) {
                        //三元运算符
                        // return this.parseTernary(operator, op, getLeftExpress(), getRightExpress());
                    }
                }
                console.log('not found ', node);
                return null;
            }
            /***三元运算符 */
            parseTernary(left, right) {
                // var token = operator.eq(0);
                /**
                 * ?:是所有基本运算符中优先级最低的，所以最终会相爱在一起
                 * */
                var te = new Lang.TernaryExpress();
                te.ref(left.operator.operator);
                te.set('condition', left.lefts.first());
                te.set('trueExpress', left.rights.first());
                te.set('falseExpress', right.rights.first());
                return te;
            }
            /***单元运算符 */
            parseUnary(operator, op, left, right) {
                if (left == null && right == null) {
                    this.onError(new Error(`单目运算符${op.name}使用错误`), operator.eq(0));
                    return;
                }
                switch (op.name) {
                    case '@':
                        var at = new Lang.AtExpress();
                        at.ref(operator);
                        at.set('at', right);
                        return at;
                        break;
                    case '-':
                        if (left instanceof Lang.Constant && left.isNumber) {
                            left.value = (0 - left.value);
                            return left;
                        }
                        else {
                            var un = new Lang.UnaryExpress();
                            un.ref(operator);
                            un.operator = op.name;
                            un.set('express', left ? left : right);
                            un.direction = left ? true : false;
                            return un;
                            break;
                        }
                    case '++':
                    case '--':
                    case '!':
                        var un = new Lang.UnaryExpress();
                        un.ref(operator);
                        un.operator = op.name;
                        un.set('express', left ? left : right);
                        un.direction = left ? true : false;
                        return un;
                        break;
                    case '...':
                        var sp = new Lang.SpreadExpress();
                        sp.ref(operator);
                        sp.set('express', right);
                        return sp;
                        break;
                    case 'new':
                        var nc = new Lang.NewCallExpress();
                        nc.ref(operator);
                        nc.set('caller', right);
                        return nc;
                    case '~~':
                        var co = new Lang.Constant();
                        nc.ref(operator);
                        co.value = null;
                        if (right instanceof Lang.NameCall)
                            co.constantType = Lang.TypeExpress.create({ name: right.name });
                        return co;
                        break;
                }
                return null;
            }
            /****二元运算符 */
            parseBinary(operator, op, left, right) {
                if (left == null || right == null) {
                    this.onError(new Error(`二元运算符${op.name}使用错误`), operator.first());
                    return;
                }
                switch (op.name) {
                    case "+=":
                    case '-=':
                    case '*=':
                    case '**=':
                    case '/=':
                    case '&&=':
                    case '||=':
                    case '%=':
                        var assign = new Lang.AssignExpress();
                        assign.ref(operator);
                        assign.set('left', left);
                        assign.set('right', right);
                        assign.operator = op.name;
                        return assign;
                        break;
                    case '+':
                    case '-':
                    case '&&':
                    case '||':
                    case '*':
                    case '**':
                    case '%':
                    case '/':
                    case '??':
                    case 'as':
                    case 'is':
                    case 'and':
                    case 'xor':
                    case 'or':
                    case 'nas':
                    case 'nis':
                    case 'nand':
                    case 'nxor':
                    case 'nor':
                    case '..':
                    case '>':
                    case '<':
                    case '>=':
                    case '<=':
                    case '!=':
                    case '==':
                        var binary = new Lang.BinaryExpress();
                        binary.ref(operator);
                        binary.set('left', left);
                        binary.set('right', right);
                        binary.operator = op.name;
                        return binary;
                        break;
                    case '.':
                    case '?.':
                        var oa = new Lang.ObjectCallExpress();
                        oa.ref(operator);
                        oa.set('caller', left);
                        oa.set('key', right);
                        oa.operator = op.name;
                        return oa;
                        break;
                }
                return null;
            }
            /****括号运算，有left的说明是某个调用（如方法，否则为括号运算符） */
            parseBracket(operator, op, left) {
                if (!operator.eq(1)) {
                    this.onError(new Error(`没有找到符号${op.name}的另一伴`), operator.first());
                    return;
                }
                if (op.name == '[') {
                    if (left) {
                        var ac = new Lang.ArrayCallExpress();
                        ac.ref(operator.find(x => x.flag == '['));
                        ac.set('caller', left);
                        ac.set('arrayIndex', this.TM.express(operator.first().childs));
                        return ac;
                    }
                    else {
                        return this.TM.dataExpress(new List(operator.first()));
                    }
                }
                else if (op.name == '(') {
                    if (left) {
                        var oe = new Lang.MethodCallExpress();
                        oe.ref(operator.find(x => x.flag == '('));
                        oe.set('caller', left);
                        oe.set('argements', operator.first().childs.split(x => x.flag == ',').toArray(x => this.TM.express(x)));
                        return oe;
                    }
                    else {
                        var be = new Lang.BracketExpress();
                        be.ref(operator.find(x => x.flag == '('));
                        be.set('express', this.TM.express(operator.first().childs));
                        return be;
                    }
                }
                else if (op.name == '{') {
                    if (!left) {
                        try {
                            return this.TM.dataExpress(new List(operator.first()));
                        }
                        catch (e) {
                            console.log(e);
                            throw e;
                        }
                    }
                }
                return null;
            }
            /**
             * 优先级比较
             */
            comparePrecedence(nearSymbols) {
                let [leftOperatorPrecedence, rightOperatorPrecedence] = nearSymbols;
                if (leftOperatorPrecedence.name == rightOperatorPrecedence.name) {
                    /**感叹运算符可以叠加 */
                    if (leftOperatorPrecedence.operand == 1 && new List('!').exists(leftOperatorPrecedence.name))
                        return false;
                    return true;
                }
                return leftOperatorPrecedence.precedence >= rightOperatorPrecedence.precedence;
            }
        }
        Lang.StatementParser$Express = StatementParser$Express;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class StatementParser$Class {
            $property() {
                var tokens = this.eat(Lang.getStatementRegex('class.property'));
                var cp = new Lang.ClassProperty();
                tokens = this.decorateAndModify(tokens, cp);
                var nt = tokens.find(x => x.flag == 'type' || x.flag == 'word');
                cp.name = nt.value;
                cp.ref(nt);
                if (this.match(/@blank*\:/)) {
                    this.eat(/@blank*\:/);
                    cp.set('propType', this.$type());
                }
                if (this.match(/@blank*\=@blank*/)) {
                    this.eat(/@blank*\=@blank*/);
                    var valueExp;
                    valueExp = this.eatExpressUnit();
                    if (!valueExp) {
                        if (this.match(/\{\}|\[\]/)) {
                            valueExp = this.TM.dataExpress(this.eat(/\{\}|\[\]/));
                        }
                    }
                    if (!valueExp) {
                        valueExp = this.nextExpress();
                    }
                    if (valueExp)
                        cp.set('propValue', valueExp);
                }
                this.eatEmptyStatement();
                return cp;
            }
            $method() {
                var tokens = this.eat(Lang.getStatementRegex('class.method'));
                var cm = new Lang.ClassMethod();
                tokens = this.decorateAndModify(tokens, cm);
                var nt = this.TM.match(/@word|ctor|get|set/, tokens).first();
                cm.name = nt.value;
                cm.ref(nt);
                /***fun  parameters*/
                var parameterToken = tokens.find(x => x.flag == '(');
                if (parameterToken.childs.length > 0) {
                    cm.set('parameters', this.TM.parameters(parameterToken.childs));
                }
                var rc = this.matchFunTypeAndBody();
                cm.returnType = rc.returnType;
                if (rc.content)
                    cm.set('content', rc.content);
                else
                    cm.modifys.push(Lang.Modify.interface);
                return cm;
            }
            $field() {
                var tokens = this.eat(Lang.getStatementRegex('class.field'));
                var cp = new Lang.ClassProperty();
                tokens = this.decorateAndModify(tokens, cp);
                var nt = this.TM.match(/@word/, tokens).first();
                cp.ref(nt);
                cp.name = nt.value;
                if (tokens.exists(x => x.flag == 'get'))
                    cp.modifys.push(Lang.Modify.get);
                else if (tokens.exists(x => x.flag == 'set'))
                    cp.modifys.push(Lang.Modify.set);
                /***fun  parameters*/
                var parameterToken = tokens.find(x => x.flag == '(');
                if (parameterToken.childs.length > 0) {
                    cp.set('parameters', this.TM.parameters(parameterToken.childs));
                }
                var rc = this.matchFunTypeAndBody();
                cp.returnType = rc.returnType;
                if (rc.content)
                    cp.set('content', rc.content);
                else
                    cp.modifys.push(Lang.Modify.interface);
                return cp;
            }
            $operator() {
                var tokens = this.eat(Lang.getStatementRegex('class.operator'));
                var op = new Lang.ClassOperator();
                tokens = this.decorateAndModify(tokens, op);
                tokens.removeBefore(x => x.flag == 'operator', true);
                /***fun  parameters*/
                var parameterToken = tokens.find(x => x.flag == '(');
                if (parameterToken.childs.length > 0) {
                    op.set('parameters', this.TM.parameters(parameterToken.childs));
                }
                var rc = this.matchFunTypeAndBody();
                op.returnType = rc.returnType;
                if (rc.content)
                    op.set('content', rc.content);
                else
                    op.modifys.push(Lang.Modify.interface);
                var nt = this.TM.match(Lang.getStatementRegex('symbols'), tokens).first();
                op.ref(nt);
                op.name = nt.value;
                return op;
            }
        }
        Lang.StatementParser$Class = StatementParser$Class;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Lang.Util.List;
        class StatementParser$Declare {
            $package() {
                var pa = new Lang.PackageStatement();
                pa.ref(this.eat(/package/));
                this.eatBlank();
                pa.name = this.eat(/@namespace/).toArray(x => x.value.trim()).join("");
                this.eatBlank();
                this.eatEmptyStatement();
                return pa;
            }
            $use() {
                var use = new Lang.UseStatement();
                use.ref(this.eat(/use/));
                this.eatBlank();
                use.packageName = this.eat(/@namespace/).toArray(x => x.value.trim()).join("");
                this.eatBlank();
                if (this.match(/@namespace/)) {
                    use.aliasName = this.eat(/@namespace/).toArray(x => x.value.trim()).join("");
                }
                this.eatEmptyStatement();
                return use;
            }
            $class() {
                var tokens = this.eat(Lang.getStatementRegex('root.class'));
                var classStatement = new Lang.ClassStatement();
                tokens = this.decorateAndModify(tokens, classStatement);
                if (tokens.exists(x => x.flag == 'interface'))
                    classStatement.modifys.push(Lang.Modify.interface);
                else if (tokens.exists(x => x.flag == 'class'))
                    classStatement.modifys.push(Lang.Modify.class);
                var classNameTokens = this.TM.match(/(class|interface)@blank+(@word|type)/, tokens);
                var nt = classNameTokens.find(x => x.flag == 'word' || x.flag == 'type');
                classStatement.ref(nt);
                classStatement.name = nt.value;
                if (this.TM.isMatch(/extends@blank*(@word|type)/, tokens)) {
                    var classExtendTokens = this.TM.match(/extends@blank*(@word|type)/, tokens);
                    classStatement.extendName = classExtendTokens.find(x => x.flag == 'word' || x.flag == 'type').value;
                }
                /***class content */
                var contentToken = tokens.find(x => x.flag == '{');
                if (contentToken.childs.length > 0) {
                    var parser = this.createParser();
                    parser.syntaxContext = 'class';
                    var contentNodes = parser.parse(contentToken.childs);
                    var ns = new List(Lang.NodeType.classMethod, Lang.NodeType.classOperator, Lang.NodeType.classProperty);
                    contentNodes.removeAll(x => !ns.exists(n => n == x.type));
                    classStatement.set('content', contentNodes);
                }
                return classStatement;
            }
            $enum() {
                var tokens = this.eat(Lang.getStatementRegex('root.enum'));
                var enumStatement = new Lang.EnumStatement();
                tokens = this.decorateAndModify(tokens, enumStatement);
                var nt = this.TM.match(/@word/, tokens).first();
                enumStatement.name = nt.value;
                enumStatement.ref(nt);
                /***enum content */
                var contentToken = tokens.find(x => x.flag == '{');
                var ts = contentToken.childs.split(x => x.flag == ',' || x.flag == ';');
                ts.each((os, i) => {
                    var key = this.TM.match(/@word/, os).first().value;
                    var numToken = this.TM.match(/number/, os);
                    var kv = new Lang.EnumItem();
                    kv.value = 1;
                    kv.name = key;
                    if (numToken && numToken.length > 0) {
                        kv.value = parseInt(numToken.first().value);
                    }
                    enumStatement.items.push(kv);
                });
                return enumStatement;
            }
            $fun() {
                var funStatement = new Lang.FunStatement();
                var tokens = this.eat(Lang.getStatementRegex('root.fun'));
                tokens = this.decorateAndModify(tokens, funStatement);
                var nt = this.TM.match(/@word/, tokens).first();
                funStatement.ref(nt);
                funStatement.name = nt.value;
                /***fun  parameters*/
                var parameterToken = tokens.find(x => x.flag == '(');
                if (parameterToken.childs.length > 0) {
                    funStatement.set('parameters', this.TM.parameters(parameterToken.childs));
                }
                /****返回类型和方法体需要加以区分处理 */
                var rc = this.matchFunTypeAndBody();
                funStatement.returnType = rc.returnType;
                funStatement.set('content', rc.content);
                return funStatement;
            }
            $def() {
                var tokens = this.eat(Lang.getStatementRegex('root.def'));
                var defToken = tokens.find(x => x.flag == 'def' || x.flag == 'const');
                var dvs = new List;
                while (true) {
                    if (this.match(/@blank*@word@blank*/)) {
                        var dv = new Lang.DeclareVariable();
                        if (defToken.flag == 'const')
                            dv.modifys.push(Lang.Modify.const);
                        var tokens = this.eat(/@blank*@word@blank*/);
                        var nt = tokens.find(x => x.flag == 'word' || x.flag == 'type');
                        dv.ref(nt);
                        dv.name = nt.value;
                        if (this.match(/\:/)) {
                            this.eat(/\:/);
                            dv.declareType = this.$type();
                        }
                        if (this.match(/@blank*\=@blank*/)) {
                            this.eat(/@blank*\=@blank*/);
                            dv.set('value', this.nextExpress());
                        }
                        ;
                        dvs.push(dv);
                        if (this.match(/@blank*\,@blank*/)) {
                            this.eat(/@blank*\,@blank*/);
                            continue;
                        }
                        else
                            break;
                    }
                    else
                        break;
                }
                return dvs;
            }
        }
        Lang.StatementParser$Declare = StatementParser$Declare;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Lang.Util.List;
        class StatementParser$Statement {
            $if() {
                var ifStatement = new Lang.IFStatement();
                /****
                *
                *  if()  express;?|{ }
                *  [ else if()  express;?|{ } ]...
                *  else  express;?|{ }
                *
                */
                var ifConditionTokens = this.eat(Lang.getStatementRegex('if.condition'));
                ifStatement.ref(ifConditionTokens.find(x => x.flag == 'if'));
                ifStatement.set('ifCondition', this.TM.pickExpressFromBracketOfStatement(ifConditionTokens));
                ifStatement.set('ifContent', this.eatBlockOrStatement());
                var elseIfConditions = new List;
                var elseIfContens = new List;
                while (true) {
                    var index = this.index;
                    if (this.match(Lang.getStatementRegex('if.elseCondition'))) {
                        var ifElseTokens = this.eat(Lang.getStatementRegex('if.elseCondition'));
                        elseIfConditions.push(this.TM.pickExpressFromBracketOfStatement(ifElseTokens));
                        elseIfContens.push(this.eatBlockOrStatement());
                    }
                    else
                        break;
                    if (index == this.index) {
                        throw new Error('else if match over time');
                    }
                }
                ;
                ifStatement.set('elseIFConditions', elseIfConditions);
                ifStatement.set('elseIFContents', elseIfContens);
                if (this.match(Lang.getStatementRegex('if.else'))) {
                    this.eat(Lang.getStatementRegex('if.else'));
                    ifStatement.set('elseContent', this.eatBlockOrStatement());
                }
                return ifStatement;
            }
            $for() {
                var forStatement = new Lang.ForStatement();
                var conditionTokens = this.eat(Lang.getStatementRegex('for.condition'));
                forStatement.ref(conditionTokens);
                var brakctToken = conditionTokens.find(x => x.flag == '(');
                var ts = brakctToken.childs.split(x => x.flag == ';');
                ts.each((ds, i) => {
                    if (i == 0) {
                        forStatement.set('init', this.TM.statement(ds));
                    }
                    else if (i == 2) {
                        forStatement.set('condition', this.TM.express(ds));
                    }
                    else if (i == 1) {
                        forStatement.set('post', this.TM.statement(ds));
                    }
                });
                /***content */
                var bs = this.eatBlockOrStatement();
                forStatement.set('content', bs);
                return forStatement;
            }
            $while() {
                var whileStatement = new Lang.WhileStatement();
                var conditionTokens = this.eat(Lang.getStatementRegex('while.condition'));
                whileStatement.ref(conditionTokens.find(x => x.flag == 'while'));
                var brakctToken = conditionTokens.find(x => x.flag == '(');
                whileStatement.set('condition', this.TM.express(brakctToken.childs));
                whileStatement.set('content', this.eatBlockOrStatement());
                return whileStatement;
            }
            $when() {
                /****
                * when{
                *    express*->express;?|{ },
                *    ...
                *    default -> express;?|{ },
                * }
                *
                */
                var whenStatement = new Lang.WhenStatement();
                var tokens = this.eat(Lang.getStatementRegex('when.statement'));
                whenStatement.ref(tokens.find(x => x.flag == 'when'));
                var brakctToken = tokens.find(x => x.flag == '{');
                var caseParser = this.createParser();
                caseParser.import(brakctToken.childs);
                var ws = new List;
                while (true) {
                    if (caseParser.eol)
                        break;
                    if (caseParser.match(/((?!\-\>).)+/)) {
                        var exps = caseParser.eat(/((?!\-\>).)+/);
                        var wv = { value: new List(), content: new List() };
                        if (exps.exists(x => x.flag == 'default'))
                            wv.value = new List();
                        else
                            wv.value = exps.split(x => x.flag == ',').toArray(t => this.TM.express(t));
                        caseParser.eat(/\-\>/);
                        wv.content = caseParser.eatBlockOrStatement();
                        ws.push(wv);
                    }
                    else
                        break;
                }
                whenStatement.set('whens', ws);
                return whenStatement;
            }
            $switch() {
                /***
                 * switch(express){
                 *    case express : express;?|{}
                 *    default : express;?|{ }
                 * }
                 *
                 */
                var switchStatement = new Lang.SwitchStatement();
                var tokens = this.eat(Lang.getStatementRegex('switch.statement'));
                switchStatement.ref(tokens.find(x => x.flag == 'switch'));
                var brakctToken = tokens.find(x => x.flag == '(');
                switchStatement.set('value', this.TM.express(brakctToken.childs));
                var contentToken = tokens.find(x => x.flag == '{');
                var caseParser = this.createParser();
                caseParser.import(contentToken.childs);
                var ws = new List;
                while (true) {
                    if (caseParser.eol)
                        break;
                    if (caseParser.match(/@blank*case((?!:).)+/)) {
                        caseParser.eat(/@blank*case/);
                        var tokens = caseParser.eat(/((?!:).)+/);
                        var wv = { case: new List(), content: new List() };
                        var parser = this.createParser();
                        parser.import(tokens);
                        wv.case = parser.commasExpress();
                        caseParser.eat(/@blank*\:@blank*/);
                        var contentTokens = caseParser.eat(/((?!case|default).)+/);
                        if (contentTokens) {
                            wv.content = this.TM.statement(contentTokens);
                        }
                        ws.push(wv);
                    }
                    else if (caseParser.match(/@blank*default@blank*\:/)) {
                        caseParser.eat(/@blank*default@blank*\:/);
                        var contentTokens = caseParser.eat(/((?!case|default).)+/);
                        if (contentTokens) {
                            switchStatement.set('default', this.TM.statement(contentTokens));
                        }
                    }
                    else
                        break;
                }
                switchStatement.set('cases', ws);
                return switchStatement;
            }
            $try() {
                var tryStatement = new Lang.TryStatement();
                var tryTokens = this.eat(Lang.getStatementRegex('try.name'));
                tryStatement.ref(tryTokens.find(x => x.flag == 'try'));
                tryStatement.set('try', this.eatBlockOrStatement());
                var catchs = new List;
                while (true) {
                    var catchParameter = this.eat(Lang.getStatementRegex('try.catch'));
                    if (catchParameter) {
                        catchs.push({
                            paramete: this.TM.parameters(catchParameter.find(x => x.flag == '(').childs).first(),
                            content: this.eatBlockOrStatement()
                        });
                    }
                    else
                        break;
                }
                tryStatement.set('catchs', catchs);
                if (this.match(Lang.getStatementRegex('try.finally'))) {
                    this.eat(Lang.getStatementRegex('try.finally'));
                    tryStatement.set('finally', this.eatBlockOrStatement());
                }
                return tryStatement;
            }
            $break() {
                var tokens = this.eat(Lang.getStatementRegex('root.break'));
                var b = new Lang.BreadkStatement();
                b.ref(tokens.find(x => x.flag == 'break'));
                return b;
            }
            $continue() {
                var tokens = this.eat(Lang.getStatementRegex('root.continue'));
                var c = new Lang.ContinueStatement();
                c.ref(tokens.find(x => x.flag == 'continue'));
                return c;
            }
            $return() {
                var tokens = this.eat(Lang.getStatementRegex('root.return'));
                var returnS = new Lang.ReturnStatement();
                returnS.ref(tokens.find(x => x.flag == 'return'));
                var exp = this.nextExpress();
                returnS.set('result', exp);
                return returnS;
            }
            $throw() {
                var tokens = this.eat(Lang.getStatementRegex('root.throw'));
                var throwS = new Lang.ThrowStatement();
                throwS.ref(tokens.find(x => x.flag == 'throw'));
                throwS.set('throw', this.nextExpress());
                return throwS;
            }
        }
        Lang.StatementParser$Statement = StatementParser$Statement;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        class StatementParser$Common {
            block() {
                var tokens = this.eat(Lang.getStatementRegex('root.block'));
                var bs = new Lang.BlockStatement();
                var bracket = tokens.find(x => x.flag == '{');
                bs.ref(bracket);
                if (bracket)
                    bs.set('content', this.TM.statement(bracket.childs));
                return bs;
            }
            /***提取空白符*/
            blank() {
                this.eatBlank();
            }
            /****吃掉空白的语句 */
            emptyStatement() {
                var tokens = this.eat(Lang.getStatementRegex('root.emptyStatement'));
                var es = new Lang.EmptyStatement();
                es.ref(tokens);
                return es;
            }
        }
        Lang.StatementParser$Common = StatementParser$Common;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Lang.Util.List;
        class StatementParser$Util {
            /****匹配方法返回类型和方法体 */
            matchFunTypeAndBody() {
                /****返回类型和方法体需要加以区分处理 */
                var returnType;
                var content;
                if (this.match(/@blank*\:/)) {
                    this.eat(/@blank*\:/);
                    //说明有类型
                    returnType = this.$type();
                }
                /****fun content */
                if (this.match(/@blank*\{\}/)) {
                    var tokens = this.eat(/@blank*\{\}/);
                    var contentToken = tokens.find(x => x.flag == '{');
                    content = this.TM.statement(contentToken.childs);
                }
                return { returnType, content };
            }
            decorateAndModify(tokens, statement) {
                var decorateTokens = this.TM.matchAll(Lang.getStatementRegex('decorate'), tokens);
                if (decorateTokens) {
                    var decorates = new List;
                    decorateTokens.each(d => {
                        var node = this.TM.decorate(d);
                        decorates.push(node);
                        tokens = tokens.subtract(d);
                    });
                    statement.set('decorates', decorates);
                }
                var modifyTokens = this.TM.matchAll(Lang.getStatementRegex('modify'), tokens);
                if (modifyTokens) {
                    var modifys = new List;
                    modifyTokens.each(d => {
                        d.each(dd => {
                            if (typeof Lang.Modify[dd.value] != 'undefined') {
                                var dv = dd.value;
                                modifys.push(Ve.Lang['Modify'][dv]);
                            }
                        });
                        tokens = tokens.subtract(d);
                    });
                    statement.modifys = modifys;
                }
                var genericTokens = this.TM.match(Lang.getStatementRegex('generic'), tokens);
                if (genericTokens) {
                    var gs = this.TM.generics(genericTokens.find(x => x.flag == '<').childs);
                    if (gs) {
                        statement.set('generics', gs);
                    }
                    tokens = tokens.subtract(genericTokens);
                }
                return tokens;
            }
        }
        Lang.StatementParser$Util = StatementParser$Util;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Lang.Util.List;
        class StatementParser$ExpressCommon {
            funExpress() {
                var index = this.index;
                if (this.match(/fun@blank*\(/)) {
                    var bracketTokens = this.eat(/fun@blank*\(\)/);
                    var returnType;
                    if (this.match(/\:/)) {
                        this.eat(/\:/);
                        returnType = this.$type();
                    }
                    this.eatBlank();
                    if (this.match(/\{\}/)) {
                        var content = this.TM.statement(this.eat(/\{\}/).first().childs);
                        var af = new Lang.AnonymousFunExpress();
                        af.ref(bracketTokens.find(x => x.flag == 'fun'));
                        af.set('parameters', this.TM.parameters(bracketTokens.find(x => x.flag == '(').childs));
                        af.set('content', content);
                        if (returnType)
                            af.returnType = returnType;
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
            $type() {
                var index = this.index;
                this.eatBlank();
                var tokens = new List();
                if (this.match(/\(\)@blank*->/)) {
                    var tokens = this.eat(/\(\)@blank*\-\>/);
                    var tp = new Lang.TypeExpress();
                    tp.args = tokens.find(x => x.flag == '(').childs.split(x => x.flag == ',').toArray(z => {
                        if (z.exists(g => g.flag == ':')) {
                            return {
                                key: z.range(0, z.findIndex(x => x.flag == ':') - 1).toArray(x => x.value).join("").trim(),
                                type: this.TM.typeExpress(z.range(z.findIndex(x => x.flag == ':') + 1))
                            };
                        }
                        return {
                            key: z.toArray(x => x.value).join("").trim(),
                            type: Lang.TypeExpress.create({ name: 'any' })
                        };
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
            arrowFun() {
                this.eat(/@blank+/);
                var index = this.index;
                if (this.match(/\(\)@blank*/)) {
                    var bracketTokens = this.eat(/\(\)@blank*/);
                    var returnType;
                    if (this.match(/\:/)) {
                        this.eat(/\:/);
                        returnType = this.$type();
                    }
                    this.eat(/@blank+/);
                    if (this.match(/\-\>/)) {
                        var ts = this.eat(/\-\>/);
                        this.eat(/@blank+/);
                        var content = this.eatBlockOrStatement();
                        var af = new Lang.AnonymousFunExpress();
                        af.ref(ts);
                        af.set('parameters', this.TM.parameters(bracketTokens.find(x => x.flag == '(').childs));
                        af.set('content', content);
                        if (returnType)
                            af.returnType = returnType;
                        return af;
                    }
                }
                this.back(this.index - index);
            }
        }
        Lang.StatementParser$ExpressCommon = StatementParser$ExpressCommon;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../../token/token.ts'/>
///<reference path='../../util/list.ts'/>
///<reference path='../../util/common.ts'/>
///<reference path='statement/statement.parser.class.ts'/>
///<reference path='statement/statement.parser.declare.ts'/>
///<reference path='statement/statement.parser.statement.ts'/>
///<reference path='statement/statement.parser.common.ts'/>
///<reference path='statement/statement.parser.util.ts'/>
///<reference path='express.parser.ts'/>
///<reference path='express/express.parser.common.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Ve.Lang.Util.List;
        class StatementParser extends Lang.Util.BaseEvent {
            constructor() {
                super();
                this.tokens = new List;
                this.nodes = new List;
                this.syntaxContext = 'root';
                this.pos = 0;
                this.isErrored = false;
                this.load(Lang.veStatementSyntax);
            }
            load(syntax) {
                this.syntax = syntax;
            }
            onError(error, token) {
                this.isErrored = true;
                var errorToken = token || this.currentToken || this.prevToken;
                if (!errorToken) {
                    this.emit('error', error);
                }
                else {
                    this.emit('error', error, { col: errorToken.col, row: errorToken.row }, errorToken);
                }
            }
            import(tokens) {
                this.tokens = tokens;
            }
            parse(tokens) {
                this.import(tokens);
                this.next();
                return this.nodes;
            }
            /***执行下一个语句 */
            next(actionName) {
                while (true) {
                    var index = this.index;
                    if (this.eol) {
                        this.end();
                        break;
                    }
                    var node = this.nextOne(actionName);
                    if (node)
                        this.append(node);
                    if (this.eol) {
                        this.end();
                        break;
                    }
                    if (index == this.index) {
                        //说明一个也没有匹配到，说明停止走动了，
                        console.warn(this.restValues, this.syntaxContext, this.restTokens);
                        this.onError(new Error('not match statement'));
                    }
                }
            }
            nextOne(actionName) {
                if (typeof actionName == 'undefined') {
                    var rest = this.getFlags();
                    var matchText;
                    var match = this.syntax[this.syntaxContext].find(x => {
                        if (typeof x.match != 'undefined') {
                            var r = this.matchText(rest, x.match);
                            if (typeof r != 'undefined') {
                                matchText = r;
                                return true;
                            }
                        }
                    });
                    /***如果没有匹配，则直接取没有match的 */
                    if (typeof match == 'undefined') {
                        match = this.syntax[this.syntaxContext].find(x => typeof x.match == 'undefined');
                    }
                    if (match) {
                        actionName = match.name;
                    }
                }
                if (typeof this['$' + actionName] == 'function')
                    actionName = '$' + match.name;
                if (typeof this[actionName] == 'function') {
                    var index = this.index;
                    var node = this[actionName]();
                    if (index == this.index) {
                        console.log(actionName, this.restValues, this.restFlags);
                        this.onError(new Error('the statement not eat tokens'));
                    }
                    if (!node && actionName != 'blank') {
                        console.log(actionName, 'not return node...');
                    }
                    return node;
                }
                else {
                    if (this.eol)
                        return;
                    console.trace(this.syntaxContext, this.restValues, this.restFlags, actionName);
                    this.onError(new Error('not found parse name:' + actionName));
                }
            }
            eat(match) {
                var fgs = this.getFlags();
                var matchText = this.matchText(fgs, match);
                if (matchText) {
                    var tokens = this.matchTokens(matchText);
                    this.pos += tokens.length;
                    return tokens;
                }
                return null;
            }
            eatBlockOrStatement() {
                var result;
                if (this.match(Lang.getStatementRegex('block')))
                    result = this.TM.pickStatementFromBlockOfStatement(this.eat(Lang.getStatementRegex('block')));
                else {
                    this.eatBlank();
                    result = this.nextOne();
                }
                if (!result)
                    result = new List;
                if (!(result instanceof List))
                    result = new List(result);
                return result;
            }
            eatBlank() {
                return this.eat(/@blank+/);
            }
            eatEmptyStatement() {
                this.eat(/@blank*;@blank*/);
            }
            eatOne() {
                var token = this.currentToken;
                this.pos += 1;
                return token;
            }
            match(match) {
                var fgs = this.getFlags();
                var matchText = this.matchText(fgs, match);
                return matchText ? true : false;
            }
            end() {
                if (this.nodes.exists(x => x instanceof Lang.PackageStatement)) {
                    var pa = this.nodes.find(x => x instanceof Lang.PackageStatement);
                    var nodes = this.nodes.findAll(x => !(x instanceof Lang.PackageStatement));
                    pa.set('content', nodes);
                    this.nodes = new List(pa);
                }
            }
            append(node) {
                if (node instanceof List)
                    node.each(n => {
                        this.nodes.append(n);
                    });
                else
                    this.nodes.append(node);
            }
            range(start, end) {
                return this.tokens.range(start, end);
            }
            /**
             * @param pos 如果为正的，将向前滚，如果负的，将向后滚
             * */
            move(pos) {
                this.pos += pos;
            }
            back(pos) {
                this.move(0 - pos);
            }
            get index() {
                return this.pos;
            }
            get prevToken() {
                return this.tokens.eq(this.pos - 1);
            }
            get currentToken() {
                return this.tokens.eq(this.pos);
            }
            get restTokens() {
                return this.tokens.range(this.pos);
            }
            get restFlags() {
                return this.restTokens.toArray(x => x.flag).join("");
            }
            get restValues() {
                return this.restTokens.map(r => r.value).join("");
            }
            get eol() {
                return this.isErrored == true || this.pos >= this.tokens.length;
            }
            matchTokens(matchText) {
                var str = '';
                var tokens = new List;
                for (var i = this.pos; i < this.tokens.length; i++) {
                    str += this.tokens.eq(i).flag;
                    tokens.push(this.tokens.eq(i));
                    if (str == matchText) {
                        break;
                    }
                }
                return tokens;
            }
            matchText(code, match) {
                if (Array.isArray(match)) {
                    /***排序，如果匹配多个时，先从长的文本串开始 */
                    match.sort((x, y) => {
                        if (typeof x == 'string' && typeof y == 'string') {
                            if (x.length > y.length)
                                return -1;
                            else
                                return 1;
                        }
                        return 0;
                    });
                    for (var i = 0; i < match.length; i++) {
                        var m = this.matchText(code, match[i]);
                        if (typeof m != 'undefined')
                            return m;
                    }
                    return undefined;
                }
                else if (match instanceof RegExp) {
                    var r = code.match(Lang.getLangSyntaxRegex(Lang.veStatementSyntax, match));
                    if (r && r[0] && r.index == 0)
                        return r[0];
                }
                else if (typeof match == 'string') {
                    if (match.startsWith('@')) {
                        var sn = this.syntax[match.replace('@', '')];
                        if (sn) {
                            return this.matchText(code, sn);
                        }
                    }
                    if (code.startsWith(match))
                        return match;
                }
            }
            getFlags() {
                var str = '';
                for (var i = this.pos; i < this.tokens.length; i++) {
                    str += this.tokens.eq(i).flag;
                }
                return str;
            }
            createParser() {
                var parser = new StatementParser();
                var self = this;
                parser.on('error', function () {
                    self.emit('error', ...arguments);
                });
                return parser;
            }
            get TM() {
                var tm = new Lang.TokenMatch();
                var self = this;
                tm.on('error', function () {
                    self.emit('error', ...arguments);
                });
                return tm;
            }
        }
        Lang.StatementParser = StatementParser;
        Lang.Util.Inherit(StatementParser, Lang.StatementParser$Class);
        Lang.Util.Inherit(StatementParser, Lang.StatementParser$Declare);
        Lang.Util.Inherit(StatementParser, Lang.StatementParser$Statement);
        Lang.Util.Inherit(StatementParser, Lang.StatementParser$Common);
        Lang.Util.Inherit(StatementParser, Lang.StatementParser$Util);
        Lang.Util.Inherit(StatementParser, Lang.StatementParser$Express);
        Lang.Util.Inherit(StatementParser, Lang.StatementParser$ExpressCommon);
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../../token/syntax.regex.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        /***
        * @param  s表示空格
        * @param  n表示换行符
        * @param  blank表示空白符（包括换符号和空格符）
        * @param  decorate 表示注解
        * @param  modify 表示方法的修辞符
        *
        */
        Lang.veStatementSyntax = {
            blank: /space|line|comment/,
            white: /space|line/,
            modify: /(decorate|out|readonly|inner|static|public|protected|private|override|partial|sealed)@blank*/,
            generic: /\<\>@blank*/,
            word: /word|type/,
            wordType: /word|type|void/,
            namespace: /@word(@blank*\.@blank*@word)*@blank*/,
            namespaceType: /@wordType(@blank*\.@blank*@word)*@blank*/,
            /****可以自定义操作符的符号 */
            symbols: /[\+\-\*%\/\|&\>\<\=!]+|(as|is|in|and|xor|or)/,
            block: /@blank*\{\}@blank*/,
            decorate: /#@namespace(\(\)@blank*)?(;@blank*)?/,
            root: [
                { name: 'package', match: /package@blank+@namespace(;@blank*)?/ },
                { name: 'use', match: /use/ },
                { name: 'fun', match: /@decorate*@modify*fun@blank+@word@generic?\(\)/ },
                { name: 'enum', match: /@decorate*@modify*enum@blank+@word@blank*\{\}/ },
                { name: 'class', match: /@decorate*@modify*(class|interface)@blank+@word@blank*@generic?(extends@blank*@word@blank*)?\{\}/ },
                { name: 'def', match: /def|const/ },
                { name: 'if', match: /if/ },
                { name: 'when', match: /when/ },
                { name: 'while', match: /while/ },
                { name: 'for', match: /for/ },
                { name: 'switch', match: /switch/ },
                { name: 'try', match: /try/ },
                { name: 'break', match: /break/ },
                { name: 'continue', match: /continue/ },
                { name: 'return', match: /return/ },
                { name: 'throw', match: /throw/ },
                { name: 'block', match: /@block/ },
                { name: 'blank', match: /@blank+/ },
                { name: 'emptyStatement', match: /;/ },
                { name: 'express' },
            ],
            class: [
                { name: 'operator', match: /@decorate*@modify*operator@blank+@symbols@blank*\(\)/ },
                { name: 'field', match: /@decorate*@modify*(get|set)@blank+@word@blank*\(\)/ },
                { name: 'method', match: /@decorate*@modify*(@word|ctor|get|set)@blank*@generic?\(\)/ },
                { name: 'property', match: /@decorate*@modify*@word/ },
                { name: 'blank', match: /@blank+/ },
                { name: 'emptyStatement', match: /;/ },
            ],
            if: [
                { name: 'condition', match: /if@blank*\(\)/ },
                { name: 'elseCondition', match: /@blank*else@blank+if@blank*\(\)/ },
                { name: 'else', match: /@blank*else/ }
            ],
            for: [
                { name: 'condition', match: /for@blank*\(\)/ }
            ],
            while: [
                { name: 'condition', match: /while@blank*\(\)/ }
            ],
            switch: [
                { name: 'statement', match: /switch@blank*\(\)@blank*\{\}/ }
            ],
            when: [
                { name: 'statement', match: /when@blank*\{\}/ }
            ],
            try: [
                { name: 'name', match: /try/ },
                { name: 'catch', match: /catch@blank*\(\)/ },
                { name: 'finally', match: /finally/ }
            ]
        };
        Ve.Lang.convertLangSyntax(Lang.veStatementSyntax);
        Lang.veOperatorPrecedences = [
            { name: '[', match: /\[\]/, precedence: 16 },
            { name: '{', match: /\{\}/, precedence: 16 },
            { name: '(', match: /\(\)/, precedence: 16 },
            { name: 'new', match: 'new', precedence: 15, operand: 1 },
            { name: '==', match: '==', precedence: 9, direction: 0, operand: 2 },
            { name: '@', match: '@', precedence: 16, operand: 1 },
            { name: '?.', match: '?.', precedence: 16, operand: 2 },
            { name: '...', match: '...', precedence: 15, operand: 1 },
            { name: '..', match: '..', precedence: 15, operand: 2 },
            { name: '.', match: '.', precedence: 16, operand: 2 },
            { name: '++', match: '++', precedence: 15.5, operand: 1 },
            { name: '--', match: '--', precedence: 15.5, operand: 1 },
            { name: '=', match: '=', precedence: 2, direction: 1, operand: 2 },
            { name: '+=', match: '+=', precedence: 2, direction: 1, operand: 2 },
            { name: '-=', match: '-=', precedence: 2, direction: 1, operand: 2 },
            { name: '**=', match: '**=', precedence: 2, direction: 1, operand: 2 },
            { name: '*=', match: '*=', precedence: 2, direction: 1, operand: 2 },
            { name: '%=', match: '%=', precedence: 2, direction: 1, operand: 2 },
            { name: '/=', match: '/=', precedence: 2, direction: 1, operand: 2 },
            { name: '||', match: '||', precedence: 4, direction: 0, operand: 2 },
            { name: '&&', match: '&&', precedence: 5, direction: 0, operand: 2 },
            /**类型空值运算符 */
            { name: '~~', match: '~~', precedence: 16, operand: 2 },
            { name: '+', match: '+', precedence: 12, direction: 0, operand: 2 },
            { name: '-', match: '-', precedence: 12, direction: 0, operand: 2 },
            { name: '/', match: '/', precedence: 13, direction: 0, operand: 2 },
            { name: '%', match: '%', precedence: 13, direction: 0, operand: 2 },
            { name: '**', match: '**', precedence: 13, direction: 0, operand: 2 },
            { name: '*', match: '*', precedence: 13, direction: 0, operand: 2 },
            { name: '??', match: '??', precedence: 14, direction: 0, operand: 2 },
            { name: '!=', match: '!=', precedence: 9, direction: 0, operand: 2 },
            { name: '!', match: '!', precedence: 15, operand: 1 },
            { name: '<=', match: '<=', precedence: 10, direction: 0, operand: 2 },
            { name: '>=', match: '>=', precedence: 10, direction: 0, operand: 2 },
            { name: '<', match: '<', precedence: 10, direction: 0, operand: 2 },
            { name: '>', match: '>', precedence: 10, direction: 0, operand: 2 },
            { name: 'or', match: 'or', precedence: 4, direction: 0, operand: 2 },
            { name: 'xor', match: 'xor', precedence: 4.5, direction: 0, operand: 2 },
            { name: 'and', match: 'and', precedence: 5, direction: 0, operand: 2 },
            { name: 'as', match: 'as', precedence: 9, direction: 0, operand: 2 },
            { name: 'is', match: 'is', precedence: 9, direction: 0, operand: 2 },
            { name: 'nas', match: /not@blank+as/, precedence: 9, direction: 0, operand: 2 },
            { name: 'nis', match: /not@blank+is/, precedence: 9, direction: 0, operand: 2 },
            { name: 'nor', match: /not@blank+or/, precedence: 4, direction: 0, operand: 2 },
            { name: 'nxor', match: /not@blank+or/, precedence: 4.5, direction: 0, operand: 2 },
            { name: 'nand', match: /not@blank+and/, precedence: 5, direction: 0, operand: 2 },
            { name: '?:', match: '?', precedence: 3, direction: 0, operand: 3 },
            { name: '?:', match: ':', precedence: 3, direction: 0, operand: 3 },
        ];
        Lang.veOperatorPrecedences.sort((x, y) => {
            if (x.match instanceof RegExp && typeof y.match == 'string')
                return -1;
            else if (x.match instanceof RegExp && y.match instanceof RegExp)
                return 0;
            else if (typeof x.match == 'string' && typeof y.match == 'string' && x.match.length > y.match.length)
                return -1;
            else
                return 1;
        });
        function getStatementRegex(namespace) {
            var ns = namespace.split(/\./g);
            var n = Lang.veStatementSyntax[ns[0]];
            if (Array.isArray(n)) {
                return n.find(x => x.name == ns[1]).match;
            }
            else
                return n;
        }
        Lang.getStatementRegex = getStatementRegex;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var List = Lang.Util.List;
        function matchFlag(code, match) {
            if (Array.isArray(match)) {
                for (var i = 0; i < match.length; i++) {
                    var r = matchFlag(code, match[i]);
                    if (typeof r != 'undefined')
                        return r;
                }
            }
            else if (typeof match == 'string') {
                if (code.includes(match))
                    return match;
            }
            else if (match instanceof RegExp) {
                var ma = code.match(Lang.getLangSyntaxRegex(Lang.veStatementSyntax, match));
                if (ma && ma[0])
                    return ma[0];
            }
        }
        class TokenMatch extends Ve.Lang.Util.BaseEvent {
            pickExpressFromBracketOfStatement(tokens) {
                var bracket = tokens.find(x => x.flag == '(');
                if (bracket) {
                    return this.express(bracket.childs);
                }
                return null;
            }
            pickStatementFromBlockOfStatement(tokens) {
                var bracket = tokens.find(x => x.flag == '{');
                if (bracket) {
                    return this.statement(bracket.childs);
                }
                return null;
            }
            statement(tokens) {
                var parser = this.createParser();
                return parser.parse(tokens);
            }
            express(tokens) {
                var parser = this.createParser();
                parser.import(tokens);
                return parser.nextExpress();
            }
            /****tokens */
            /***
               * 判断是否存匹配
               */
            isMatch(match, tokens) {
                var tokenText = tokens.map(t => t.flag).join("");
                var matchText = matchFlag(tokenText, match);
                if (matchText) {
                    return true;
                }
                return false;
            }
            /***获取匹配的token数量 */
            match(match, tokens) {
                var start = 0;
                var tokenText = tokens.map(t => t.flag).join("");
                var matchText = matchFlag(tokenText, match);
                //console.log(tokens, match,tokenText,matchText);
                var rest = tokenText;
                if (matchText) {
                    while (true) {
                        if (rest.startsWith(matchText)) {
                            break;
                        }
                        else {
                            rest = rest.substring((tokens.eq(start).flag).length);
                            start += 1;
                        }
                    }
                    rest = '';
                    var ts = new List;
                    for (var i = start; i < tokens.length; i++) {
                        rest += tokens.eq(i).flag;
                        ts.push(tokens.eq(i));
                        if (rest == matchText) {
                            break;
                        }
                    }
                    ;
                    return ts;
                }
                else {
                    return null;
                }
            }
            matchAll(match, tokens) {
                var ts = new List;
                tokens = tokens.toArray(t => t);
                while (true) {
                    var ms = this.match(match, tokens);
                    if (ms) {
                        ts.push(ms);
                        tokens = tokens.subtract(ms);
                    }
                    else
                        break;
                }
                return ts;
            }
            /***
             * 过滤(是过滤所有)
             */
            filter(match, tokens) {
                var ts = this.matchAll(match, tokens);
                ts.each(t => {
                    tokens = tokens.subtract(t);
                });
                return tokens;
            }
            /***
             * 解析类型
             */
            typeExpress(tokens) {
                /****
                 *
                 * {}[]
                 * word[]
                 */
                if (tokens.exists(x => x.flag == '->')) {
                    var brakectIndex = tokens.findIndex(x => x.flag == '(');
                    var arrowIndex = tokens.findIndex(x => x.flag == '->');
                    var tp = new Lang.TypeExpress();
                    tp.ref(tokens);
                    tp.args = tokens.eq(brakectIndex).childs.split(x => x.flag == ',').toArray(x => {
                        var sp = x.findIndex(x => x.flag == ':');
                        if (sp < 0)
                            sp = x.length;
                        return {
                            key: x.range(0, sp).toArray(x => x.value).join("").trim(),
                            type: x.exists(x => x.flag == ':') ? this.typeExpress(x.range(sp + 1, x.length)) : Lang.TypeExpress.create({ name: 'any' })
                        };
                    });
                    tp.returnType = this.typeExpress(tokens.range(arrowIndex + 1));
                    return tp;
                }
                else if (tokens.exists(x => x.flag == '[')) {
                    var tp = new Lang.TypeExpress();
                    tp.ref(tokens);
                    var index = tokens.findLastIndex(x => x.flag == '[');
                    tokens = tokens.removeAll((x, i) => i >= index);
                    tp.generics = new List(this.typeExpress(tokens));
                    tp.unionType = Lang.TypeExpress.create({ name: 'Array' });
                    return tp;
                }
                else if (tokens.exists(x => x.flag == '(')) {
                    return this.typeExpress(tokens.find(x => x.flag == '(').childs);
                }
                else if (tokens.exists(x => x.flag == '{')) {
                    var tp = new Lang.TypeExpress();
                    tp.ref(tokens);
                    var contentToken = tokens.find(x => x.flag == '{');
                    var ts = contentToken.childs.split(x => x.flag == ',');
                    tp.props = new List();
                    ts.each(tk => {
                        var tas = tk.split(x => x.flag == ':');
                        var key = tas.eq(0).find(x => x.flag == 'word' || x.flag == 'type').value;
                        var valueType = this.typeExpress(tas.eq(1));
                        tp.props.push({ key, type: valueType });
                    });
                    return tp;
                }
                else if (tokens.exists(x => x.flag == '<')) {
                    var name = this.match(/@namespace/, tokens).map(t => t.value).join('').trim().replace(/[ \t]/g, '');
                    var tp = new Lang.TypeExpress();
                    tp.ref(tokens);
                    tp.unionType = Lang.TypeExpress.create({ name });
                    var gs = this.match(/\</, tokens).eq(0);
                    tp.generics = gs.childs.split(x => x.flag == ',').toArray(m => this.typeExpress(m));
                    return tp;
                }
                else {
                    var tp = new Lang.TypeExpress();
                    tp.ref(tokens);
                    var wordTypes = this.match(/@namespaceType/, tokens);
                    if (!wordTypes) {
                        console.trace(tokens, tokens.map(t => t.flag).join(""), "||", tokens.map(x => x.value).join(""));
                    }
                    tp.name = wordTypes.map(x => x.value).join("").trim().replace(/[ \t]/g, '');
                    return tp;
                }
            }
            /****
            * 解析数据
            */
            dataExpress(tokens) {
                if (tokens.exists(x => x.flag == '[')) {
                    var ae = new Lang.ArrayExpress();
                    ae.ref(tokens.find(x => x.flag == '['));
                    var ts = tokens.find(x => x.flag == '[').childs.split(x => x.flag == ',');
                    ts.each(ds => {
                        var exp = this.express(ds);
                        ae.append(exp);
                        ae.items.push(exp);
                    });
                    return ae;
                }
                else if (tokens.exists(x => x.flag == '{')) {
                    var oe = new Lang.ObjectExpress();
                    oe.ref(tokens.find(x => x.flag == '{'));
                    var ts = tokens.find(x => x.flag == '{').childs.split(x => x.flag == ',');
                    ts.each(ds => {
                        if (ds.exists(x => x.flag == ':')) {
                            var i = ds.findIndex(x => x.flag == ':');
                            var dss = new List(ds.range(0, i - 1), ds.range(i + 1, ds.length));
                            var keyTokens = dss.eq(0);
                            var key;
                            if (keyTokens.exists(x => x.flag == '"')) {
                                key = keyTokens.find(x => x.flag == '"').childs.eq(0).value;
                            }
                            else {
                                key = this.match(/@word/, dss.eq(0)).eq(0).value;
                            }
                            var value = this.express(dss.eq(1));
                            oe.append(value);
                            oe.items.push({ key, value });
                        }
                        else if (ds.exists(x => x.flag == '(')) {
                            var dgs = this.match(/@blank*@word@blank*\(\)@blank*/, ds);
                            var key = this.match(/@word/, dgs).eq(0).value;
                            var af = new Lang.AnonymousFunExpress();
                            af.set('parameters', this.parameters(dgs.find(x => x.flag == '(').childs));
                            var parser = this.createParser();
                            parser.import(ds.range(ds.findIndex(x => x === dgs.last()) + 1));
                            var rc = parser.matchFunTypeAndBody();
                            af.returnType = rc.returnType;
                            af.set('content', rc.content);
                            oe.append(af);
                            oe.items.push({ key, value: af });
                        }
                        else {
                            var exp = this.express(ds);
                            oe.append(exp);
                            oe.items.push({ key: this.match(/@word/, ds).eq(0).value, value: exp });
                        }
                    });
                    return oe;
                }
                else {
                    if (tokens.exists(x => x.flag == '"')) {
                        var quoteToken = tokens.find(x => x.name.endsWith('.open') && x.name.startsWith('string.'));
                        var quoteTokenUnit = quoteToken.next.next;
                        var typeName = 'string';
                        if (quoteTokenUnit && (quoteTokenUnit.flag == 'word' || quoteTokenUnit.flag == 'type'))
                            typeName = quoteTokenUnit.value;
                        if (quoteToken) {
                            if (quoteToken.childs.exists(x => x.flag == '@{' || x.name == 'string.variable')) {
                                //说明上面是string.template
                                var cte = new Lang.StringTemplateExpress();
                                cte.ref(quoteToken);
                                var strings = new List;
                                quoteToken.childs.each(ch => {
                                    if (ch.flag == '}')
                                        return;
                                    if (ch.flag == '@{') {
                                        strings.push(this.express(ch.childs));
                                    }
                                    else if (ch.name == 'string.variable') {
                                        var nc = new Lang.NameCall();
                                        nc.ref(ch);
                                        nc.name = ch.value;
                                        if (nc.name.startsWith('@'))
                                            nc.name = nc.name.substring(1);
                                        strings.push(nc);
                                    }
                                    else {
                                        var constant = new Lang.Constant();
                                        constant.ref(ch);
                                        constant.constantType = Lang.TypeExpress.create({ name: 'string' });
                                        constant.value = ch.value;
                                        strings.push(constant);
                                    }
                                });
                                cte.set('strings', strings);
                                cte.stringType = Lang.TypeExpress.create({ name: typeName });
                                return cte;
                            }
                            else {
                                //下面是纯字符串
                                var str = quoteToken.childs.toArray(x => x.value).join("");
                                var constant = new Lang.Constant();
                                constant.ref(quoteToken);
                                constant.constantType = Lang.TypeExpress.create({ name: typeName });
                                constant.value = str;
                                return constant;
                            }
                        }
                    }
                    else if (tokens.exists(x => x.flag == 'number')) {
                        var numberToken = tokens.find(x => x.flag == 'number');
                        var cs = new Lang.Constant();
                        cs.ref(numberToken);
                        cs.value = numberToken.value.match(/\d+([\.。]\d+)?([eE][\-+]?\d+)?/)[0];
                        var typeName = numberToken.value.replace(cs.value, '');
                        cs.value = parseFloat(numberToken.value);
                        if (!typeName) {
                            if (cs.value.toString().indexOf('.') > -1)
                                typeName = 'number';
                            else
                                typeName = 'int';
                        }
                        cs.constantType = Lang.TypeExpress.create({ name: typeName });
                        return cs;
                    }
                    else if (tokens.exists(x => x.flag == 'true' || x.flag == 'false')) {
                        var cs = new Lang.Constant();
                        cs.ref(tokens.find(x => x.flag == 'true' || x.flag == 'false'));
                        cs.value = tokens.exists(x => x.flag == 'true') ? true : false;
                        cs.constantType = Lang.TypeExpress.create({ name: 'bool' });
                        return cs;
                    }
                    else if (tokens.exists(x => x.flag == 'null')) {
                        var cs = new Lang.Constant();
                        cs.ref(tokens.find(x => x.flag == 'null'));
                        cs.value = null;
                        cs.constantType = Lang.TypeExpress.create({ name: 'Null' });
                        return cs;
                    }
                    else if (tokens.exists(x => x.flag == '~~')) {
                        var cs = new Lang.Constant();
                        cs.ref(tokens.find(x => x.flag == '~~'));
                        cs.value = null;
                        cs.constantType = Lang.TypeExpress.create({ name: tokens.find(x => x.flag == 'word' || x.flag == 'type').value });
                        return cs;
                    }
                }
            }
            decorate(tokens) {
                var dc = new Lang.DecorateStatement();
                dc.ref(tokens.find(x => x.flag == '#'));
                dc.name = this.match(/@namespace/, tokens).toArray(x => x.value).join("");
                var br = tokens.find(x => x.flag == '(');
                if (br) {
                    dc.arguments = new List();
                    var ts = br.childs.split(x => x.flag == ',');
                    ts.each(ds => {
                        if (ds.exists(x => x.flag == '=')) {
                            var index = ds.findIndex(x => x.flag == '=');
                            dc.arguments.push(this.dataExpress(ds.range(index + 1, ds.length)));
                        }
                        else {
                            dc.arguments.push(this.dataExpress(ds));
                        }
                    });
                }
                return dc;
            }
            generics(tokens) {
                var gs = new List;
                var ws = this.matchAll(/@namespace/, tokens);
                ws.each(wd => {
                    var gc = new Lang.Generic();
                    gc.name = wd.map(x => x.value).join("").trim().replace(/[ \t]/, '');
                    gs.push(gc);
                });
                return gs;
            }
            parameters(tokens) {
                /***
                *  a:string='eeee',c:bool=false,g?:bool=true,...args:string[]
                */
                var ps = new List;
                var ts = tokens.split(x => x.flag == ',');
                ts.each(ds => {
                    var pa = new Lang.Parameter();
                    ps.push(pa);
                    if (ds.exists(x => x.flag == '=')) {
                        var valueTokens = this.match(/\=.*$/, ds);
                        ds = ds.subtract(valueTokens);
                        valueTokens = this.filter('=', valueTokens);
                        pa.default = this.dataExpress(valueTokens);
                    }
                    if (ds.exists(x => x.flag == ':')) {
                        var typeTokens = this.match(/\:.*$/, ds);
                        ds = ds.subtract(typeTokens);
                        typeTokens = this.filter(':', typeTokens);
                        pa.valueType = this.typeExpress(typeTokens);
                    }
                    if (ds.exists(x => x.flag == '?'))
                        pa.optional = true;
                    if (ds.exists(x => x.flag == '...'))
                        pa.rest = true;
                    var nameToken = this.match(/@word|this/, ds).eq(0);
                    pa.ref(nameToken);
                    pa.name = nameToken.value;
                });
                return ps;
            }
            createParser() {
                var parser = new Lang.StatementParser();
                var self = this;
                parser.on('error', function () {
                    self.emit('error', ...arguments);
                });
                return parser;
            }
        }
        Lang.TokenMatch = TokenMatch;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var List = Lang.Util.List;
            class GenerateLang extends Ve.Lang.Util.BaseEvent {
                constructor() {
                    super(...arguments);
                    this.libs = new List();
                }
                import(la) {
                    for (var n in la) {
                        var sp = this.libs.find(x => x.ns == n);
                        if (!sp) {
                            sp = { ns: n, apis: {} };
                            this.libs.push(sp);
                        }
                        for (let m in la[n]) {
                            sp.apis[m] = la[n][m];
                        }
                    }
                }
                renderClassProp(onlyName, obj) {
                    var ap;
                    for (var i = 0; i < this.libs.length; i++) {
                        var lib = this.libs.eq(i);
                        if (onlyName.startsWith(lib.ns)) {
                            var nb = onlyName.replace(lib.ns + ".", '');
                            if (typeof lib.apis[nb] != 'undefined') {
                                ap = lib.apis[nb];
                            }
                        }
                    }
                    return Lang.Razor.RazorTemplate.compile(ap, obj);
                }
                generateMethod(node, callExpress, render) {
                    var callers = node.nameCallers;
                    callers.each(cal => {
                        render.append(cal);
                    });
                    var names = new List();
                    var inferType;
                    var nameCode = '';
                    var searchKey = (key, last) => {
                        if (inferType) {
                            if (inferType.name) {
                                if (last == true && callExpress instanceof Lang.MethodCallExpress) {
                                    var cla = node.queryName(inferType.name, new List(Lang.NodeType.class));
                                    var pros = cla.propertys.findAll(x => (x instanceof Lang.ClassMethod) && x.isPublic && !x.isStatic && x.name == key);
                                    var pro = pros.find(x => Lang.InferType.InferTypeMethodCallFunTypeIsCompatibility(callExpress, x, inferType.generics));
                                    if (pro) {
                                        inferType = pro.inferType().retunType;
                                        var cm = pro;
                                        var obj = { caller: nameCode };
                                        callExpress.argements.each((arg, i) => {
                                            obj[cm.parameters.eq(i).name] = render.express(arg);
                                        });
                                        nameCode = this.renderClassProp(pro.onlyName, obj);
                                    }
                                }
                                else if (last == true && callExpress instanceof Lang.NewCallExpress) {
                                    var cla = node.queryName(inferType.name, new List(Lang.NodeType.class));
                                    var pros = cla.propertys.findAll(x => (x instanceof Lang.ClassMethod) && x.isCtor && x.isPublic);
                                    var pro = pros.find(x => Lang.InferType.InferTypeMethodCallFunTypeIsCompatibility(callExpress.caller, x, inferType.generics));
                                    if (pro) {
                                        inferType = pro.inferType().retunType;
                                        var cm = pro;
                                        var obj = { caller: nameCode };
                                        callExpress.caller.argements.each((arg, i) => {
                                            obj[cm.parameters.eq(i).name] = render.express(arg);
                                        });
                                        nameCode = this.renderClassProp(pro.onlyName, obj);
                                    }
                                }
                                else {
                                    var cla = node.queryName(inferType.name, new List(Lang.NodeType.class));
                                    if (!cla) {
                                        console.log(inferType.name, node, cla);
                                    }
                                    var pro = cla.propertys.find(x => x instanceof Lang.ClassProperty && x.isPublic && !x.isStatic && x.isName(key));
                                    if (pro) {
                                        inferType = pro.inferType();
                                        var obj = { caller: nameCode };
                                        nameCode = this.renderClassProp(pro.onlyName, { caller: nameCode });
                                    }
                                }
                            }
                            else if (inferType.unionType) {
                                /***
                                 * 数组泛型类型
                                 */
                                if (last == true && callExpress instanceof Lang.MethodCallExpress) {
                                    var cla = node.queryName(inferType.unionType.name, new List(Lang.NodeType.class));
                                    var pros = cla.propertys.findAll(x => (x instanceof Lang.ClassMethod) && x.isPublic && !x.isStatic && x.name == key);
                                    var pro = pros.find(x => Lang.InferType.InferTypeMethodCallFunTypeIsCompatibility(callExpress, x, inferType.generics));
                                    if (pro) {
                                        inferType = pro.inferType().retunType;
                                        var cm = pro;
                                        var obj = { caller: nameCode };
                                        callExpress.argements.each((arg, i) => {
                                            obj[cm.parameters.eq(i).name] = render.express(arg);
                                        });
                                        nameCode = this.renderClassProp(pro.onlyName, obj);
                                    }
                                }
                                else if (last == true && callExpress instanceof Lang.NewCallExpress) {
                                    var cla = node.queryName(inferType.unionType.name, new List(Lang.NodeType.class));
                                    var pros = cla.propertys.findAll(x => (x instanceof Lang.ClassMethod) && x.isCtor && x.isPublic);
                                    var pro = pros.find(x => Lang.InferType.InferTypeMethodCallFunTypeIsCompatibility(callExpress.caller, x, inferType.generics));
                                    if (pro) {
                                        inferType = pro.inferType().retunType;
                                        var cm = pro;
                                        var obj = { caller: nameCode };
                                        callExpress.caller.argements.each((arg, i) => {
                                            obj[cm.parameters.eq(i).name] = render.express(arg);
                                        });
                                        nameCode = this.renderClassProp(pro.onlyName, obj);
                                    }
                                }
                                else {
                                    var cla = node.queryName(inferType.unionType.name, new List(Lang.NodeType.class));
                                    if (!cla) {
                                        console.log(inferType.name, node, cla);
                                    }
                                    var pro = cla.propertys.find(x => x instanceof Lang.ClassProperty && x.isPublic && !x.isStatic && x.isName(key));
                                    if (pro) {
                                        inferType = pro.inferType();
                                        var obj = { caller: nameCode };
                                        nameCode = this.renderClassProp(pro.onlyName, { caller: nameCode });
                                    }
                                }
                            }
                        }
                        else {
                            names.push(key);
                            var cp = node.queryName(names.join("."), (x) => x instanceof Lang.ClassProperty && x.isStatic && x.isPublic);
                            if (cp) {
                                inferType = cp.inferType();
                                this.renderClassProp(cp.onlyName, { caller: nameCode });
                            }
                        }
                    };
                    for (let i = 0; i < callers.length; i++) {
                        if (i == 0) {
                            var caller = callers.eq(i);
                            if (caller instanceof Lang.NameCall) {
                                var nb = caller.queryName(caller.name);
                                if (nb) {
                                    inferType = nb.inferType();
                                    nameCode = render.express(caller);
                                }
                                else {
                                    names.push(caller.name);
                                }
                            }
                            else {
                                inferType = caller.inferType();
                                nameCode = render.express(caller);
                            }
                        }
                        else
                            searchKey(callers.eq(i).key.name);
                    }
                    searchKey(node.key.name, true);
                    return nameCode;
                }
                generateAt(node, render) {
                    if (node.at instanceof Lang.NameCall) {
                        render.append(node.at);
                        return `${this.paper.thisObjectName || 'this'}.${render.ref(node.at.name)}`;
                    }
                }
            }
            Generate.GenerateLang = GenerateLang;
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var nodeJS;
            (function (nodeJS) {
                /***
                 *
                 *
                 *
                 */
                nodeJS.genArray = {
                    'Ve.Core.Array': {
                        length: '@(caller).length',
                        first: `(@(caller).length>0?@(caller)[0]:null)`,
                        last: `(@(caller).length>0?@caller[@(caller).length-1]:null)`,
                        reversed: '@(caller).map(x=>x).reverse()',
                        isEmpty: `(@(caller).length==0?true:false)`,
                        isNotEmpty: `(@(caller).length==0?false:true)`,
                        clear: `@(caller).splice(0,@(caller).length)`,
                        exists: `@(caller).some(x=>x==@item)`,
                        exists1: `@(caller).some(@predict)`,
                        every: `(@(caller).every(@predict))`,
                        findIndex: `@(caller).findIndex(x=>x==@item)`,
                        findIndex1: `@(caller).findIndex(@predict)`,
                        findLastIndex: `@(caller).findLastIndex(x=>x==@item)`,
                        findLastIndex1: `@(caller).findLastIndex(x=>x==@item)`,
                        find: `@(caller).find(@predict)`,
                        findLast: ``,
                        findAll: `@(caller).filter(@predict)`,
                        skip: ``,
                        limit: ``,
                        range: ``,
                        remove: `@(caller).splice(@(caller).findIndex(x=>x==@item),1)`,
                        remove1: `@(caller).splice(@(caller).findIndex(@predict),1)`,
                        removeAt: `@(caller).splice(@at,1)`,
                        removeAll: ``,
                        each: `@(caller).forEach(@predict)`,
                        eachReverse: ``,
                        append: `@(caller).push(@item)`,
                        prepend: `@(caller).splice(0,0,@item)`,
                        insert: `@(caller).splice(@at,0,@item)`,
                        insertMany: ``,
                        set: `@(caller)[@at]=@item`,
                        get: `@(caller)[@at]`,
                        sum: `@(caller).map(@predict)`,
                        avg: ``,
                        max: ``,
                        min: ``,
                        join: ``,
                        findMax: ``,
                        findMin: ``,
                        count: `@(caller).filter(@predict).length`,
                        sort: ``,
                        map: `@(caller).map(@predict)`
                    }
                };
            })(nodeJS = Generate.nodeJS || (Generate.nodeJS = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var nodeJS;
            (function (nodeJS) {
                nodeJS.genCommon = {
                    'Ve.Core.Any': {
                        isNull: `(@caller===null||typeof @caller=="undefined")`,
                        isNotNull: `!(@caller===null||typeof @caller=="undefined")`,
                        toString: `(@caller===null||typeof @caller=="undefined")?"null":@(caller).toString()`,
                        '==': `@caller==@other`,
                        "!=": '@caller!=@other'
                    },
                    'Ve.Core.Null': {},
                    'Ve.Core.Bool': {
                        "&&": `@caller&&@other`,
                        '||': `@caller||@other`
                    }
                };
            })(nodeJS = Generate.nodeJS || (Generate.nodeJS = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var nodeJS;
            (function (nodeJS) {
                /***
                 *
                 * 计算一年中的第几周 参考https://www.jianshu.com/p/aa6dd016db26
                 *
                 */
                nodeJS.genDate = {
                    'Ve.Core.Date': {
                        year: `@(caller).getFullYear()`,
                        month: `(@(caller).getMonth()+1)`,
                        day: `@(caller).getDate()`,
                        weekday: '(@(caller).getDay()+1)',
                        week: '',
                        hour: '@(caller).getHours()',
                        minute: `@(caller).getMinutes()`,
                        second: `@(caller).getSeconds()`,
                        millis: '@(caller).getMilliseconds()',
                        y: '@(caller).getFullYear()',
                        m: '(@(caller).getMonth()+1)',
                        d: '@(caller).getDate()',
                        w: '(@(caller).getDay()+1)',
                        h: '@(caller).getHours()',
                        min: '@(caller).getMinutes()',
                        s: '@(caller).getSeconds()',
                        ms: '@(caller).getMilliseconds()',
                        add: ``,
                        diff: ``,
                        toString1: ``,
                        "<": `@(caller).getTime()<@(other).getTime()`,
                        "<=": `@(caller).getTime()<=@(other).getTime()`,
                        ">": `@(caller).getTime()>@(other).getTime()`,
                        ">=": `@(caller).getTime()>=@(other).getTime()`,
                        'parse': ``,
                        'now': `new Date()`
                    }
                };
            })(nodeJS = Generate.nodeJS || (Generate.nodeJS = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var nodeJS;
            (function (nodeJS) {
                nodeJS.genNumber = {
                    'Ve.Core.Number': {
                        'isNegative': `(@caller>=0?false:true)`,
                        'isNaN': `isNaN(@caller)`,
                        'abs': `Math.abs(@caller)`,
                        'ceil': `Math.ceil(@caller)`,
                        'floor': `Math.floor(@caller)`,
                        'round': `Math.round(@caller)`,
                        'toFixed': `@(caller).toFixed(@fractionDigits)`,
                        'toInt': `parseInt(@(caller).toString().split(".")[0])`,
                        "%": `@caller%@other`,
                        "*": `@caller+@other`,
                        "+": `@caller+@other`,
                        "-": `@caller-@other`,
                        "/": `@caller/@other`,
                        "<": `@caller<@other`,
                        "<=": `@caller<=@other`,
                        ">": `@caller>@other`,
                        ">=": `@caller>=@other`,
                        "parse": `parseFloat(@caller)`,
                        "tryParse": `(isNaN(parseFloat(@caller))?@defalutValue: parseFloat(@caller))`,
                    },
                    'Ve.Core.Int': {
                        'isEven': '@caller%2==0',
                        'isOdd': '@caller%2==1',
                        "%": `@caller%@other`,
                        "*": `@caller+@other`,
                        "+": `@caller+@other`,
                        "-": `@caller-@other`,
                        "/": `@caller/@other`,
                        "<": `@caller<@other`,
                        "<=": `@caller<=@other`,
                        ">": `@caller>@other`,
                        ">=": `@caller>=@other`,
                        "parse": `parseInt(@caller)`,
                        "tryParse": `(isNaN(parseInt(@caller))?@defalutValue: parseInt(@caller))`
                    },
                    'Ve.Core.Double': {
                        "%": `@caller%@other`,
                        "*": `@caller+@other`,
                        "+": `@caller+@other`,
                        "-": `@caller-@other`,
                        "/": `@caller/@other`,
                    }
                };
            })(nodeJS = Generate.nodeJS || (Generate.nodeJS = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var nodeJS;
            (function (nodeJS) {
                nodeJS.genString = {
                    'Ve.Core.String': {
                        length: '@(caller).length',
                        isEmpty: `(@caller===""||@caller===null||@caller===undefined)`,
                        isNotEmpty: `!(@caller===""||$caller===null||$caller===undefined)`,
                        chars: `@(caller).split("")`,
                        replace: `@(caller).replace(new RegExp(@old,"gm"),@str)`,
                        replace1: `@(caller).replace(@match,@str)`,
                        contains: `@(caller).indexOf(@str)>-1`,
                        indexOf: `@(caller).indexOf(@str)`,
                        lastIndexOf: `@(caller).lastIndexOf(@str)`,
                        toLower: `@(caller).toLowerCase()`,
                        toUpper: `@(caller).toUpperCase()`,
                        padLeft: `new Array(@width - @(caller).length + 1).join(@padding||'')+@(caller)`,
                        padRight: `@(caller) + new Array(@width - @(caller).length + 1).join(@padding|| '')`,
                        match: `@(caller).match(@regex)[0]`,
                        matchs: `@(caller).match(new RegExp(@(regex).toString(),"gm"))`,
                        isMatch: `@regex.test(@caller)`,
                        split: `@(caller).split(new RegExp(@str,"gm"))`,
                        substring: `@(caller).substring(@startIndex,@endIndex)`,
                        reserve: `@(caller).split("").reserve().join("")`,
                        startsWith: `@(caller).startsWith(@str)`,
                        endsWith: `@(caller).endsWith(@str)`,
                        trim: `@(caller).trim()`,
                        trimLeft: `@(caller).replace(/^[\s]+/g,"")`,
                        trimRight: `@(caller).replace(/[\s]+$/g,"")`,
                        toNumber: `(isNaN(parseFloat(@caller))?@defaultValue: parseFloat(@caller))`,
                        toInt: `(isNaN(parseInt(@caller))?@defaultValue: parseInt(@caller))`,
                        '+': `@caller+@other`
                    }
                };
            })(nodeJS = Generate.nodeJS || (Generate.nodeJS = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../../gen/lang.ts'/>
///<reference path='lib/core/Array.ts'/>
///<reference path='lib/core/common.ts'/>
///<reference path='lib/core/date.ts'/>
///<reference path='lib/core/number.ts'/>
///<reference path='lib/core/string.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var List = Lang.Util.List;
            class GenerateNodeJS extends Ve.Lang.Generate.GenerateLang {
                program(node, render) {
                    node.packages.each(pa => {
                        render.append(pa);
                    });
                    return `@childs()`;
                }
                package(node) {
                    var content = '';
                    var ns = List.asList(node.name.split("."));
                    ns.recursion((name, i, next) => {
                        var pre = i > 0 ? ns.eq(i - 1) : '';
                        content += (`var ${name};`);
                        content += (`(function(${name}){`);
                        next(i + 1);
                        if (i == ns.length - 1) {
                            content += '@childs()';
                        }
                        if (pre)
                            content += (`})(${name}=${pre}.${name}||(${pre}.${name}={}))`);
                        else
                            content += (`})(${name}||(${name}={}))`);
                    });
                    return content;
                }
                use(node) {
                    return `@if(node.aliasName)
        {
            var @node.aliasName=@node.packageName;
        }`;
                }
                $if(node, render) {
                    return `if(@express('ifCondition'))
            {
                @statement('ifContent')
            }
            @for(var i=0;i<node.elseIFConditions.length;i++)
            {
                else if(@express('elseIFConditions',i))
                {
                    @statement('elseIFContents',i)
                }
            }
            else{
                @statement('elseConent')
            }
            `;
                }
                $while(node, render) {
                    return `while(@express("condition"))
            {
                 @statement('content')
            }`;
                }
                $for(node, render) {
                    return `for(@statement("init");@express("condition");@statement("post"))
            {
                @statement('content')
            }`;
                }
                $switch(node, render) {
                    return `
                @{
                    var valueExpress=express('value');
                }
                @for(var i=0;i<node.cases.length;i++)
                {
                    @{
                        var caseCode=node.cases.eq(i).case.map(x=>"("+valueExpress+"=="+express(x)")").join("||");
                        var content=node.cases.eq(i).content;
                    }
                    @if(i==0)
                    {
                        if(@caseCode)
                        {
                            @statement(content)
                        }
                    }
                    else if(i>0)
                    {
                        else if(@caseCode)
                        {
                            @statement(content)
                        }
                    }
                }
                @if(node.default.length>0)
                {
                     else{
                        @statement(node.default)
                     }
                }
            `;
                }
                when(node, render) {
                    return `@for(var i=0;i<node.whens.length;i++)
            {
                @{
                    var caseCode=node.whens.eq(i).value?node.whens.eq(i).value.map(x=>express(x)).join("||"):"true";
                    var content=node.whens.eq(i).content;
                }
                 @if(i==0)
                 {
                    if(@caseCode)
                    {
                        @statement(content)
                    }
                 }
                 else if(i>0){
                    else if(@caseCode)
                    {
                        @statement(content)
                    }
                 }
            }`;
                }
                $continue(node) { return `continue;`; }
                $break(node) { return 'break;'; }
                $return(node) { return `return @express(node.express);`; }
                $throw(node) { return `throw @express(node.express);`; }
                $try(node) {
                    return `try{ @statement(node.try) }catche(e)
            { 
                @for(var i=0;i<node.catchs.length;i++)
                {
                    @{
                        var ca=node.catchs.eq(i).paramete;
                        var cc=node.catchs.eq(i).content;
                    }
                    @if(i==0)
                    {
                        if(e instanceof @express(ca))
                        {
                             @statement(@cc)
                        }
                    }
                    else if(i>0){
                        else  if(e instanceof @express(ca))
                        {
                             @statement(@cc)
                        }
                    }
                }
            }
            @if(finally.length>0)
            {
                finally{@statement(node.finally) }
            }
            `;
                }
                enum(node) {
                    return {
                        template: `var @def(node.name);
            (function(@def(node.name)){
                @content(node);
            })(@def(node.name)=@(node.package.lastName).@def(node.name)||(@node.package.lastName@{}.@def(node.name)={ }))`,
                        content(node) {
                            if (node instanceof Lang.EnumStatement) {
                                return node.items.map(pro => {
                                    return `${this.def(node.name)}[${this.def(node.name)}["${pro.name}"]=${this.visitor.accept(pro.value)}]="${pro.name}";`;
                                }).join("");
                            }
                        }
                    };
                }
                $class(node) {
                    var lastName = node.package.lastName;
                    return `class @def() @(node.extendName?"extends "+node.extendName:""){
                @childs()
            }
            ${lastName}.@def()=@def();
            `;
                }
                classProperty(node) {
                }
                classMethod(node) {
                    return `${node.isStatic ? 'static ' : ''}@(node.name)(@express(node.parameters))
                {
                    @childs(node.content)
                }`;
                }
                classOperator(node) {
                    return `static "${node.name}"(@express(node.parameters)){
                 @childs(node.content)
            }`;
                }
                fun(node) {
                    return `function @def()(@express(node.parameters))
            {
                @statement(node.content)
            }`;
                }
                anonymousFun(node) {
                    return `(@express(node.parameters))=>{
                @statement(node.content)
            }`;
                }
                objectCall(node, render) {
                    return this.generateMethod(node, node, render);
                }
                $new(node, render) {
                    node.caller.argements.each(exp => {
                        render.append(exp);
                    });
                    return this.generateMethod(node.caller.caller, node, render);
                }
                methodCall(node, render) {
                    node.argements.each(exp => {
                        render.append(exp);
                    });
                    return this.generateMethod(node.caller, node, render);
                }
                at(node, render) {
                    return this.generateAt(node, render);
                }
                block(node) { return `{@statement(node.content)}`; }
                object(obj, render) {
                    obj.items.each(no => {
                        render.append(no.value);
                    });
                    return {
                        template: `{
                   @content()
            }`, content() {
                            return obj.items.toArray(x => {
                                return `${x.key}:` + this.express(x.value);
                            }).join(",");
                        }
                    };
                }
                array(node, render) {
                    node.items.each(no => {
                        render.append(no);
                    });
                    return `
    [
        @for(var i=0;i<node.items.length;i++)
        {  
            @express(node.items.eq(i))
            @if(i<node.items.length-1)
            {
                 ,
            }
        }
    ] 
        `;
                }
                arrayCall(arrayCall) {
                    return `@express("caller")[@express("arrayIndex")]`;
                }
                nameCall(node) {
                    return `@ref()`;
                }
                thisCall(node) { return 'this'; }
                superCall(node) { return 'super'; }
                constant(node) {
                    var name = node.constantType.name;
                    var nu = name.toLocaleLowerCase();
                    if (nu.startsWith('ve.core'))
                        nu = nu.substring('ve.core.'.length);
                    if (nu == 'int' || nu == 'number' || nu == 'double')
                        return node.value.toString();
                    else if (nu == 'bool')
                        return node.value.toString();
                    else if (nu == 'null')
                        return 'null';
                    else if (nu == 'string')
                        return "\"" + node.value.toString().replace(/"/g, "\"") + "\"";
                    else if (typeof node.value == 'number' || typeof node.value == 'string') {
                        if (nu == 'date') {
                            return `new Date(${node.value})`;
                        }
                        var cp = node.queryName(node.constantType.name, new Lang.Util.List(Lang.NodeType.class));
                        if (!cp) {
                            throw `not found create Constant Type class name ${node.constantType.name}`;
                        }
                        var ctorFirstParameter = typeof node.value == 'string' ? Lang.TypeExpress.create({ name: 'string' }) : Lang.TypeExpress.create({ name: node.value.toString().indexOf('.') > -1 ? 'number' : 'int' });
                        var pro = cp.propertys.find(x => x instanceof Lang.ClassMethod && x.isCtor && Ve.Lang.InferType.InterTypeListTypeFunTypeIsCompatibility(new Lang.Util.List(ctorFirstParameter), x));
                        if (!pro)
                            throw `not foun class ctor name:${cp.fullNames.first()}`;
                        var value = typeof node.value == 'string' ? "\"" + node.value.toString().replace(/"/g, "\"") + "\"" : node.value.toString();
                        return this.renderClassProp(pro.onlyName, { caller: value });
                    }
                }
                declareVariable(node) {
                    if (node.isConst) {
                        return `const @def()@(node.value?"="+express(node.value):"")`;
                    }
                    else
                        return `var  @def()@(node.value?"="+express(node.value):"")`;
                }
                stringTemplate(node, render) {
                    node.strings.each(str => {
                        render.append(str);
                    });
                    return {
                        template: `@strings()`,
                        strings() {
                            var strs = `\`${this.node.strings.map(str => {
                                if (str instanceof Lang.Constant) {
                                    var name = str.constantType.name;
                                    var nu = name.toLocaleLowerCase();
                                    if (nu.startsWith('ve.core'))
                                        nu = nu.substring('ve.core.'.length);
                                    if (nu == 'string')
                                        return str.value.toString().replace(/`/g, "\\`");
                                }
                                else
                                    return `\${${this.express(str)}}`;
                            }).join("")}\``;
                            if (!this.node.stringType || this.node.stringType && this.node.stringType.name == 'string' || this.node.stringType.name.toLocaleLowerCase() == 've.core.string') {
                                return strs;
                            }
                            else {
                                return `new ${this.express(this.node.stringType)}(\`${strs}\`)`;
                            }
                        }
                    };
                }
                ternary(node, render) {
                    render.append(node.condition);
                    render.append(node.trueExpress);
                    render.append(node.falseExpress);
                    return '(@express(node.condition))?(@express(node.trueExpress)):(@express(node.falseExpress))';
                }
                unary(node, render) {
                    render.append(node.express);
                    if (node.direction == true)
                        return `(@node.operator@express(node.express))`;
                    else
                        return `(@express(node.express)@node.operator)`;
                }
                bracket(node, render) {
                    render.append(node.express);
                    return `(@express(node.express))`;
                }
                assign(node, render) {
                    render.append(node.left);
                    render.append(node.right);
                    return `@express(node.left)${node.operator}@express(node.right)`;
                }
                binary(node, render) {
                    render.append(node.left);
                    render.append(node.right);
                    var cp = Lang.InferType.InferTypeOperatorBinaryExpress(node);
                    var obj = {
                        caller: render.express(node.left)
                    };
                    obj[cp.parameters.first().name] = render.express(node.right);
                    return this.renderClassProp(cp.onlyName, obj);
                }
                type(node) { return ''; }
                parameter(pa) { return `@(node.rest?"...":"")@def(node.name)@(node.default?"="+express(node.default):"")`; }
                spread(node) { return `...@express(node.express)`; }
                emptyStatement(node) { return ';'; }
            }
            Generate.GenerateNodeJS = GenerateNodeJS;
            Generate.nodejsGenerate = new GenerateNodeJS();
            Generate.nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genArray);
            Generate.nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genCommon);
            Generate.nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genDate);
            Generate.nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genNumber);
            Generate.nodejsGenerate.import(Ve.Lang.Generate.nodeJS.genString);
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='lang/nodejs/nodejs.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate_1) {
            var List = Lang.Util.List;
            let GenerateLanguage;
            (function (GenerateLanguage) {
                GenerateLanguage[GenerateLanguage["nodejs"] = 0] = "nodejs";
                GenerateLanguage[GenerateLanguage["js"] = 1] = "js";
                GenerateLanguage[GenerateLanguage["java"] = 2] = "java";
                GenerateLanguage[GenerateLanguage["csharp"] = 3] = "csharp";
                GenerateLanguage[GenerateLanguage["php"] = 4] = "php";
                GenerateLanguage[GenerateLanguage["python"] = 5] = "python";
                GenerateLanguage[GenerateLanguage["mongodb"] = 6] = "mongodb";
                GenerateLanguage[GenerateLanguage["mysql"] = 7] = "mysql";
                GenerateLanguage[GenerateLanguage["mssql"] = 8] = "mssql";
            })(GenerateLanguage = Generate_1.GenerateLanguage || (Generate_1.GenerateLanguage = {}));
            class Generate extends Ve.Lang.Util.BaseEvent {
                constructor() {
                    super();
                    this.nodes = new List();
                }
                generate(code, lang) {
                    this.lang = lang;
                    var compiler = new Lang.Compiler();
                    compiler.on('error', (...args) => {
                        this.emit('error', ...args);
                    });
                    var gl = this.getLang();
                    if (!gl) {
                        console.log('not found generage language', this.lang, GenerateLanguage[this.lang]);
                        this.emit('error', 'not found gengrate language ' + this.lang);
                        return;
                    }
                    this.paper = new Generate_1.GeneratePaper(gl);
                    this.paper.on('error', (...args) => {
                        this.emit('error', ...args);
                    });
                    try {
                        var rs = compiler.compile(code);
                        return this.paper.generate(rs.nodes);
                    }
                    catch (error) {
                        this.emit('error', error);
                    }
                }
                generateExpress(code, lang, args, thisObjectArgs, options) {
                    this.lang = lang;
                    var compiler = new Lang.Compiler();
                    compiler.on('error', (...args) => {
                        this.emit('error', ...args);
                    });
                    var gl = this.getLang();
                    if (!gl) {
                        console.log('not found generage language', this.lang, GenerateLanguage[this.lang]);
                        this.emit('error', 'not found gengrate language ' + this.lang);
                        return;
                    }
                    this.paper = new Generate_1.GeneratePaper(gl, options);
                    this.paper.on('error', (...args) => {
                        this.emit('error', ...args);
                    });
                    try {
                        var rs = compiler.express(code, args, thisObjectArgs);
                        return this.paper.generate(rs.express);
                    }
                    catch (error) {
                        this.emit('error', error);
                    }
                }
                getLang() {
                    switch (this.lang) {
                        case GenerateLanguage.nodejs:
                        case GenerateLanguage.js:
                            return Generate_1.nodejsGenerate;
                            break;
                        case GenerateLanguage.mongodb:
                            return Generate_1.generateMongodb;
                            break;
                    }
                }
            }
            Generate_1.Generate = Generate;
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../token/tokenizer.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Razor;
        (function (Razor) {
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
            Razor.RazorSyntax = {
                root: [
                    { name: 'text', match: /[^@\(\)\{\} \t]+/ },
                    { match: /@[ \t]*if[ \t]*\(/, name: 'if', push: true },
                    { match: /@[ \t]*(for|while)[ \t]*\(/, name: 'forwhile', push: true },
                    { match: ['@@', '@)', '@#{', '@}', "@#("], name: 'escape' },
                    { match: /@\(/, name: 'bracket.value.open', push: true },
                    { match: /@\{/, name: 'bracket.block.open', push: true },
                    { match: /@([a-zA-Z_\$\u4E00-\u9FA5][a-zA-Z_\$\u4E00-\u9FA5\d]*)([ \t]*\.[ \t]*[a-zA-Z_\$\u4E00-\u9FA5][a-zA-Z_\$\u4E00-\u9FA5\d]*)*[ \t]*\(/, push: true, name: 'method.open' },
                    { match: /@([a-zA-Z_\$\u4E00-\u9FA5][a-zA-Z_\$\u4E00-\u9FA5\d]*)([ \t]*\.[ \t]*[a-zA-Z_\$\u4E00-\u9FA5][a-zA-Z_\$\u4E00-\u9FA5\d]*)*/, name: 'variable' },
                    { match: /\(/, name: 'bracket.open', push: true },
                    { match: /\{/, name: 'bracket.big.open', push: true },
                    { match: /@\*/, next: '@comment', name: 'comment.open', push: true },
                    {
                        match: ')',
                        name: 'bracket.close',
                        pop: true,
                        action(contextToken) {
                            if (contextToken.name == 'if' || contextToken.name == 'elseif') {
                                return {
                                    next: '@if'
                                };
                            }
                        }
                    },
                    {
                        match: '}',
                        name: 'bracket.big.close',
                        pop: true,
                        action(contextToken) {
                            if (contextToken.isPrevMatch(/(if\(\)|elseif\(\))[s|n]*\{$/)) {
                                return {
                                    next: '@if'
                                };
                            }
                        }
                    },
                    { name: 'text', match: /@/ },
                    { name: "white", match: /[ \t]+/ }
                ],
                if: [
                    {
                        name: 'bracket.if',
                        match: '{',
                        push: true,
                        next: '@root',
                        action(contextToken) {
                            if (!['if', 'elseif'].includes(contextToken.name))
                                return {
                                    nextTurn: '@root'
                                };
                        }
                    },
                    { name: 'elseif', match: /[ \t]*else[ \t]+if[ \t]*\(/, push: true },
                    { name: 'else', match: /[ \t]*else[ \t]*\{/, push: true },
                    { name: 'if.end', nextTurn: '@root' }
                ],
                comment: [
                    { match: /[^@\*]+/, name: 'comment' },
                    { match: /\*@/, name: 'comment.end', pop: true, next: '@root' },
                    { match: /[@\*]/, name: 'comment' }
                ]
            };
            class RazorToken extends Lang.Token {
                get flag() {
                    if (this.name == 'line')
                        return 'n';
                    else if (this.name == 'text')
                        return 'text';
                    else if (this.name == 'if')
                        return 'if(';
                    else if (this.name == 'elseif')
                        return 'elseif(';
                    else if (this.name == 'forwhile')
                        return 'for(';
                    else if (this.name == 'else')
                        return 'else{';
                    else if (this.name == 'bracket.if')
                        return '{';
                    else if (this.name.startsWith('comment'))
                        return 'c';
                    else if (this.name == 'bracket.open')
                        return '(';
                    else if (this.name == 'bracket.close')
                        return ')';
                    else if (this.name == 'bracket.big.open')
                        return '{';
                    else if (this.name == 'bracket.big.close')
                        return '}';
                    else if (this.name == 'bracket.value.open')
                        return '#(';
                    else if (this.name == 'bracket.block.open')
                        return '#{';
                    else if (this.name == 'escape')
                        return 'e';
                    else if (this.name == 'method.open')
                        return '#method(';
                    else if (this.name == 'variable')
                        return '#varibale';
                    else if (this.name == 'white')
                        return 's';
                    return this.name;
                }
            }
            Razor.RazorToken = RazorToken;
            class RazorTokenizer extends Lang.Tokenizer {
                init() {
                    this.load(Razor.RazorSyntax);
                }
                createToken() {
                    return new RazorToken();
                }
            }
            Razor.RazorTokenizer = RazorTokenizer;
        })(Razor = Lang.Razor || (Lang.Razor = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Razor;
        (function (Razor) {
            let Variable_COUNTER = 0;
            class RazorWriter {
                constructor(options) {
                    this.scope = 'text';
                    if (typeof options == 'object') {
                        if (typeof options.writeVariable != 'undefined') {
                            this.writeVariable = options.writeVariable;
                        }
                    }
                    if (typeof this.writeVariable == 'undefined')
                        this.writeVariable = `__$$rt${++Variable_COUNTER}`;
                    this.codes = [`\nvar ${this.writeVariable}=[];\n`];
                }
                writeCode(text) {
                    this.codes.push(text);
                }
                writeValue(text) {
                    if (typeof text == 'undefined' || text == null || text === '')
                        return;
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
                writeScope(code) {
                    if (this.scope == 'code')
                        this.writeCode(code);
                    else if (this.scope == 'text')
                        this.writeString(code);
                }
                write(token) {
                    if (token.name == 'root') {
                        token.childs.each(token => {
                            this.write(token);
                        });
                    }
                    else if (token.name.startsWith('comment')) {
                    }
                    else if (token.name == 'escape') {
                        var value = token.value;
                        if (value == '@@')
                            value = '@';
                        else if (value == '@#{')
                            value = '{';
                        else if (value == '@#(')
                            value = '(';
                        else if (value == '@}')
                            value = '}';
                        else if (value == '@)')
                            value = ')';
                        this.writeScope(value);
                    }
                    else if (token.name == 'if' || token.name == 'elseif') {
                        this.writeCode(token.name == 'if' ? 'if' : 'else if');
                        this.scope = 'code';
                        this.writeCode('(');
                        token.childs.each(token => {
                            this.write(token);
                        });
                        this.writeCode(')');
                        this.scope = 'code';
                    }
                    else if (token.name == 'else' || token.name == 'bracket.if') {
                        if (token.name == 'else')
                            this.writeCode('else');
                        this.scope = 'text';
                        this.writeCode('{');
                        token.childs.each(token => {
                            this.write(token);
                        });
                        this.writeCode('}');
                        this.scope = 'code';
                    }
                    else if (token.name == 'forwhile') {
                        if (token.name.indexOf('for') > -1)
                            this.writeCode('for');
                        else
                            this.writeCode('while');
                        this.scope = 'code';
                        this.writeCode('(');
                        token.childs.each(token => { this.write(token); });
                        this.writeCode(')');
                        this.scope = 'code';
                    }
                    else if (token.name == 'method.open') {
                        this.scope = 'code';
                        this.writeValue(`${token.value.replace(/[@\t ]+/g, '')}${this.read(token.childs)})`);
                        this.scope = 'text';
                    }
                    else if (token.name == 'variable') {
                        this.scope = 'text';
                        this.writeValue(`${token.value.replace(/[@ \t]+/, '')}`);
                        this.scope = 'text';
                    }
                    else if (token.name == 'bracket.value.open') {
                        /***@(value)*/
                        this.scope = 'text';
                        this.writeValue(`${this.read(token.childs)}`);
                        this.scope = 'text';
                    }
                    else if (token.name == 'bracket.block.open') {
                        /***@{} */
                        this.scope = 'code';
                        token.childs.each(t => { this.write(t); });
                        this.scope = 'text';
                    }
                    else if (token.name == 'bracket.open') {
                        this.writeScope(token.value);
                        token.childs.each(t => {
                            this.write(t);
                        });
                        this.writeScope(')');
                    }
                    else if (token.name == 'bracket.big.open') {
                        /****主要区分{来源于@forwhile还是普通的{}*/
                        if (token.isPrevMatch(/(for\(\)|if\(\)|elseif\(\))[s|n]*\{$/)) {
                            this.writeCode('{');
                            this.scope = 'text';
                            token.childs.each(t => {
                                this.write(t);
                            });
                            this.scope = 'text';
                            this.writeCode('}');
                        }
                        else {
                            this.writeScope(token.value);
                            token.childs.each(t => {
                                this.write(t);
                            });
                            this.writeScope('}');
                        }
                    }
                    else if (token.name == 'text') {
                        this.writeScope(token.value);
                    }
                    else if (token.name == 'line' || token.name == 'white') {
                        if (!token.isPrevMatch(/(for\(\)|if\(\)|elseif\(\))([s|n]*\{\})?[s|n]*$/))
                            this.writeScope(token.value);
                    }
                    else if (token.name == 'bracket.close' || token.name == 'bracket.big.close') {
                    }
                }
                read(token) {
                    if (token instanceof Lang.Util.List)
                        return token.map(t => this.read(t)).join("");
                    else
                        return token.value + this.read(token.childs);
                }
                outputCode() {
                    return this.codes.join('') + `\nreturn ${this.writeVariable}.join("");\n`;
                }
            }
            Razor.RazorWriter = RazorWriter;
        })(Razor = Lang.Razor || (Lang.Razor = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='syntax.ts'/>
///<reference path='writer.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Razor;
        (function (Razor) {
            class RazorTemplate {
                static escape(code) {
                    return code.replace(/@(?![@])/g, "@@");
                }
                static compile(code, obj, ViewBag) {
                    if (typeof ViewBag == 'undefined')
                        ViewBag = {};
                    var tokenizer = new Razor.RazorTokenizer();
                    var token = tokenizer.parse(code);
                    var writer = new Razor.RazorWriter();
                    writer.write(token);
                    var jsCode = writer.outputCode();
                    /****
                     * 扩展默认系统的对象与方法
                     * 如@include('~/views/index.rjs')
                     *
                     */
                    var baseObj = {};
                    var baseMaps = this.getObjectKeyValues(baseObj);
                    var maps = this.getObjectKeyValues(obj);
                    maps = [...maps, ...baseMaps];
                    var funCode = `function(ViewBag,...args)
            {
                 function innerFun(${maps.map(x => x.key).join(",")})
                 {
                     ${jsCode}
                 };
                 return innerFun.apply(this,args);
            }`;
                    try {
                        var gl = typeof window == 'undefined' ? global : window;
                        var fun = gl.eval(`(${funCode})`);
                        return fun.apply(obj, [ViewBag, ...maps.map(x => x.value)]);
                    }
                    catch (e) {
                        console.log(funCode);
                        throw e;
                    }
                }
                /***
                 * 提取对象的所有property name,包括继承的
                 */
                static getObjectKeyValues(data) {
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
                        if (!Ve.Lang.Util._.exists(keys, n))
                            keys.push(n);
                    }
                    prototypes.forEach(pro => {
                        var ps = Reflect.ownKeys(pro);
                        Ve.Lang.Util._.remove(ps, 'constructor');
                        ps.forEach(m => { if (!Ve.Lang.Util._.exists(keys, m))
                            keys.push(m); });
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
            Razor.RazorTemplate = RazorTemplate;
        })(Razor = Lang.Razor || (Lang.Razor = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../../razor/template.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var List = Ve.Lang.Util.List;
            /***
             * @description 标记申明的位置，方便注入
             *
             */
            let DeclarePosition;
            (function (DeclarePosition) {
                /**
                 * @param  当前的申明就是自身
                 *
                 */
                DeclarePosition[DeclarePosition["self"] = 0] = "self";
                /***
                 * @param  当前节点所在的语句的前面
                 */
                DeclarePosition[DeclarePosition["prev"] = 1] = "prev";
                /***
                 * @param  程序的头部
                 */
                DeclarePosition[DeclarePosition["head"] = 2] = "head";
                /**
                 *@param  在方法内的前面
                 */
                DeclarePosition[DeclarePosition["method"] = 3] = "method";
                /**
                 * @param  在大括的下面
                 */
                DeclarePosition[DeclarePosition["brace"] = 4] = "brace";
            })(DeclarePosition = Generate.DeclarePosition || (Generate.DeclarePosition = {}));
            /**
             * 节点渲染器
             */
            class NodeRender {
                constructor(paper, node) {
                    this.childRenders = new Lang.Util.List();
                    /***
                     * @description 当前节点申明的变量名称
                     *
                     */
                    this.declares = [];
                    this.paper = paper;
                    this.node = node;
                }
                load(data) {
                    for (var n in data) {
                        this[n] = data[n];
                    }
                }
                generate() {
                    var code = Lang.Razor.RazorTemplate.compile(this.template || '', this);
                    return code;
                }
                append(node) {
                    var render = this.paper.render(node);
                    this.childRenders.push(render);
                    render.parentRender = this;
                }
                find(predict) {
                    if (predict instanceof Lang.Node) {
                        return this.find(x => x.node == predict);
                    }
                    else {
                        var r;
                        List.treeEach(this.childRenders, 'childRenders', x => {
                            if (predict(x) == true) {
                                r = x;
                                return { break: true };
                            }
                        });
                        return r;
                    }
                }
                /***
                 * @description 通常这是编译多个语句的块，每个语句块有可能会依赖于前一个语句块
                 *
                 */
                childs(name) {
                    var ns;
                    if (typeof name == 'string') {
                        ns = this.node[name];
                        if (typeof ns == 'undefined')
                            throw 'not not node property name:' + name;
                    }
                    else
                        ns = name;
                    if (!(ns instanceof List))
                        ns = new List(ns);
                    var ps = ns.toArray(n => {
                        var re = this.find(n);
                        if (re)
                            return re.generate();
                        else {
                            console.warn('');
                            return undefined;
                        }
                    });
                    ps.reverse();
                    var prev = ps.first();
                    for (var i = 1; i < ps.length; i++) {
                        /**
                         * ps是生成的节点代码，需要转义escape
                         */
                        var current = Lang.Razor.RazorTemplate.escape(ps.eq(i));
                        if (!current.match(/@next\([\s]*\)/))
                            current = current + '@next()';
                        prev = Lang.Razor.RazorTemplate.compile(current, { next() { return prev; } });
                    }
                    return prev;
                }
                /***
                 * @description 当前的名称是定义的
                 *
                 */
                def(name) {
                    if (typeof name == 'string') {
                        return name;
                    }
                    else if (this.node instanceof Lang.DeclareVariable) {
                        return this.node.name;
                    }
                    else if (this.node instanceof Lang.Parameter) {
                        if (this.paper.parameterMapNames && typeof this.paper.parameterMapNames[this.node.name] != 'undefined') {
                            return this.paper.parameterMapNames[this.node.name];
                        }
                        return this.node.name;
                    }
                    return name;
                }
                /**
                 * @description 当前的名称是引用的（被调用的）
                 * @param name
                 *
                 */
                ref(name) {
                    if (typeof name == 'string') {
                        return name;
                    }
                    else if (this.node instanceof Lang.NameCall) {
                        var rf = this.node.refNode;
                        if (rf instanceof Lang.Parameter) {
                            if (this.paper.parameterMapNames && typeof this.paper.parameterMapNames[rf.name] != 'undefined') {
                                return this.paper.parameterMapNames[rf.name];
                            }
                        }
                        return this.node.name;
                    }
                }
                next() {
                    return '@next()';
                }
                prev() {
                }
                get $this() {
                    return '';
                }
                get $value() {
                    return '';
                }
                express(name, at) {
                    var cnode;
                    if (typeof name == 'string') {
                        cnode = this.node[name];
                        if (typeof cnode == 'undefined')
                            throw 'not not node property name:' + name;
                    }
                    else
                        cnode = name;
                    if (typeof cnode != 'undefined') {
                        if (cnode instanceof List) {
                            if (typeof at == 'undefined') {
                                /**
                                 * @warn 应该很少触发这种情况
                                 */
                                return cnode.map(c => {
                                    var ce = this.find(c);
                                    if (ce)
                                        return ce.generate();
                                    else
                                        return '';
                                }).join("");
                            }
                            else if (typeof at == 'number' && cnode.eq(at)) {
                                var crender = this.find(cnode.eq(at));
                                if (crender) {
                                    return crender.generate();
                                }
                            }
                        }
                        else {
                            var crender = this.find(cnode);
                            if (crender) {
                                return crender.generate();
                            }
                        }
                    }
                }
                /**
                 * @description 语句编译
                 * @enum name {string} node节点的属性名名
                 * @enum name {Node}  node节点子节点
                 * @param at? 如果节点是集合，那么需要指定编译的
                 *
                 */
                statement(name, at) {
                    var cnode;
                    if (typeof name == 'string') {
                        cnode = this.node[name];
                        if (typeof cnode == 'undefined')
                            throw 'not not node property name:' + name;
                    }
                    else
                        cnode = name;
                    if (typeof cnode != 'undefined') {
                        if (cnode instanceof List) {
                            if (typeof at == 'undefined') {
                                /**
                                 * @warn 应该很少触发这种情况
                                 */
                                return cnode.map(c => {
                                    var ce = this.find(c);
                                    if (ce)
                                        return ce.generate();
                                    else
                                        return '';
                                }).join("");
                            }
                            else if (typeof at == 'number' && cnode.eq(at)) {
                                var crender = this.find(cnode.eq(at));
                                if (crender) {
                                    return crender.generate();
                                }
                            }
                        }
                        else {
                            var crender = this.find(cnode);
                            if (crender) {
                                return crender.generate();
                            }
                        }
                    }
                }
            }
            Generate.NodeRender = NodeRender;
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var List = Lang.Util.List;
            class GeneratePaper extends Ve.Lang.Util.BaseEvent {
                constructor(generateLang, options) {
                    super();
                    this.renders = new List();
                    if (typeof options == 'object') {
                        for (var n in options)
                            this[n] = options[n];
                    }
                    this.generateLang = generateLang;
                    this.generateLang.paper = this;
                }
                render(node) {
                    if (!node)
                        console.trace(node);
                    if (typeof node.type == 'undefined')
                        console.error('the node type is undefiend', node);
                    var action = Lang.NodeType[node.type];
                    if (typeof this.generateLang[action] != 'function')
                        action = '$' + action;
                    if (typeof this.generateLang[action] != 'function') {
                        console.error('not found action:' + action, node.type, node);
                        this.emit('error', new Error(`not found action:${action}`));
                        return;
                    }
                    var render = new Generate.NodeRender(this, node);
                    var result = this.generateLang[action](node, render);
                    if (typeof result == 'string') {
                        render.template = result;
                    }
                    else if (typeof result == 'object') {
                        render.load(result);
                    }
                    else
                        render.template = '';
                    return render;
                }
                generate(nodes) {
                    var ns = nodes instanceof List ? nodes : new List(nodes);
                    this.renders = ns.toArray(x => this.render(x));
                    return this.renders.toArray(x => x.generate()).join("");
                }
            }
            Generate.GeneratePaper = GeneratePaper;
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var mongodb;
            (function (mongodb) {
                /***
                 *
                 *
                 *
                 */
                mongodb.genArray = {
                    'Ve.Core.Array': {
                        length: '{$size:@caller}',
                        first: `{$first:@caller}`,
                        last: `{$last:@caller}`,
                        //reversed: '@(caller).map(x=>x).reverse()',
                        isEmpty: `{$eq:[{$size:@caller},0]}`,
                        isNotEmpty: `{$ne:[{$size:@caller},0]}`,
                        //clear: `@(caller).splice(0,@(caller).length)`,
                        exists: `{ $in: [@node.item,@(caller)]}`,
                    }
                };
            })(mongodb = Generate.mongodb || (Generate.mongodb = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var mongodb;
            (function (mongodb) {
                mongodb.genCommon = {
                    'Ve.Core.Any': {
                        isNull: `{$eq:[@caller,null]}`,
                        isNotNull: `{$ne:[@caller,null]}`,
                        toString: `{$toString:@caller}`,
                        '==': `{$eq:[@caller,@other]}`,
                        "!=": '{$ne:[@caller,@other]}'
                    },
                    'Ve.Core.Null': {},
                    'Ve.Core.Bool': {
                        "&&": `{$and:[@caller,@other]}`,
                        '||': `{$or:[@caller,@other]}`
                    }
                };
            })(mongodb = Generate.mongodb || (Generate.mongodb = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var mongodb;
            (function (mongodb) {
                /***
                 *
                 * 计算一年中的第几周 参考https://www.jianshu.com/p/aa6dd016db26
                 *
                 */
                mongodb.genDate = {
                    'Ve.Core.Date': {
                        year: `{$year:[@caller]}`,
                        month: `{$month:[@caller]}`,
                        day: `{$dayOfMonth:[@caller]}`,
                        weekday: '{$dayOfWeek:[@caller]}',
                        yearday: '{$dayOfYear:[@caller]}',
                        week: '{$week:[@caller]}',
                        hour: '{$hour:[@caller]}',
                        minute: `{$minute:[@caller]}`,
                        second: `{$second:[@caller]}`,
                        millis: '{$millisecond:[@caller]}',
                        y: '{$year:[@caller]}',
                        m: '{$month:[@caller]}',
                        d: '{$dayOfMonth:[@caller]}',
                        w: '{$week:[@caller]}',
                        h: '{$hour:[@caller]}',
                        min: '{$minute:[@caller]}',
                        s: '{$second:[@caller]}',
                        ms: '{$millisecond:[@caller]}',
                        add: ``,
                        adds: ``,
                        sub: `{$floor:{$divide:[{$subtract:[@caller,@date]},60 * 60 * 24 * 1000] }}`,
                        subs: ``,
                        toString1: `{$dateToString:{format: "%H:%M:%S:%L%z",date:@caller,timezone: "+08:00" } }`,
                        "<": `{$lt:[@caller,@other]}`,
                        "<=": `{$lte:[@caller,@other]}`,
                        ">": `{$gt:[@caller,@other]}`,
                        ">=": `{$gte:[@caller,@other]}`,
                        parse: ``,
                        now: `new Date()`
                    }
                };
            })(mongodb = Generate.mongodb || (Generate.mongodb = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var mongodb;
            (function (mongodb) {
                /***
                 *
                 *
                 *
                 */
                mongodb.genMath = {
                    'Ve.Core.Math': {
                        PI: `3.14159`,
                        E: `2.718`,
                        LN2: '0.693',
                        LN10: '2.302',
                        LOG2E: '1.414',
                        log10E: '0.434',
                        SQRT1_2: '0.707',
                        SQRT2: '1.414',
                        pow: `{$pow:[@num]}`,
                        sin: `{$sin:[@num]}`,
                        cos: `{$cos:[@num]}`,
                        tan: `{$tan:[@num]}`,
                        asin: `{$asin:[@num]}`,
                        acos: `{$acos:[@num]}`,
                        atan: `{$atan:[@num]}`,
                        sqrt: `{$sqrt:[@num]}`,
                        log: `{$log:[@num]}`,
                        abs: `{$abs:[@num]}`,
                        round: `{$round:[@num]}`,
                        ceil: `{$ceil:[@num]}`,
                        floor: `{$floor:[@num]}`
                    }
                };
            })(mongodb = Generate.mongodb || (Generate.mongodb = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var mongodb;
            (function (mongodb) {
                mongodb.genNumber = {
                    'Ve.Core.Number': {
                        'isNegative': `{$lt:[@caller,0]}`,
                        'abs': `{$abs:[@caller]}`,
                        'ceil': `{$ceil:[@caller]}`,
                        'floor': `{$floor:[@caller]}`,
                        'round': `{$round:[@caller]}`,
                        'toInt': `{$toInt:@caller}`,
                        "%": `{$mod:[@caller,@other]}`,
                        "*": `{$multiply:[@caller,@other]}`,
                        "+": `{$add:[@caller,@other]}`,
                        "-": `{$subtract:[@caller,@other]}`,
                        "/": `{$divide:[@caller,@other]}`,
                        "<": `{$lt:[@caller,@other]}`,
                        "<=": `{$lte:[@caller,@other]}`,
                        ">": `{$gt:[@caller,@other]}`,
                        ">=": `{$gte:[@caller,@other]}`,
                        "parse": `{$toDecimal:@caller}`,
                    },
                    'Ve.Core.Int': {
                        'isEven': '{$eq:[@caller,{$mod:[@caller,2]}]}',
                        'isOdd': '{$eq:[@caller,{$mod:[@caller,1]}]}',
                        "%": `{$mod:[@caller,@other]}`,
                        "*": `{$multiply:[@caller,@other]}`,
                        "+": `{$add:[@caller,@other]}`,
                        "-": `{$subtract:[@caller,@other]}`,
                        "/": `{$divide:[@caller,@other]}`,
                        "<": `{$lt:[@caller,@other]}`,
                        "<=": `{$lte:[@caller,@other]}`,
                        ">": `{$gt:[@caller,@other]}`,
                        ">=": `{$gte:[@caller,@other]}`,
                        "parse": `{$toInt:@caller}`,
                    },
                    'Ve.Core.Double': {
                        "%": `{$mod:[@caller,@other]}`,
                        "*": `{$multiply:[@caller,@other]}`,
                        "+": `{$add:[@caller,@other]}`,
                        "-": `{$subtract:[@caller,@other]}`,
                        "/": `{$divide:[@caller,@other]}`,
                    }
                };
            })(mongodb = Generate.mongodb || (Generate.mongodb = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            var mongodb;
            (function (mongodb) {
                mongodb.genString = {
                    'Ve.Core.String': {
                        length: '{$strLenBytes:@caller}',
                        isEmpty: `{@eq:[{$strLenBytes:@caller},0]} `,
                        isNotEmpty: `{@ne:[{$strLenBytes:@caller},0]}`,
                        //chars: `@(caller).split("")`,
                        //replace: `@(caller).replace(new RegExp(@old,"gm"),@str)`,
                        //replace1: `@(caller).replace(@match,@str)`,
                        contains: `{$regexMatch:{input:@(caller),regex:new RegExp(@str)}}`,
                        //indexOf: `@(caller).indexOf(@str)`,
                        //lastIndexOf: `@(caller).lastIndexOf(@str)`,
                        toLower: `{$toLower:[@(caller)]}`,
                        toUpper: `{$toUpper:[@(caller)]}`,
                        isMatch: `{$regexMatch:{input:@caller,regex:@regex}}`,
                        substring: `{$substr: [@(caller),@startIndex,@endIndex]}`,
                        startsWith: `{$regexMatch:{input:@(caller),regex:new RegExp("^"+@str)}}`,
                        endsWith: `{$regexMatch:{input:@(caller),regex:new RegExp(@str+"$")}}`,
                        trim: `{$trim:{input: @(caller)}}`,
                        trimLeft: `{$ltrim:{input: @caller}}`,
                        trimRight: `{$rtrim:{input: @caller}}`,
                        toNumber: `{@toDecimal:@call}`,
                        toInt: `{@toInt:@call}`,
                        '+': `{$concat:[@caller,@other]}`
                    }
                };
            })(mongodb = Generate.mongodb || (Generate.mongodb = {}));
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../../gen/lang.ts'/>
///<reference path='lib/core/Array.ts'/>
///<reference path='lib/core/Common.ts'/>
///<reference path='lib/core/date.ts'/>
///<reference path='lib/core/Math.ts'/>
///<reference path='lib/core/number.ts'/>
///<reference path='lib/core/string.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Generate;
        (function (Generate) {
            /**
             *  https://docs.mongodb.com/manual/reference/command/nav-geospatial/
             */
            class GenerateMongodb extends Ve.Lang.Generate.GenerateLang {
                at(node, render) {
                    if (node.at instanceof Lang.NameCall) {
                        render.append(node.at);
                        return `"${this.paper.thisObjectName || 'this'}${render.ref(node.at.name)}"`;
                    }
                }
                nameCall(node) {
                    return `@ref()`;
                }
                constant(node) {
                    var name = node.constantType.name;
                    var nu = name.toLocaleLowerCase();
                    if (nu.startsWith('ve.core'))
                        nu = nu.substring('ve.core.'.length);
                    if (nu == 'int' || nu == 'number' || nu == 'double')
                        return `{$literal:${node.value}}`;
                    else if (nu == 'bool')
                        return node.value ? '{$literal:true}' : '{$literal:false}';
                    else if (nu == 'null')
                        return '{$literal:null}';
                    else if (nu == 'string')
                        return `{$literal:\"${node.value.replace(/"/g, '\\"')}\"}`;
                    else if (typeof node.value == 'number' || typeof node.value == 'string') {
                        if (nu == 'date') {
                            return `new Date(${node.value})`;
                        }
                    }
                }
                stringTemplate(node, render) {
                    node.strings.each(str => {
                        render.append(str);
                    });
                    return `{$concat:[${node.strings.map(str => {
                        return render.express(str);
                    }).join(",")}]}`;
                }
                ternary(node, render) {
                    render.append(node.condition);
                    render.append(node.trueExpress);
                    render.append(node.falseExpress);
                    return `
                {
                    $cond: {
                      if:@express(node.condition),
                      then:@express(node.trueExpress),
                      else:@express(node.falseExpress)
                    }
                  }
               `;
                }
                unary(node, render) {
                    render.append(node.express);
                    switch (node.operator) {
                        case '++':
                            return `{$add:[@express(node.express),1]}`;
                        case '--':
                            return `{$add:[@express(node.express),-1]}`;
                        case '!':
                            return `{$not:@express(node.express)}`;
                    }
                }
                bracket(node, render) {
                    render.append(node.express);
                    return `@express(node.express)`;
                }
                binary(node, render) {
                    render.append(node.left);
                    render.append(node.right);
                    var cp = Lang.InferType.InferTypeOperatorBinaryExpress(node);
                    var obj = {
                        caller: render.express(node.left)
                    };
                    obj[cp.parameters.first().name] = render.express(node.right);
                    return this.renderClassProp(cp.onlyName, obj);
                }
                methodCall(node, render) {
                    node.argements.each(exp => {
                        render.append(exp);
                    });
                    return this.generateMethod(node.caller, node, render);
                }
                object(obj, render) {
                    obj.items.each(no => {
                        render.append(no.value);
                    });
                    return {
                        template: `{
                   @content()
            }`, content() {
                            return obj.items.toArray(x => {
                                return `"${x.key}":` + this.express(x.value);
                            }).join(",");
                        }
                    };
                }
            }
            Generate.GenerateMongodb = GenerateMongodb;
            Generate.generateMongodb = new GenerateMongodb();
            Generate.generateMongodb.import(Ve.Lang.Generate.mongodb.genArray);
            Generate.generateMongodb.import(Ve.Lang.Generate.mongodb.genCommon);
            Generate.generateMongodb.import(Ve.Lang.Generate.mongodb.genDate);
            Generate.generateMongodb.import(Ve.Lang.Generate.mongodb.genMath);
            Generate.generateMongodb.import(Ve.Lang.Generate.mongodb.genNumber);
            Generate.generateMongodb.import(Ve.Lang.Generate.mongodb.genString);
        })(Generate = Lang.Generate || (Lang.Generate = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        //ve core library code ...
        Lang.VeLibraryCodes = new Lang.Util.List;
        Lang.VeLibraryCodes.push({ name: '/core/Array.ve', code: `package Ve.Core;
out interface Array<T>{
        ctor();
        readonly length:int;
        readonly first:T;
        readonly last:T;
        readonly reversed:T[];
        readonly isEmpty:bool;
        readonly isNotEmpty:bool;
        clear():void;
        exists(item:T):bool;
        #only('exists1')
        exists(predict:(item:T,at:int)->bool):bool;
        every(predict:(item:T,at:int)->bool):bool;
        findIndex(item:T):int;
        #only('findIndex1')
        findIndex(predict:(item:T)->bool):bool;

        findLastIndex(item:T):int;
        #only('findLastIndex1')
        findLastIndex(predict:(item:T)->bool):int;

        find(predict:(item:T,at:int)->bool):T;
        findLast(predict:(item:T,at:int)->bool):T;
        findAll(predict:(item:T,at:int)->bool):T[];
        
        skip(at:int):T[];

        limit(at:int,size:int):T[];
        //包括startIndex,但是不包括endIndex
        range(startIndex:int,endIndex:int):T[];

        remove(predict:(item:T,at:int)->bool);
        #only('remove1')
        remove(item:T);
        removeAt(at:int);
        removeAll(predict:(item:T,at:int)->bool);

        each(predict:(item:T,at:int)->void);
        eachReverse(predict:(item:T,at:int)->void);

        append(item:T):void;
        prepend(item:T):void;
        insert(item:T,at?:int):void;
        insertMany(items:T[],at?:int):void;

        set(at:int,item:T):void;
        get(at:int):T;
        sum(predict:(item:T,at:int)->number):number;
        avg(predict:(item:T,at:int)->number):number;
        max(predict:(item:T,at:int)->number):number;
        min(predict:(item:T,at:int)->number):number;
        join(predict:(item:T,at:int)->string):string;
        findMax(predict:(item:T,at:int)->number):T;
        findMin(predict:(item:T,at:int)->number):T;
        count(predict:(item:T,at:int)->number):number;
        sort(predict:(item:T,at:int)->any,rank=1):T[];
        map<R>(predict:(item:T,at:int)->R):R[];
}` });
        Lang.VeLibraryCodes.push({ name: '/core/common.ve', code: `package Ve.Core;
#alias('any');
out interface Any{
     readonly isNull:bool;
     readonly isNotNull:bool;
     toString():string;
     operator ==(other:bool):bool;
     operator !=(other:bool):bool;
}
#alias('null');
out interface Null{
  
}
#alias('bool')
out interface Bool{
   ctor();
   ctor(value:bool):Bool;
   operator &&(other:bool):bool;
   operator ||(other:bool):bool;
}
out interface Object{
    ctor();
}
out interface Console{
    print(str:string):void;
}` });
        Lang.VeLibraryCodes.push({ name: '/core/console.ve', code: `package Ve.Core;
#alias('console')
out class Console{
    private ctor();
    static assert(predict:bool);
    static print(msg:string);
    static log(msg:string);
    static warn(msg:string);
    static error(error:Error);
    #only('error1')
    static error(error:string);
}` });
        Lang.VeLibraryCodes.push({ name: '/core/date.ve', code: `
package Ve.Core;
#alias('date')
out interface Date{
    ctor():Date;
    ctor(dateFormat:string):Date;
    ctor(ticks:number):Date;
    ctor(year:int,month:int,day:int,hour:int,minute:int,second:int,millis:int):Date;
    //1970年1月1日 （UTC/GMT的午夜）开始所经过的秒数
    ticks:int;
    year:int;
    //本月1..12
    month:int;
    //每月的一天1..31
    day:int;
    //一年中的第几天
    readonly yearday:int;
    //一星期中的星期几
    readonly weekday:int;
    //一年中的第几周
    readonly week:int;
    //一天中的小时，以24小时制0..23
    hour:int;
    //分钟0...59
    minute:int;
    //秒0...59
    second:int;
    //微秒0...999
    millis:int;
    //年 简写
    readonly y:int;
    //月 简写
    readonly m:int;
    //周 简写
    readonly w:int;
     //日 简写
    readonly d:int;
     //时 简写
    readonly h:int;
     //分钟 简写
    readonly min:int; 
     //秒 简写
    readonly s:int;
     //毫秒 简写
    readonly ms:int;
    //加上几天（相隔），示例 :时间加上2天
    add(num:int,unit="day"):date;
    //加上几天 示例 :当前时间加上2.5天
    adds(num:number,unit="day"):date;
    //当前时间相差2.5天
    sub(to:date,unit='day'):int;
    subs(to:date,unit='day'):number;
    #only("toString1")
    toString(format:string):string;
    operator <(other:date):bool;
    operator <=(other:date):bool;
    operator >(other:date):bool;
    operator >=(other:date):bool;
    static parse(string:string,format="yyyy-mm-dd hh:mm:ss.zzz"):date;
    static now():date;
}
out interface Duration{

}` });
        Lang.VeLibraryCodes.push({ name: '/core/decorate.ve', code: `

package Ve.Core;
#alias('alias');
out decorate interface Alias
{
    ctor(name:string):Alias;
}
#alias('deprecated');
out decorate interface Deprecated{
    ctor(message:string):Deprecated
}
#alias('only')
out decorate interface Only{
    ctor(name:string):Only;
}` });
        Lang.VeLibraryCodes.push({ name: '/core/Error.ve', code: `package Ve.Core;
/**
* 错误
*/
out class Error{
    data:any;
    //错误码
    core:int;
    //帮助链接
    link:string;
    //错误信息
    message:string;
    source:string;
    stack:string;
}` });
        Lang.VeLibraryCodes.push({ name: '/core/math.ve', code: `package Ve.Core;
out interface Math{
    private ctor():Math;
    //返回圆周率（约等于3.14159）。
    static PI:number;
    //返回算术常量 e，即自然对数的底数（约等于2.718）。
    static E:number;
    // 返回 2 的自然对数（约等于0.693）。
    static LN2:number;
    // 返回 10 的自然对数（约等于2.302）。
    static LN10:number;
    // 返回以 2 为底的 e 的对数（约等于 1.414）。
    static LOG2E:number;
    // 返回以 10 为底的 e 的对数（约等于0.434）。
    static LOG10E:number;
    // 返回返回 2 的平方根的倒数（约等于 0.707）。
    static SQRT1_2:number;
    // 返回 2 的平方根（约等于 1.414）。
    static SQRT2:number;

    static cos(angle:number):number;
    static sin(angle:number):number;
    static tan(angle:number):number;
    static acos(num:number):number;
    static asin(num:number):number;
    static atan(num:number):number;
    static atan2(num:number):number;

    static exp(num:number):number;
    static log(num:number):number;
    static pow(num:number):number;
    static sqrt(num:number):number;
    static max(...args:number[]):number;
    static min(...args:number[]):number;
    
    static abs(num:number):number;
    static ceil(num:number):int;
    static floor(num:number):int;
    static round(num:number):int;

}

out interface Random{

    private ctor():Random;
    static nextInt(max:int,min:int=0):int;
    static nextBool():bool;
    static nextNumber():number;
    /**
    * 随机指定位数的数字  
    */
    static number(digit:int):int;
    /**随机文体，包含数字，字母
    * @param digit 表示指定位数
    *
    */
    static chars(digit:int):string;
}

out interface Point{
    ctor(x:number,y:number);
    x:number;
    y:number;
    distanceTo(p1:point):number;
    operator * (factor:number):Point;
    operator + (other:Point):Point;
    operator - (other:Point):Point;
    operator == (other:Point):bool;
    operator != (other:Point):bool;
}

out interface Rectangle{
     ctor(left:number,top:number,width:number,height:number):Rectangle;
     ctor(p1:Point,p2:Point):Rectangle;
     top:number;
     left:number;
     width:number;
     height:number;
     readonly area:number;
     readonly right:number;
     readonly bottom:number;
     readonly topLeft:Point;
     readonly topRight:Point;
     readonly bottomLeft:Point;
     readonly bottomRight:Point;
     boundingBox(other:Rectangle):Rectangle;
     containsPoint(point:Point):bool;
     containsRectangle(other:Rectangle):bool;
     intersection(other:Rectangle):Rectangle;
     intersects(other:Rectangle):bool;
}
out interface Range{
    ctor(min:number,max:number):Range;
    ctor(min:number,minBoundary:bool,max:number,maxBoundary:bool):Range;
    min:number;
    minBoundary:bool=true;
    max:number;
    maxBoundary:bool=true;
    contains(num:number):bool;
    intersection(other:Range):Range;
    intersects(other:Range):bool;
}
` });
        Lang.VeLibraryCodes.push({ name: '/core/number.ve', code: `package Ve.Core;
#alias('number')
out interface Number{
    ctor():number;
    ctor(str:string):number;
    ctor(value:number):number;
    readonly isNegative:bool;
    readonly isNaN:bool;
    //返回当前数的绝对值
    abs():number;
    ceil():int;
    floor():int;
    round():int;
    //返回this的小数点字符串表示形式
    toFixed(fractionDigits:int):string;
    operator %(other:number):number;
    operator *(other:number):number;
    operator +(other:number):number;
    operator -(other:number):number;
    operator /(other:number):double;
    operator <(other:number):bool;
    operator <=(other:number):bool;
    operator >(other:number):bool;
    operator >=(other:number):bool;
    static parse(str:string):number;
    static tryParse(str:string,defaultValue:number=0):number;
}

#alias('int')
out interface Int extends Number{
    ctor();
    ctor(str:string):Int; 
    ctor(value:int):int;
    //偶数
    readonly isEven:bool;
    //奇数
    readonly isOdd:bool;
    operator %(other:number):int;
    operator *(other:number):int;
    operator +(other:number):int;
    operator -(other:number):int;
    operator /(other:number):double;
    operator <(other:number):bool;
    operator <=(other:number):bool;
    operator >(other:number):bool;
    operator >=(other:number):bool;
    static parse(str:String):int;
    static tryParse(str:string,defaultValue:int=0):int;
}
#alias('double')
out interface Double extends Number{
     ctor():Double;
     ctor(str:string):Double;
     operator %(other:number):double;
     operator *(other:number):double;
     operator +(other:number):double;
     operator -(other:number):double;
     operator /(other:number):double;
}` });
        Lang.VeLibraryCodes.push({ name: '/core/string.ve', code: `package Ve.Core;
#alias('string')
out interface String{
    ctor();
    ctor(val:string);
    readonly length:int;
    readonly isEmpty:bool;
    readonly isNotEmpty:bool;
    readonly chars:string[];
    replace(old:string,str:string):string;
    #only("replace1");
    replace(match:Regex,str:string):string;
    contains(str:string):bool;
    indexOf(str:string):int;
    lastIndexOf(str:string):int;
    toLower():string;
    toUpper():string;
    padLeft(width:int,padding:string=' '):string;
    padRight(width:int,padding:string=' '):string;
    match(regex:Regex):string;
    matchs(regex:Regex):string[];
    isMatch(regex:Regex):bool;
    split(str:string):string[];
    substring(startIndex:int,endIndex:int):string;
    reserve():string;
    startsWith(str:string):bool;
    endsWith(str:string):bool;
    trim():string;
    trimLeft():string;
    trimRight():string;
    toNumber(defaultValue=0):number;
    toInt(defaultValue=0):int;
    operator +(other:string):string;
}
out interface Regex{
    ctor(regexStr:string);
    hasMatch(input:string):bool;
    match(input:string):string;
    matchs(input:string):string[];
}` });
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
///<reference path='../ast/compiler.ts'/>
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        function importCoreLibrary() {
            Lang.VeLibraryCodes.each(bc => {
                Lang.coreCompile.importPackage(bc.code, Lang.LibType.core);
            });
        }
        Lang.importCoreLibrary = importCoreLibrary;
        /***
         * 导入核心库接口，构建基本的运行环境
         *
         **/
        importCoreLibrary();
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Outer;
        (function (Outer) {
            /*
             * 通过code解析ve类型
             * example:
             * "int"=>VeType
             * "{a:string,b:string}"=>VeType
             *
             */
            function pickVeTypeFromCode(code) {
                var args = `a:${code}`;
                var keyTypes = pickArgsFromCode(args);
                return keyTypes[0].type;
            }
            Outer.pickVeTypeFromCode = pickVeTypeFromCode;
            /***
             * 通过code去解析参数
             * example:
             * "a:int=2,b=3,c:string='ssss'"=>{ key: string, type: VeType }
             * 参数里面的值基本上都是常量
             *
             */
            function pickArgsFromCode(code) {
                var compiler = new Lang.Compiler();
                var exp = compiler.express(`(${code}):void->{}`).express;
                var args = exp.parameters.map(x => {
                    var value = x.default ? x.default.value : undefined;
                    return {
                        rest: x.rest,
                        key: x.name,
                        optional: x.optional,
                        value: value,
                        type: Outer.TypeExpressToVeType(x.inferType())
                    };
                }).asArray();
                compiler.dispose();
                return args;
            }
            Outer.pickArgsFromCode = pickArgsFromCode;
            /*
             * 通过数据代码去解析Object数据
             * example:
             *  "{a:'xxx',b:5,c:[]}"=>VeProp
             */
            function pickVePropFromCode(code) {
                if (typeof code != 'string')
                    return null;
                var compiler = new Lang.Compiler();
                var exp = compiler.express(code).express;
                var vp = Outer.dataToVeProp(exp);
                compiler.dispose();
                return vp;
            }
            Outer.pickVePropFromCode = pickVePropFromCode;
            /*
            * 通过表达式和参数，去推断当前表达式的返回类型
            * 如果推断有错误，需要抛出来
            * "a+b",[{name:'a',type:'string',value:"xxx"},{name:'b',type:'string',value:'sss'}]=>infer VeType
            */
            function inferExpressType(expressCode, args, thisObjectArgs) {
                if (typeof expressCode != 'string')
                    expressCode = '';
                var compiler = new Lang.Compiler();
                var express = compiler.express(expressCode, args, thisObjectArgs).express;
                var expressType = express.inferType();
                compiler.dispose();
                return Outer.TypeExpressToVeType(expressType);
            }
            Outer.inferExpressType = inferExpressType;
            function inferTypeFunType(funbodyCode, args, thisObjectArgs) {
                if (typeof funbodyCode != 'string')
                    funbodyCode = '';
                var compiler = new Lang.Compiler();
                var cm = compiler.block(funbodyCode, args, thisObjectArgs).classMethod;
                return Outer.TypeExpressToVeType(cm.inferType());
            }
            Outer.inferTypeFunType = inferTypeFunType;
            /**
             * 判断当前表达式是否为常量表达式
             * @param express
             */
            function inferExpressIsConstant(express) {
                if (typeof express != 'string' && express)
                    express = express.toString();
                if (!express)
                    return false;
                var compiler = new Lang.Compiler();
                var r = compiler.express(express);
                if (r.express instanceof Lang.Constant)
                    return true;
                else
                    return false;
            }
            Outer.inferExpressIsConstant = inferExpressIsConstant;
            /**
             * 判断当前表达式是否引用申明的参数，因为有些表达式可以写成"1+1"这种表达式并不是常量表达式
             * @param expressCode
             * @param args
             * @param thisObjectArgs
             *
             */
            function inferExpressIsReferenceArgs(expressCode, args, thisObjectArgs) {
                if (typeof expressCode != 'string')
                    expressCode = '';
                if (!(Array.isArray(args) && args.length > 0))
                    return false;
                var compiler = new Lang.Compiler();
                var express = compiler.express(expressCode, args, thisObjectArgs).express;
                var node = express.find(x => x instanceof Lang.NameCall && args.findIndex(g => g.text == x.name) > -1);
                if (node)
                    return true;
                else
                    return false;
            }
            Outer.inferExpressIsReferenceArgs = inferExpressIsReferenceArgs;
        })(Outer = Lang.Outer || (Lang.Outer = {}));
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
var Ve;
(function (Ve) {
    var Lang;
    (function (Lang) {
        var Outer;
        (function (Outer) {
            /*
             * 翻译生成其它语言的代码
             *
             */
            function TranslateCode(code, lang, error) {
                if (typeof lang == 'string')
                    lang = lang.toLowerCase();
                var gl = Lang.Generate.GenerateLanguage[lang];
                if (typeof gl == 'undefined') {
                    error('not found Generate language ' + lang);
                    return;
                }
                var gen = new Ve.Lang.Generate.Generate();
                gen.on('error', (...args) => {
                    if (typeof error == 'function') {
                        error(...args);
                    }
                });
                return gen.generate(code, gl);
            }
            Outer.TranslateCode = TranslateCode;
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
            function TranslateExpressCode(code, lang, args, thisObjectArgs, options, error) {
                if (typeof lang == 'string')
                    lang = lang.toLowerCase();
                var gl = Lang.Generate.GenerateLanguage[lang];
                if (typeof gl == 'undefined') {
                    error('not found Generate language ' + lang);
                    return;
                }
                var gen = new Ve.Lang.Generate.Generate();
                gen.on('error', (...args) => {
                    if (typeof error == 'function') {
                        error(...args);
                    }
                });
                return gen.generateExpress(code, gl, args, thisObjectArgs, options);
            }
            Outer.TranslateExpressCode = TranslateExpressCode;
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
            function VePropToCode(prop) {
                if (typeof prop.type == 'string' && prop.type.toLowerCase() != 'object' && prop.type.toLowerCase() != 'array') {
                    var pt = prop.type.toLowerCase();
                    switch (pt) {
                        case 'int':
                        case 'double':
                        case 'number':
                        case 've.core.int':
                        case 've.core.number':
                        case 've.core.double':
                            if (typeof prop.value != 'undefined' && prop.value != null)
                                return prop.value.toString();
                            else
                                return '0';
                        case 'string':
                        case 've.core.string':
                            if (typeof prop.value == 'string')
                                return `"${prop.value ? prop.value.replace(/"/g, `\\"`) : ""}"`;
                            else if (typeof prop.value == 'undefined' || prop.value === null)
                                return `""`;
                            else
                                return `"${prop.value.toString()}"`;
                        case 'bool':
                        case 've.core.bool':
                            return prop.value == '是' || prop.value == true || prop.value == 'true' ? 'true' : 'false';
                        case 'date':
                        case 've.core.date':
                            if (typeof prop.value == 'number')
                                prop.value = new Date(prop.value);
                            if (!prop.value)
                                prop.value = new Date(0);
                            if (prop.value instanceof Date) {
                                return `${prop.value.getTime()}Date`;
                            }
                        default:
                            if (prop.value == null || typeof prop.value == 'undefined') {
                                return `${prop.type}!!`;
                            }
                            else if (typeof prop.value == 'string') {
                                return `"${prop.value.replace(/"/g, `\\"`)}"${prop.type}`;
                            }
                            else if (typeof prop.value == 'number') {
                                return `${prop.value}${prop.type}`;
                            }
                    }
                }
                var isArray = prop.type == 'array' || prop.type == 'Array' || prop.type == 'Ve.Core.Array';
                if (!isArray) {
                    if (typeof prop.type == 'object')
                        if (prop.type.unionType && (prop.type.unionType == 'Array' || prop.type.unionType == 'Ve.Core.Array' || prop.type.unionType == 'array')) {
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
                        //说明传递的值是js数组，那么理论上讲是需要将js数组转成ve语言的
                        var vp = jsObjectToVeProp(prop.value);
                        return `[${vp.props.map(pro => {
                            return VePropToCode(pro);
                        }).join(",")}]`;
                    }
                }
                else if (prop.type == 'object' || prop.type == 'Object' || prop.type == 'Ve.Core.Object' || Array.isArray(prop.props)) {
                    if (Array.isArray(prop.props))
                        return `{${prop.props.map(x => {
                            return `"${x.text}":${VePropToCode(x)}`;
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
                    if (prop.type == 'Array' || prop.type == 'array' || prop.type == 'Ve.Core.Array') {
                        return {
                            unionType: 'Array',
                            generics: [VePropToVeType(prop.props[0])]
                        };
                    }
                    else if (prop.type == 'Object' || prop.type == 'object' || prop.type == 'Ve.Core.Object') {
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
                    return `{${veType.props.map(x => `${x.key}:${VeTypeToCode(x.type)}`).join(",")}}`;
                }
                else if (Array.isArray(veType.args)) {
                    return `(${veType.args.map(x => `${x.key}:${VeTypeToCode(x.type)}`)})=>${veType.returnType ? VeTypeToCode(veType.returnType) : 'void'}`;
                }
                else if (veType.unionType) {
                    if ((veType.unionType == 'Array' || veType.unionType == 'Ve.Core.Array') && veType.generics.length == 1) {
                        return `${VeTypeToCode(veType.generics[0])}[]`;
                    }
                    else {
                        return `${VeTypeToCode(veType.unionType)}<${veType.generics.map(x => VeTypeToCode(x)).join(",")}>`;
                    }
                }
            }
            Outer.VeTypeToCode = VeTypeToCode;
            function TypeExpressToVeType(typeExpress) {
                if (typeExpress.name)
                    return typeExpress.name;
                else if (typeExpress.unionType) {
                    return {
                        unionType: TypeExpressToVeType(typeExpress.unionType),
                        generics: typeExpress.generics.map(gen => TypeExpressToVeType(gen)).asArray()
                    };
                }
                else if (typeExpress.args) {
                    return {
                        args: typeExpress.args.toArray(x => {
                            return {
                                key: x.key,
                                type: TypeExpressToVeType(x.type)
                            };
                        }).asArray(),
                        returnType: TypeExpressToVeType(typeExpress.returnType)
                    };
                }
                else if (typeExpress.props) {
                    return {
                        props: typeExpress.props.toArray(x => { return { key: x.key, type: TypeExpressToVeType(x.type) }; })
                            .asArray()
                    };
                }
            }
            Outer.TypeExpressToVeType = TypeExpressToVeType;
            function dataToVeProp(data) {
                var prop;
                if (data instanceof Lang.Constant) {
                    prop = {};
                    prop.type = TypeExpressToVeType(data.constantType);
                    prop.value = data.value;
                    return prop;
                }
                else if (data instanceof Lang.ObjectExpress) {
                    prop = { props: [], type: TypeExpressToVeType(data.inferType()) };
                    data.items.each(pro => {
                        var p = dataToVeProp(pro.value);
                        p.text = pro.key;
                        prop.props.push(p);
                    });
                    return prop;
                }
                else if (data instanceof Lang.ArrayExpress) {
                    prop = { props: [], type: TypeExpressToVeType(data.inferType()) };
                    data.items.each(pro => {
                        var p = dataToVeProp(pro);
                        prop.props.push(p);
                    });
                    return prop;
                }
                else if (data instanceof Lang.DeclareVariable) {
                    prop = {};
                    prop.type = TypeExpressToVeType(data.inferType());
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
                    var prop = { text: '', type: 'Date', value: jsObject.getTime() };
                    return prop;
                }
                else if (jsObject === null || typeof jsObject == 'undefined') {
                    var prop = { text: '', type: 'Null', value: null };
                    return prop;
                }
                else if (typeof jsObject == 'object') {
                    if (typeof jsObject.__ve_type == 'string') {
                        //说明这是ve语言的类型用js表达的
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
/***
 *{"标题":"","分类":"boy","是否推送至公众号":false,"图片":"/资源/图片.png","文章内容":"","ID":""}
 *
 */ 
//# sourceMappingURL=ve.js.map