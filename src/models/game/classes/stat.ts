import { defineEntity, p } from "@mikro-orm/core";
import type { IStat } from "../types.ts";

export const StatSchema = defineEntity({
    name: "Stat",
    properties: {
        id: p.string().primary(),
        name: p.string(),
    },
});

export class Stat extends StatSchema.class implements IStat {}
StatSchema.setClass(Stat);
