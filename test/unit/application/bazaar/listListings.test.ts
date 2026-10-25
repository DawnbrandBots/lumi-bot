import { describe, expect, test } from "vitest";
import { listListings } from "../../../../src/application/bazaar/useCases/listListings.ts";
import { EBazaarResultKind } from "../../../../src/application/bazaar/types.ts";
import { EListingSide } from "../../../../src/domain/bazaar/models/listing.types.ts";
import { GUILD_ID, getBazaarDependencies, LISTING, OWNER_ID, WEAPON_ITEM, WEAPON_REFERENCE } from "./fixtures.ts";

describe(listListings.name, () => {
    test("passes filters and orders listings by most recent change", async () => {
        const oldest = LISTING;
        const newest = {
            ...LISTING,
            ownerId: "owner-2",
            updatedAt: new Date("2026-10-03T10:00:00.000Z"),
        };
        const middle = {
            ...LISTING,
            ownerId: "owner-3",
            createdAt: new Date("2026-10-02T10:00:00.000Z"),
            updatedAt: new Date("2026-10-02T10:00:00.000Z"),
        };
        const { dependencies, listListings: listListingsRepository } = getBazaarDependencies({
            listListingsResult: [oldest, newest, middle],
        });
        const arg = {
            guildId: GUILD_ID,
            side: EListingSide.SALE,
            ownerId: OWNER_ID,
            item: WEAPON_REFERENCE,
        } as const;

        const result = await listListings(dependencies, arg);

        expect(listListingsRepository).toHaveBeenCalledWith(arg);
        expect(result).toEqual({
            kind: EBazaarResultKind.LISTINGS_LISTED,
            value: { item: WEAPON_ITEM, listings: [newest, middle, oldest] },
        });
    });
});
