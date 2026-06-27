import { describe, expect, test } from "vitest";
import { getSpellDraggingModeKind, isSpellShapeAoe } from "../../../../src/game/rules/spell.ts";
import { ESpellDraggingMode, ESpellEffectTarget } from "../../../../src/game/types.ts";

describe(isSpellShapeAoe.name, () => {
    test.each([
        ["............X............", false],
        ["...........OX............", true],
        ["..........OOXOO..........", true],
    ])("tiles %s => %s", (tiles, expected) => {
        expect(isSpellShapeAoe({ tiles })).toBe(expected);
    });
});

describe(getSpellDraggingModeKind.name, () => {
    test.each([
        [[ESpellEffectTarget.SELF], ESpellDraggingMode.SELF],
        [[ESpellEffectTarget.SELF, ESpellEffectTarget.SELF], ESpellDraggingMode.SELF],
        [[ESpellEffectTarget.ANY], ESpellDraggingMode.ANY],
        [[ESpellEffectTarget.DUAL], ESpellDraggingMode.ANY],
        [[ESpellEffectTarget.SELF, ESpellEffectTarget.ANY], ESpellDraggingMode.ANY],
    ] as const)("targets %o => %s", (targets, expected) => {
        const effects = targets.map((kind) => ({ target: { kind } }));

        expect(getSpellDraggingModeKind({ effects })).toBe(expected);
    });
});
