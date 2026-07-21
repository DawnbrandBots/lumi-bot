import type { SqlEntityManager } from "@mikro-orm/sqlite";
import { SPELL_NAME_SUFFIXES } from "../game/constants.ts";
import { Disciple } from "../game/models/disciple.ts";
import { Music } from "../game/models/music.ts";
import { Spell } from "../game/models/spell.ts";
import { Weapon } from "../game/models/weapon.ts";
import { WeaponSkill } from "../game/models/weaponSkill.ts";
import { ESpellRole } from "../game/types.ts";
import type { ISearchItem, TSearchableEntity } from "../search/types.ts";

function* aliasWeapon(weapon: Weapon) {
    yield weapon.name;
    if (weapon.name.includes("+")) {
        yield weapon.name.replace("+", "Plus");
    }
    if (weapon.prfDisciple) {
        yield `${weapon.prfDisciple.name}'s weapon`;
    }
}

function* aliasDisciple(disciple: Disciple) {
    yield disciple.name;
    if (disciple.prfWeapon) {
        yield `${disciple.prfWeapon.name}'s disciple`;
    }
    for (const spell of disciple.spells) {
        yield `${spell.name}'s disciple`;
    }
}

function* aliasWeaponSkill(weaponSkill: WeaponSkill) {
    yield weaponSkill.name;
    for (const weapon of weaponSkill.uniqueSkillWeapons) {
        yield `${weapon.name}'s skill`;
    }
}

function* aliasMusic(music: Music) {
    yield music.name;
    for (const disciple of music.shadowMusicFor || []) {
        yield `Shadow ${disciple.name}'s music`;
    }
    for (const disciple of music.shadowResultsScreenMusicFor || []) {
        yield `Shadow ${disciple.name}'s results screen music`;
    }
}

const SPELL_NAME_PREFIX_SPLIT_REGEX = new RegExp(`\\s|(?=${SPELL_NAME_SUFFIXES.join("|")})`, "i");

function* aliasSpell(spell: Spell): Generator<string> {
    yield spell.name;
    if (spell.name.includes("+")) {
        yield spell.name.replace("+", "Plus");
    }

    const nameSplit = spell.name.split(SPELL_NAME_PREFIX_SPLIT_REGEX);
    const acronym = nameSplit.map((s) => (s === "EX" ? s : s[0]?.toUpperCase())).join("");
    yield acronym;
    if (spell.name.includes("+")) {
        yield acronym.replace("+", "P");
    }

    if (spell.disciple && spell.role.kind === ESpellRole.EX) {
        yield `${spell.disciple.name}'s EX`;
    }
}

function getToSearchItemMapper<Kind extends string>(
    aliaser: (value: Extract<TSearchableEntity, { kind: Kind }>) => Iterable<string>,
): (entity: Extract<TSearchableEntity, { kind: Kind }>) => ISearchItem & { kind: Kind } {
    return (entity: Extract<TSearchableEntity, { kind: Kind }>) => {
        const aliases = [...aliaser(entity)];
        const { id, name, kind } = entity;
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
    const weapons: Weapon[] = await localEm.findAll(Weapon, { populate: ["prfDisciple"] });
    const disciples: Disciple[] = await localEm.findAll(Disciple, { populate: ["prfWeapon", "spells"] });
    const weaponSkills: WeaponSkill[] = await localEm.findAll(WeaponSkill, { populate: ["uniqueSkillWeapons"] });
    const spells: Spell[] = await localEm.findAll(Spell, { populate: ["disciple"] });
    const music: Music[] = await localEm.findAll(Music, {
        populate: ["shadowMusicFor", "shadowResultsScreenMusicFor"],
    });

    const weaponSearchItems = weapons.flatMap(getToSearchItemMapper(aliasWeapon));
    const discipleSearchItems = disciples.flatMap(getToSearchItemMapper(aliasDisciple));
    const weaponSkillSearchItems = weaponSkills.flatMap(getToSearchItemMapper(aliasWeaponSkill));
    const spellSearchItems = spells.flatMap(getToSearchItemMapper(aliasSpell));
    const musicSearchItems = music.flatMap(getToSearchItemMapper(aliasMusic));

    return [
        ...weaponSearchItems,
        ...discipleSearchItems,
        ...weaponSkillSearchItems,
        ...spellSearchItems,
        ...musicSearchItems,
    ];
}
