import { describe, expect, test } from "vitest";
import { EListingSide } from "../../../../../src/domain/bazaar/models/listing.types.ts";
import { mapBazaarListResultToMessage } from "../../../../../src/presentation/discord/mappers/bazaar.ts";
import { LISTING, WEAPON_ITEM, WEAPON_REFERENCE } from "../../../application/bazaar/fixtures.ts";

describe(mapBazaarListResultToMessage.name, () => {
    test.each([
        [{ guildId: "guild-1", side: EListingSide.PURCHASE }, "Bazaar purchase listings", undefined],
        [
            { guildId: "guild-1", side: EListingSide.SALE, ownerId: "owner-1" },
            "Bazaar sale listings by Owner One",
            "Owner One",
        ],
        [
            { guildId: "guild-1", side: EListingSide.SALE, item: WEAPON_REFERENCE },
            "Bazaar sale listings for Royal Sword + (ATK)",
            undefined,
        ],
        [
            { guildId: "guild-1", side: EListingSide.SALE, ownerId: "owner-1", item: WEAPON_REFERENCE },
            "Bazaar sale listings by Owner One for Royal Sword + (ATK)",
            "Owner One",
        ],
    ] as const)("formats the title for filter %#", (filter, title, userName) => {
        const message = mapBazaarListResultToMessage({
            listings: [LISTING],
            filter,
            requestedPage: 1,
            showActionRow: true,
            requestedUserName: userName,
        });

        expect(message.embeds[0]?.title).toBe(title);
    });

    test("includes an item in the title when no matching listings are returned", () => {
        const message = mapBazaarListResultToMessage({
            listings: [],
            filter: { guildId: "guild-1", side: EListingSide.SALE, item: WEAPON_REFERENCE },
            requestedPage: 1,
            showActionRow: true,
            requestedItem: WEAPON_ITEM,
        });

        expect(message.embeds[0]?.title).toBe("Bazaar sale listings for Royal Sword + (ATK)");
    });
});
