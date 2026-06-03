import { defineEntity, p } from "@mikro-orm/sqlite";
import { GameMapMinionLocation } from "./gameMapMinionLocation.ts";
import { GameMapMinionProperties } from "./gameMapMinionProperties.ts";

export const GameMapMinionSchema = defineEntity({
    name: "GameMapMinion",
    embeddable: true,
    properties: {
        name: p.string(),
        location: () => p.embedded(GameMapMinionLocation),
        properties: () => p.embedded(GameMapMinionProperties),
    },
});
export class GameMapMinion extends GameMapMinionSchema.class { }
GameMapMinionSchema.setClass(GameMapMinion);
