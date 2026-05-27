import { MikroORM, type Options } from "@mikro-orm/sqlite";
import fs from "node:fs";
import recreateDb from "./recreateDb.ts";

/**
 * Creates an SQLite database with game data.
 */
export default async function recreateGameDb(config: Options): Promise<void> {
    const orm = await MikroORM.init(config);
    await recreateDb(config);
    const em = orm.em.fork();

    try {
        const tables = [...orm.getMetadata().getAll().values()]
            .filter((entityMetadata) => entityMetadata.tableName && !entityMetadata.embeddable)
            .map((entityMetadata) => entityMetadata.className);

        // Ignore foreign key checks during insertion
        await orm.em.getConnection().execute("PRAGMA foreign_keys = OFF");

        for (const entityName of tables) {
            const jsonFileName = `./data/${entityName[0]!.toLowerCase() + entityName.slice(1)}.json`;
            const str = fs.readFileSync(jsonFileName, {
                encoding: "utf-8",
            });

            // No need to bother with type checking here (?).
            // If there is a problem with column names or data types, SQLite will report it.
            const entries = JSON.parse(str) as object[];
            await em.insertMany(entityName as never, entries, { convertCustomTypes: false });
        }
        await em.flush();

        // Check foreign keys now that all entries have been inserted
        const foreignKeyErrors = await orm.em.getConnection().execute("PRAGMA foreign_key_check");
        if (foreignKeyErrors.length > 0) {
            throw new Error(`Imported data contains foreign key errors: ${JSON.stringify(foreignKeyErrors)}`);
        }
    } finally {
        // Re-enable foreign key checks
        await orm.em.getConnection().execute("PRAGMA foreign_keys = ON");
        await orm.close(true);
    }
}
