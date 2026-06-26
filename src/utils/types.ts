export type MaybePromise<T> = T | PromiseLike<T>;

type DeepPickShape<T> = {
    [TKey in keyof T]?: T[TKey] extends object ? true | DeepPickShape<T[TKey]> : true;
};

/**
 * Recursively selects properties from a type while deriving leaf types from it.
 * Use `true` to select a leaf property.
 */
export type DeepPick<T, TShape extends DeepPickShape<T>> = {
    [TKey in keyof TShape & keyof T]: NonNullable<TShape[TKey]> extends true
        ? T[TKey]
        : NonNullable<TShape[TKey]> extends DeepPickShape<T[TKey]>
          ? DeepPick<T[TKey], NonNullable<TShape[TKey]>>
          : never;
};
