import { describe, expect, test } from "vitest";
import { ESpellRole } from "../../../src/game/types.ts";
import {
    aliasDisciple,
    aliasMusic,
    aliasSpell,
    aliasWeapon,
    aliasWeaponSkill,
} from "../../../src/loaders/searchItems.ts";

describe(aliasWeapon.name, () => {
    test.each([
        [
            "without relative aliases",
            {
                name: "Royal Sword",
                prfDisciple: null,
            },
            ["Royal Sword"],
        ],
        [
            "with plus and exclusive disciple aliases",
            {
                name: "Royal Sword +",
                prfDisciple: { name: "Kurt" },
            },
            ["Royal Sword +", "Royal Sword Plus", "Kurt weapon"],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof aliasWeapon>[0], string[]]>)(
        "%s",
        (_, weapon, expected) => {
            expect([...aliasWeapon(weapon)]).toEqual(expected);
        },
    );
});

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

describe(aliasWeaponSkill.name, () => {
    test.each([
        [
            "without unique weapons",
            {
                name: "Armor Bane 1",
                uniqueSkillWeapons: [],
            },
            ["Armor Bane 1"],
        ],
        [
            "with unique weapon aliases",
            {
                name: "Royal Scion",
                uniqueSkillWeapons: [{ name: "Royal Sword +" }],
            },
            ["Royal Scion", "Royal Sword + weapon skill", "Royal Sword Plus weapon skill"],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof aliasWeaponSkill>[0], string[]]>)(
        "%s",
        (_, weaponSkill, expected) => {
            expect([...aliasWeaponSkill(weaponSkill)]).toEqual(expected);
        },
    );
});

describe(aliasMusic.name, () => {
    test.each([
        [
            "without disciple relations",
            {
                name: "Theme of Love",
                shadowMusicFor: null,
                shadowResultsScreenMusicFor: undefined,
            },
            ["Theme of Love"],
        ],
        [
            "with battle disciple aliases",
            {
                name: "Betrayal – The Exiled Prince",
                shadowMusicFor: [{ name: "Kurt" }],
            },
            ["Betrayal – The Exiled Prince", "Shadow Kurt music"],
        ],
        [
            "with results screen disciple aliases",
            {
                name: "Betrayal – The Exiled Prince (Results screen)",
                shadowResultsScreenMusicFor: [{ name: "Kurt" }],
            },
            ["Betrayal – The Exiled Prince (Results screen)", "Shadow Kurt results screen music"],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof aliasMusic>[0], string[]]>)(
        "%s",
        (_, music, expected) => {
            expect([...aliasMusic(music)]).toEqual(expected);
        },
    );
});

describe(aliasSpell.name, () => {
    test.each([
        [
            "without plus or relative aliases",
            {
                name: "Ennea Fire EX",
                disciple: null,
                role: { kind: ESpellRole.LIGHT },
            },
            ["Ennea Fire EX", "EFEX"],
        ],
        [
            "with plus aliases",
            {
                name: "Dark Crossfire + Tome",
                disciple: null,
                role: { kind: ESpellRole.SHADOW },
            },
            ["Dark Crossfire + Tome", "Dark Crossfire Plus Tome", "DCF+T", "DCFPT"],
        ],
        [
            "with EX disciple alias",
            {
                name: "Crosswind Grav EX",
                disciple: { name: "Claude" },
                role: { kind: ESpellRole.EX },
            },
            ["Crosswind Grav EX", "CWGEX", "Claude EX"],
        ],
        [
            "without disciple alias for non-EX role",
            {
                name: "Crosswind Grav",
                disciple: { name: "Claude" },
                role: { kind: ESpellRole.LIGHT },
            },
            ["Crosswind Grav", "CWG"],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof aliasSpell>[0], string[]]>)(
        "%s",
        (_, spell, expected) => {
            expect([...aliasSpell(spell)]).toEqual(expected);
        },
    );
});
