import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach, expect, test } from "vitest";
import recreateStaticGameDataDb from "../../../../scripts/utils/recreateStaticGameDataDb.ts";
import { Color } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/color.ts";
import { Disciple } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/disciple.ts";
import { MovementType } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/movementType.ts";
import { Music } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/music.ts";
import { Spell } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/spell.ts";
import { SpellShape } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/spellShape.ts";
import { Weapon } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weapon.ts";
import { WeaponSkill } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weaponSkill.ts";
import { WeaponSkillEffect } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weaponSkillEffect.ts";
import { WeaponType } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weaponType.ts";
import { WeaponTypeWeaponSkill } from "../../../../src/infrastructure/persistence/mikroOrm/models/game/weaponTypeWeaponSkill.ts";
import { staticGameDataMikroOrmConfig } from "../../../mikro-orm.test.config.ts";

import colors from "../../../../data/color.json" with { type: "json" };
import disciples from "../../../../data/disciple.json" with { type: "json" };
import movementTypes from "../../../../data/movementType.json" with { type: "json" };
import music from "../../../../data/music.json" with { type: "json" };
import spells from "../../../../data/spell.json" with { type: "json" };
import spellShapes from "../../../../data/spellShape.json" with { type: "json" };
import weapons from "../../../../data/weapon.json" with { type: "json" };
import weaponSkills from "../../../../data/weaponSkill.json" with { type: "json" };
import weaponSkillEffects from "../../../../data/weaponSkillEffect.json" with { type: "json" };
import weaponTypes from "../../../../data/weaponType.json" with { type: "json" };
import weaponTypeWeaponSkills from "../../../../data/weaponTypeWeaponSkill.json" with { type: "json" };

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
    const counts = {
        color: await em.count(Color),
        disciple: await em.count(Disciple),
        movementType: await em.count(MovementType),
        music: await em.count(Music),
        spell: await em.count(Spell),
        spellShape: await em.count(SpellShape),
        weapon: await em.count(Weapon),
        weaponSkill: await em.count(WeaponSkill),
        weaponSkillEffect: await em.count(WeaponSkillEffect),
        weaponType: await em.count(WeaponType),
        weaponTypeWeaponSkill: await em.count(WeaponTypeWeaponSkill),
    };
    expect(counts).toStrictEqual({
        color: colors.length,
        disciple: disciples.length,
        movementType: movementTypes.length,
        music: music.length,
        spell: spells.length,
        spellShape: spellShapes.length,
        weapon: weapons.length,
        weaponSkill: weaponSkills.length,
        weaponSkillEffect: weaponSkillEffects.length,
        weaponType: weaponTypes.length,
        weaponTypeWeaponSkill: weaponTypeWeaponSkills.length,
    });
});
