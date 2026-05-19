import { default as disciple } from "../search/handlers/disciple.ts";
import { default as spell } from "../search/handlers/spell.ts";
import { default as weapon } from "../search/handlers/weapon.ts";
import { default as weaponSkill } from "../search/handlers/weaponSkill.ts";

const SEARCH_HANDLERS = {
    disciple,
    weapon,
    weaponSkill,
    spell,
} as const;

export default SEARCH_HANDLERS;
