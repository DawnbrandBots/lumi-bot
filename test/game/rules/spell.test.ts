import { describe, expect, test } from "vitest";
import Spell from "../../../src/game/rules/spell.ts";
import { ESpellDraggingMode, ESpellEffectTarget } from "../../../src/game/types.ts";

describe(Spell.draggingModeKind.name, () => {
    test.each([
        [[ESpellEffectTarget.SELF], ESpellDraggingMode.SELF],
        [[ESpellEffectTarget.SELF, ESpellEffectTarget.SELF], ESpellDraggingMode.SELF],
        [[ESpellEffectTarget.ANY], ESpellDraggingMode.ANY],
        [[ESpellEffectTarget.DUAL], ESpellDraggingMode.ANY],
        [[ESpellEffectTarget.SELF, ESpellEffectTarget.ANY], ESpellDraggingMode.ANY],
    ] as const)("targets %o => %s", (targets, expected) => {
        const effects = targets.map((kind) => ({ target: { kind } }));

        expect(Spell.draggingModeKind({ effects })).toBe(expected);
    });
});
