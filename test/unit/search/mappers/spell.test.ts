import { describe, expect, test } from "vitest";
import spellShapes from "../../../../data/spellShape.json" with { type: "json" };
import mapSpellToMessage, { formatSpellShape } from "../../../../src/search/mappers/spell.ts";
import { WEAPON_TYPE } from "./common.fixtures.ts";
import { DISCIPLE } from "./disciple.fixtures.ts";
import { SPELL } from "./spell.fixtures.ts";

describe(formatSpellShape.name, () => {
    test.each(spellShapes.map((shape) => [shape.name, shape] as const))("%s", (_, shape) => {
        expect(formatSpellShape(shape)).toMatchSnapshot();
    });
});

describe(mapSpellToMessage.name, () => {
    test.each([
        ["without a disciple", SPELL],
        [
            "with a disciple and usage restrictions",
            {
                ...SPELL,
                disciple: DISCIPLE,
                onlyFor: WEAPON_TYPE,
                uses: 1,
                cooldown: 8,
            },
        ],
    ])("%s", (_, spell) => {
        expect(mapSpellToMessage(spell)).toMatchSnapshot();
    });
});
