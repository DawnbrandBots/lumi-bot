import { defineConfig } from '@mikro-orm/sqlite';
import { Color } from './models/game/classes/color.ts';
import { DamageEffect } from './models/game/classes/damageEffect.ts';
import { Direction } from './models/game/classes/direction.ts';
import { Disciple } from './models/game/classes/disciple.ts';
import { HealEffect } from './models/game/classes/healEffect.ts';
import { IceBlockEffect } from './models/game/classes/iceBlockEffect.ts';
import { MovementEffect } from './models/game/classes/movementEffect.ts';
import { MovementType } from './models/game/classes/movementType.ts';
import { RepeatEffect } from './models/game/classes/repeatEffect.ts';
import { Spell } from './models/game/classes/spell.ts';
import { SpellEffect } from './models/game/classes/spellEffect.ts';
import { SpellShape } from './models/game/classes/spellShape.ts';
import { SpellValue } from './models/game/classes/spellValue.ts';
import { SpellValueEffectivenessItem } from './models/game/classes/spellValueEffectivenessItem.ts';
import { SpellValueFixedUnit } from './models/game/classes/spellValueFixedUnit.ts';
import { SpellValuePercentUnit } from './models/game/classes/spellValuePercentUnit.ts';
import { StatChange } from './models/game/classes/statChange.ts';
import { StatEffect } from './models/game/classes/statEffect.ts';
import { StatusEffect } from './models/game/classes/statusEffect.ts';
import { SummonEffect } from './models/game/classes/summonEffect.ts';
import { TileEffect } from './models/game/classes/tileEffect.ts';
import { WarpEffect } from './models/game/classes/warpEffect.ts';
import { Weapon } from './models/game/classes/weapon.ts';
import { WeaponSkill } from './models/game/classes/weaponSkill.ts';
import { WeaponSkillEffect } from './models/game/classes/weaponSkillEffect.ts';
import { WeaponType } from './models/game/classes/weaponType.ts';

export default defineConfig({
    entities: [SpellEffect, WeaponSkill, WeaponSkillEffect, Weapon, WeaponType, Color, Direction, StatChange, SpellValue, DamageEffect, HealEffect, MovementEffect, StatEffect, StatusEffect, RepeatEffect, WarpEffect, TileEffect, IceBlockEffect, SummonEffect, Disciple, MovementType, Spell, /*SpellValueUnit, */SpellValueEffectivenessItem, SpellValueFixedUnit, SpellValuePercentUnit, SpellShape],
    dbName: 'lumi',
});