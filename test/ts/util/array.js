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
                for (var i = 0; i < this.length; i++) {
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
            static isVeArray(t) {
                return t instanceof VeArray;
            }
            static asVeArray(t) {
                if (VeArray.isVeArray(t))
                    return t;
                else
                    return new VeArray(t);
            }
        }
        Lang.VeArray = VeArray;
    })(Lang = Ve.Lang || (Ve.Lang = {}));
})(Ve || (Ve = {}));
//# sourceMappingURL=array.js.map