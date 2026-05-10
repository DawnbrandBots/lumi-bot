import { defineEntity, p } from "@mikro-orm/core";
import type { IColor } from "../types.ts";

export const ColorSchema = defineEntity({
    name: 'Color',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        strongAgainst: () => p.oneToOne(Color).nullable(),
        weakAgainst: () => p.oneToOne(Color).nullable()
    },
})

export class Color extends ColorSchema.class implements IColor {
    get kind() { return "color" as const }

}
ColorSchema.setClass(Color);
