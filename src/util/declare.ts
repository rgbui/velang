namespace Ve.Lang {
    export type ArrayOf<T> = T extends (infer p)[] ? p : never;
    export type ListOf<T> = T extends Ve.Lang.Util.List<infer p> ? p : never;
}
