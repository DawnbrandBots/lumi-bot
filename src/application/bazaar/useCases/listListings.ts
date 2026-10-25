import type { TBazaarUseCaseBase } from "../types.ts";
import { EBazaarResultKind } from "../types.ts";
import { resolveListableItem } from "./resolveListableItem.ts";

export const listListings: TBazaarUseCaseBase<
    "listListings",
    "queries.bazaar.findDiscipleById" | "queries.bazaar.findWeaponById" | "repositories.bazaar.listListings"
> = async function (dependencies, arg) {
    const [listings, item] = await Promise.all([
        dependencies.repositories.bazaar.listListings(arg),
        arg.item ? resolveListableItem(dependencies, arg.item) : undefined,
    ]);
    return {
        kind: EBazaarResultKind.LISTINGS_LISTED,
        value: {
            listings: listings.toSorted(
                (a, b) =>
                    b.updatedAt.getTime() - a.updatedAt.getTime() || b.createdAt.getTime() - a.createdAt.getTime(),
            ),
            ...(item ? { item } : {}),
        },
    } as const;
};
