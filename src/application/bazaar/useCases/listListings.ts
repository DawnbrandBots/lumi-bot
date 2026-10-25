import type { TBazaarUseCaseBase } from "../types.ts";
import { EBazaarResultKind } from "../types.ts";

export const listListings: TBazaarUseCaseBase<"listListings", "repositories.bazaar.listListings"> = async function (
    dependencies,
    arg,
) {
    const listings = await dependencies.repositories.bazaar.listListings(arg);
    return {
        kind: EBazaarResultKind.LISTINGS_LISTED,
        value: {
            listings: listings.toSorted(
                (a, b) =>
                    b.updatedAt.getTime() - a.updatedAt.getTime() || b.createdAt.getTime() - a.createdAt.getTime(),
            ),
        },
    } as const;
};
