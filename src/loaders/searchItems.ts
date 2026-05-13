import type { EntityManager } from "@mikro-orm/core";
import type { ISearchableEntity, ISearchItem } from "../features/search.ts";
import { Disciple } from "../models/game/classes/disciple.ts";
import { Spell } from "../models/game/classes/spell.ts";
import { Weapon } from "../models/game/classes/weapon.ts";
import { WeaponSkill } from "../models/game/classes/weaponSkill.ts";

export function* id(value: string) {
    yield value;
}

export function* aliasWeaponName(value: string) {
    yield value.replace("+", "Plus");
}

export function* aliasSpellName(value: string): Generator<string> {
    const norm = value.replace("+", "Plus");
    yield norm;
    // TODO: constants for regex?
    const normSplit = norm.split(/\s|(?=Fire|Thunder|Wind|Poison|Heal|Shield|Edge)/i);
    yield normSplit.map((s) => (s === "EX" ? s : s === "Plus" ? "P" : s[0]?.toUpperCase())).join("");
}

function getToSearchItemMapper<Kind extends string>(
    aliaser: (value: string) => Iterable<string>,
): (entity: ISearchableEntity & { kind: Kind }) => ISearchItem & { kind: Kind } {
    return ({ id, name, kind }: ISearchableEntity & { kind: Kind }) => {
        const aliases = [...aliaser(name)];
        return {
            id,
            aliases,
            kind,
        };
    };
}

export type TSearchableEntity = Disciple | Weapon | WeaponSkill | Spell;

export default async function getSearchItems(em: EntityManager) {
    // No need to populate entities. We only care about the id, name and kind for the sake of the search.
    const weapons: Weapon[] = await em.findAll(Weapon);
    const disciples: Disciple[] = await em.findAll(Disciple);
    const weaponSkills: WeaponSkill[] = await em.findAll(WeaponSkill);
    const spells: Spell[] = await em.findAll(Spell);

    const weaponSearchItems = weapons.flatMap(getToSearchItemMapper(aliasWeaponName));
    const discipleSearchItems = disciples.flatMap(getToSearchItemMapper(id));
    const weaponSkillSearchItems = weaponSkills.flatMap(getToSearchItemMapper(id));
    const spellSearchItems = spells.flatMap(getToSearchItemMapper(aliasSpellName));

    return [...weaponSearchItems, ...discipleSearchItems, ...weaponSkillSearchItems, ...spellSearchItems];
}
