import type { MaybePromise } from "../../utils/types.ts";

const err = () => {
    throw new Error(
        `Attempted to access own keys of a record built with ${proxify.name} by providing a function but no source for keys.`,
    );
};

// TODO: basic proxify logic and caching should be separate functions
const proxify = <T extends Record<PropertyKey, unknown>>(f: <K extends keyof T>(key: K) => T[K]): T => {
    const cache = new Map<PropertyKey, unknown>();

    return new Proxy(
        {},
        {
            get: (_, property) => {
                if (!cache.has(property)) {
                    cache.set(property, f(property as keyof T));
                }
                return cache.get(property);
            },
            ownKeys: err,
        },
    ) as T;
};

// TODO: I'm leaving additions below now but they look all a bit too funky to me.
// Let's try to remove as much as possible later.

// TODO: do TBuildableFunction and TBuildableFunctionMiddleware need to be separate types?
export type TBuildableFunction = (dependencies: never, arg: never) => MaybePromise<unknown>;
type TBuildableFunctions = Record<PropertyKey, TBuildableFunction>;
// TODO: allow middleware to change return type?
type TBuildableFunctionMiddleware = <Dependencies, Argument, Return>(
    functionToBind: (dependencies: Dependencies, arg: Argument) => MaybePromise<Return>,
) => (dependencies: Dependencies, arg: Argument) => MaybePromise<Return>;

type TRemainingArguments<Function extends TBuildableFunction> =
    Parameters<Function> extends [unknown, ...infer RemainingArguments] ? RemainingArguments : never;

type TBuiltFunction<Function extends TBuildableFunction> = (
    ...args: TRemainingArguments<Function>
) => ReturnType<Function>;

type TBuiltFunctions<Functions extends TBuildableFunctions> = {
    readonly [Key in keyof Functions]: TBuiltFunction<Functions[Key]>;
};

export function buildFunction<Dependencies, Function extends TBuildableFunction>(
    dependencies: Dependencies,
    functionToBind: Function,
): TBuiltFunction<Function> {
    return (...args: TRemainingArguments<Function>) =>
        Reflect.apply(functionToBind, undefined, [dependencies, ...args]) as ReturnType<Function>;
}

export function build<Dependencies, Functions extends TBuildableFunctions>(
    dependencies: Dependencies,
    functions: Functions,
    // TODO: instead of requiring a middleware, update the caller to build and provide a Record with middleware'd functions?
    middleware?: TBuildableFunctionMiddleware,
): TBuiltFunctions<Functions> {
    return proxify<TBuiltFunctions<Functions>>((key) =>
        // TODO: is there a TS bug or something I don't understand here?
        // - With `buildFunction(dependencies, functions[key])`, functions[key] is never undefined.
        // - But with the following line, ! must be appended to both access to functions
        buildFunction(dependencies, middleware?.(functions[key]!) ?? functions[key]!),
    );
}

export default proxify;
