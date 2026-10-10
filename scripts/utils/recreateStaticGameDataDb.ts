import { type Options } from "@mikro-orm/sqlite";
import fs from "node:fs";
import spells from "../../data/spell.json" with { type: "json" };
import { ESpellEffectsKind } from "../../src/domain/game/models/spell.types.ts";
import recreateDb from "./recreateDb.ts";

const mappers = {
    Spell: (spell: (typeof spells)[number]) => {
        if (Array.isArray(spell.effects)) {
            return {
                ...spell,
                effects: {
                    kind: ESpellEffectsKind.NORMAL,
                    effects: spell.effects,
                },
            };
        } else {
            return {
                ...spell,
                effects: {
                    kind: ESpellEffectsKind.FORM_BASED,
                    light: spell.effects.light,
                    shadow: spell.effects.shadow,
                },
            };
        }
    },
    Support: ([discipleOne, discipleTwo]: [string, string]) => ({ discipleOne, discipleTwo }),
} as const;

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
            const mapper = mappers[entityName as keyof typeof mappers];
            const entries = (JSON.parse(str) as object[]).map((entry) =>
                // TODO: booooo I used any I know I know. Proper validation incoming in a future PR.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
                mapper ? mapper(entry as any) : entry,
            );
            // Types for insertMany and the likes do not accept strings as first argument,
            // yet passing an entity name string does work as a replacement for passing a constructor at runtime.
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
