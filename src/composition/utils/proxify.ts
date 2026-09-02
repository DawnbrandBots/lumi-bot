import type { MaybePromise } from "../../utils/types.ts";
import memoizeUnary from "./memoizeUnary.ts";

const err = () => {
    throw new Error(
        `Attempted to access own keys of a record built with ${proxify.name} by providing a function but no source for keys.`,
    );
};

/**
 * Given a function that returns a value of a specific type for each possible {@link PropertyKey}-compatible input value,
 * returns a proxy object typed as having keys of the same type as the input function's keys and values of the same type as the input function's return type.
 *
 * Example:
 *
 * ```ts
 * const record = { foo: "a", bar: 1 } as const;
 *
 * const proxifiedRecord = proxify<typeof record>((key) => {
 *   console.log(`Accessing key: ${key}`);
 *   return record[key];
 * });
 *
 * console.log(proxifiedRecord.foo); // Output: "a"
 * console.log(proxifiedRecord.bar); // Output: 1
 * console.log(proxifiedRecord.baz); // Property 'baz' does not exist on type '{ readonly foo: "a"; readonly bar: 1; }'.
 * ```
 */
const proxify = <T extends Record<PropertyKey, unknown>>(f: <K extends keyof T>(key: K) => T[K]): T => {
    return new Proxy({}, { get: (_, property) => f(property as keyof T), ownKeys: err }) as T;
};

// TODO: I'm leaving additions below now but they look all a bit too funky to me.
// Let's try to remove as much as possible later.

// TODO: do TBuildableFunction and TBuildableFunctionMiddleware need to be separate types?
export type TBuildableFunction = (dependencies: never, arg: never) => MaybePromise<unknown>;
type TBuildableFunctions = Record<PropertyKey, TBuildableFunction>;
// TODO: allow middleware to change return type?
export type TBuildableFunctionMiddleware = <Dependencies, Argument, Return>(
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
    // TODO: I don't understand:
    // - With `buildFunction(dependencies, functions[key])`, functions[key] is never undefined.
    // - But with the following line, ! must be appended to both access to functions
    const f = (key: keyof Functions) => buildFunction(dependencies, middleware?.(functions[key]!) ?? functions[key]!);
    return proxify<TBuiltFunctions<Functions>>(memoizeUnary(f));
}

export default proxify;
