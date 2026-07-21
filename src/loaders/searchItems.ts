import type { SqlEntityManager } from "@mikro-orm/sqlite";
import { SPELL_NAME_SUFFIXES } from "../game/constants.ts";
import { Disciple } from "../game/models/disciple.ts";
import { Music } from "../game/models/music.ts";
import { Spell } from "../game/models/spell.ts";
import { Weapon } from "../game/models/weapon.ts";
import { WeaponSkill } from "../game/models/weaponSkill.ts";
import { ESpellRole } from "../game/types.ts";
import type { ISearchItem, TSearchableEntity } from "../search/types.ts";

// Standalone aliases are aliases created from an entity's own properties. eg. `Ennea Fire EX` and `EFEX` are based on the spell's name only.
// Relative aliases are aliases created from an entity's relationship's properties. eg. `Ennea Fire EX disciple` points to `Kurt`,
// and so do `EFEX Disciple`, `Royal Sword + disciple` and `Royal Sword Plus disciple`!

function* standaloneAliasWeapon(weapon: Weapon) {
    yield weapon.name;
    if (weapon.name.includes("+")) {
        yield weapon.name.replace("+", "Plus");
    }
}

function* relativeAliasWeapon(weapon: Weapon) {
    if (weapon.prfDisciple) {
        for (const discipleAlias of standaloneAliasDisciple(weapon.prfDisciple)) {
            yield `${discipleAlias} weapon`;
        }
    }
}

function* aliasWeapon(weapon: Weapon) {
    yield* standaloneAliasWeapon(weapon);
    yield* relativeAliasWeapon(weapon);
}

function* standaloneAliasDisciple(disciple: Disciple) {
    yield disciple.name;
}

function* relativeAliasDisciple(disciple: Disciple) {
    if (disciple.prfWeapon) {
        for (const weaponAlias of standaloneAliasWeapon(disciple.prfWeapon)) {
            yield `${weaponAlias} disciple`;
        }
    }
    for (const spell of disciple.spells) {
        for (const spellAlias of standaloneAliasSpell(spell)) {
            yield `${spellAlias} disciple`;
        }
    }
}

function* aliasDisciple(disciple: Disciple) {
    yield* standaloneAliasDisciple(disciple);
    yield* relativeAliasDisciple(disciple);
}

function* standaloneAliasWeaponSkill(weaponSkill: WeaponSkill) {
    yield weaponSkill.name;
}

function* relativeAliasWeaponSkill(weaponSkill: WeaponSkill) {
    for (const weapon of weaponSkill.uniqueSkillWeapons) {
        for (const weaponAlias of standaloneAliasWeapon(weapon)) {
            yield `${weaponAlias} weapon skill`;
        }
    }
}

function* aliasWeaponSkill(weaponSkill: WeaponSkill) {
    yield* standaloneAliasWeaponSkill(weaponSkill);
    yield* relativeAliasWeaponSkill(weaponSkill);
}

function* standaloneAliasMusic(music: Music) {
    yield music.name;
}

function* relativeAliasMusic(music: Music) {
    for (const disciple of music.shadowMusicFor || []) {
        for (const discipleAlias of standaloneAliasDisciple(disciple)) {
            yield `Shadow ${discipleAlias} music`;
        }
    }
    for (const disciple of music.shadowResultsScreenMusicFor || []) {
        for (const discipleAlias of standaloneAliasDisciple(disciple)) {
            yield `Shadow ${discipleAlias} results screen music`;
        }
    }
}

function* aliasMusic(music: Music) {
    yield* standaloneAliasMusic(music);
    yield* relativeAliasMusic(music);
}

const SPELL_NAME_PREFIX_SPLIT_REGEX = new RegExp(`\\s|(?=${SPELL_NAME_SUFFIXES.join("|")})`, "i");

function* standaloneAliasSpell(spell: Spell): Generator<string> {
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
}

function* relativeAliasSpell(spell: Spell): Generator<string> {
    if (spell.disciple && spell.role.kind === ESpellRole.EX) {
        for (const discipleAlias of standaloneAliasDisciple(spell.disciple)) {
            yield `${discipleAlias} EX`;
        }
    }
}

function* aliasSpell(spell: Spell): Generator<string> {
    yield* standaloneAliasSpell(spell);
    yield* relativeAliasSpell(spell);
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
