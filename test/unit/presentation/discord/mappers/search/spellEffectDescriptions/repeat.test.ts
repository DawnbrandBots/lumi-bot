import { describe, expect, test } from "vitest";
import { ESpellEffectKind } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { FIXED_VALUE_UNIT, RED_COLOR, SINGLE_TILE_SHAPE } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.REPEAT.name, () => {
    test("describes its nested effect and schedule", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.REPEAT(
                {
                    kind: ESpellEffectKind.REPEAT,
                    effect: {
                        kind: ESpellEffectKind.DAMAGE,
                        amount: { base: 20, unit: FIXED_VALUE_UNIT },
                        color: RED_COLOR,
                    },
                    interval: 4,
                    times: 3,
                },
                { shape: SINGLE_TILE_SHAPE },
                true,
            ),
        ).toBe("Deals 20 Red damage every 4 seconds (3 times)");
    });

    test(`omits "every X seconds" when interval = 0`, () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.REPEAT(
                {
                    kind: ESpellEffectKind.REPEAT,
                    effect: {
                        kind: ESpellEffectKind.DAMAGE,
                        amount: { base: 20, unit: FIXED_VALUE_UNIT },
                        color: RED_COLOR,
                    },
                    interval: 0,
                    times: 1,
                },
                { shape: SINGLE_TILE_SHAPE },
                true,
            ),
        ).toBe("Deals 20 Red damage (1 time)");
    });
});
