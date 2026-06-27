export type MaybePromise<T> = T | PromiseLike<T>;

type DeepPickShape<T> = T extends readonly (infer TItem)[]
    ? DeepPickShape<TItem>
    : T extends object
      ? {
            [TKey in keyof T]?: NonNullable<T[TKey]> extends object ? true | DeepPickShape<NonNullable<T[TKey]>> : true;
        }
      : never;

type DeepPickResult<T, TShape> = T extends (infer TItem)[]
    ? DeepPickResult<TItem, TShape>[]
    : T extends readonly (infer TItem)[]
      ? readonly DeepPickResult<TItem, TShape>[]
      : T extends object
        ? {
              [TKey in keyof T as TKey extends keyof TShape ? TKey : never]: TKey extends keyof TShape
                  ? NonNullable<TShape[TKey]> extends true
                      ? T[TKey]
                      : DeepPickResult<T[TKey], NonNullable<TShape[TKey]>>
                  : never;
          }
        : T;

/**
 * Recursively selects properties from a type while deriving leaf types from it.
 * Use `true` to select a leaf property.
 */
export type DeepPick<T, TShape extends DeepPickShape<T>> = DeepPickResult<T, TShape>;
