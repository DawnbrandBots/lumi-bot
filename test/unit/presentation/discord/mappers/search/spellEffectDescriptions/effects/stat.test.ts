import { describe, expect, test } from "vitest";
import { ESpellEffectKind } from "../../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { EStat } from "../../../../../../../../src/domain/game/models/stat.types.ts";
import { EStatChange } from "../../../../../../../../src/domain/game/models/statChange.types.ts";
import { EUnitSelectorProperty } from "../../../../../../../../src/domain/game/models/unitSelector.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { INFANTRY_MOVEMENT_TYPE } from "../../common.fixtures.ts";
import { ATK_PERCENT_VALUE_UNIT, FIXED_VALUE_UNIT, SINGLE_TILE_SHAPE } from "../utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.STAT.name, () => {
    test("describes a percentage of the affected stat and a duration", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.STAT(
                {
                    kind: ESpellEffectKind.STAT,
                    stat: EStat.ATK,
                    statChange: EStatChange.INCREASE,
                    amount: {
                        base: 30,
                        unit: ATK_PERCENT_VALUE_UNIT,
                    },
                    duration: 3,
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Increases Atk by 30% (3 turns)");
    });

    test("describes a permanent fixed stat change", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.STAT(
                {
                    kind: ESpellEffectKind.STAT,
                    stat: EStat.HP,
                    statChange: EStatChange.LIMIT,
                    amount: { base: 10, unit: FIXED_VALUE_UNIT },
                    duration: null,
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Limits HP to 10 (permanent)");
    });

    test("describes which units a stat change is restricted to", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.STAT(
                {
                    kind: ESpellEffectKind.STAT,
                    stat: EStat.MOVEMENT,
                    statChange: EStatChange.INCREASE,
                    amount: { base: 1, unit: FIXED_VALUE_UNIT },
                    duration: null,
                    onlyFor: {
                        property: EUnitSelectorProperty.MOVEMENT_TYPE,
                        value: INFANTRY_MOVEMENT_TYPE,
                    },
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Increases Movement by 1 (Infantry units only, permanent)");
    });
});
