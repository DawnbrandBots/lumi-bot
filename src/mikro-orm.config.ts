import { defineConfig } from '@mikro-orm/sqlite';
import { Color } from './models/color.ts';
import { DamageEffect } from './models/damageEffect.ts';
import { Direction } from './models/direction.ts';
import { Disciple } from './models/disciple.ts';
import { HealEffect } from './models/healEffect.ts';
import { IceBlockEffect } from './models/iceBlockEffect.ts';
import { MovementEffect } from './models/movementEffect.ts';
import { MovementType } from './models/movementType.ts';
import { RepeatEffect } from './models/repeatEffect.ts';
import { Spell } from './models/spell.ts';
import { SpellEffect } from './models/spellEffect.ts';
import { SpellShape } from './models/spellShape.ts';
import { SpellValue } from './models/spellValue.ts';
import { SpellValueEffectivenessItem } from './models/spellValueEffectivenessItem.ts';
import { SpellValueFixedUnit } from './models/spellValueFixedUnit.ts';
import { SpellValuePercentUnit } from './models/spellValuePercentUnit.ts';
import { StatChange } from './models/statChange.ts';
import { StatEffect } from './models/statEffect.ts';
import { StatusEffect } from './models/statusEffect.ts';
import { SummonEffect } from './models/summonEffect.ts';
import { TileEffect } from './models/tileEffect.ts';
import { WarpEffect } from './models/warpEffect.ts';
import { Weapon } from './models/weapon.ts';
import { WeaponSkill } from './models/weaponSkill.ts';
import { WeaponSkillEffect } from './models/weaponSkillEffect.ts';
import { WeaponType } from './models/weaponType.ts';

export default defineConfig({
    entities: [SpellEffect, WeaponSkill, WeaponSkillEffect, Weapon, WeaponType, Color, Direction, StatChange, SpellValue, DamageEffect, HealEffect, MovementEffect, StatEffect, StatusEffect, RepeatEffect, WarpEffect, TileEffect, IceBlockEffect, SummonEffect, Disciple, MovementType, Spell, /*SpellValueUnit, */SpellValueEffectivenessItem, SpellValueFixedUnit, SpellValuePercentUnit, SpellShape],
    dbName: 'lumi',
});