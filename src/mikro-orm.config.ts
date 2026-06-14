import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/sqlite";
import path from "node:path";
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

/**
 * Game data entities. Not managed by migrations. Rather, their dedicated DB is recreated during deployment.
 */
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

/**
 * Empty in this PR only but left to demonstrate how it should be used later on.
 * Remove comment in PR adding entities to the main database.
 */
const RUNTIME_ENTITIES: never[] = [];

const STATE_DB_NAME = path.join(LUMI_STATE_DB_DIR, `${LUMI_STATE_DB_NAME}.db3`);
const GAME_DB_NAME = path.join(LUMI_STATIC_DB_DIR, `${LUMI_GAME_DB_NAME}.db3`);

const GAME_DB_SCHEMA = "game";

/**
 * Main ORM config used at runtime. Default CLI config.
 */
export const appMikroOrmConfig = defineConfig({
    entities: [...GAME_DATA_ENTITIES, ...RUNTIME_ENTITIES],
    dbName: STATE_DB_NAME,
    // SQLite's way of adding another db to the same connection.
    // A single Mikro-ORM instance using this db config can manipulate entities from both dbs.
    // https://mikro-orm.io/docs/multiple-schemas#sqlite-attach-database
    attachDatabases: [{ name: GAME_DB_SCHEMA, path: GAME_DB_NAME }],
    discovery: {
        // Mikro ORM requires defining the `schema` property for entities in attached databases.
        // The official documentation recommends setting the schema on the entity definition directly:
        // https://mikro-orm.io/docs/multiple-schemas#entity-definition
        // However, this prevents using the game database as main database in a separate config,
        // as Mikro-ORM will write queries referring to game entities under the "game" schema, rather than at the database's root level.
        // This hook assigns a schema to entities based on whether they belong to GAME_DATA_ENTITIES.
        onMetadata(meta) {
            meta.schema = GAME_DATA_ENTITIES.includes(meta.class) ? GAME_DB_SCHEMA : "main";
        },
    },
    metadataCache: { enabled: false },
});

/**
 * ORM config used to manipulate only the static game data db.
 */
export const staticGameDataMikroOrmConfig = defineConfig({
    contextName: "static-game-data",
    entities: GAME_DATA_ENTITIES,
    dbName: GAME_DB_NAME,
    metadataCache: { enabled: false },
});

/**
 * ORM config used for migrating non-game data entities.
 */
export const migrationMikroOrmConfig = defineConfig({
    contextName: "migration",
    entities: RUNTIME_ENTITIES,
    dbName: STATE_DB_NAME,
    discovery: {
        // Remove in PR adding entities to the main database.
        warnWhenNoEntities: false,
    },
    migrations: {
        pathTs: path.join("src", "migrations", LUMI_STATE_DB_NAME),
    },
    extensions: [Migrator],
});

// Exporting an array of configs as default allows referring to non-default config using `--contextName`.
// https://mikro-orm.io/blog/mikro-orm-6-4-released#support-for-multiple-orm-configurations
export default [appMikroOrmConfig, staticGameDataMikroOrmConfig, migrationMikroOrmConfig];
