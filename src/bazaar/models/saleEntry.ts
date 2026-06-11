import { defineEntity, p } from "@mikro-orm/sqlite";
import type { TBazaarWeaponVariant } from "../types.ts";

export const BazaarSaleEntrySchema = defineEntity({
    name: "BazaarSaleEntry",
    properties: {
        id: p.string().primary(),
        sellerId: p.string(),
        weaponId: p.string(),
        variant: p.string().$type<TBazaarWeaponVariant>(),
        quantity: p.integer(),
        price: p.integer().nullable().default(null),
        createdAt: p.date().onCreate(() => new Date().toISOString()),
        updatedAt: p
            .date()
            .onCreate(() => new Date().toISOString())
            .onUpdate(() => new Date().toISOString()),
    },
    indexes: [{ properties: ["sellerId", "weaponId", "variant"], options: { unique: true } }],
});

export class BazaarSaleEntry extends BazaarSaleEntrySchema.class {}
BazaarSaleEntrySchema.setClass(BazaarSaleEntry);
