export const EStatChange = {
    INCREASE: "INCREASE",
    DECREASE: "DECREASE",
    LIMIT: "LIMIT",
} as const;

/** For stat spell effects. Eg; INCREASE and DECREASE. */
export interface IStatChange {
    readonly id: keyof typeof EStatChange;
    readonly verb: string;
    readonly preposition: string;
}
