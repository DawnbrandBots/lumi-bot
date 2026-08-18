import { describe, expect, test } from "vitest";
import { ESpellEffectKind } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { SINGLE_TILE_SHAPE } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.WARP.name, () => {
    test("describes moving the user", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.WARP(
                { kind: ESpellEffectKind.WARP },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Moves user to target tile");
    });
});
