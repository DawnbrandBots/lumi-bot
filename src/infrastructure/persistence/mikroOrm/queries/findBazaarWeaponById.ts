import type { EntityManager } from "@mikro-orm/sqlite";
import type { TBazaarQueries } from "../../../../application/bazaar/queries.types.ts";
import { Weapon } from "../models/game/weapon.ts";

export function findBazaarWeaponById(
    { em }: { readonly em: EntityManager },
    { weaponId }: Parameters<TBazaarQueries["findWeaponById"]>[0],
): Promise<Awaited<ReturnType<TBazaarQueries["findWeaponById"]>>> {
    return em.findOne(Weapon, { id: weaponId }, { fields: ["id", "level", "name"] });
}
