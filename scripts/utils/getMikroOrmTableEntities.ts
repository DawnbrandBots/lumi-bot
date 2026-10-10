import type { MikroORM } from "@mikro-orm/sqlite";

/**
 * Get only metadata of Mikro-ORM entities that represent tables.
 * eg. embeddables are entities that do not have tables: https://mikro-orm.io/docs/embeddables.
 */
export default function getMikroOrmTableEntities(orm: MikroORM) {
    return [...orm.getMetadata().getAll().values()].filter(
        (entityMetadata) => entityMetadata.tableName && !entityMetadata.embeddable,
    );
}
