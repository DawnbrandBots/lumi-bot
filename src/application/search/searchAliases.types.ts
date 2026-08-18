import type { TId } from "../../domain/game/models/base.types.ts";
import type { ESpellRole } from "../../domain/game/models/spell.types.ts";

export type TStandaloneSearchAliasWeapon = {
    readonly name: string;
};

export type TSearchAliasWeaponInput = TStandaloneSearchAliasWeapon & {
    readonly prfDisciple?: TStandaloneSearchAliasDisciple | null;
};

export type TSearchAliasWeapon = TSearchAliasWeaponInput & {
    readonly id: TId;
    readonly kind: "weapon";
};

export type TStandaloneSearchAliasDisciple = {
    readonly name: string;
};

export type TSearchAliasDiscipleInput = TStandaloneSearchAliasDisciple & {
    readonly prfWeapon?: TStandaloneSearchAliasWeapon | null;
    readonly spells: Iterable<TStandaloneSearchAliasSpell>;
};

export type TSearchAliasDisciple = TSearchAliasDiscipleInput & {
    readonly id: TId;
    readonly kind: "disciple";
};

export type TSearchAliasWeaponSkillInput = {
    readonly name: string;
    readonly uniqueSkillWeapons: Iterable<TStandaloneSearchAliasWeapon>;
};

export type TSearchAliasWeaponSkill = TSearchAliasWeaponSkillInput & {
    readonly id: TId;
    readonly kind: "weaponSkill";
};

export type TSearchAliasMusicInput = {
    readonly name: string;
    readonly shadowMusicFor?: Iterable<TStandaloneSearchAliasDisciple> | null;
    readonly shadowResultsScreenMusicFor?: Iterable<TStandaloneSearchAliasDisciple> | null;
};

export type TSearchAliasMusic = TSearchAliasMusicInput & {
    readonly id: TId;
    readonly kind: "music";
};

export type TStandaloneSearchAliasSpell = {
    readonly name: string;
};

export type TSearchAliasSpellInput = TStandaloneSearchAliasSpell & {
    readonly disciple?: TStandaloneSearchAliasDisciple | null;
    readonly role: keyof typeof ESpellRole;
};

export type TSearchAliasSpell = TSearchAliasSpellInput & {
    readonly id: TId;
    readonly kind: "spell";
};

export type TSearchAliasEntities = {
    readonly disciple: readonly TSearchAliasDisciple[];
    readonly music: readonly TSearchAliasMusic[];
    readonly spell: readonly TSearchAliasSpell[];
    readonly weapon: readonly TSearchAliasWeapon[];
    readonly weaponSkill: readonly TSearchAliasWeaponSkill[];
};
