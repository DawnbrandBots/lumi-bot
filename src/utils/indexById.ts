/**
 * Returns an object which entries are (arrayItem[key], item).
 *
 * @throws when two items have the same value for the given key.
 */
export function indexByKey<K extends PropertyKey, T extends Record<K, PropertyKey>>(
    array: readonly T[],
    key: K,
): Partial<Record<T[K], T>> {
    const result: Partial<Record<T[K], T>> = {};

    for (const item of array) {
        const value = item[key];

        if (Object.hasOwn(result, value)) {
            throw new Error(`Duplicate key found: ${String(value)}`);
        }

        result[value] = item;
    }

    return result;
}
