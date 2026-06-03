import { defineEntity, p } from "@mikro-orm/sqlite";
import { GameMapMinion } from "./gameMapMinion.ts";

export const GameMapSchema = defineEntity({
    name: "GameMap",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        tiles: p.string().length(25),
        minions: () => p.embedded(GameMapMinion).array(),
    },
});
export class GameMap extends GameMapSchema.class {
    public get kind() {
        return "map" as const;
    }
}
GameMapSchema.setClass(GameMap);
