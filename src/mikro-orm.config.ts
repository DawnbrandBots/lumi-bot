import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/sqlite";
import path from "node:path";
import { GAME_DB_SCHEMA } from "./db/constants.ts";
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

const LUMI_STATE_DB_DIR = process.env.LUMI_STATE_DB_DIR;
const LUMI_STATIC_DB_DIR = process.env.LUMI_STATIC_DB_DIR;
const LUMI_STATE_DB_NAME = process.env.LUMI_STATE_DB_NAME;
const LUMI_GAME_DB_NAME = process.env.LUMI_GAME_DB_NAME;

if (!LUMI_STATE_DB_DIR || !LUMI_STATIC_DB_DIR || !LUMI_STATE_DB_NAME || !LUMI_GAME_DB_NAME) {
    throw new Error(
        "One or more required environment variables are not set: " +
        JSON.stringify({
            LUMI_STATE_DB_DIR,
            LUMI_STATIC_DB_DIR,
            LUMI_STATE_DB_NAME,
            LUMI_GAME_DB_NAME,
        }),
    );
}

export const GAME_DATA_ENTITIES = [
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
];

export const RUNTIME_ENTITIES = [];

export const STATE_DB_NAME = path.join(LUMI_STATE_DB_DIR, `${LUMI_STATE_DB_NAME}.db3`);
export const GAME_DB_NAME = path.join(LUMI_STATIC_DB_DIR, `${LUMI_GAME_DB_NAME}.db3`);

const GAME_DB_ATTACHMENT = [{ name: GAME_DB_SCHEMA, path: GAME_DB_NAME }];

const mikroOrmConfig = defineConfig({
    entities: [...GAME_DATA_ENTITIES, ...RUNTIME_ENTITIES],
    dbName: STATE_DB_NAME,
    attachDatabases: GAME_DB_ATTACHMENT,
});

// This config must use the state db instead of the game db
// because game data models have `schema: GAME_DB_SCHEMA`.
// Mikro-ORM refers to tables from attached databases in queries by prepending their model's schema name (eg. "game".<TABLE_NAME>).
// If the config used the static db as main db, there would be no "game" db attached
// and errors would occur as queries would attempt to access tables named like "game".<TABLE_NAME>.
export const staticGameDataMikroOrmConfig = defineConfig({
    contextName: "static-game-data",
    entities: GAME_DATA_ENTITIES,
    dbName: STATE_DB_NAME,
    attachDatabases: GAME_DB_ATTACHMENT,
});

export const migrationMikroOrmConfig = defineConfig({
    contextName: "migration",
    entities: RUNTIME_ENTITIES,
    dbName: STATE_DB_NAME,
    migrations: {
        pathTs: "./src/migrations",
    },
    extensions: [Migrator],
});

export default mikroOrmConfig;
