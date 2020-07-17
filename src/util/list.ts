


namespace Ve.Lang.Util {
    export type ListPredict<T> = T | ((item?: any, index?: number, list?: List<T>) => boolean);
    export class List<T> {
        private $ = new Array<T>();
        constructor(...args: T[]) {
            if (args.length > 1) {
                args.forEach(arg => this.push(arg));
            }
            else if (args.length == 1) {
                if (args[0] instanceof List) {
                    (<any>args[0]).forEach(x => this.push(x));
                }
                else if (Array.isArray(args[0])) {
                    (<any>args[0]).forEach(x => this.push(x));
                }
                else this.push(args[0]);
            }
        }
        push(item: T) {
            return this.$.push(item);
        }
        get length() {
            return this.$.length;
        }
        splice(start: number, deleteCount: number, ...items: T[]) {
            this.$.splice(start, deleteCount, ...items);
            return this;
        }
        join(separator?: string, predict?: (item: T, i: number, list: List<T>) => string): string {
            if (typeof predict == 'function') return this.map(predict).join(separator)
            else return this.$.join(separator);
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
        sort(compareFn?: (a: T, b: T) => number) {
            this.$.sort(compareFn);
            return this;
        }
        eq(pos: number): T {
            return this.$[pos];
        }
        predicateMatch(item: any, index: number, list: List<T>, predicate: ListPredict<T>): boolean {
            if (typeof predicate == 'function') {
                return (<any>predicate)(item, index, list);
            }
            else return predicate == item;
        }
        last(): T {
            return this.eq(this.length - 1);
        }
        first(): T {
            return this.eq(0);
        }

        toArray<U>(predicate: (item?: T, index?: number, list?: List<T>) => U): List<U> {
            var ve = new List<U>();
            for (var i = 0; i < this.length; i++) {
                var r = predicate(this.eq(i), i, this);
                if (typeof r != typeof undefined) {
                    ve.push(r);
                }
            }
            return ve;
        }
        append(a: List<T> | T[] | T, pos?: number): List<T> {
            this.insertAt(pos || this.length, a);
            return this;
        }
        insertAt(pos: number, a: List<T> | T[] | T): List<T> {
            if (a instanceof List) {
                var args: any = [pos, 0];
                a.forEach(x => args.push(x));
                this.splice.apply(this, args);
            }
            else if (a instanceof Array) {
                var args: any = [pos, 0];
                a.forEach(x => args.push(x));
                this.splice.apply(this, args);
            }
            else {
                this.splice(pos, 0, a);
            }
            return this;
        }
        replaceAt(pos: number, a: T): List<T> {
            this.$[pos] = a;
            return this;
        }
        appendArray(a: List<any> | any[], pos?: number): List<T> {
            //将数组添加进来
            this.insertArrayAt(pos || this.length, a);
            return this;
        }
        insertArrayAt(pos: number, a: List<any> | any[]): List<T> {
            //将数组添加到指定位置
            this.splice(pos, 0, a as any);
            return this;
        }
        removeAt(pos: number): List<T> {
            this.splice(pos, 1);
            return this;
        }
        remove(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean)): List<T> {
            var i = this.length - 1;
            for (i; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    this.removeAt(i);
                    break;
                }
            }
            return this;
        }
        removeAll(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean)): List<T> {
            var i = this.length - 1;
            for (i; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    this.removeAt(i);
                }
            }
            return this;
        }
        removeBefore(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean), isIncludeFind?: boolean): List<T> {
            var index = this.findIndex(predicate as any);
            if (isIncludeFind == true) this.removeAll((x, i) => i <= index);
            else this.removeAll((x, i) => i < index);
            return this;
        }
        removeAfter(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean), isIncludeFind?: boolean): List<T> {
            var index = this.findIndex(predicate as any);
            if (isIncludeFind == true) this.removeAll((x, i) => i >= index);
            else this.removeAll((x, i) => i > index); return this;
        }
        exists(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean)): boolean {
            return this.findIndex(predicate as any) >= 0;
        }
        trueForAll(predicate: T | ((item?: any, index?: number, list?: List<T>) => boolean)): boolean {
            for (var i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) !== true) return false;
            }
            return true;
        }
        findLast(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean)): T | null {
            for (var i = this.length - 1; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    return this.eq(i);
                }
            }
            return null;
        }
        findBefore(indexPredict: ListPredict<T>, predict: ListPredict<T>, isIncludeSelf: boolean = false) {
            var index = this.findIndex(indexPredict as any);
            for (let i = 0; i < index - (isIncludeSelf == true ? 0 : 1); i++) {
                if (this.predicateMatch(this.eq(i), i, this, predict) == true) {
                    return this.eq(i);
                }
            }
            return null;
        }
        findAfter(indexPredict: ListPredict<T>, predict: ListPredict<T>, isIncludeSelf: boolean = false) {
            var index = this.findIndex(indexPredict as any);
            for (let i = index + (isIncludeSelf == true ? 0 : 1); i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predict) == true) {
                    return this.eq(i);
                }
            }
            return null;
        }
        findSkip(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean), skip: number = 1): T {
            var index = this.findIndex(predicate as any);
            return this.eq(index + skip);
        }
        findRange(
            predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean),
            predicate2: T | ((item?: T, index?: number, list?: List<T>) => boolean)
        ): List<T> {
            var start = this.findIndex(predicate as any);
            var end = this.findIndex(predicate2 as any);
            return this.range(start, end);
        }
        findAll(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean)): List<T> {
            var result = new List<T>();
            for (var i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    result.push(this.eq(i));
                }
            }
            return result;
        }
        findAt(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean), defaultIndex?: number): number {
            for (var i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    return i;
                }
            }
            if (typeof defaultIndex == 'number') return defaultIndex;
            return -1;
        }
        findLastIndex(predicate: T | ((item?: T, index?: number, list?: List<T>) => boolean), defaultIndex?: number): number {
            var i = this.length - 1;
            for (i; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    return i;
                }
            }
            if (typeof defaultIndex == 'number') return defaultIndex;
            return -1;
        }
        forEach(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): void {
            this.each(predicate);
        }
        each(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): void {
            for (var i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == false) {
                    break;
                }
            }
        }
        reach(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): void {
            this.eachReverse(predicate);
        }
        recursion(predicate: (item?: T, index?: number, next?: ((index?: number) => void)) => void) {
            var next = (i: number) => {
                if (i < this.length)
                    predicate(this.eq(i), i, next);
            }
            predicate(this.eq(0), 0, next);
        }
        eachReverse(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): void {
            for (var i = this.length - 1; i >= 0; i--) {
                if (this.predicateMatch(this.eq(i), i, this, predicate)) {
                    break;
                }
            }
        }
        limit(index: number, size: number): List<T> {
            if (size <= 0) { return new List<T>(); }
            return this.range(index, index + size - 1);
        }
        /***
         * 包含start,end
         */
        range(start: number, end?: number): List<T> {
            var arr = new List<T>();
            if (typeof end == typeof undefined) end = this.length;
            this.each(function (val, i) {
                if (i >= start && i <= end) { arr.push(val); }
            });
            return arr;
        }
        split(predicate: T | ((item?: T, index?: number, list?: List<T>) => any)): List<List<T>> {
            var list = new List<List<T>>();
            var gs = new List<T>();
            var self = this;
            this.each(function (val, i, arr) {
                if (self.predicateMatch(val, i, arr, predicate) == true) {
                    if (gs.length > 0) list.appendArray(gs);
                    gs = new List<T>();
                }
                else gs.append(val);
            })
            if (gs.length > 0) list.appendArray(gs);
            return list;
        }
        matchIndex(regex: string | RegExp, map: (item?: T, index?: number, list?: List<T>) => string, startIndex?: number): number {
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
        /**
         * 两个集合相减
         */
        subtract(arr: List<T>): List<T> {
            return this.findAll(x => !arr.exists(x));
        }
        sum(predicate?: T | ((item?: T, index?: number, list?: List<T>) => number)) {
            var s = 0;
            this.each((r, i) => {
                if (typeof predicate == 'undefined') s += r as any;
                else if (typeof predicate == 'function') s += (predicate as any)(r, i, this);
                else s += r as any;
            });
            return s;
        }
        match(regex: string | RegExp, map: (item?: any, index?: number, list?: List<T>) => string, startIndex?: number): List<T> {
            if (typeof startIndex == typeof undefined) startIndex = 0;
            var mi = this.matchIndex(regex, map, startIndex);
            return this.range(startIndex, mi);
        }
        copy(): List<T> {
            return this.map(x => x) as any;
        }
        asArray(): T[] {
            var as = new Array<T>();
            this.each(t => {
                as.push(t);
            })
            return as;
        }
        treeEach(treeChildName: string, fn: (item: T, deep?: number, index?: number, sort?: number, parent?: T, arr?: List<T>) => (void | {
            break?: boolean;
            continue?: boolean;
            returns?: any;
        }), parent?: T, defaultDeep?: number, defaultIndex?: number): { total: number, deep: number } {
            var maxDeep = defaultDeep == undefined ? 0 : defaultDeep;
            var index = defaultIndex == undefined ? 0 : defaultIndex;
            var isBreak = false;
            var fc = function (arr: List<T>, deep, parent) {
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
                })
            };
            fc(this, maxDeep, parent);
            return { total: index, deep: maxDeep };
        }
        findIndex(predicate, defaultIndex?: number) {
            for (var i = 0; i < this.length; i++) {
                if (this.predicateMatch(this.eq(i), i, this, predicate) == true) {
                    return i;
                }
            }
            if (typeof defaultIndex == 'number') return defaultIndex;
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
        map<U>(predicate: (item: T, i: number, list: List<T>) => U) {
            var ve = new List<U>();
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
        static asList<V>(t: V | V[] | List<V>): List<V> {
            if (t instanceof List) return t;
            else return new List<V>(<any>t);
        }
        static treeEach<T>(list: List<T>, treeChildName: string,
            fn: (item: T, deep?: number, index?: number, sort?: number, parent?: any, arr?: List<T>) => (void | { break?: boolean, continue?: boolean, returns?: any }),
            parent?: any, defaultDeep?: any, defaultIndex?: any) {
            var maxDeep = defaultDeep == undefined ? 0 : defaultDeep;
            var index = defaultIndex == undefined ? 0 : defaultIndex;
            var isBreak = false;
            var fc = function (arr: List<T>, deep, parent) {
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
                    if (a && a[treeChildName] && a[treeChildName].length > 0) {
                        fc(a[treeChildName], deep + 1, r && r.returns ? r.returns : undefined);
                    }
                })
            }
            fc(list, maxDeep, parent);
            return { total: index, deep: maxDeep };
        }
    }


    export var _ = {
        remove<T>(
            list: T[],
            predict: ((t: T, index?: number, thisArray?: T[]) => boolean) | T
        ) {
            var index = this.findIndex(list, predict);
            if (index > -1) list.splice(index, 1);
        },
        removeAll<T>(list: T[],
            predict: ((t: T, index?: number, thisArray?: T[]) => boolean) | T) {
            for (let i = list.length - 1; i >= 0; i--) {
                if (typeof predict == 'function') {
                    var r = (predict as any)(list[i], i, list);
                    if (r == true) list.splice(i, 1);
                }
                else if (predict === list[i]) {
                    list.splice(i, 1);
                }
            }
        },
        each<T>(
            list: T[],
            predict: ((t: T, index?: number, thisArray?: T[]) => boolean)
        ) {
            for (let i = 0; i < list.length; i++) {
                let data = list[i];
                if (typeof predict == 'function') {
                    var result = predict(data, i, list);
                    if (result == false) break;
                }
            }
        },
        addRange<T>(list: T[], newArray: T[]) {
            newArray.forEach(t => list.push(t));
        },
        find<T>(list: T[], predict: ((t: T, index?: number, thisArray?: T[]) => boolean)) {
            for (let i = 0; i < list.length; i++) {
                if (typeof predict == 'function') {
                    var r = predict(list[i], i, list);
                    if (r == true) return list[i]
                }
            }
        },
        findIndex<T>(list: T[], predict: ((t: T, index?: number, thisArray?: T[]) => boolean) | T): number {
            for (let i = 0; i < list.length; i++) {
                if (typeof predict == 'function') {
                    var r = (predict as any)(list[i], i, list);
                    if (r == true) return i
                }
                else if (predict === list[i]) {
                    return i;
                }
            }
        },
        exists<T>(list: T[], predict: ((t: T, index?: number, thisArray?: T[]) => boolean) | T) {
            return this.findIndex(list, predict) > -1 ? true : false;
        },
        treeEach<T>(list: T[], treeChildName: string,
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
                    if (a && Array.isArray(a[treeChildName])) {
                        fc(a[treeChildName], deep + 1, r && r.returns ? r.returns : undefined);
                    }
                })
            }
            fc(list, maxDeep, parent);
            return { total: index, deep: maxDeep };
        }
    }
}