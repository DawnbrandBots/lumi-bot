import { type Options } from "@mikro-orm/sqlite";
import fs from "node:fs";
import { ESpellEffectsKind } from "../../src/domain/game/models/spell.types.ts";
import recreateDb from "./recreateDb.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapDataEntry(entityName: string, entry: object): object {
    if (entityName !== "Spell" || !isRecord(entry)) {
        return entry;
    }

    const effects = entry.effects;
    if (Array.isArray(effects)) {
        return {
            ...entry,
            effects: {
                kind: ESpellEffectsKind.NORMAL,
                effects,
            },
        };
    }

    if (isRecord(effects) && Array.isArray(effects.light) && Array.isArray(effects.shadow)) {
        return {
            ...entry,
            effects: {
                kind: ESpellEffectsKind.FORM_BASED,
                light: effects.light,
                shadow: effects.shadow,
            },
        };
    }

    throw new Error(`Spell ${String(entry.id)} has invalid effects data.`);
}

/** Creates an SQLite database with game data. */
export default async function recreateStaticGameDataDb(config: Options): Promise<void> {
    const orm = await recreateDb(config);

    const em = orm.em.fork();
    // Get only metadata of Mikro-ORM entities that represent tables.
    // eg. embeddables are entities that do not have tables:
    // https://mikro-orm.io/docs/embeddables
    const metadata = [...orm.getMetadata().getAll().values()].filter(
        (entityMetadata) => entityMetadata.tableName && !entityMetadata.embeddable,
    );

    try {
        const connection = orm.em.getConnection();

        await connection.execute("PRAGMA foreign_keys = OFF");

        for (const entityMetadata of metadata) {
            const entityName = entityMetadata.className;
            const jsonFileName = `./data/${entityName[0]!.toLowerCase() + entityName.slice(1)}.json`;
            const str = fs.readFileSync(jsonFileName, {
                encoding: "utf-8",
            });
            const entries = (JSON.parse(str) as object[]).map((entry) => mapDataEntry(entityName, entry));
            // Types for insertMany and the likes do not accept strings as first argument,
            // yet passing an entity name string works.
            await em.insertMany(entityMetadata.className as unknown as Parameters<typeof em.insertMany>[0], entries, {
                convertCustomTypes: false,
            });
        }
        await em.flush();

        const foreignKeyErrors = await connection.execute("PRAGMA foreign_key_check");
        if (foreignKeyErrors.length > 0) {
            throw new Error(`Imported data contains foreign key errors: ${JSON.stringify(foreignKeyErrors)}`);
        }
    } finally {
        await orm.em.getConnection().execute("PRAGMA foreign_keys = ON");
        await orm.close(true);
    }
}
