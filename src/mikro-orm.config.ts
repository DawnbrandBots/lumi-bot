import { defineConfig } from '@mikro-orm/sqlite';
import { Color, Disciple, MovementType, Spell, Weapon, WeaponSkill, WeaponSkillEffect, WeaponType } from './models.ts';

export default defineConfig({
    entities: [WeaponSkill, WeaponSkillEffect, Weapon, WeaponType, Color, Spell, Disciple, MovementType],
    dbName: 'lumi',
});

