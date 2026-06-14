import { type Options } from "@mikro-orm/sqlite";
import fs from "node:fs";
import recreateDb from "./recreateDb.ts";

/**
 * Refreshes static game-data tables from JSON without touching runtime tables.
 */
export default async function recreateStaticGameDataDb(config: Options): Promise<void> {
    const orm = await recreateDb(config);

    const em = orm.em.fork();
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
            const entries = JSON.parse(str) as object[];
            await em.insertMany(entityMetadata.className as never, entries, { convertCustomTypes: false });
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
