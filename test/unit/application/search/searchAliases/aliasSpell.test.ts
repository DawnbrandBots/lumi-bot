import { describe, expect, test } from "vitest";
import { SEARCH_ALIAS_GENERATORS } from "../../../../../src/application/search/searchAliases.ts";
import { ESpellRole } from "../../../../../src/domain/game/models/spell.types.ts";

const generators = SEARCH_ALIAS_GENERATORS.spell;

describe("spell alias generators", () => {
    test.each([
        [
            "without plus or relative aliases",
            {
                name: "Ennea Fire EX",
                disciple: null,
                role: ESpellRole.LIGHT,
            },
            ["Ennea Fire EX", "EFEX"],
        ],
        [
            "with plus aliases",
            {
                name: "Dark Crossfire + Tome",
                disciple: null,
                role: ESpellRole.SHADOW,
            },
            ["Dark Crossfire + Tome", "Dark Crossfire Plus Tome", "DCF+T", "DCFPT"],
        ],
        [
            "with EX disciple alias",
            {
                name: "Crosswind Grav EX",
                disciple: { name: "Claude" },
                role: ESpellRole.EX,
            },
            ["Crosswind Grav EX", "CWGEX", "Claude EX"],
        ],
        [
            "without disciple alias for non-EX role",
            {
                name: "Crosswind Grav",
                disciple: { name: "Claude" },
                role: ESpellRole.LIGHT,
            },
            ["Crosswind Grav", "CWG"],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof generators.relative>[0], string[]]>)(
        "%s",
        (_, spell, expected) => {
            expect([...generators.standalone(spell), ...generators.relative(spell)]).toEqual(expected);
        },
    );
});
