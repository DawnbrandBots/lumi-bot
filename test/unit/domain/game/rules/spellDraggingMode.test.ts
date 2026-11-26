import { expect, test } from "vitest";
import { ESpellDraggingModeKind } from "../../../../../src/domain/game/models/spell.types.ts";
import { ESpellEffectTarget } from "../../../../../src/domain/game/models/spellEffect.types.ts";
import spellDraggingMode from "../../../../../src/domain/game/rules/spellDraggingMode.ts";

test.each([
    [[ESpellEffectTarget.SELF], ESpellDraggingModeKind.SELF],
    [[ESpellEffectTarget.SELF, ESpellEffectTarget.SELF], ESpellDraggingModeKind.SELF],
    [[ESpellEffectTarget.ANY], ESpellDraggingModeKind.ANY],
    [[ESpellEffectTarget.DUAL], ESpellDraggingModeKind.ANY],
    [[ESpellEffectTarget.SELF, ESpellEffectTarget.ANY], ESpellDraggingModeKind.ANY],
    [[undefined], ESpellDraggingModeKind.ANY],
] as const)("targets %o => %s", (targets, expected) => {
    expect(spellDraggingMode(targets.map((target) => ({ target })))).toBe(expected);
});
