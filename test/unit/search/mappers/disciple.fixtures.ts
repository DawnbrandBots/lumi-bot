// Disclaimer: AI-generated test fixtures

import type { IDisciple, IMusic } from "../../../../src/game/types.ts";
import { INFANTRY_MOVEMENT_TYPE, WEAPON_TYPE } from "./common.fixtures.ts";
import { SPELL } from "./spell.fixtures.ts";
import { WEAPON } from "./weapon.fixtures.ts";

export const SHADOW_MUSIC = {
    kind: "music",
    id: "BETRAYAL",
    name: "Betrayal - The Exiled Prince",
    url: "https://example.com/betrayal",
    shadowMusicFor: null,
    shadowResultsScreenMusicFor: null,
} satisfies IMusic;

export const SHADOW_RESULTS_SCREEN_MUSIC = {
    kind: "music",
    id: "VICTORY",
    name: "Victory - The Exiled Prince",
    url: "https://example.com/victory",
    shadowMusicFor: null,
    shadowResultsScreenMusicFor: null,
} satisfies IMusic;

export const DISCIPLE = {
    kind: "disciple",
    id: "KURT",
    name: "Kurt",
    movementType: INFANTRY_MOVEMENT_TYPE,
    weaponType: WEAPON_TYPE,
    prfWeapon: WEAPON,
    shadowMusic: SHADOW_MUSIC,
    shadowResultsScreenMusic: SHADOW_RESULTS_SCREEN_MUSIC,
    spells: [SPELL],
    baseAtk: 42,
    baseHp: 80,
    getAtk({ level }) {
        return Math.floor(this.baseAtk * (1 + 0.1 * (level - 1)));
    },
    getHp({ level }) {
        return Math.floor(this.baseHp * (1 + 0.1 * (level - 1)));
    },
} satisfies IDisciple;
