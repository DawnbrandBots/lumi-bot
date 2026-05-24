import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/sqlite";
import { Color } from "./game/models/color.ts";
import { DamageEffect } from "./game/models/damageEffect.ts";
import { Disciple } from "./game/models/disciple.ts";
import { HealEffect } from "./game/models/healEffect.ts";
import { IceBlockEffect } from "./game/models/iceBlockEffect.ts";
import { MovementEffect } from "./game/models/movementEffect.ts";
import { MovementType } from "./game/models/movementType.ts";
import { RepeatEffect } from "./game/models/repeatEffect.ts";
import { Spell } from "./game/models/spell.ts";
import { SpellEffect } from "./game/models/spellEffect.ts";
import { SpellEffectValue } from "./game/models/spellEffectValue.ts";
import { SpellEffectValueEffectivenessItem } from "./game/models/spellEffectValueEffectivenessItem.ts";
import { SpellEffectValueFixedUnit } from "./game/models/spellEffectValueFixedUnit.ts";
import { SpellEffectValuePercentUnit } from "./game/models/spellEffectValuePercentUnit.ts";
import { SpellShape } from "./game/models/spellShape.ts";
import { StatEffect } from "./game/models/statEffect.ts";
import { StatusEffect } from "./game/models/statusEffect.ts";
import { SummonEffect } from "./game/models/summonEffect.ts";
import { TileEffect } from "./game/models/tileEffect.ts";
import { WarpEffect } from "./game/models/warpEffect.ts";
import { Weapon } from "./game/models/weapon.ts";
import { WeaponSkill } from "./game/models/weaponSkill.ts";
import { WeaponSkillEffect } from "./game/models/weaponSkillEffect.ts";
import { WeaponType } from "./game/models/weaponType.ts";
import { WeaponTypeWeaponSkill } from "./game/models/weaponTypeWeaponSkill.ts";
import { Room } from "./lfg/models/room.ts";
import { RoomPlayer } from "./lfg/models/roomPlayer.ts";

const GAME_CONFIG = defineConfig({
    contextName: "game",
    entities: [
        SpellEffect,
        WeaponSkill,
        WeaponSkillEffect,
        WeaponTypeWeaponSkill,
        Weapon,
        WeaponType,
        Color,
        SpellEffectValue,
        DamageEffect,
        HealEffect,
        MovementEffect,
        StatEffect,
        StatusEffect,
        RepeatEffect,
        WarpEffect,
        TileEffect,
        IceBlockEffect,
        SummonEffect,
        Disciple,
        MovementType,
        Spell,
        SpellEffectValueEffectivenessItem,
        SpellEffectValueFixedUnit,
        SpellEffectValuePercentUnit,
        SpellShape,
    ],
    dbName: "game.db3",
});

const LFG_CONFIG = defineConfig({
    contextName: "lfg",
    entities: [Room, RoomPlayer],
    dbName: "lfg.db3",
    migrations: {
        pathTs: "./src/migrations/lfg",
    },
    extensions: [Migrator],
});

// Still export array of configs as default for compatibility with MikroORM CLI.
// Use --contextName option to specify config.
// https://mikro-orm.io/docs/quick-start#configuration-file-structure
export default [GAME_CONFIG, LFG_CONFIG] as const;

export const configsById = {
    game: GAME_CONFIG,
    lfg: LFG_CONFIG,
} as const;
