export function indexById<T extends { id: string | number | symbol }>(array: T[]): Record<T["id"], T>;
export function indexById<T extends { id: { toString(): string } }>(array: T[]): Record<string, T> {
    const result: Record<string | number | symbol, T> = {};
    for (const item of array) {
        const id = item.id.toString();
        if (id in result) {
            throw new Error(`Duplicate id found: ${id}`);
        }
        result[id] = item;
    }
    return result;
}
