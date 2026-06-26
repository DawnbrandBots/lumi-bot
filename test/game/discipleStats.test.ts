import { describe, expect, test } from "vitest";
import { getDiscipleAtk, getDiscipleBaseAtk, getDiscipleBaseHp, getDiscipleHp } from "../../src/game/discipleStats.ts";
import range from "../../src/utils/range.ts";

const LEVELS = Array.from(range({ start: 1, end: 12 }));

describe(getDiscipleBaseHp.name, () => {
    // All possible baseHp values.
    test.each([
        [{ discipleBaseHpModifier: 1 }, 80],
        [{ discipleBaseHpModifier: 1.1 }, 88],
    ])("%o => %i", (movementType, expected) => {
        expect(getDiscipleBaseHp({ movementType })).toBe(expected);
    });
});

describe(getDiscipleBaseAtk.name, () => {
    // All possible baseAtk values.
    test.each([
        [{ discipleBaseAtkModifier: 1.1666666666666667 }, { discipleBaseAtkModifier: 1 }, 42],
        [{ discipleBaseAtkModifier: 0.8333333333333334 }, { discipleBaseAtkModifier: 1 }, 30],
        [{ discipleBaseAtkModifier: 1 }, { discipleBaseAtkModifier: 1 }, 36],
        [{ discipleBaseAtkModifier: 1 }, { discipleBaseAtkModifier: 2 / 3 }, 24],
        [{ discipleBaseAtkModifier: 1.1666666666666667 }, { discipleBaseAtkModifier: 2 / 3 }, 28],
        [{ discipleBaseAtkModifier: 0.8333333333333334 }, { discipleBaseAtkModifier: 2 / 3 }, 20],
    ])("%o, %o => %i", (movementType, weaponType, expected) => {
        expect(getDiscipleBaseAtk({ movementType, weaponType })).toBe(expected);
    });
});

describe(getDiscipleHp.name, () => {
    // All possible baseHp values per level.
    test.each([
        [80, [80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160]],
        [88, [88, 96, 105, 114, 123, 132, 140, 149, 158, 167, 176]],
    ])("%i", (baseHp, expected) => {
        expect(LEVELS.map((level) => getDiscipleHp({ discipleData: { baseHp }, level }))).toEqual(expected);
    });
});

describe(getDiscipleAtk.name, () => {
    // All possible baseAtk values per level.
    test.each([
        [42, [42, 46, 50, 54, 58, 63, 67, 71, 75, 79, 84]],
        [30, [30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60]],
        [36, [36, 39, 43, 46, 50, 54, 57, 61, 64, 68, 72]],
        [24, [24, 26, 28, 31, 33, 36, 38, 40, 43, 45, 48]],
        [28, [28, 30, 33, 36, 39, 42, 44, 47, 50, 53, 56]],
        [20, [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]],
    ])("%i", (baseAtk, expected) => {
        expect(LEVELS.map((level) => getDiscipleAtk({ discipleData: { baseAtk }, level }))).toEqual(expected);
    });
});
