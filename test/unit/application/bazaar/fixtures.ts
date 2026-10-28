import { vi } from "vitest";
import type { TBazaarQueries } from "../../../../src/application/bazaar/queries.types.ts";
import type { TBazaarRepository } from "../../../../src/application/bazaar/repositories.types.ts";
import type { TBazaarDependencies, TListableItemReference } from "../../../../src/application/bazaar/types.ts";
import type { IWeaponListableItem } from "../../../../src/domain/bazaar/models/listableItem.types.ts";
import { EListingSide, type IListing } from "../../../../src/domain/bazaar/models/listing.types.ts";
import { EWeaponVariant } from "../../../../src/domain/game/models/weaponVariant.types.ts";

export const GUILD_ID = "guild-1";
export const OWNER_ID = "owner-1";
export const WEAPON_ID = "weapon-1";
export const DISCIPLE_ID = "disciple-1";

export const WEAPON_REFERENCE = {
    kind: "weapon",
    weaponId: WEAPON_ID,
    variant: EWeaponVariant.ATK,
} as const satisfies TListableItemReference;

export const SOUL_REFERENCE = {
    kind: "soul",
    discipleId: DISCIPLE_ID,
} as const satisfies TListableItemReference;

export const WEAPON = { id: WEAPON_ID, name: "Royal Sword +", level: 8 } as const;
export const DISCIPLE = {
    id: DISCIPLE_ID,
    name: "Lyn",
    isBattlePassDisciple: true,
} as const;

export const WEAPON_ITEM = {
    kind: "weapon",
    weapon: { id: WEAPON.id, name: WEAPON.name },
    variant: WEAPON_REFERENCE.variant,
} as const satisfies IWeaponListableItem;

export const LISTING = {
    guildId: GUILD_ID,
    ownerId: OWNER_ID,
    side: EListingSide.SALE,
    item: WEAPON_ITEM,
    quantity: 2,
    unitPrice: 10_000,
    createdAt: new Date("2026-10-01T10:00:00.000Z"),
    updatedAt: new Date("2026-10-01T10:00:00.000Z"),
} satisfies IListing;

export function getBazaarDependencies({
    findDiscipleByIdResult = DISCIPLE,
    findWeaponByIdResult = WEAPON,
    upsertListingResult = { previous: null, current: LISTING },
    deleteListingResult = LISTING,
    listListingsResult = [],
}: {
    readonly findDiscipleByIdResult?: Awaited<ReturnType<TBazaarQueries["findDiscipleById"]>>;
    readonly findWeaponByIdResult?: Awaited<ReturnType<TBazaarQueries["findWeaponById"]>>;
    readonly upsertListingResult?: Awaited<ReturnType<TBazaarRepository["upsertListing"]>>;
    readonly deleteListingResult?: Awaited<ReturnType<TBazaarRepository["deleteListing"]>>;
    readonly listListingsResult?: Awaited<ReturnType<TBazaarRepository["listListings"]>>;
} = {}) {
    const findDiscipleById = vi.fn<TBazaarQueries["findDiscipleById"]>().mockResolvedValue(findDiscipleByIdResult);
    const findWeaponById = vi.fn<TBazaarQueries["findWeaponById"]>().mockResolvedValue(findWeaponByIdResult);
    const upsertListing = vi.fn<TBazaarRepository["upsertListing"]>().mockResolvedValue(upsertListingResult);
    const deleteListing = vi.fn<TBazaarRepository["deleteListing"]>().mockResolvedValue(deleteListingResult);
    const listListings = vi.fn<TBazaarRepository["listListings"]>().mockResolvedValue(listListingsResult);

    const dependencies = {
        queries: { bazaar: { findDiscipleById, findWeaponById } },
        repositories: { bazaar: { upsertListing, deleteListing, listListings } },
    } satisfies TBazaarDependencies;

    return {
        dependencies,
        deleteListing,
        findDiscipleById,
        findWeaponById,
        listListings,
        upsertListing,
    };
}
