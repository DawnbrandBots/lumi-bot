import type { PickDeep } from "type-fest";
import { SPELL_NAME_SUFFIXES } from "../../domain/game/constants.ts";
import type { IDisciple } from "../../domain/game/models/disciple.types.ts";
import type { IMusic } from "../../domain/game/models/music.types.ts";
import type { ISpell } from "../../domain/game/models/spell.types.ts";
import { ESpellRole } from "../../domain/game/models/spell.types.ts";
import type { IWeapon } from "../../domain/game/models/weapon.types.ts";
import type { IWeaponSkill } from "../../domain/game/models/weaponSkill.types.ts";
import type { ISearchIndexEntry, TSearchIndexEntry } from "../../domain/search/types.ts";

// Standalone aliases are aliases created from an entity's own properties. eg. `Ennea Fire EX` and `EFEX` are based on the spell's name only.
// Relative aliases are aliases created from an entity relationship's properties. eg. `Ennea Fire EX disciple` points to `Kurt`,
// and so do `EFEX Disciple`, `Royal Sword + disciple` and `Royal Sword Plus disciple`.

const SPELL_NAME_PREFIX_SPLIT_REGEX = new RegExp(`\\s|(?=${SPELL_NAME_SUFFIXES.join("|")})`, "i");

function* yieldName(arg: { name: string }) {
    yield arg.name;
}

export const SEARCH_ALIAS_GENERATORS = {
    disciple: {
        standalone: yieldName,
        *relative(
            disciple: Pick<IDisciple, "name"> & {
                readonly prfWeapon?: Pick<IWeapon, "name"> | null;
                readonly spells: Iterable<Pick<ISpell, "name">>;
            },
        ) {
            if (disciple.prfWeapon) {
                for (const weaponAlias of SEARCH_ALIAS_GENERATORS.weapon.standalone(disciple.prfWeapon)) {
                    yield `${weaponAlias} disciple`;
                }
            }
            for (const spell of disciple.spells) {
                for (const spellAlias of SEARCH_ALIAS_GENERATORS.spell.standalone(spell)) {
                    yield `${spellAlias} disciple`;
                }
            }
        },
    },
    music: {
        standalone: yieldName,
        *relative(
            music: Pick<IMusic, "name"> & {
                readonly shadowMusicFor?: Iterable<Pick<IDisciple, "name">> | null;
                readonly shadowResultsScreenMusicFor?: Iterable<Pick<IDisciple, "name">> | null;
            },
        ) {
            for (const disciple of music.shadowMusicFor || []) {
                for (const discipleAlias of SEARCH_ALIAS_GENERATORS.disciple.standalone(disciple)) {
                    yield `Shadow ${discipleAlias} music`;
                }
            }
            for (const disciple of music.shadowResultsScreenMusicFor || []) {
                for (const discipleAlias of SEARCH_ALIAS_GENERATORS.disciple.standalone(disciple)) {
                    yield `Shadow ${discipleAlias} results screen music`;
                }
            }
        },
    },
    spell: {
        *standalone(spell: Pick<ISpell, "name">): Generator<string> {
            yield spell.name;
            if (spell.name.includes("+")) {
                yield spell.name.replace("+", "Plus");
            }

            const nameSplit = spell.name.split(SPELL_NAME_PREFIX_SPLIT_REGEX);
            const acronym = nameSplit.map((part) => (part === "EX" ? part : part[0]?.toUpperCase())).join("");
            yield acronym;
            if (spell.name.includes("+")) {
                yield acronym.replace("+", "P");
            }
        },
        *relative(
            spell: Pick<ISpell, "name" | "role"> & {
                readonly disciple?: Pick<IDisciple, "name"> | null;
            },
        ): Generator<string> {
            if (spell.disciple && spell.role === ESpellRole.EX) {
                for (const discipleAlias of SEARCH_ALIAS_GENERATORS.disciple.standalone(spell.disciple)) {
                    yield `${discipleAlias} EX`;
                }
            }
        },
    },
    weapon: {
        *standalone(weapon: Pick<IWeapon, "name">) {
            yield weapon.name;
            if (weapon.name.includes("+")) {
                yield weapon.name.replace("+", "Plus");
            }
        },
        *relative(
            weapon: Pick<IWeapon, "name"> & {
                readonly prfDisciple?: Pick<IDisciple, "name"> | null;
            },
        ) {
            if (weapon.prfDisciple) {
                for (const discipleAlias of SEARCH_ALIAS_GENERATORS.disciple.standalone(weapon.prfDisciple)) {
                    yield `${discipleAlias} weapon`;
                }
            }
        },
    },
    weaponSkill: {
        standalone: yieldName,
        *relative(
            weaponSkill: PickDeep<IWeaponSkill, "name"> & {
                readonly uniqueSkillWeapons: Iterable<Pick<IWeapon, "name">>;
            },
        ) {
            for (const weapon of weaponSkill.uniqueSkillWeapons) {
                for (const weaponAlias of SEARCH_ALIAS_GENERATORS.weapon.standalone(weapon)) {
                    yield `${weaponAlias} weapon skill`;
                }
            }
        },
    },
} as const;

export type TSearchAliasEntities = {
    readonly disciple: readonly (Parameters<(typeof SEARCH_ALIAS_GENERATORS)["disciple"]["relative"]>[0] &
        Pick<IDisciple, "id" | "kind">)[];
    readonly music: readonly (Parameters<(typeof SEARCH_ALIAS_GENERATORS)["music"]["relative"]>[0] &
        Pick<IMusic, "id" | "kind">)[];
    readonly spell: readonly (Parameters<(typeof SEARCH_ALIAS_GENERATORS)["spell"]["relative"]>[0] &
        Pick<ISpell, "id" | "kind">)[];
    readonly weapon: readonly (Parameters<(typeof SEARCH_ALIAS_GENERATORS)["weapon"]["relative"]>[0] &
        Pick<IWeapon, "id" | "kind">)[];
    readonly weaponSkill: readonly (Parameters<(typeof SEARCH_ALIAS_GENERATORS)["weaponSkill"]["relative"]>[0] &
        Pick<IWeaponSkill, "id" | "kind">)[];
};

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
        ...entities.weapon.map((weapon) =>
            toSearchIndexEntry(weapon, [
                ...SEARCH_ALIAS_GENERATORS.weapon.standalone(weapon),
                ...SEARCH_ALIAS_GENERATORS.weapon.relative(weapon),
            ]),
        ),
        ...entities.disciple.map((disciple) =>
            toSearchIndexEntry(disciple, [
                ...SEARCH_ALIAS_GENERATORS.disciple.standalone(disciple),
                ...SEARCH_ALIAS_GENERATORS.disciple.relative(disciple),
            ]),
        ),
        ...entities.weaponSkill.map((weaponSkill) =>
            toSearchIndexEntry(weaponSkill, [
                ...SEARCH_ALIAS_GENERATORS.weaponSkill.standalone(weaponSkill),
                ...SEARCH_ALIAS_GENERATORS.weaponSkill.relative(weaponSkill),
            ]),
        ),
        ...entities.spell.map((spell) =>
            toSearchIndexEntry(spell, [
                ...SEARCH_ALIAS_GENERATORS.spell.standalone(spell),
                ...SEARCH_ALIAS_GENERATORS.spell.relative(spell),
            ]),
        ),
        ...entities.music.map((music) =>
            toSearchIndexEntry(music, [
                ...SEARCH_ALIAS_GENERATORS.music.standalone(music),
                ...SEARCH_ALIAS_GENERATORS.music.relative(music),
            ]),
        ),
    ];
}
