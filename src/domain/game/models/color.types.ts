import type { TId } from "./base.types.ts";

/**
 * Spells and weapon types have a color which influences damage calculations.
 *
 * Typically in Fire Emblem: Red > Green > Blue > Red.
 */
export interface IColor {
    readonly kind: "color";
    readonly id: TId;
    readonly name: string;
    /**
     * Color against which this one deals more damage.
     */
    readonly strongAgainst: IColor | null | undefined;
    /**
     * Color against which this one deals less damage.
     */
    readonly weakAgainst: IColor | null | undefined;
}
