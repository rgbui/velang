declare namespace Ve.Lang {
    class VeArray<T> extends Array<T> {
        constructor(...args: T[]);
        private predicateMatch;
        last(): T;
        first(): T;
        eq(pos: number): T;
        map<U>(predicate: (item?: T, index?: number, array?: VeArray<T>) => U): VeArray<U>;
        append(a: VeArray<T> | T[] | T, pos?: number): VeArray<T>;
        insertAt(pos: number, a: VeArray<T> | T[] | T): VeArray<T>;
        replaceAt(pos: number, a: T): VeArray<T>;
        appendArray(a: VeArray<any> | any[], pos?: number): VeArray<T>;
        insertArrayAt(pos: number, a: VeArray<any> | any[]): VeArray<T>;
        removeAt(pos: number): VeArray<T>;
        remove(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): VeArray<T>;
        removeAll(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): VeArray<T>;
        removeBefore(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean), isIncludeFind?: boolean): VeArray<T>;
        removeAfter(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean), isIncludeFind?: boolean): VeArray<T>;
        exists(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => boolean)): boolean;
        find(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): T | null;
        findLast(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): T | null;
        findSkip(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), skip?: number): T;
        findRange(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), predicate2: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): VeArray<T>;
        findAll(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean)): VeArray<T>;
        findIndex(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), defaultIndex?: number): number;
        findLastIndex(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => boolean), defaultIndex?: number): number;
        forEach(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void;
        each(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void;
        reach(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void;
        recursion(predicate: (item?: T, index?: number, next?: ((index?: number) => void)) => void): void;
        eachReverse(predicate: T | ((item?: T, index?: number, array?: VeArray<T>) => any)): void;
        limit(index: number, size: number): VeArray<T>;
        range(start: number, end?: number): VeArray<T>;
        split(predicate: T | ((item?: any, index?: number, array?: VeArray<T>) => any)): VeArray<VeArray<T>>;
        matchIndex(regex: string | RegExp, map: (item?: T, index?: number, array?: VeArray<T>) => string, startIndex?: number): number;
        match(regex: string | RegExp, map: (item?: any, index?: number, array?: VeArray<T>) => string, startIndex?: number): VeArray<T>;
        copy(): VeArray<T>;
        asArray(): T[];
        static isVeArray(t: any): boolean;
        static asVeArray(t: any): any;
    }
}
