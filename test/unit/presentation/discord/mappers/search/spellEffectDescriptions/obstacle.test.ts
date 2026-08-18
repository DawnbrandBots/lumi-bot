import { describe, expect, test } from "vitest";
import {
    ESpellEffectKind,
    ESpellEffectTileType,
} from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { CROSS_SHAPE, SINGLE_TILE_SHAPE } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.OBSTACLE.name, () => {
    test("describes a single summoned obstacle's HP", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.OBSTACLE(
                {
                    kind: ESpellEffectKind.OBSTACLE,
                    hp: { base: 50 },
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Summons an obstacle with 50 HP on a single space");
    });

    test("describes tile condition and overridden shape", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.OBSTACLE(
                {
                    kind: ESpellEffectKind.OBSTACLE,
                    hp: { base: 50 },
                    onlyOn: ESpellEffectTileType.GROUND,
                    shapeOverride: SINGLE_TILE_SHAPE,
                },
                { shape: CROSS_SHAPE },
                false,
            ),
        ).toBe("Summons an obstacle with 50 HP on a single space if it is flat ground");
    });

    test("describes target tile type for an area obstacle effect", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.OBSTACLE(
                {
                    kind: ESpellEffectKind.OBSTACLE,
                    hp: { base: 50 },
                    onlyOn: ESpellEffectTileType.GROUND,
                },
                { shape: CROSS_SHAPE },
                false,
            ),
        ).toBe("Summons obstacles with 50 HP on target flat ground tiles");
    });
});
