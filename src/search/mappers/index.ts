import type { APIEmbed } from "discord.js";
import type { ISearchableEntity, TSearchableEntity } from "../types.ts";
import mapDiscipleToMessage from "./disciple.ts";
import mapSpellToMessage from "./spell.ts";
import mapWeaponToMessage from "./weapon.ts";
import mapWeaponSkillToMessage from "./weaponSkill.ts";

export type SearchMapperReturnType = Required<Pick<APIEmbed, "title" | "fields">>;
export type ISearchMapper<EntityType extends ISearchableEntity> = (entity: EntityType) => SearchMapperReturnType;
export type ISearchMappers<Items extends ISearchableEntity> = {
    [Kind in Items["kind"]]: ISearchMapper<Items & { kind: Kind }>;
};

const SEARCH_MAPPERS = {
    disciple: mapDiscipleToMessage,
    weapon: mapWeaponToMessage,
    weaponSkill: mapWeaponSkillToMessage,
    spell: mapSpellToMessage,
} as const satisfies ISearchMappers<TSearchableEntity>;

export default SEARCH_MAPPERS;
