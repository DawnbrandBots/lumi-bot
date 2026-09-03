import { describe, expect, test } from "vitest";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { COLORLESS_COLOR, CROSS_SHAPE, FIXED_VALUE_UNIT } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.TILE.name, () => {
    test("describes a repeated effect on shaped tiles", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.TILE(
                {
                    kind: ESpellEffectKind.TILE,
                    target: ESpellEffectTarget.ANY,
                    repeat: {
                        kind: ESpellEffectKind.REPEAT,
                        effect: {
                            kind: ESpellEffectKind.DAMAGE,
                            amount: { base: 15, unit: FIXED_VALUE_UNIT },
                            color: COLORLESS_COLOR,
                        },
                        interval: 2,
                        times: 4,
                    },
                },
                { shape: CROSS_SHAPE },
                true,
            ),
        ).toBe("Grants effect to target tiles on a 3x3 cross: Deals 15 Colorless damage every 2 seconds (4 times)");
    });
});
