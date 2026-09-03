import { describe, expect, test } from "vitest";
import { SEARCH_ALIAS_GENERATORS } from "../../../../../src/application/search/searchAliases.ts";

const generators = SEARCH_ALIAS_GENERATORS.disciple;

describe("disciple alias generators", () => {
    test("includes aliases from the disciple, their weapon and their spells", () => {
        const disciple = {
            name: "Kurt",
            prfWeapon: { name: "Royal Sword +" },
            spells: [{ name: "Ennea Fire EX" }, { name: "Dark Crossfire + Tome" }],
        } satisfies Parameters<typeof generators.relative>[0];

        expect([...generators.standalone(disciple), ...generators.relative(disciple)]).toEqual([
            "Kurt",
            "Royal Sword + disciple",
            "Royal Sword Plus disciple",
            "Ennea Fire EX disciple",
            "EFEX disciple",
            "Dark Crossfire + Tome disciple",
            "Dark Crossfire Plus Tome disciple",
            "DCF+T disciple",
            "DCFPT disciple",
        ]);
    });
});
