import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, expect, test } from "vitest";

import recreateStaticGameDataDb from "../../../../scripts/utils/recreateStaticGameDataDb.ts";
import { staticGameDataMikroOrmConfig } from "../../../mikro-orm.test.config.ts";

import { Color } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/color.ts";
import { Disciple } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/disciple.ts";
import { MovementType } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/movementType.ts";
import { Music } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/music.ts";
import { Spell } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/spell.ts";
import { SpellShape } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/spellShape.ts";
import { Support } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/support.ts";
import { Weapon } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weapon.ts";
import { WeaponSkill } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weaponSkill.ts";
import { WeaponSkillEffect } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weaponSkillEffect.ts";
import { WeaponType } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weaponType.ts";
import { WeaponTypeWeaponSkill } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weaponTypeWeaponSkill.ts";

import colors from "../../../../data/color.json" with { type: "json" };
import disciples from "../../../../data/disciple.json" with { type: "json" };
import movementTypes from "../../../../data/movementType.json" with { type: "json" };
import music from "../../../../data/music.json" with { type: "json" };
import spells from "../../../../data/spell.json" with { type: "json" };
import spellShapes from "../../../../data/spellShape.json" with { type: "json" };
import supports from "../../../../data/support.json" with { type: "json" };
import weapons from "../../../../data/weapon.json" with { type: "json" };
import weaponSkills from "../../../../data/weaponSkill.json" with { type: "json" };
import weaponSkillEffects from "../../../../data/weaponSkillEffect.json" with { type: "json" };
import weaponTypes from "../../../../data/weaponType.json" with { type: "json" };
import weaponTypeWeaponSkills from "../../../../data/weaponTypeWeaponSkill.json" with { type: "json" };
import getMikroOrmTableEntities from "../../../../scripts/utils/getMikroOrmTableEntities.ts";

// DB already created once in vitest global setup file.

let orm: MikroORM;

beforeEach(async () => {
    orm = await MikroORM.init(staticGameDataMikroOrmConfig);
});

afterEach(async () => {
    await orm.close();
});

test(`${recreateStaticGameDataDb.name} creates a database with expected count of entities in each table`, async () => {
    const em = orm.em.fork();
    const expectedCounts = {
        Color: colors.length,
        Disciple: disciples.length,
        MovementType: movementTypes.length,
        Music: music.length,
        Spell: spells.length,
        SpellShape: spellShapes.length,
        Support: supports.length,
        Weapon: weapons.length,
        WeaponSkill: weaponSkills.length,
        WeaponSkillEffect: weaponSkillEffects.length,
        WeaponType: weaponTypes.length,
        WeaponTypeWeaponSkill: weaponTypeWeaponSkills.length,
    } as const;

    const expectedCountsKeys = new Set(Object.keys(expectedCounts));
    const tableEntitiesNames = new Set(getMikroOrmTableEntities(orm).map((entityMetadata) => entityMetadata.className));
    expect(expectedCountsKeys.symmetricDifference(tableEntitiesNames).size).toBe(0);

    const counts = {
        Color: await em.count(Color),
        Disciple: await em.count(Disciple),
        MovementType: await em.count(MovementType),
        Music: await em.count(Music),
        Spell: await em.count(Spell),
        SpellShape: await em.count(SpellShape),
        Support: await em.count(Support),
        Weapon: await em.count(Weapon),
        WeaponSkill: await em.count(WeaponSkill),
        WeaponSkillEffect: await em.count(WeaponSkillEffect),
        WeaponType: await em.count(WeaponType),
        WeaponTypeWeaponSkill: await em.count(WeaponTypeWeaponSkill),
    };
    expect(counts).toStrictEqual(expectedCounts);
});
