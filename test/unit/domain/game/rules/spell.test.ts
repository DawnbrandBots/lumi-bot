import { describe, expect, test } from "vitest";
import { ESpellDraggingModeKind, ESpellEffectsKind } from "../../../../../src/domain/game/models/spell.types.ts";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../../src/domain/game/models/spellEffect.types.ts";
import Spell from "../../../../../src/domain/game/rules/spell.ts";

describe(Spell.draggingModeKind.name, () => {
    test.each([
        [[ESpellEffectTarget.SELF], ESpellDraggingModeKind.SELF],
        [[ESpellEffectTarget.SELF, ESpellEffectTarget.SELF], ESpellDraggingModeKind.SELF],
        [[ESpellEffectTarget.ANY], ESpellDraggingModeKind.ANY],
        [[ESpellEffectTarget.DUAL], ESpellDraggingModeKind.ANY],
        [[ESpellEffectTarget.SELF, ESpellEffectTarget.ANY], ESpellDraggingModeKind.ANY],
    ] as const)("targets %o => %s", (targets, expected) => {
        expect(Spell.draggingModeKind(targets)).toBe(expected);
    });
});

describe(Spell.draggingMode.name, () => {
    test("returns dragging mode for a normal spell", () => {
        expect(
            Spell.draggingMode({
                effects: {
                    kind: ESpellEffectsKind.NORMAL,
                    effects: [
                        { kind: ESpellEffectKind.WARP, target: ESpellEffectTarget.SELF },
                        { kind: ESpellEffectKind.WARP, target: ESpellEffectTarget.SELF },
                    ],
                },
            }),
        ).toStrictEqual({
            kind: ESpellEffectsKind.NORMAL,
            draggingMode: ESpellDraggingModeKind.SELF,
        });
    });

    test("returns dragging modes for a form-based spell", () => {
        expect(
            Spell.draggingMode({
                effects: {
                    kind: ESpellEffectsKind.FORM_BASED,
                    light: [{ kind: ESpellEffectKind.WARP, target: ESpellEffectTarget.SELF }],
                    shadow: [{ kind: ESpellEffectKind.WARP, target: ESpellEffectTarget.ANY }],
                },
            }),
        ).toStrictEqual({
            kind: ESpellEffectsKind.FORM_BASED,
            light: ESpellDraggingModeKind.SELF,
            shadow: ESpellDraggingModeKind.ANY,
        });
    });
});
