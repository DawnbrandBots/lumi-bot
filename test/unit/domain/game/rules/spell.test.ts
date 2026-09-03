import { describe, expect, test } from "vitest";
import { ESpellDraggingMode } from "../../../../../src/domain/game/models/spell.types.ts";
import { ESpellEffectTarget } from "../../../../../src/domain/game/models/spellEffect.types.ts";
import Spell from "../../../../../src/domain/game/rules/spell.ts";

describe(Spell.draggingModeKind.name, () => {
    test.each([
        [[ESpellEffectTarget.SELF], ESpellDraggingMode.SELF],
        [[ESpellEffectTarget.SELF, ESpellEffectTarget.SELF], ESpellDraggingMode.SELF],
        [[ESpellEffectTarget.ANY], ESpellDraggingMode.ANY],
        [[ESpellEffectTarget.DUAL], ESpellDraggingMode.ANY],
        [[ESpellEffectTarget.SELF, ESpellEffectTarget.ANY], ESpellDraggingMode.ANY],
    ] as const)("targets %o => %s", (targets, expected) => {
        const effects = targets.map((target) => ({ target }));

        expect(Spell.draggingModeKind({ effects })).toBe(expected);
    });
});
