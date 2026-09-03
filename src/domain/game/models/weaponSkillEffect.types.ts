import type { TId } from "./base.types.ts";

/**
 * Effect that a weapon skill grants.
 *
 * Multiple weapon skills may grant the same effect.
 */
export interface IWeaponSkillEffect {
    readonly kind: "weaponSkillEffect";
    readonly id: TId;
    // TODO: in the future, description's type could be replaced with a more complex type (similar to SpellEffect)
    // that can be used as part of stats and damage computations
    readonly description: string;
}
