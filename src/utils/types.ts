export type MaybePromise<T> = T | PromiseLike<T>;
export type ThisGuardType<F extends () => this is unknown> = F extends () => this is infer R ? R : never;
