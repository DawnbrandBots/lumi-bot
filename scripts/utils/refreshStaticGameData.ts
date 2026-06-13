import type { EntityMetadata } from "@mikro-orm/core";
import { MikroORM, type Options } from "@mikro-orm/sqlite";
import fs from "node:fs";

type StaticGameDataRefreshOptions = {
    readonly ensureSchema?: boolean;
    readonly readEntries?: (entityName: string) => object[];
};

function quoteIdentifier(identifier: string): string {
    return `"${identifier.replaceAll('"', '""')}"`;
}

function getQualifiedTableName(entityMetadata: EntityMetadata): string {
    const tableName = quoteIdentifier(entityMetadata.tableName);
    return entityMetadata.schema ? `${quoteIdentifier(entityMetadata.schema)}.${tableName}` : tableName;
}

function getForeignKeyCheckSql(schema?: string): string {
    return schema ? `PRAGMA ${quoteIdentifier(schema)}.foreign_key_check` : "PRAGMA foreign_key_check";
}

function getImportableMetadata(orm: MikroORM): EntityMetadata[] {
    return [...orm.getMetadata().getAll().values()].filter(
        (entityMetadata) => entityMetadata.tableName && !entityMetadata.embeddable,
    );
}

function readJsonEntries(entityName: string): object[] {
    const jsonFileName = `./data/${entityName[0]!.toLowerCase() + entityName.slice(1)}.json`;
    const str = fs.readFileSync(jsonFileName, {
        encoding: "utf-8",
    });
    return JSON.parse(str) as object[];
}

export async function ensureStaticGameDataSchema(config: Options): Promise<void> {
    const orm = await MikroORM.init(config);
    try {
        await orm.schema.update({ safe: true, dropTables: false });
    } finally {
        await orm.close(true);
    }
}

/**
 * Refreshes static game-data tables from JSON without touching runtime tables.
 */
export default async function refreshStaticGameData(
    config: Options,
    { ensureSchema = true, readEntries = readJsonEntries }: StaticGameDataRefreshOptions = {},
): Promise<void> {
    if (ensureSchema) {
        await ensureStaticGameDataSchema(config);
    }

    const orm = await MikroORM.init(config);
    const em = orm.em.fork();
    const metadata = getImportableMetadata(orm);

    try {
        const connection = orm.em.getConnection();

        await connection.execute("PRAGMA foreign_keys = OFF");

        for (const entityMetadata of metadata.toReversed()) {
            await connection.execute(`DELETE FROM ${getQualifiedTableName(entityMetadata)}`);
        }

        for (const entityMetadata of metadata) {
            const entries = readEntries(entityMetadata.className);
            await em.insertMany(entityMetadata.className as never, entries, { convertCustomTypes: false });
        }
        await em.flush();

        const schemas = new Set(metadata.map((entityMetadata) => entityMetadata.schema));
        const foreignKeyErrors = (
            await Promise.all([...schemas].map(async (schema) => connection.execute(getForeignKeyCheckSql(schema))))
        ).flat();
        if (foreignKeyErrors.length > 0) {
            throw new Error(`Imported data contains foreign key errors: ${JSON.stringify(foreignKeyErrors)}`);
        }
    } finally {
        await orm.em.getConnection().execute("PRAGMA foreign_keys = ON");
        await orm.close(true);
    }
}
