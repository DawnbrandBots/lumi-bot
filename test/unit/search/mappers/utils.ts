// Disclaimer: AI-generated test fixtures

import {
    ESpellDraggingMode,
    ESpellEffectKind,
    ESpellEffectTarget,
    ESpellEffectValueUnitKind,
    ESpellRole,
    type IColor,
    type IDisciple,
    type IMovementType,
    type IMusic,
    type ISpell,
    type ISpellDraggingMode,
    type ISpellRole,
    type ISpellShape,
    type IWeapon,
    type IWeaponSkill,
    type IWeaponSkillEffect,
    type IWeaponType,
    type IWeaponTypeWeaponSkill,
} from "../../../../src/game/types.ts";

export const RED_COLOR = {
    kind: "color",
    id: "RED",
    name: "Red",
    strongAgainst: null,
    weakAgainst: null,
} satisfies IColor;

export const INFANTRY_MOVEMENT_TYPE = {
    kind: "movement",
    id: "INFANTRY",
    name: "Infantry",
    distance: 2,
    canTraverseWaterTiles: false,
    baseHp: 80,
    baseAtkByRange: {
        1: 42,
        2: 28,
    },
} satisfies IMovementType;

export const WEAPON_SKILL_EFFECT = {
    kind: "weaponSkillEffect",
    id: "ARMOR_BANE_EFFECT",
    description: "Deals more damage to Armored units.",
} satisfies IWeaponSkillEffect;

export const WEAPON_TYPE = {
    kind: "weaponType",
    id: "SWORD",
    name: "Sword",
    color: RED_COLOR,
    range: 1,
    weaponSkills: [],
} satisfies IWeaponType;

export const WEAPON_TYPE_SKILL = {
    kind: "weaponSkill",
    id: "ARMOR_BANE_1",
    name: "Armor Bane 1",
    effect: WEAPON_SKILL_EFFECT,
    description: WEAPON_SKILL_EFFECT.description,
    uniqueSkillWeapons: [],
    weaponTypeWeaponSkills: [],
} satisfies IWeaponSkill;

export const UNIQUE_WEAPON_SKILL = {
    kind: "weaponSkill",
    id: "ROYAL_FOCUS",
    name: "Royal Focus",
    effect: {
        kind: "weaponSkillEffect",
        id: "ROYAL_FOCUS_EFFECT",
        description: "Increases damage dealt by this weapon.",
    },
    description: "Increases damage dealt by this weapon.",
    uniqueSkillWeapons: [],
    weaponTypeWeaponSkills: [],
} satisfies IWeaponSkill;

export const WEAPON = {
    kind: "weapon",
    id: "ROYAL_SWORD",
    name: "Royal Sword",
    weaponType: WEAPON_TYPE,
    level: 6,
    hp: 12,
    atk: 34,
    weaponTypeSkill: WEAPON_TYPE_SKILL,
    uniqueSkill: UNIQUE_WEAPON_SKILL,
    freeSkillSlots: 2,
    prfDisciple: null,
    getWeaponVariantStat({ stat, variant }) {
        const bonuses = {
            HP: { hp: 22, atk: 34 },
            NEUTRAL: { hp: 17, atk: 44 },
            ATK: { hp: 12, atk: 54 },
        };
        return bonuses[variant][stat];
    },
} satisfies IWeapon;

export const SPELL_ROLE = {
    kind: ESpellRole.EX,
    name: "EX",
} satisfies ISpellRole;

export const SPELL_SHAPE = {
    id: "SINGLE_TILE",
    name: "single tile",
    tiles: "............X............",
    isAoe: false,
} satisfies ISpellShape;

export const SPELL_DRAGGING_MODE = {
    kind: ESpellDraggingMode.ANY,
    asString: "target tile",
} satisfies ISpellDraggingMode;

export const SPELL = {
    kind: "spell",
    id: "ELFIRE",
    name: "Elfire",
    disciple: null,
    role: SPELL_ROLE,
    uses: null,
    countdown: null,
    cooldown: 5,
    effects: [
        {
            kind: ESpellEffectKind.DAMAGE,
            amount: {
                base: 60,
                scalesWithLevel: true,
                unit: {
                    kind: ESpellEffectValueUnitKind.FIXED,
                },
            },
            color: RED_COLOR,
            target: {
                kind: ESpellEffectTarget.ANY,
                asString: "targets",
            },
        },
    ],
    shape: SPELL_SHAPE,
    onlyFor: null,
    draggingMode: SPELL_DRAGGING_MODE,
} satisfies ISpell;

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

export const MUSIC = {
    kind: "music",
    id: "SHADOW_THEME",
    name: "Shadow Theme",
    url: "https://example.com/shadow-theme",
    shadowMusicFor: [DISCIPLE],
    shadowResultsScreenMusicFor: [],
} satisfies IMusic;

export const WEAPON_TYPE_WEAPON_SKILL = {
    kind: "weaponTypeWeaponSkill",
    weaponType: WEAPON_TYPE,
    weaponSkill: WEAPON_TYPE_SKILL,
    rank: 2,
} satisfies IWeaponTypeWeaponSkill;

export const WEAPON_SKILL = {
    kind: "weaponSkill",
    id: "ARMOR_BANE_2",
    name: "Armor Bane 2",
    effect: WEAPON_SKILL_EFFECT,
    description: WEAPON_SKILL_EFFECT.description,
    uniqueSkillWeapons: [WEAPON],
    weaponTypeWeaponSkills: [WEAPON_TYPE_WEAPON_SKILL],
} satisfies IWeaponSkill;
