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

export default proxify;
