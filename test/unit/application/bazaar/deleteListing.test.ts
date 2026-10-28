import { describe, expect, test } from "vitest";
import { deleteListing } from "../../../../src/application/bazaar/useCases/deleteListing.ts";
import { EBazaarResultKind } from "../../../../src/application/bazaar/types.ts";
import { EListingSide } from "../../../../src/domain/bazaar/models/listing.types.ts";
import { GUILD_ID, getBazaarDependencies, LISTING, OWNER_ID, WEAPON_REFERENCE } from "./fixtures.ts";

const ARG = {
    guildId: GUILD_ID,
    ownerId: OWNER_ID,
    side: EListingSide.SALE,
    item: WEAPON_REFERENCE,
} as const;

describe(deleteListing.name, () => {
    test.each([
        [LISTING, { kind: EBazaarResultKind.LISTING_DELETED, value: { listing: LISTING } }],
        [null, { kind: EBazaarResultKind.LISTING_NOT_FOUND }],
    ] as const)("maps repository result %#", async (deleteListingResult, expected) => {
        const { dependencies, deleteListing: deleteListingRepository } = getBazaarDependencies({
            deleteListingResult,
        });

        const result = await deleteListing(dependencies, ARG);

        expect(deleteListingRepository).toHaveBeenCalledWith(ARG);
        expect(result).toEqual(expected);
    });
});
