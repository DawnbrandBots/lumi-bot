import type { SqlEntityManager } from "@mikro-orm/sqlite";
import { SPELL_NAME_SUFFIXES } from "../game/constants.ts";
import { Disciple } from "../game/models/disciple.ts";
import { Music } from "../game/models/music.ts";
import { Spell } from "../game/models/spell.ts";
import { Weapon } from "../game/models/weapon.ts";
import { WeaponSkill } from "../game/models/weaponSkill.ts";
import type { IMusic } from "../game/types.ts";
import type { ISearchableEntity, ISearchItem } from "../search/types.ts";

function* id(value: string) {
    yield value;
}

function* aliasWeaponName(value: string) {
    yield value.replace("+", "Plus");
}

const SPELL_NAME_PREFIX_SPLIT_REGEX = new RegExp(`\\s|(?=${SPELL_NAME_SUFFIXES.join("|")})`, "i");

function* aliasSpellName(value: string): Generator<string> {
    const norm = value.replace("+", "Plus");
    yield norm;
    const normSplit = norm.split(SPELL_NAME_PREFIX_SPLIT_REGEX);
    yield normSplit.map((s) => (s === "EX" ? s : s === "Plus" ? "P" : s[0]?.toUpperCase())).join("");
}

function getToSearchItemMapper<Kind extends string>(
    aliaser: (value: string) => Iterable<string>,
): (entity: ISearchableEntity & { kind: Kind }) => ISearchItem & { kind: Kind } {
    return ({ id, name, kind }: ISearchableEntity & { kind: Kind }) => {
        const aliases = [...aliaser(name)];
        return {
            id,
            name,
            kind,
            aliases,
        };
    };
}

/**
 * @returns Items to to provide to the search engine.
 */
export default async function getSearchItems(em: SqlEntityManager) {
    // Fork EM to not preserve (even partially) loaded entities in memory.
    const localEm = em.fork();

    // No need to populate entities. We only care about the id, name and kind for the sake of the search.
    const weapons: Weapon[] = await localEm.findAll(Weapon);
    const disciples: Disciple[] = await localEm.findAll(Disciple);
    const weaponSkills: WeaponSkill[] = await localEm.findAll(WeaponSkill);
    const spells: Spell[] = await localEm.findAll(Spell);
    const music: IMusic[] = await localEm.findAll(Music);

    const weaponSearchItems = weapons.flatMap(getToSearchItemMapper(aliasWeaponName));
    const discipleSearchItems = disciples.flatMap(getToSearchItemMapper(id));
    const weaponSkillSearchItems = weaponSkills.flatMap(getToSearchItemMapper(id));
    const spellSearchItems = spells.flatMap(getToSearchItemMapper(aliasSpellName));
    const musicSearchItems = music.flatMap(getToSearchItemMapper(id));

    return [
        ...weaponSearchItems,
        ...discipleSearchItems,
        ...weaponSkillSearchItems,
        ...spellSearchItems,
        ...musicSearchItems,
    ];
}
