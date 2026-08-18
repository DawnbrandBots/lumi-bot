import { SPELL_NAME_SUFFIXES } from "../../domain/game/constants.ts";
import { ESpellRole } from "../../domain/game/models/spell.types.ts";
import type { ISearchIndexEntry, TSearchIndexEntry } from "../../domain/search/types.ts";
import type {
    TSearchAliasDiscipleInput,
    TSearchAliasEntities,
    TSearchAliasMusicInput,
    TSearchAliasSpellInput,
    TSearchAliasWeaponInput,
    TSearchAliasWeaponSkillInput,
    TStandaloneSearchAliasDisciple,
    TStandaloneSearchAliasSpell,
    TStandaloneSearchAliasWeapon,
} from "./searchAliases.types.ts";

// Standalone aliases are aliases created from an entity's own properties. eg. `Ennea Fire EX` and `EFEX` are based on the spell's name only.
// Relative aliases are aliases created from an entity relationship's properties. eg. `Ennea Fire EX disciple` points to `Kurt`,
// and so do `EFEX Disciple`, `Royal Sword + disciple` and `Royal Sword Plus disciple`.

function* standaloneAliasWeapon(weapon: TStandaloneSearchAliasWeapon) {
    yield weapon.name;
    if (weapon.name.includes("+")) {
        yield weapon.name.replace("+", "Plus");
    }
}

function* relativeAliasWeapon(weapon: TSearchAliasWeaponInput) {
    if (weapon.prfDisciple) {
        for (const discipleAlias of standaloneAliasDisciple(weapon.prfDisciple)) {
            yield `${discipleAlias} weapon`;
        }
    }
}

export function* aliasWeapon(weapon: TSearchAliasWeaponInput) {
    yield* standaloneAliasWeapon(weapon);
    yield* relativeAliasWeapon(weapon);
}

function* standaloneAliasDisciple(disciple: TStandaloneSearchAliasDisciple) {
    yield disciple.name;
}

function* relativeAliasDisciple(disciple: TSearchAliasDiscipleInput) {
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

export function* aliasDisciple(disciple: TSearchAliasDiscipleInput) {
    yield* standaloneAliasDisciple(disciple);
    yield* relativeAliasDisciple(disciple);
}

function* standaloneAliasWeaponSkill(weaponSkill: Pick<TSearchAliasWeaponSkillInput, "name">) {
    yield weaponSkill.name;
}

function* relativeAliasWeaponSkill(weaponSkill: TSearchAliasWeaponSkillInput) {
    for (const weapon of weaponSkill.uniqueSkillWeapons) {
        for (const weaponAlias of standaloneAliasWeapon(weapon)) {
            yield `${weaponAlias} weapon skill`;
        }
    }
}

export function* aliasWeaponSkill(weaponSkill: TSearchAliasWeaponSkillInput) {
    yield* standaloneAliasWeaponSkill(weaponSkill);
    yield* relativeAliasWeaponSkill(weaponSkill);
}

function* standaloneAliasMusic(music: Pick<TSearchAliasMusicInput, "name">) {
    yield music.name;
}

function* relativeAliasMusic(music: TSearchAliasMusicInput) {
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

export function* aliasMusic(music: TSearchAliasMusicInput) {
    yield* standaloneAliasMusic(music);
    yield* relativeAliasMusic(music);
}

const SPELL_NAME_PREFIX_SPLIT_REGEX = new RegExp(`\\s|(?=${SPELL_NAME_SUFFIXES.join("|")})`, "i");

function* standaloneAliasSpell(spell: TStandaloneSearchAliasSpell): Generator<string> {
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

function* relativeAliasSpell(spell: TSearchAliasSpellInput): Generator<string> {
    if (spell.disciple && spell.role === ESpellRole.EX) {
        for (const discipleAlias of standaloneAliasDisciple(spell.disciple)) {
            yield `${discipleAlias} EX`;
        }
    }
}

export function* aliasSpell(spell: TSearchAliasSpellInput): Generator<string> {
    yield* standaloneAliasSpell(spell);
    yield* relativeAliasSpell(spell);
}

function toSearchIndexEntry<Kind extends string>(
    entity: { readonly id: string; readonly kind: Kind; readonly name: string },
    aliases: Iterable<string>,
): ISearchIndexEntry & { kind: Kind } {
    return {
        id: entity.id,
        name: entity.name,
        kind: entity.kind,
        aliases: [...aliases],
    };
}

export function generateSearchIndexEntries(entities: TSearchAliasEntities): TSearchIndexEntry[] {
    return [
        ...entities.weapon.map((weapon) => toSearchIndexEntry(weapon, aliasWeapon(weapon))),
        ...entities.disciple.map((disciple) => toSearchIndexEntry(disciple, aliasDisciple(disciple))),
        ...entities.weaponSkill.map((weaponSkill) => toSearchIndexEntry(weaponSkill, aliasWeaponSkill(weaponSkill))),
        ...entities.spell.map((spell) => toSearchIndexEntry(spell, aliasSpell(spell))),
        ...entities.music.map((music) => toSearchIndexEntry(music, aliasMusic(music))),
    ];
}
