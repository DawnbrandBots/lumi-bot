import type { TBazaarRepository } from "../../../../../application/bazaar/repositories.types.ts";
import { toBazaarListing } from "../../mappers/toBazaarListing.ts";
import { BazaarListing } from "../../models/bazaar/listing.ts";
import { getListableItemKey, type TBazaarRepositoryFunction } from "./types.ts";

export const deleteListing: TBazaarRepositoryFunction<TBazaarRepository["deleteListing"]> = async (
    { em },
    { item, ...identity },
) => {
    const listing = await em.findOne(BazaarListing, { ...identity, itemKey: getListableItemKey(item) });
    if (!listing) {
        return null;
    }
    const deleted = toBazaarListing(listing);
    em.remove(listing);
    return deleted;
};
