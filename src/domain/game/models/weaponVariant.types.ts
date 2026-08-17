export const EWeaponVariant = {
    HP: "HP",
    NEUTRAL: "NEUTRAL",
    ATK: "ATK",
} as const;

/** Stat modifier possessed by every weapon (except at level 1) that cannot be changed. */
export interface IWeaponVariant {
    readonly kind: keyof typeof EWeaponVariant;
    readonly hp: number;
    readonly atk: number;
}
