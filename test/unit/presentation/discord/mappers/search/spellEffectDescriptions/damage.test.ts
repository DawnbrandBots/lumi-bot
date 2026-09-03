import { describe, expect, test } from "vitest";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { ATK_PERCENT_VALUE_UNIT, BLUE_COLOR, FIXED_VALUE_UNIT, RED_COLOR, SINGLE_TILE_SHAPE } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE.name, () => {
    test("describes fixed damage, effectiveness and its target", () => {
        const effect: Parameters<typeof SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE>[0] = {
            kind: ESpellEffectKind.DAMAGE,
            amount: {
                base: 60,
                unit: FIXED_VALUE_UNIT,
                effectiveness: [{ base: 90, kind: "Flying" }],
            },
            color: RED_COLOR,
            target: ESpellEffectTarget.ANY,
        };
        const spell: Parameters<typeof SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE>[1] = {
            shape: SINGLE_TILE_SHAPE,
        };

        expect(SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE(effect, spell, false)).toBe(
            "Deals 60 Red damage to targets (90 against Flying units)",
        );
        expect(SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE(effect, spell, true)).toBe(
            "Deals 60 Red damage to targets on a single space (90 against Flying units)",
        );
    });

    test("describes damage based on another stat", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE(
                {
                    kind: ESpellEffectKind.DAMAGE,
                    amount: {
                        base: 25,
                        unit: ATK_PERCENT_VALUE_UNIT,
                    },
                    color: BLUE_COLOR,
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Deals (25% of Atk) Blue damage");
    });
});
