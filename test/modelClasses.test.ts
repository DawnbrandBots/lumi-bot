import type { EntityManager } from "@mikro-orm/core";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Disciple } from "../src/models/game/classes/disciple.ts";
import { Spell } from "../src/models/game/classes/spell.ts";
import { SPELL_DRAGGING_MODE } from "../src/models/game/classes/spellDraggingMode.ts";
import { Weapon } from "../src/models/game/classes/weapon.ts";
import { describeSpellEffects } from "../src/models/game/spellEffectDescriptions.ts";
import { ESpellDraggingMode } from "../src/models/game/types.ts";
import { initTestOrm } from "./orm.ts";

const LEVELS = Array.from({ length: 11 }, (_, index) => index + 1);
const VARIANTS = ["HP", "NEUTRAL", "ATK"] as const;
const STATS = ["hp", "atk"] as const;

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
});

afterAll(async () => {
    await orm.close();
});

async function findDisciple(name: string): Promise<Disciple> {
    return em.findOneOrFail(Disciple, { name }, { populate: ["movementType", "weaponType"] });
}

async function findSpell(name: string): Promise<Spell> {
    return em.findOneOrFail(Spell, { name }, { populate: ["*"] });
}

async function findWeapon(name: string): Promise<Weapon> {
    return em.findOneOrFail(Weapon, { name }, { populate: ["weaponType.weaponSkills"] });
}

describe(Disciple.name, () => {
    // All possible baseHp values per level
    test.each([
        ["Kurt", [80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160]],
        ["Gotthold", [88, 96, 105, 114, 123, 132, 140, 149, 158, 167, 176]],
    ])("getHp returns expected values from level 1 to 11 for %s", async (name, expected) => {
        const disciple = await findDisciple(name);

        expect(LEVELS.map((level) => disciple.getHp({ level }))).toEqual(expected);
    });

    // All possible baseAtk values per level
    test.each([
        ["Kurt", [42, 46, 50, 54, 58, 63, 67, 71, 75, 79, 84]],
        ["Gotthold", [30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60]],
        ["Carina", [36, 39, 43, 46, 50, 54, 57, 61, 64, 68, 72]],
        ["Alberta", [24, 26, 28, 31, 33, 36, 38, 40, 43, 45, 48]],
        ["Tamamo", [28, 30, 33, 36, 39, 42, 44, 47, 50, 53, 56]],
        ["Corrin", [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]],
    ])("getAtk returns expected values from level 1 to 11 for %s", async (name, expected) => {
        const disciple = await findDisciple(name);

        expect(LEVELS.map((level) => disciple.getAtk({ level }))).toEqual(expected);
    });

    // All possible baseHp values
    test.each([
        ["Kurt", 80],
        ["Gotthold", 88],
    ])("baseHp returns expected value for %s", async (name, expected) => {
        const disciple = await findDisciple(name);

        expect(disciple.baseHp).toBe(expected);
    });

    // All possible baseAtk values
    test.each([
        ["Kurt", 42],
        ["Gotthold", 30],
        ["Carina", 36],
        ["Alberta", 24],
        ["Tamamo", 28],
        ["Corrin", 20],
    ])("baseAtk returns expected value for %s", async (name, expected) => {
        const disciple = await findDisciple(name);

        expect(disciple.baseAtk).toBe(expected);
    });
});

describe(Spell.name, () => {
    test.each(["Self Mend", "Self Heal Push", "Self Crossedge"])("%s has SELF dragging mode", async (name) => {
        const spell = await findSpell(name);

        expect(spell.draggingMode.kind).toBe(SPELL_DRAGGING_MODE.SELF.kind);
    });

    test.each([
        // Some spells with ANY dragging mode, one for each effect type.
        "Tetrafire",
        "Mend",
        "Shield Strike",
        "Heal Warp EX",
        "Edge Break",
        "Tetrathunder Wall EX",
        "Axe Fighter + Infantry",
        "Tetraheal Zone",

        // Spells which have a SELF spell effect but don't have a SELF dragging mode.
        "Aether EX",
        "Thunder Self Edge EX",
        "Wind Self Pull EX",
    ])("%s has ANY dragging mode", async (name) => {
        const spell = await findSpell(name);

        expect(spell.draggingMode.kind).toBe(ESpellDraggingMode.ANY);
    });

    describe(describeSpellEffects.name, () => {
        test("keeps single-tile SELF effects targeted to user", async () => {
            const spell = await findSpell("Self Mend");

            expect(spell.shape.isAoe).toBe(false);
            expect(describeSpellEffects(spell)).toBe("1. Restores 80 HP to user.");
        });

        test.each([
            [
                "Self Cross Shield",
                "Grants status to targets in shape centered around user:\n1. decreases Received Weapon Damage by 30%.",
            ],
            ["Self Crossedge", "Grants status to targets in shape centered around user:\n1. increases Atk by 50%."],
        ])("uses shape-aware target wording for %s", async (name, expected) => {
            const spell = await findSpell(name);

            expect(spell.shape.isAoe).toBe(true);
            expect(describeSpellEffects(spell)).toBe(expected);
        });

        test("uses one status intro when all effects are statuses", async () => {
            const spell = await findSpell("Trinity Shield Edge EX");

            expect(describeSpellEffects(spell)).toBe(
                [
                    "Grants status to targets:",
                    "1. decreases Received Weapon Damage by 20%.",
                    "1. increases Atk by 30%.",
                    "1. decreases Color Affinity by 20%.",
                ].join("\n"),
            );
        });

        test("keeps status intro on the status item when a spell has other effect kinds", async () => {
            const spell = await findSpell("Thunder Self Edge EX");

            expect(describeSpellEffects(spell)).toBe(
                ["1. Deals 60 Blue damage to targets.", "1. Grants status to user: increases Atk by 30%."].join("\n"),
            );
        });

        test.each([
            ["Tetrafire", "1. Deals 50 Red damage to targets."],
            ["Dark Crossfire + Tome", "Grants status to targets:\n1. Deals 40 Red damage every 6 seconds, 2 times."],
        ])("preserves existing non-status effect wording for %s", async (name, expected) => {
            const spell = await findSpell(name);
            expect(describeSpellEffects(spell)).toBe(expected);
        });
    });
});

describe(Weapon.name, () => {
    test("getWeaponVariantStat returns 0 for every Bronze Sword stat and variant", async () => {
        const weapon = await findWeapon("Bronze Sword");

        for (const variant of VARIANTS) {
            for (const stat of STATS) {
                expect(weapon.getWeaponVariantStat({ variant, stat })).toBe(0);
            }
        }
    });

    test("getWeaponVariantStat returns expected values for Royal Sword +", async () => {
        const weapon = await findWeapon("Royal Sword +");

        // Checking right values for all variants of an 8* weapon
        expect(weapon.getWeaponVariantStat({ variant: "HP", stat: "hp" })).toBe(16);
        expect(weapon.getWeaponVariantStat({ variant: "HP", stat: "atk" })).toBe(35);
        expect(weapon.getWeaponVariantStat({ variant: "NEUTRAL", stat: "hp" })).toBe(11);
        expect(weapon.getWeaponVariantStat({ variant: "NEUTRAL", stat: "atk" })).toBe(45);
        expect(weapon.getWeaponVariantStat({ variant: "ATK", stat: "hp" })).toBe(6);
        expect(weapon.getWeaponVariantStat({ variant: "ATK", stat: "atk" })).toBe(55);
    });

    describe("Weapon type skills", () => {
        describe("Should have a weapon type skill", () => {
            test.each([
                ["Basic Claws", null],
                ["Iron Claws", "RIDER_BANE_1"],
                ["Silver Claws", "RIDER_BANE_2"],
                ["Solar Claws +", "RIDER_BANE_3"],
                ["Novice Staff", null],
                ["Iron Staff", "ARMOR_BANE_1"],
                ["Silver Staff", "ARMOR_BANE_2"],
                ["Panther Staff +", "ARMOR_BANE_3"],
                ["Novice Tome", null],
                ["Iron Tome", "ARMOR_BANE_1"],
                ["Silver Tome", "ARMOR_BANE_2"],
                ["Ivory Tome +", "ARMOR_BANE_3"],
                ["Bronze Bow", null],
                ["Iron Bow", "FLIER_BANE_1"],
                ["Silver Bow", "FLIER_BANE_2"],
                ["Mulagir +", "FLIER_BANE_3"],
            ])("%s => %s", async (name, expectedSkillId) => {
                const weapon = await findWeapon(name);

                expect(weapon.weaponTypeSkill?.id ?? null).toBe(expectedSkillId);
            });
        });

        describe("Should not have a weapon type skill", () => {
            test.each([
                "Bronze Sword",
                "Iron Sword",
                "Silver Sword",
                "Royal Sword +",
                "Bronze Lance",
                "Iron Lance",
                "Silver Lance",
                "Shield Lance +",
                "Bronze Axe",
                "Iron Axe",
                "Silver Axe",
                "Bull Axe +",
                "Basic Stone",
                "Iron Stone",
                "Silver Stone",
                "Sight Stone +",
            ])("%s => null", async (name) => {
                const weapon = await findWeapon(name);

                expect(weapon.weaponTypeSkill).toBeNullable();
            });
        });
    });
});
