import type { SqlEntityManager } from "@mikro-orm/sqlite";
import { BAZAAR_ALLOWED_WEAPON_LEVELS } from "../bazaar/constants.ts";
import { Weapon } from "../game/models/weapon.ts";
import type { ISearchItem } from "../search/types.ts";

function* aliasWeaponName(value: string) {
    yield value.replace("+", "Plus");
}

export default async function getBazaarSearchItems(
    em: SqlEntityManager,
): Promise<(ISearchItem & { kind: "weapon" })[]> {
    const localEm = em.fork();
    const weapons = await localEm.find(Weapon, { level: { $in: [...BAZAAR_ALLOWED_WEAPON_LEVELS] } });

    return weapons.map((weapon) => ({
        id: weapon.id,
        name: weapon.name,
        kind: weapon.kind,
        aliases: [...aliasWeaponName(weapon.name)],
    }));
}
