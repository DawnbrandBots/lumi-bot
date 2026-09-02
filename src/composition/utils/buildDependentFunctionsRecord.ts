import type { MaybePromise } from "../../utils/types.ts";
import memoizeUnary from "./memoizeUnary.ts";
import proxify from "./proxify.ts";

export type TBuildableFunction = (dependencies: never, arg: never) => MaybePromise<unknown>;
type TBuildableFunctions<Dependencies> = Record<
    PropertyKey,
    (dependencies: Dependencies, arg: never) => MaybePromise<unknown>
>;
// TODO: allow middleware to change return type?
export type TBuildableFunctionMiddleware = <Dependencies, Argument, Return>(
    functionToBind: (dependencies: Dependencies, arg: Argument) => MaybePromise<Return>,
) => (dependencies: Dependencies, arg: Argument) => MaybePromise<Return>;

type TBuiltFunction<Function extends TBuildableFunction> = (arg: Parameters<Function>[1]) => ReturnType<Function>;

type TBuiltFunctions<Functions extends Record<PropertyKey, TBuildableFunction>> = {
    readonly [Key in keyof Functions]: TBuiltFunction<Functions[Key]>;
};

export function buildDependentFunction<Dependencies, Argument, Return>(
    dependencies: Dependencies,
    functionToBind: (dependencies: Dependencies, arg: Argument) => Return,
): (arg: Argument) => Return {
    return (arg) => functionToBind(dependencies, arg);
}

export function buildDependentFunctionsRecord<Dependencies, Functions extends TBuildableFunctions<Dependencies>>(
    dependencies: Dependencies,
    functions: Functions,
    // TODO: instead of requiring a middleware, update the caller to build and provide a Record with middleware'd functions?
    middleware?: TBuildableFunctionMiddleware,
): TBuiltFunctions<Functions> {
    // TODO: I don't understand:
    // - With `buildFunction(dependencies, functions[key])`, functions[key] is never undefined.
    // - But with the following line, ! must be appended to both access to functions
    const f = <Key extends keyof Functions>(key: Key): TBuiltFunction<Functions[Key]> =>
        // TODO: Not a fan of the assertion here. Take some time to properly understand and define types later so it's not required anymore.
        buildDependentFunction(dependencies, middleware?.(functions[key]!) ?? functions[key]!) as TBuiltFunction<
            Functions[Key]
        >;
    return proxify<TBuiltFunctions<Functions>>(memoizeUnary(f));
}
