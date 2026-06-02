import { defineEntity, p } from "@mikro-orm/sqlite";
import { MovementType } from "./movementType.ts";
import { WeaponType } from "./weaponType.ts";

export const GameMapMinionPropertiesSchema = defineEntity({
    name: "GameMapMinionProperties",
    embeddable: true,
    properties: {
        size: p.enum(["SMALL", "MEDIUM", "LARGE"]),
        movementType: () => p.manyToOne(MovementType),
        weaponType: () => p.manyToOne(WeaponType),
    },
});
export class GameMapMinionProperties extends GameMapMinionPropertiesSchema.class { }
GameMapMinionPropertiesSchema.setClass(GameMapMinionProperties);
