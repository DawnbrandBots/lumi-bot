import { EntityManager } from "@mikro-orm/core";
import { ISearchableEntity, ISearchItem } from "../features/search.ts";
import { Disciple } from "../models/game/classes/disciple.ts";
import { Spell } from "../models/game/classes/spell.ts";
import { Weapon } from "../models/game/classes/weapon.ts";
import { WeaponSkill } from "../models/game/classes/weaponSkill.ts";

export function normalizeEntityName(value: string) {
    return value;
}

export function normalizeWeaponOrSpellName(value: string) {
    // No need to remove diacritics and replace with lowercase: the search engine takes care of it already.
    // Do not remove spaces.
    // TODO: having written the comments above, moving this logic into the FuseSearchEngine class might be more appropriate.
    return normalizeEntityName(value).replaceAll(/\+/g, "Plus");
}

export const normalizeSearchText = normalizeWeaponOrSpellName;

function getToSearchItemMapper<Kind extends string>(
    normalizer: (value: string) => string,
): (entity: ISearchableEntity & { kind: Kind }) => ISearchItem & { kind: Kind } {
    return ({ id, name, kind }: ISearchableEntity & { kind: Kind }) => ({
        id,
        aliases: [normalizer(name)],
        kind,
    });
}

export type TSearchableEntity = Disciple | Weapon | WeaponSkill | Spell;

export default async function getSearchables(em: EntityManager) {
    // No need to populate entities. We only care about the id, name and kind for the sake of the search.
    const weapons: Weapon[] = await em.findAll(Weapon);
    const disciples: Disciple[] = await em.findAll(Disciple);
    const weaponSkills: WeaponSkill[] = await em.findAll(WeaponSkill);
    const spells: Spell[] = await em.findAll(Spell);

    const weaponSearchItems = weapons.map(getToSearchItemMapper(normalizeWeaponOrSpellName));
    const discipleSearchItems = disciples.map(getToSearchItemMapper(normalizeSearchText));
    const weaponSkillSearchItems = weaponSkills.map(getToSearchItemMapper(normalizeSearchText));
    const spellSearchItems = spells.map(getToSearchItemMapper(normalizeWeaponOrSpellName));

    return [...weaponSearchItems, ...discipleSearchItems, ...weaponSkillSearchItems, ...spellSearchItems];
}
