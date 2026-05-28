import { expect } from "vitest";

export default function expectTypeGuard<T>(actual: unknown, expected: T): asserts actual is T {
    expect(actual).toBe(expected);
}
