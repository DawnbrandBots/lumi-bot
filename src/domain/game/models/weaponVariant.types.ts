export const EWeaponVariant = {
    HP: "HP",
    NEUTRAL: "NEUTRAL",
    ATK: "ATK",
} as const;

/** Stat modifier possessed by every weapon (except at level 1) that cannot be changed. */
export interface IWeaponVariant {
    readonly kind: "HP" | "NEUTRAL" | "ATK";
    readonly hp: number;
    readonly atk: number;
}
