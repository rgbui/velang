namespace Ve.Lang {

    export class State<T> {
        root: T;
        current: T;
        context: T;
    }
    export interface Mode<T> {
        state: State<T>;
        startState(): State<T>;
        token(stream: StringStream, state: State<T>): T;
        tokenStart?(stream: StringStream, state: State<T>);
        tokenEnd?(stream: StringStream, state: State<T>);
        walk?(stream: StringStream, state: State<T>): T;
        revise?();
    }
}