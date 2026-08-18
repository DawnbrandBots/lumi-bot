import { describe, expect, test } from "vitest";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { FIXED_VALUE_UNIT, SINGLE_TILE_SHAPE } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.HEAL.name, () => {
    test("describes healing effectiveness", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.HEAL(
                {
                    kind: ESpellEffectKind.HEAL,
                    amount: {
                        base: 40,
                        unit: FIXED_VALUE_UNIT,
                        effectiveness: [{ base: 70, kind: "Armored" }],
                    },
                    target: ESpellEffectTarget.SELF,
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Restores 40 HP to user (70 for Armored units)");
    });
});
