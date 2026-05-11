import { EntityManager } from "@mikro-orm/core";
import { Disciple } from "../models/game/classes/disciple.ts";
import { Spell } from "../models/game/classes/spell.ts";
import { Weapon } from "../models/game/classes/weapon.ts";
import { WeaponSkill } from "../models/game/classes/weaponSkill.ts";

export default async function getSearchables(em: EntityManager) {
    // No need to populate entities. We only care about the id, name and kind for the sake of the search.
    const weapons: Weapon[] = await em.findAll(Weapon);
    const disciples: Disciple[] = await em.findAll(Disciple);
    const weaponSkills: WeaponSkill[] = await em.findAll(WeaponSkill);
    const spells: Spell[] = await em.findAll(Spell);

    return [...weapons, ...disciples, ...weaponSkills, ...spells];
}
