import { defineEntity, p } from "@mikro-orm/core";
import type { ISpellValueEffectivenessItem } from "../types.ts";

export const SpellValueEffectivenessItemSchema = defineEntity({
    name: "SpellValueEffectivenessItem",
    embeddable: true,
    properties: {
        kind: p.string(),
        base: p.integer()
    }
})
export class SpellValueEffectivenessItem extends SpellValueEffectivenessItemSchema.class implements ISpellValueEffectivenessItem { }
SpellValueEffectivenessItemSchema.setClass(SpellValueEffectivenessItem);
