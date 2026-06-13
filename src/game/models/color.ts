import { defineEntity, p } from "@mikro-orm/sqlite";
import { GAME_DB_SCHEMA } from "../../db/constants.ts";
import type { IColor } from "../types.ts";

export const ColorSchema = defineEntity({
    name: "Color",
    schema: GAME_DB_SCHEMA,
    properties: {
        id: p.string().primary(),
        name: p.string(),
        strongAgainst: () => p.oneToOne(Color).nullable(),
        weakAgainst: () => p.oneToOne(Color).nullable(),
    },
});

export class Color extends ColorSchema.class implements IColor {
    get kind() {
        return "color" as const;
    }
}
ColorSchema.setClass(Color);
