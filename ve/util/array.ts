

namespace Ve.Lang {
    export type VeArrayPredict<T> = T | ((item?: any, index?: number, array?: VeArray<T>) => boolean);

    export class VeArray<T> extends Array<T>{
        constructor(...args: T[]) {
            super();
            if (args.length > 1) {
                args.forEach(arg => this.push(arg));
            }
            else if (args.length == 1) {
                if (args[0] instanceof VeArray) {
                    (<any>args[0]).forEach(x => this.push(x));
                }
                else if (Array.isArray(args[0])) {
                    (<any>args[0]).forEach(x => this.push(x));
                }
                else this.push(args[0]);
            }
        }
        private predicateMatch(item: any, index: number, array: VeArray<T>, predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): boolean {
            if (typeof predicate == 'function') {
                return (<any>predicate)(item, index, array);
            }
            else return predicate == item;
        }
        last(): T {
            return this.eq(this.length - 1);
        }
        first(): T {
            return this.eq(0);
        }
        eq(pos: number): T {
            return this[pos];
        }
        map<U>(predicate: (item?: T, index?: number, array?: VeArray<T>) => U): VeArray<U> {
            var ve = new VeArray<U>();
            for (var i = 0; i < this.length; i++) {
                var r = predicate(this.eq(i), i, this);
                if (typeof r != typeof undefined) {
                    ve.push(r);
                }
            }
            return ve;
        }
        append(a: VeArray<T> | T[] | T, pos?: number): VeArray<T> {
            this.insertAt(pos || this.length, a);
            return this;
        }
        insertAt(pos: number, a: VeArray<T> | T[] | T): VeArray<T> {
            if (a instanceof VeArray) {
                var args: any = [pos, 0];
                a.forEach(x => args.push(x));
                Array.prototype.splice.apply(this, args);
            }
            else if (a instanceof Array) {
                var args: any = [pos, 0];
                a.forEach(x => args.push(x));
                Array.prototype.splice.apply(this, args);
            }
            else {
                this.splice(pos, 0, a);
            }
            return this;
        }
        replaceAt(pos: number, a: T): VeArray<T> {
            this[pos] = a;
            return this;
        }
        appendArray(a: VeArray<any> | any[], pos?: number): VeArray<T> {
            //将数组添加进来
            this.insertArrayAt(pos || this.length, a);
            return this;
        }
        insertArrayAt(pos: number, a: VeArray<any> | any[]): VeArray<T> {
            //将数组添加到指定位置
            this.splice(pos, 0, a as any);
            return this;
        }
        removeAt(pos: number): VeArray<T> {
            this.splice(pos, 1);
            return this;
        }
        remove(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): VeArray<T> {
            var i = this.length - 1;
            for (i; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    this.removeAt(i);
                    break;
                }
            }
            return this;
        }
        removeAll(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): VeArray<T> {
            var i = this.length - 1;
            for (i; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    this.removeAt(i);
                }
            }
            return this;
        }
        removeBefore(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean), isIncludeFind?: boolean): VeArray<T> {
            var index = this.findIndex(predicate);
            if (isIncludeFind == true) this.removeAll((x, i) => i <= index);
            else this.removeAll((x, i) => i < index);
            return this;
        }
        removeAfter(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean), isIncludeFind?: boolean): VeArray<T> {
            var index = this.findIndex(predicate);
            if (isIncludeFind == true) this.removeAll((x, i) => i >= index);
            else this.removeAll((x, i) => i > index); return this;
        }
        exists(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): boolean {
            return this.findIndex(predicate) >= 0;
        }
        find(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): T | null {
            for (let i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    return this.eq(i);
                }
            }
            return null;
        }
        findLast(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): T | null {
            for (var i = this.length - 1; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    return this.eq(i);
                }
            }
            return null;
        }
        findBefore(indexPredict: VeArrayPredict<T>, predict: VeArrayPredict<T>, isIncludeSelf: boolean = false) {
            var index = this.findIndex(indexPredict);
            for (let i = 0; i < index - (isIncludeSelf == true ? 0 : 1); i++) {
                if (this.predicateMatch(this.eq(i), i, this, predict) == true) {
                    return this.eq(i);
                }
            }
            return null;
        }
        findAfter(indexPredict: VeArrayPredict<T>, predict: VeArrayPredict<T>, isIncludeSelf: boolean = false) {
            var index = this.findIndex(indexPredict);
            for (let i = index + (isIncludeSelf == true ? 0 : 1); i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predict) == true) {
                    return this.eq(i);
                }
            }
            return null;
        }
        findSkip(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), skip: number = 1): T {
            var index = this.findIndex(predicate);
            return this.eq(index + skip);
        }
        findRange(
            predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean),
            predicate2: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)
        ): VeArray<T> {
            var start = this.findIndex(predicate);
            var end = this.findIndex(predicate2);
            return this.range(start, end);
        }
        findAll(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): VeArray<T> {
            var result = new VeArray<T>();
            for (var i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    result.push(this.eq(i));
                }
            }
            return result;
        }
        findIndex(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), defaultIndex?: number): number {
            for (var i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    return i;
                }
            }
            if (typeof defaultIndex == 'number') return defaultIndex;
            return -1;
        }
        findLastIndex(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), defaultIndex?: number): number {
            var i = this.length - 1;
            for (i; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    return i;
                }
            }
            if (typeof defaultIndex == 'number') return defaultIndex;
            return -1;
        }
        forEach(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void {
            this.each(predicate);
        }
        each(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void {
            for (var i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == false) {
                    break;
                }
            }
        }
        reach(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void {
            this.eachReverse(predicate);
        }
        recursion(predicate: (item?: T, index?: number, next?: ((index?: number) => void)) => void) {
            var next = (i: number) => {
                if (i < this.length)
                    predicate(this.eq(i), i, next);
            }
            predicate(this.eq(0), 0, next);
        }
        eachReverse(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void {
            for (var i = this.length - 1; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate)) {
                    break;
                }
            }
        }
        limit(index: number, size: number): VeArray<T> {
            if (size <= 0) { return new VeArray<T>(); }
            return this.range(index, index + size - 1);
        }
        range(start: number, end?: number): VeArray<T> {
            var arr = new VeArray<T>();
            if (typeof end == typeof undefined) end = this.length;
            this.each(function (val, i) {
                if (i >= start && i <= end) { arr.push(val); }
            });
            return arr;
        }
        split(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => any)): VeArray<VeArray<T>> {
            var list = new VeArray<VeArray<T>>();
            var gs = new VeArray<T>();
            var self = this;
            this.each(function (val, i, arr) {
                if (self.predicateMatch(val, i, arr, predicate) == true) {
                    if (gs.length > 0) list.appendArray(gs);
                    gs = new VeArray<T>();
                }
                else gs.append(val);
            })
            if (gs.length > 0) list.appendArray(gs);
            return list;
        }
        matchIndex(regex: string | RegExp, map: (item?: T, index?: number, array?: VeArray<T>) => string, startIndex?: number): number {
            if (typeof startIndex == typeof undefined) startIndex = 0;
            var text = this.findAll((x, i) => i >= startIndex).map(map).join("");
            if (typeof regex == 'string') regex = new RegExp(regex);
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
        match(regex: string | RegExp, map: (item?: any, index?: number, array?: VeArray<T>) => string, startIndex?: number): VeArray<T> {
            if (typeof startIndex == typeof undefined) startIndex = 0;
            var mi = this.matchIndex(regex, map, startIndex);
            return this.range(startIndex, mi);
        }
        copy(): VeArray<T> {
            return this.map(x => x);
        }
        asArray(): T[] {
            var as = new Array<T>();
            this.each(t => {
                as.push(t);
            })
            return as;
        }
        arrayJsonEach(arrayJsonName: string, fn: (item: T, deep?: number, index?: number, sort?: number, parent?: T, arr?: VeArray<T>) => (void | {
            break?: boolean;
            continue?: boolean;
            returns?: any;
        }), parent?: T, defaultDeep?: number, defaultIndex?: number): { total: number, deep: number } {
            var maxDeep = defaultDeep == undefined ? 0 : defaultDeep;
            var index = defaultIndex == undefined ? 0 : defaultIndex;
            var isBreak = false;
            var fc = function (arr, deep, parent) {
                if (deep > maxDeep) {
                    maxDeep = deep;
                }
                var sort = 0;
                _.each<T>(arr, function (a) {
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
                })
            };
            fc(this, maxDeep, parent);
            return { total: index, deep: maxDeep };
        }
        static isVeArray(t) {
            return t instanceof VeArray;
        }
        static asVeArray<V>(t: V | V[] | VeArray<V>): VeArray<V> {
            if (t instanceof VeArray) return t;
            else return new VeArray<V>(<any>t);
        }
    }

    export var _ = {
        remove<T>(
            array: T[],
            predict: ((t: T, index?: number, thisArray?: T[]) => boolean) | T
        ) {
            var index = this.findIndex(array, predict);
            if (index > -1)
                array.splice(index, 1);
        },
        removeAll<T>(array: T[],
            predict: ((t: T, index?: number, thisArray?: T[]) => boolean) | T) {
            for (let i = array.length - 1; i >= 0; i--) {
                if (typeof predict == 'function') {
                    var r = (predict as any)(array[i], i, array);
                    if (r == true) array.splice(i, 1);
                }
                else if (predict === array[i]) {
                    array.splice(i, 1);
                }
            }
        },
        each<T>(
            array: T[],
            predict: ((t: T, index?: number, thisArray?: T[]) => boolean)
        ) {
            for (let i = 0; i < array.length; i++) {
                let data = array[i];
                if (typeof predict == 'function') {
                    var result = predict(data, i, array);
                    if (result == false) break;
                }
            }
        },
        addRange<T>(array: T[], newArray: T[]) {
            newArray.forEach(t => array.push(t));
        },
        find<T>(array: T[], predict: ((t: T, index?: number, thisArray?: T[]) => boolean)) {
            for (let i = 0; i < array.length; i++) {
                if (typeof predict == 'function') {
                    var r = predict(array[i], i, array);
                    if (r == true) return array[i]
                }
            }
        },
        findIndex<T>(array: T[], predict: ((t: T, index?: number, thisArray?: T[]) => boolean) | T): number {
            for (let i = 0; i < array.length; i++) {
                if (typeof predict == 'function') {
                    var r = (predict as any)(array[i], i, array);
                    if (r == true) return i
                }
                else if (predict === array[i]) {
                    return i;
                }
            }
        },
        exists<T>(array: T[], predict: ((t: T, index?: number, thisArray?: T[]) => boolean) | T) {
            return this.findIndex(array, predict) > -1 ? true : false;
        },
        arrayJsonEach<T>(array: T[], arrayJsonName: string,
            fn: (item: T, deep?: number, index?: number, sort?: number, parent?: any, arr?: any[]) => (void | { break?: boolean, continue?: boolean, returns?: any }),
            parent?: any, defaultDeep?: any, defaultIndex?: any) {
            var maxDeep = defaultDeep == undefined ? 0 : defaultDeep;
            var index = defaultIndex == undefined ? 0 : defaultIndex;
            var isBreak = false;
            var fc = function (arr, deep, parent) {
                if (deep > maxDeep) { maxDeep = deep; }
                var sort = 0;
                arr.forEach(function (a) {
                    if (isBreak) { return false; }
                    var r = fn(a, deep, index, sort, parent, arr);
                    if (r && r.break == true) {
                        isBreak = true;
                    }
                    if (isBreak) { return false; }
                    if (r && r.continue == true) {
                        return;
                    }
                    index += 1;
                    sort += 1;
                    if (a && Array.isArray(a[arrayJsonName])) {
                        fc(a[arrayJsonName], deep + 1, r && r.returns ? r.returns : undefined);
                    }
                })
            }
            fc(array, maxDeep, parent);
            return { total: index, deep: maxDeep };
        }
    }
}