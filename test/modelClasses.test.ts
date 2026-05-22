import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Disciple } from "../src/game/models/disciple.ts";
import { Spell } from "../src/game/models/spell.ts";
import { SPELL_DRAGGING_MODE } from "../src/game/models/spellDraggingMode.ts";
import { Weapon } from "../src/game/models/weapon.ts";
import { describeSpellEffects } from "../src/game/spellEffectDescriptions.ts";
import { ESpellDraggingMode } from "../src/game/types.ts";
import range from "../src/utils/range.ts";
import { initTestOrm } from "./orm.ts";

const LEVELS = Array.from(range({ start: 1, end: 12 }));
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
    describe("getHp returns expected values from level 1 to 11 for", () => {
        // All possible baseHp values per level
        test.each([
            ["Kurt", [80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160]],
            ["Gotthold", [88, 96, 105, 114, 123, 132, 140, 149, 158, 167, 176]],
        ])("%s", async (name, expected) => {
            const disciple = await findDisciple(name);

            expect(LEVELS.map((level) => disciple.getHp({ level }))).toEqual(expected);
        });
    });

    describe("getAtk returns expected values from level 1 to 11 for", () => {
        // All possible baseAtk values per level
        test.each([
            ["Kurt", [42, 46, 50, 54, 58, 63, 67, 71, 75, 79, 84]],
            ["Gotthold", [30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60]],
            ["Carina", [36, 39, 43, 46, 50, 54, 57, 61, 64, 68, 72]],
            ["Alberta", [24, 26, 28, 31, 33, 36, 38, 40, 43, 45, 48]],
            ["Tamamo", [28, 30, 33, 36, 39, 42, 44, 47, 50, 53, 56]],
            ["Corrin", [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]],
        ])("%s", async (name, expected) => {
            const disciple = await findDisciple(name);

            expect(LEVELS.map((level) => disciple.getAtk({ level }))).toEqual(expected);
        });
    });

    describe("baseHp returns expected value for", () => {
        // All possible baseHp values
        test.each([
            ["Kurt", 80],
            ["Gotthold", 88],
        ])("%s", async (name, expected) => {
            const disciple = await findDisciple(name);

            expect(disciple.baseHp).toBe(expected);
        });
    });

    describe("baseAtk returns expected value for", () => {
        // All possible baseAtk values
        test.each([
            ["Kurt", 42],
            ["Gotthold", 30],
            ["Carina", 36],
            ["Alberta", 24],
            ["Tamamo", 28],
            ["Corrin", 20],
        ])("%s", async (name, expected) => {
            const disciple = await findDisciple(name);

            expect(disciple.baseAtk).toBe(expected);
        });
    });
});

describe(Spell.name, () => {
    describe("draggingMode" satisfies keyof Spell, () => {
        describe(ESpellDraggingMode.SELF, () => {
            test.each(["Self Mend", "Self Heal Push", "Self Crossedge"])("%s", async (name) => {
                const spell = await findSpell(name);

                expect(spell.draggingMode.kind).toBe(SPELL_DRAGGING_MODE.SELF.kind);
            });
        });
        describe(ESpellDraggingMode.ANY, () => {
            test.each([
                // Some spells with ANY dragging mode, one for each effect type.
                "Elfire",
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
            ])("%s", async (name) => {
                const spell = await findSpell(name);

                expect(spell.draggingMode.kind).toBe(ESpellDraggingMode.ANY);
            });
        });
    });

    describe(describeSpellEffects.name, () => {
        [
            {
                name: "Elfire",
                explanation: "plain damage",
                expected: "1. Deals 60 Red damage to targets.",
                inlineExpected: "deals 60 Red damage to targets (single tile).",
            },
            {
                name: "Dark Tetrafire",
                explanation: "countdown before damage",
                expected: "After 2 seconds:\n1. Deals 75 Red damage to targets.",
                inlineExpected: "after 2 seconds, deals 75 Red damage to targets (2x2 square).",
            },
            {
                name: "Self Mend",
                explanation: "single-tile self heal",
                expected: "1. Restores 80 HP to user.",
                inlineExpected: "restores 80 HP to user.",
            },
            {
                name: "Self Cross Shield",
                explanation: "aoe self-targeted status",
                expected:
                    "1. Grants status to targets in shape centered around user: Decreases Received Weapon Damage by 30% (3 turns).",
                inlineExpected:
                    "grants status to targets in 3x3 cross centered around user: decreases Received Weapon Damage by 30% (3 turns). (Cooldown: 1)",
            },
            {
                name: "Trinity Shield Edge EX",
                explanation: "shared status intro",
                expected: [
                    "Grants statuses to targets:",
                    "1. Decreases Received Weapon Damage by 20% (permanent).",
                    "1. Increases Atk by 30% (permanent).",
                    "1. Decreases Color Affinity by 20% (permanent).",
                ].join("\n"),
                inlineExpected: [
                    "grants statuses to targets (3x3 cross): decreases Received Weapon Damage by 20% (permanent)",
                    "increases Atk by 30% (permanent)",
                    "decreases Color Affinity by 20% (permanent). (Uses: 1, Cooldown: 1)",
                ].join(", "),
            },
            {
                name: "Dark Crossfire + Tome",
                explanation: "countdown with shared status intro",
                expected: [
                    "After 2 seconds:",
                    "1. Grants status to targets: Deals 40 Red damage every 6 seconds (2 times).",
                ].join("\n"),
                inlineExpected:
                    "after 2 seconds, grants status to targets (3x3 cross): deals 40 Red damage every 6 seconds (2 times). (Cooldown: 4, Usable only by Tome units)",
            },
            {
                name: "Thunder Self Edge EX",
                explanation: "mixed damage and status",
                expected: [
                    "1. Deals 60 Blue damage to targets.",
                    "1. Grants status to user: Increases Atk by 30% (permanent).",
                ].join("\n"),
                inlineExpected:
                    "deals 60 Blue damage to targets (single tile), grants status to user: increases Atk by 30% (permanent).",
            },
            {
                name: "Dual Invigorate EX",
                explanation: "dual spell",
                expected: [
                    "1. Grants status to user and targets: Increases HP by 10% (permanent).",
                    "1. Restores 10 HP to user and targets.",
                ].join("\n"),
                inlineExpected:
                    "grants status to user and targets: increases HP by 10% (permanent), restores 10 HP to user and targets. (Uses: 1, Cooldown: 1)",
            },
            {
                name: "Axe Fighter + Infantry",
                explanation: "summon",
                expected: "1. Summons Axe Infantry minion with 75 HP and 60 Atk.",
                inlineExpected:
                    "summons Axe Infantry minion with 75 HP and 60 Atk. (Uses: 1, Cooldown: 1, Usable only by Infantry units)",
            },
            {
                name: "Heal Warp EX",
                explanation: "warp",
                expected: ["1. Restores 50 HP to targets.", "1. Moves user to target tile."].join("\n"),
                inlineExpected: "restores 50 HP to targets (single tile), moves user to target tile.",
            },
            {
                name: "Tetrathunder Wall EX",
                explanation: "ice blocks",
                expected: [
                    "1. Grants status to targets: Deals 40 Blue damage every 6 seconds (2 times).",
                    "1. Summons ice blocks with 60 HP.",
                ].join("\n"),
                inlineExpected:
                    "grants status to targets (2x2 square): deals 40 Blue damage every 6 seconds (2 times), summons ice blocks with 60 HP. (Uses: 1)",
            },
            {
                name: "Dark Cross Poison Patch",
                explanation: "tile",
                expected: "1. Grants effect to target tiles: Deals 25 Colorless damage every 3 seconds (5 times).",
                inlineExpected:
                    "grants effect to target tiles: deals 25 Colorless damage every 3 seconds (5 times). (Uses: 1)",
            },
        ].forEach(({ name, explanation, expected, inlineExpected }) => {
            test(`${name} (${explanation})`, async () => {
                const spell = await findSpell(name);

                expect(describeSpellEffects(spell)).toBe(expected);
            });

            test(`${name} (${explanation}, inline)`, async () => {
                const spell = await findSpell(name);

                expect(describeSpellEffects(spell, true)).toBe(inlineExpected);
            });
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
