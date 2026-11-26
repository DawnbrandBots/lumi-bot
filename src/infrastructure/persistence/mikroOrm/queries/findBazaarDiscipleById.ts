import type { EntityManager } from "@mikro-orm/sqlite";
import type { TBazaarQueries } from "../../../../application/bazaar/queries.types.ts";
import { Disciple } from "../models/game/disciple.ts";

export function findBazaarDiscipleById(
    { em }: { readonly em: EntityManager },
    { discipleId }: Parameters<TBazaarQueries["findDiscipleById"]>[0],
): Promise<Awaited<ReturnType<TBazaarQueries["findDiscipleById"]>>> {
    return em.findOne(Disciple, { id: discipleId }, { fields: ["id", "isBattlePassDisciple", "name"] });
}
