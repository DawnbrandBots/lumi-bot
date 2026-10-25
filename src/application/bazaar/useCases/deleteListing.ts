import type { TBazaarUseCaseBase } from "../types.ts";
import { EBazaarResultKind } from "../types.ts";

export const deleteListing: TBazaarUseCaseBase<"deleteListing", "repositories.bazaar.deleteListing"> = async function (
    dependencies,
    arg,
) {
    const listing = await dependencies.repositories.bazaar.deleteListing(arg);
    if (!listing) {
        return { kind: EBazaarResultKind.LISTING_NOT_FOUND } as const;
    }
    return { kind: EBazaarResultKind.LISTING_DELETED, value: { listing } } as const;
};
