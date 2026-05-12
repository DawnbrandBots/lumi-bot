import type { EntityManager } from "@mikro-orm/core";
import type { ISearchableEntity, ISearchItem } from "../features/search.ts";
import { Disciple } from "../models/game/classes/disciple.ts";
import { Spell } from "../models/game/classes/spell.ts";
import { Weapon } from "../models/game/classes/weapon.ts";
import { WeaponSkill } from "../models/game/classes/weaponSkill.ts";

// TODO: redundant?
export function* id(value: string) {
    yield value;
}

export function* normalizeWeaponName(value: string) {
    // No need to remove diacritics and replace with lowercase: the search engine takes care of it already.
    // Do not remove spaces.
    // TODO: having written the comments above, moving this logic into the FuseSearchEngine class might be more appropriate.
    yield value.replace("+", "Plus");
}

// TODO: "normalize" has lost a bit of its meaning here
export function* normalizeSpellName(value: string): Generator<string> {
    const norm = value.replace("+", "Plus");
    yield norm;
    // TODO: constants for regex?
    const normSplit = norm.split(/\s|(?=Fire|Thunder|Wind|Poison|Heal|Shield|Edge)/i);
    yield normSplit.map((s) => (s === "EX" ? s : s === "Plus" ? "P" : s[0]?.toUpperCase())).join("");
}

function getToSearchItemMapper<Kind extends string>(
    normalizer: (value: string) => Iterable<string>,
): (entity: ISearchableEntity & { kind: Kind }) => ISearchItem & { kind: Kind } {
    return ({ id, name, kind }: ISearchableEntity & { kind: Kind }) => {
        const aliases = [...normalizer(name)];
        return {
            id,
            aliases,
            kind,
        };
    };
}

export type TSearchableEntity = Disciple | Weapon | WeaponSkill | Spell;

export default async function getSearchables(em: EntityManager) {
    // No need to populate entities. We only care about the id, name and kind for the sake of the search.
    const weapons: Weapon[] = await em.findAll(Weapon);
    const disciples: Disciple[] = await em.findAll(Disciple);
    const weaponSkills: WeaponSkill[] = await em.findAll(WeaponSkill);
    const spells: Spell[] = await em.findAll(Spell);

    const weaponSearchItems = weapons.flatMap(getToSearchItemMapper(normalizeWeaponName));
    const discipleSearchItems = disciples.flatMap(getToSearchItemMapper(id));
    const weaponSkillSearchItems = weaponSkills.flatMap(getToSearchItemMapper(id));
    const spellSearchItems = spells.flatMap(getToSearchItemMapper(normalizeSpellName));

    return [...weaponSearchItems, ...discipleSearchItems, ...weaponSkillSearchItems, ...spellSearchItems];
}
