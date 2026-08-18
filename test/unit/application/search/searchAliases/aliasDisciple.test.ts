import { describe, expect, test } from "vitest";
import { aliasDisciple } from "../../../../../src/application/search/searchAliases.ts";

describe(aliasDisciple.name, () => {
    test("includes aliases from the disciple, their weapon and their spells", () => {
        const disciple = {
            name: "Kurt",
            prfWeapon: { name: "Royal Sword +" },
            spells: [{ name: "Ennea Fire EX" }, { name: "Dark Crossfire + Tome" }],
        } satisfies Parameters<typeof aliasDisciple>[0];

        expect([...aliasDisciple(disciple)]).toEqual([
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
