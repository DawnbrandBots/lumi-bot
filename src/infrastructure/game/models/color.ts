import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IColor } from "../../../game/types.ts";

export const ColorSchema = defineEntity({
    name: "Color",
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
