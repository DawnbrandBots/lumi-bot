import { default as disciple } from "./configs/disciple.ts";
import { default as music } from "./configs/music.ts";
import { default as spell } from "./configs/spell.ts";
import { default as weapon } from "./configs/weapon.ts";
import { default as weaponSkill } from "./configs/weaponSkill.ts";

const SEARCH_CONFIGS = {
    disciple,
    weapon,
    weaponSkill,
    spell,
    music,
} as const;

export default SEARCH_CONFIGS;
