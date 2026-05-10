import { defineEntity, p } from "@mikro-orm/core";
import type { IStatChange } from "../types.ts";

export const StatChangeSchema = defineEntity({
    name: 'StatChange',
    properties: {
        id: p.string().primary(),
        verb: p.string()
    },
})

export class StatChange extends StatChangeSchema.class implements IStatChange {
}
StatChangeSchema.setClass(StatChange);
