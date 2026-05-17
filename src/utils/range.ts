/**
 * Yields numbers between `start` (inclusive) and `end` (exclusive).
 *
 * Default step of 1.
 */
export default function* range({
    start,
    end,
    step = 1,
}: {
    start: number;
    end: number;
    step?: number;
}): Generator<number> {
    for (let current = start; current < end; current += step) {
        yield current;
    }
}
