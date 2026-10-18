import type { EStat } from "../../../../domain/game/models/stat.types.ts";

export const STAT_DESCRIPTION_STRINGS = {
    HP: "HP",
    MAX_HP: "Max HP",
    ATK: "Atk",
    RECEIVED_WEAPON_DAMAGE: "Received Weapon Damage",
    RECEIVED_SPELL_DAMAGE: "Received Spell Damage",
    MOVEMENT: "Movement",
    COLOR_AFFINITY: "Color Affinity",
    SPELL_COOLDOWN: "Spell Cooldown",
} as const satisfies Record<keyof typeof EStat, string>;
