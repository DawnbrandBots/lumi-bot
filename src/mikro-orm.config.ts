import { defineConfig } from '@mikro-orm/sqlite';
import { Color, DamageEffect, Direction, Disciple, HealEffect, IceBlockEffect, MovementEffect, MovementType, RepeatEffect, Spell, SpellEffect, SpellValue, SpellValueEffectivenessItem, SpellValueFixedUnit, SpellValuePercentUnit, StatChange, StatEffect, StatusEffect, SummonEffect, TileEffect, WarpEffect, Weapon, WeaponSkill, WeaponSkillEffect, WeaponType } from './models.ts';

export default defineConfig({
    entities: [SpellEffect, WeaponSkill, WeaponSkillEffect, Weapon, WeaponType, Color, Direction, StatChange, SpellValue, DamageEffect, HealEffect, MovementEffect, StatEffect, StatusEffect, RepeatEffect, WarpEffect, TileEffect, IceBlockEffect, SummonEffect, Disciple, MovementType, Spell, /*SpellValueUnit, */SpellValueEffectivenessItem, SpellValueFixedUnit, SpellValuePercentUnit],
    dbName: 'lumi',
});