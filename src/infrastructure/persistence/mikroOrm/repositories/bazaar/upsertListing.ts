import { randomUUID } from "node:crypto";
import type { TBazaarRepository } from "../../../../../application/bazaar/repositories.types.ts";
import { toBazaarListing } from "../../mappers/toBazaarListing.ts";
import { BazaarListing } from "../../models/bazaar/listing.ts";
import { getListableItemKey, type TBazaarRepositoryFunction } from "./types.ts";

export const upsertListing: TBazaarRepositoryFunction<TBazaarRepository["upsertListing"]> = async (
    { em },
    { identity, item, quantity, unitPrice },
) => {
    const itemKey = getListableItemKey(item);
    const listing = await em.findOne(BazaarListing, { ...identity, itemKey });

    if (!listing) {
        const now = new Date().toISOString();
        const created = em.create(BazaarListing, {
            id: randomUUID(),
            ...identity,
            itemKey,
            item,
            quantity: quantity ?? null,
            unitPrice: unitPrice ?? null,
            createdAt: now,
            updatedAt: now,
        });
        return { previous: null, current: toBazaarListing(created) };
    }

    const previous = toBazaarListing(listing);
    const nextQuantity = quantity === undefined ? listing.quantity : quantity;
    const nextUnitPrice = unitPrice === undefined ? listing.unitPrice : unitPrice;
    if (nextQuantity !== listing.quantity || nextUnitPrice !== listing.unitPrice) {
        listing.quantity = nextQuantity;
        listing.unitPrice = nextUnitPrice;
        listing.updatedAt = new Date().toISOString();
    }
    return { previous, current: toBazaarListing(listing) };
};
