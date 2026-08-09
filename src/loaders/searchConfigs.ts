import { default as disciple } from "../infrastructure/search/configs/disciple.ts";
import { default as music } from "../infrastructure/search/configs/music.ts";
import { default as spell } from "../infrastructure/search/configs/spell.ts";
import { default as weapon } from "../infrastructure/search/configs/weapon.ts";
import { default as weaponSkill } from "../infrastructure/search/configs/weaponSkill.ts";

const SEARCH_CONFIGS = {
    disciple,
    weapon,
    weaponSkill,
    spell,
    music,
} as const;

export default SEARCH_CONFIGS;
