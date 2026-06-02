import { defineEntity, p } from "@mikro-orm/sqlite";

export const GameMapMinionLocationSchema = defineEntity({
    name: "GameMapMinionLocation",
    embeddable: true,
    properties: {
        row: p.integer(),
        column: p.integer(),
    },
});
export class GameMapMinionLocation extends GameMapMinionLocationSchema.class { }
GameMapMinionLocationSchema.setClass(GameMapMinionLocation);
