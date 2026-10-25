import type { FilterQuery } from "@mikro-orm/sqlite";
import type { TBazaarRepository } from "../../../../../application/bazaar/repositories.types.ts";
import { toBazaarListing } from "../../mappers/toBazaarListing.ts";
import { BazaarListing } from "../../models/bazaar/listing.ts";
import { getListableItemKey, type TBazaarRepositoryFunction } from "./types.ts";

export const listListings: TBazaarRepositoryFunction<TBazaarRepository["listListings"]> = async (
    { em },
    { item, ...filter },
) => {
    const where: FilterQuery<BazaarListing> = {
        ...filter,
        ...(item ? { itemKey: getListableItemKey(item) } : {}),
    };
    const listings = await em.find(BazaarListing, where);
    return listings.map(toBazaarListing);
};
