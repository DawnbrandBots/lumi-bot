import type { TId } from "./base.types.ts";
import type { IWeaponType } from "./weaponType.types.ts";

/**
 * A unit has a movement type which influences its stats and how it walks on the grid.
 */
export interface IMovementType {
    readonly kind: "movement";
    readonly id: TId;
    readonly name: string;
    /**
     * Maximum number of walked tiles per turn.
     */
    readonly distance: number;
    readonly canTraverseWaterTiles: boolean;
    readonly baseHp: number;
    readonly baseAtkByRange: Readonly<Record<IWeaponType["range"], number>>;
}
