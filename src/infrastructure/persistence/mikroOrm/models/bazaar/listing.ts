import { defineEntity, p } from "@mikro-orm/sqlite";
import type { TListableItem } from "../../../../../domain/bazaar/models/listableItem.types.ts";
import { EListingSide } from "../../../../../domain/bazaar/models/listing.types.ts";

export const BazaarListingSchema = defineEntity({
    name: "BazaarListing",
    uniques: [{ properties: ["guildId", "ownerId", "side", "itemKey"] }],
    properties: {
        id: p.string().primary(),
        guildId: p.string(),
        ownerId: p.string(),
        side: p.enum(() => EListingSide),
        itemKey: p.string(),
        item: p.json<TListableItem>(),
        quantity: p.integer().nullable().default(null),
        unitPrice: p.integer().nullable().default(null),
        createdAt: p.date(),
        updatedAt: p.date(),
    },
});

export class BazaarListing extends BazaarListingSchema.class {}
BazaarListingSchema.setClass(BazaarListing);
