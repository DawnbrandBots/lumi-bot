import type { IListing } from "../../../../domain/bazaar/models/listing.types.ts";
import type { BazaarListing } from "../models/bazaar/listing.ts";

export function toBazaarListing(listing: BazaarListing): IListing {
    return {
        guildId: listing.guildId,
        ownerId: listing.ownerId,
        side: listing.side,
        item: listing.item,
        quantity: listing.quantity ?? null,
        unitPrice: listing.unitPrice ?? null,
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt),
    };
}
