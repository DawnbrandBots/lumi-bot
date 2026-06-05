/**
 * Type guard to only ever use with constant objects which type describe exactly the keys present in the objects.
 */
export default function isKeyOfExactObject<O extends Record<string, unknown>>(
    obj: O,
    key: PropertyKey,
): key is keyof O {
    // ): key is K {
    return key in obj;
}
