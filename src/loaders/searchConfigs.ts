import { default as disciple } from "../search/handlers/disciple.ts";
import { default as music } from "../search/handlers/music.ts";
import { default as spell } from "../search/handlers/spell.ts";
import { default as weapon } from "../search/handlers/weapon.ts";
import { default as weaponSkill } from "../search/handlers/weaponSkill.ts";

const SEARCH_CONFIGS = {
    disciple,
    weapon,
    weaponSkill,
    spell,
    music,
} as const;

export default SEARCH_CONFIGS;
