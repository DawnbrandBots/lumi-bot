import { describe, expect, test } from "vitest";
import { EDirection } from "../../../../../../../src/domain/game/models/direction.types.ts";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import { CROSS_SHAPE } from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.MOVEMENT.name, () => {
    test.each([
        [1, "tile"],
        [2, "tiles"],
    ])("pluralizes a movement of %i %s", (count, unit) => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.MOVEMENT(
                {
                    kind: ESpellEffectKind.MOVEMENT,
                    direction: EDirection.UP,
                    count,
                    target: ESpellEffectTarget.ANY,
                },
                { shape: CROSS_SHAPE },
                true,
            ),
        ).toBe(`Moves targets on a 3x3 cross ${count} ${unit} up`);
    });
});
