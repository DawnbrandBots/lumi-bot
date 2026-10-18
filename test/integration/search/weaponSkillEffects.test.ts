import { afterAll, beforeAll, expect, test } from "vitest";
import { getGameDataEntityForSearchResult } from "../../../src/infrastructure/persistence/mikroOrm/queries/getGameDataEntityForSearchResult.ts";
import { describeWeaponSkillEffects } from "../../../src/presentation/discord/mappers/search/weaponSkillEffectDescriptions.ts";
import { initTestGameOrm } from "../../utils/orm.ts";

let orm: Awaited<ReturnType<typeof initTestGameOrm>>;

beforeAll(async () => {
    orm = await initTestGameOrm();
});

afterAll(async () => {
    await orm.close();
});

test.each([
    ["ROYAL_SCION", "Deal 30% more weapon damage against Axe units."],
    ["SKILLED_HUNTER", "Deal 20% more weapon damage against Cavalry units."],
    ["PITCH_BLACK_ARMOR", "Take 30% less weapon damage from units with a range of 1."],
] as const)("hydrates %s's selector for its search result", async (id, expected) => {
    const skill = await getGameDataEntityForSearchResult({ em: orm.em.fork() }, { kind: "weaponSkill", id });
    expect(skill).not.toBeNull();
    if (!skill) return;

    expect(describeWeaponSkillEffects(skill.effect)).toBe(expected);
});

test("hydrates a weapon's unique skill effect for its search result", async () => {
    const weapon = await getGameDataEntityForSearchResult(
        { em: orm.em.fork() },
        { kind: "weapon", id: "ROYAL_SWORD_PLUS" },
    );
    expect(weapon?.uniqueSkill).not.toBeNull();
    if (!weapon?.uniqueSkill) return;

    expect(describeWeaponSkillEffects(weapon.uniqueSkill.effect)).toBe(
        "Deal 30% more weapon damage against Axe units.",
    );
});

test("hydrates a weapon's weapon-type skill effect for its search result", async () => {
    const weapon = await getGameDataEntityForSearchResult(
        { em: orm.em.fork() },
        { kind: "weapon", id: "IVORY_TOME_PLUS" },
    );
    expect(weapon?.weaponTypeSkill).toBeDefined();
    if (!weapon?.weaponTypeSkill) return;

    expect(describeWeaponSkillEffects(weapon.weaponTypeSkill.effect)).toBe(
        "Deal 50% more weapon damage against Armored units.",
    );
});

test("hydrates a disciple's PRF weapon skill effect for its search result", async () => {
    const disciple = await getGameDataEntityForSearchResult({ em: orm.em.fork() }, { kind: "disciple", id: "KURT" });
    expect(disciple?.prfWeapon.uniqueSkill).not.toBeNull();
    if (!disciple?.prfWeapon.uniqueSkill) return;

    expect(describeWeaponSkillEffects(disciple.prfWeapon.uniqueSkill.effect)).toBe(
        "Deal 30% more weapon damage against Axe units.",
    );
});

test("hydrates a disciple's PRF weapon-type skill effect for its search result", async () => {
    const disciple = await getGameDataEntityForSearchResult({ em: orm.em.fork() }, { kind: "disciple", id: "ROSE" });
    expect(disciple?.prfWeapon.weaponTypeSkill).toBeDefined();
    if (!disciple?.prfWeapon.weaponTypeSkill) return;

    expect(describeWeaponSkillEffects(disciple.prfWeapon.weaponTypeSkill.effect)).toBe(
        "Deal 50% more weapon damage against Armored units.",
    );
});
