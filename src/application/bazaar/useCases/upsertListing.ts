import { isBazaarListingPriceNumber, isBazaarListingQuantityNumber } from "../../../domain/bazaar/rules/listing.ts";
import { resolveListableItem } from "./resolveListableItem.ts";
import type { TBazaarUseCaseBase } from "../types.ts";
import { EBazaarResultKind } from "../types.ts";

export const upsertListing: TBazaarUseCaseBase<
    "upsertListing",
    "queries.bazaar.findDiscipleById" | "queries.bazaar.findWeaponById" | "repositories.bazaar.upsertListing"
> = async function (dependencies, arg) {
    if (arg.quantity !== undefined && arg.quantity !== null && !isBazaarListingQuantityNumber(arg.quantity)) {
        return { kind: EBazaarResultKind.INVALID_QUANTITY } as const;
    }
    if (arg.unitPrice !== undefined && arg.unitPrice !== null && !isBazaarListingPriceNumber(arg.unitPrice)) {
        return { kind: EBazaarResultKind.INVALID_PRICE } as const;
    }

    const item = await resolveListableItem(dependencies, arg.item);
    if (!item) {
        return { kind: EBazaarResultKind.INVALID_ITEM } as const;
    }

    const { previous, current } = await dependencies.repositories.bazaar.upsertListing({
        identity: { guildId: arg.guildId, ownerId: arg.ownerId, side: arg.side },
        item,
        ...(arg.quantity === undefined ? {} : { quantity: arg.quantity }),
        ...(arg.unitPrice === undefined ? {} : { unitPrice: arg.unitPrice }),
    });

    if (!previous) {
        return { kind: EBazaarResultKind.LISTING_CREATED, value: { listing: current } } as const;
    }
    if (previous.quantity === current.quantity && previous.unitPrice === current.unitPrice) {
        return { kind: EBazaarResultKind.LISTING_UNCHANGED, value: { listing: current } } as const;
    }
    return { kind: EBazaarResultKind.LISTING_UPDATED, value: { listing: current } } as const;
};
