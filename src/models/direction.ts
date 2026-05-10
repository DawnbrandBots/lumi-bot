import { defineEntity, p } from "@mikro-orm/core";
import type { IDirection } from "../types.ts";

export const DirectionSchema = defineEntity({
    name: 'Direction',
    properties: {
        id: p.string().primary(),
        noun: p.string()
    },
})

export class Direction extends DirectionSchema.class implements IDirection {
}
DirectionSchema.setClass(Direction);
