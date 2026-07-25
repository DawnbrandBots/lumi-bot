import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IMovementType, IWeaponType } from "../types.ts";

export const MovementTypeSchema = defineEntity({
    name: "MovementType",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        distance: p.integer(),
        canTraverseWaterTiles: p.boolean(),
        baseHp: p.integer(),
        baseAtkByRange: p.json<Readonly<Record<IWeaponType["range"], number>>>(),
    },
});

export class MovementType extends MovementTypeSchema.class implements IMovementType {
    get kind() {
        return "movement" as const;
    }
}
MovementTypeSchema.setClass(MovementType);
