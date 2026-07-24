import { describe, expect, test } from "vitest";
import mapSpellToMessage from "../../../../src/search/mappers/spell.ts";
import { WEAPON_TYPE } from "./common.fixtures.ts";
import { DISCIPLE } from "./disciple.fixtures.ts";
import { SPELL } from "./spell.fixtures.ts";

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
