import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISupport } from "../../../../../domain/game/models/support.types.ts";
import { Disciple } from "./disciple.ts";

export const SupportSchema = defineEntity({
    name: "Support",
    properties: {
        discipleOne: () => p.manyToOne(Disciple).primary(),
        discipleTwo: () => p.manyToOne(Disciple).primary(),
    },
});

export class Support extends SupportSchema.class implements ISupport {}
SupportSchema.setClass(Support);
