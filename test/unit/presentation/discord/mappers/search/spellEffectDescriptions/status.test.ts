import { describe, expect, test } from "vitest";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { EStat } from "../../../../../../../src/domain/game/models/stat.types.ts";
import { EStatChange } from "../../../../../../../src/domain/game/models/statChange.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { CROSS_SHAPE, RECEIVED_WEAPON_DAMAGE_PERCENT_VALUE_UNIT } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS.name, () => {
    test("describes a self-targeted status over an area", () => {
        const effect: Parameters<typeof SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS>[0] = {
            kind: ESpellEffectKind.STATUS,
            target: ESpellEffectTarget.SELF,
            effect: {
                kind: ESpellEffectKind.STAT,
                stat: EStat.RECEIVED_WEAPON_DAMAGE,
                statChange: EStatChange.DECREASE,
                amount: {
                    base: 30,
                    unit: RECEIVED_WEAPON_DAMAGE_PERCENT_VALUE_UNIT,
                },
                duration: 3,
            },
        };
        const spell: Parameters<typeof SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS>[1] = {
            shape: CROSS_SHAPE,
        };

        expect(SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS(effect, spell, false)).toBe(
            `Grants "decreases Received Weapon Damage by 30% (3 turns)" to targets in shape centered around user`,
        );
        expect(SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS(effect, spell, true)).toBe(
            `Grants "decreases Received Weapon Damage by 30% (3 turns)" to targets on a 3x3 cross centered around user`,
        );
    });
});
