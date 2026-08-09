export const EStat = {
    HP: "HP",
    ATK: "ATK",
    RECEIVED_WEAPON_DAMAGE: "RECEIVED_WEAPON_DAMAGE",
    RECEIVED_SPELL_DAMAGE: "RECEIVED_SPELL_DAMAGE",
    MOVEMENT: "MOVEMENT",
    COLOR_AFFINITY: "COLOR_AFFINITY",
    COOLDOWN: "COOLDOWN",
} as const;

/**
 * Describes a unit's stat. Eg. Atk, HP, Movement...
 */
export interface IStat {
    readonly id: keyof typeof EStat;
    readonly name: string;
}
