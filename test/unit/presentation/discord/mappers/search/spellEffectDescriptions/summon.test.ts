import { describe, expect, test } from "vitest";
import { ESpellEffectKind } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { SINGLE_TILE_SHAPE } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.SUMMON.name, () => {
    test("describes the summoned unit and stats", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.SUMMON(
                {
                    kind: ESpellEffectKind.SUMMON,
                    movementType: { name: "Infantry" },
                    weaponType: { name: "Axe" },
                    hp: { base: 75 },
                    atk: { base: 60 },
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Summons Axe Infantry minion with 75 HP and 60 Atk");
    });
});
