import type { APIEmbed } from "discord.js";
import type { TSearchEntity, TSearchKind } from "../types.ts";
import mapDiscipleToMessage from "./disciple.ts";
import mapSpellToMessage from "./spell.ts";
import mapWeaponToMessage from "./weapon.ts";
import mapWeaponSkillToMessage from "./weaponSkill.ts";

export type TSearchMapperReturnType = Required<Pick<APIEmbed, "title" | "fields">>;
export type ISearchMapper<Kind extends TSearchKind> = (entity: TSearchEntity<Kind>) => TSearchMapperReturnType;
export type ISearchMappers = { [Kind in TSearchKind]: ISearchMapper<Kind> };

const SEARCH_MAPPERS: ISearchMappers = {
    disciple: mapDiscipleToMessage,
    weapon: mapWeaponToMessage,
    weaponSkill: mapWeaponSkillToMessage,
    spell: mapSpellToMessage,
};

export default SEARCH_MAPPERS;
