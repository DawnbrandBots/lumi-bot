import type { TListableItem } from "../../../domain/bazaar/models/listableItem.types.ts";
import { isDiscipleWithListableSoul, isListableWeaponLevel } from "../../../domain/bazaar/rules/listableItem.ts";
import { isBazaarListingPriceNumber, isBazaarListingQuantityNumber } from "../../../domain/bazaar/rules/listing.ts";
import type { TBazaarDependencies, TBazaarUseCaseBase, TListableItemReference } from "../types.ts";
import { EBazaarResultKind } from "../types.ts";

async function resolveListableItem(
    dependencies: Pick<TBazaarDependencies, "queries">,
    reference: TListableItemReference,
): Promise<TListableItem | null> {
    switch (reference.kind) {
        case "weapon": {
            const weapon = await dependencies.queries.bazaar.findWeaponById({ weaponId: reference.weaponId });
            return weapon && isListableWeaponLevel(weapon.level)
                ? { kind: "weapon", weapon: { id: weapon.id, name: weapon.name }, variant: reference.variant }
                : null;
        }
        case "soul": {
            const disciple = await dependencies.queries.bazaar.findDiscipleById({ discipleId: reference.discipleId });
            return disciple && isDiscipleWithListableSoul(disciple)
                ? { kind: "soul", disciple: { id: disciple.id, name: disciple.name } }
                : null;
        }
    }
}

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
