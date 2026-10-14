import { defineEntity, p } from "@mikro-orm/sqlite";
import { EUnitSelectorProperty, type TUnitSelector } from "../../../../../domain/game/models/unitSelector.types.ts";
import { MovementType } from "./movementType.ts";
import { UnitSelector } from "./unitSelector.ts";

type TMovementTypeUnitSelector = Extract<TUnitSelector, { property: typeof EUnitSelectorProperty.MOVEMENT_TYPE }>;

export const MovementTypeUnitSelectorSchema = defineEntity({
    name: "MovementTypeUnitSelector",
    embeddable: true,
    extends: UnitSelector,
    discriminatorValue: EUnitSelectorProperty.MOVEMENT_TYPE,
    properties: {
        property: p.enum([EUnitSelectorProperty.MOVEMENT_TYPE]),
        movementType: () => p.manyToOne(MovementType),
    },
});

export class MovementTypeUnitSelector
    extends MovementTypeUnitSelectorSchema.class
    implements TMovementTypeUnitSelector
{
    get value(): TMovementTypeUnitSelector["value"] {
        return this.movementType;
    }
}
MovementTypeUnitSelectorSchema.setClass(MovementTypeUnitSelector);
