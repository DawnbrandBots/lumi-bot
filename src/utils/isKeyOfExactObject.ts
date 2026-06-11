/**
 * Type guard to only ever use with constant objects which type describe exactly the keys present in the objects.
 *
 * Hopefully this is implemented one day: https://github.com/microsoft/TypeScript/issues/12936.
 */
export default function isKeyOfExactObject<O extends Record<string, unknown>>(
    obj: O,
    key: PropertyKey,
): key is keyof O {
    return key in obj;
}
