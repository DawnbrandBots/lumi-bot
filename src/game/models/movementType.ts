import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IMovementType } from "../types.ts";

export const MovementTypeSchema = defineEntity({
    name: "MovementType",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        distance: p.integer(),
        canTraverseWaterTiles: p.boolean(),
        discipleBaseHpModifier: p.integer(),
        discipleBaseAtkModifier: p.integer(),
    },
});

export class MovementType extends MovementTypeSchema.class implements IMovementType {
    get kind() {
        return "movement" as const;
    }
}
MovementTypeSchema.setClass(MovementType);
