import type { TId } from "../game/models/base.types.ts";
import type { IDisciple } from "../game/models/disciple.types.ts";
import type { IMusic } from "../game/models/music.types.ts";
import type { ISpell } from "../game/models/spell.types.ts";
import type { IWeapon } from "../game/models/weapon.types.ts";
import type { IWeaponSkill } from "../game/models/weaponSkill.types.ts";

export type TSearchableEntity = IDisciple | IWeapon | IWeaponSkill | ISpell | IMusic;
export type TSearchKind = TSearchableEntity["kind"];
export type ISearchEntityMap = { [Entity in TSearchableEntity as Entity["kind"]]: Entity };
export type TSearchEntity<Kind extends TSearchKind> = ISearchEntityMap[Kind];

/**
 * Properties required for entities to be searchable.
 */
export interface ISearchableEntity {
    readonly id: TId;
    readonly kind: string;
    readonly name: string;
}

/**
 * Properties of objects stored and retrieved by the search engine.
 */
export interface ISearchIndexEntry {
    readonly id: TId;
    readonly kind: string;
    readonly name: string;
    /**
     * All searchable strings that refer to the same item.
     * Eg. "Dark Crossfire Plus Tome" and "DCFPT" both refer to the "Dark Crossfire + 📕" spell.
     */
    readonly aliases: string[];
}

export type TSearchIndexEntry<Kind extends TSearchKind = TSearchKind> = {
    [K in Kind]: ISearchIndexEntry & { kind: K };
}[Kind];
