export const EStat = {
    HP: "HP",
    // TODO: does MAX_HP really belong here?
    MAX_HP: "MAX_HP",
    ATK: "ATK",
    RECEIVED_WEAPON_DAMAGE: "RECEIVED_WEAPON_DAMAGE",
    RECEIVED_SPELL_DAMAGE: "RECEIVED_SPELL_DAMAGE",
    MOVEMENT: "MOVEMENT",
    COLOR_AFFINITY: "COLOR_AFFINITY",
    SPELL_COOLDOWN: "SPELL_COOLDOWN",
} as const;

/** Describes a unit's stat. Eg. Atk, HP, Movement... */
export interface IStat {
    readonly id: keyof typeof EStat;
    readonly name: string;
}
