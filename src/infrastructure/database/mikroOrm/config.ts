import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/sqlite";
import path from "node:path";
import { GuildConfig } from "./models/admin/config.ts";
import { GuildConfigLfgRole } from "./models/admin/configLfgRole.ts";
import { Color } from "./models/game/color.ts";
import { DamageEffect } from "./models/game/damageEffect.ts";
import { Disciple } from "./models/game/disciple.ts";
import { HealEffect } from "./models/game/healEffect.ts";
import { MovementEffect } from "./models/game/movementEffect.ts";
import { MovementType } from "./models/game/movementType.ts";
import { ObstacleEffect } from "./models/game/obstacleEffect.ts";
import { RepeatEffect } from "./models/game/repeatEffect.ts";
import { Spell } from "./models/game/spell.ts";
import { SpellEffect } from "./models/game/spellEffect.ts";
import { SpellEffectValue } from "./models/game/spellEffectValue.ts";
import { SpellEffectValueEffectivenessItem } from "./models/game/spellEffectValueEffectivenessItem.ts";
import { SpellEffectValueFixedUnit } from "./models/game/spellEffectValueFixedUnit.ts";
import { SpellEffectValuePercentUnit } from "./models/game/spellEffectValuePercentUnit.ts";
import { SpellShape } from "./models/game/spellShape.ts";
import { StatEffect } from "./models/game/statEffect.ts";
import { StatusEffect } from "./models/game/statusEffect.ts";
import { SummonEffect } from "./models/game/summonEffect.ts";
import { TileEffect } from "./models/game/tileEffect.ts";
import { WarpEffect } from "./models/game/warpEffect.ts";
import { Weapon } from "./models/game/weapon.ts";
import { WeaponSkill } from "./models/game/weaponSkill.ts";
import { WeaponSkillEffect } from "./models/game/weaponSkillEffect.ts";
import { WeaponType } from "./models/game/weaponType.ts";
import { WeaponTypeWeaponSkill } from "./models/game/weaponTypeWeaponSkill.ts";
import { LfgRoom } from "./models/lfg/room.ts";
import { LfgRoomPlayer } from "./models/lfg/roomPlayer.ts";

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
    ObstacleEffect,
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
 * Main db entities.
 */
const RUNTIME_ENTITIES = [GuildConfig, GuildConfigLfgRole, LfgRoom, LfgRoomPlayer];

const STATE_DB_NAME = path.join(LUMI_STATE_DB_DIR, `${LUMI_STATE_DB_NAME}.db3`);
const GAME_DB_NAME = path.join(LUMI_STATIC_DB_DIR, `${LUMI_GAME_DB_NAME}.db3`);

const GAME_DB_SCHEMA = "game";

/**
 * Main ORM config used at runtime. Default CLI config.
 */
export const appMikroOrmConfig = defineConfig({
    entities: [...GAME_DATA_ENTITIES, ...RUNTIME_ENTITIES],
    dbName: STATE_DB_NAME,
    // MikroORM's way of dealing with multiple SQLite databases.
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
    migrations: {
        path: path.join("dist", "infrastructure", "database", "mikroOrm", "migrations", LUMI_STATE_DB_NAME),
        pathTs: path.join("src", "infrastructure", "database", "mikroOrm", "migrations", LUMI_STATE_DB_NAME),
    },
    extensions: [Migrator],
});

// Exporting an array of configs as default allows referring to non-default config using `--contextName`.
// https://mikro-orm.io/blog/mikro-orm-6-4-released#support-for-multiple-orm-configurations
// https://mikro-orm.io/docs/quick-start#configuration-file-structure
export default [appMikroOrmConfig, staticGameDataMikroOrmConfig, migrationMikroOrmConfig];
