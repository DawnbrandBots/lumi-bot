import { describe, expect, test } from "vitest";
import Disciple from "../../../../src/game/rules/disciple.ts";
import range from "../../../../src/utils/range.ts";

const LEVELS = Array.from(range({ start: 1, end: 12 }));

describe(Disciple.baseHp.name, () => {
    test.each([
        [{ baseHp: 80 }, 80],
        [{ baseHp: 88 }, 88],
    ])("%o => %i", (movementType, expected) => {
        expect(Disciple.baseHp({ movementType })).toBe(expected);
    });
});

describe(Disciple.baseAtk.name, () => {
    test.each([
        [{ baseAtkByRange: { 1: 42, 2: 28 } }, { range: 1 }, 42],
        [{ baseAtkByRange: { 1: 30, 2: 20 } }, { range: 1 }, 30],
        [{ baseAtkByRange: { 1: 36, 2: 24 } }, { range: 1 }, 36],
        [{ baseAtkByRange: { 1: 36, 2: 24 } }, { range: 2 }, 24],
        [{ baseAtkByRange: { 1: 42, 2: 28 } }, { range: 2 }, 28],
        [{ baseAtkByRange: { 1: 30, 2: 20 } }, { range: 2 }, 20],
    ] as const)("%o, %o => %i", (movementType, weaponType, expected) => {
        expect(Disciple.baseAtk({ movementType, weaponType })).toBe(expected);
    });
});

describe(Disciple.hp.name, () => {
    test.each([
        [80, [80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160]],
        [88, [88, 96, 105, 114, 123, 132, 140, 149, 158, 167, 176]],
    ])("%i", (baseHp, expected) => {
        expect(LEVELS.map((level) => Disciple.hp({ discipleData: { baseHp }, level }))).toEqual(expected);
    });
});

describe(Disciple.atk.name, () => {
    test.each([
        [42, [42, 46, 50, 54, 58, 63, 67, 71, 75, 79, 84]],
        [30, [30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60]],
        [36, [36, 39, 43, 46, 50, 54, 57, 61, 64, 68, 72]],
        [24, [24, 26, 28, 31, 33, 36, 38, 40, 43, 45, 48]],
        [28, [28, 30, 33, 36, 39, 42, 44, 47, 50, 53, 56]],
        [20, [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]],
    ])("%i", (baseAtk, expected) => {
        expect(LEVELS.map((level) => Disciple.atk({ discipleData: { baseAtk }, level }))).toEqual(expected);
    });
});
