import type { ChatInputCommandInteraction } from "discord.js";
import { MessageFlags } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { EBazaarResultKind } from "../../../../../../src/application/bazaar/types.ts";
import type { TBazaarUseCases } from "../../../../../../src/application/bazaar/useCases.types.ts";
import { EListingSide } from "../../../../../../src/domain/bazaar/models/listing.types.ts";
import {
    listSaleListings,
    upsertPurchaseListing,
} from "../../../../../../src/presentation/discord/commands/bazaar/handlers.ts";
import {
    BAZAAR_ITEM_OPTION_NAME,
    BAZAAR_PAGE_OPTION_NAME,
    BAZAAR_PRICE_OPTION_NAME,
    BAZAAR_QUANTITY_OPTION_NAME,
} from "../../../../../../src/presentation/discord/commands/bazaar/constants.ts";

function createFixture({
    itemValue = "w:weapon-1:ATK",
    page = null,
    showResponse = false,
}: { readonly itemValue?: string | null; readonly page?: number | null; readonly showResponse?: boolean } = {}) {
    const reply = vi.fn();
    const interaction = {
        guildId: "guild-1",
        inGuild: vi.fn().mockReturnValue(true),
        options: {
            getBoolean: vi.fn().mockReturnValue(showResponse),
            getInteger: vi.fn((name: string) => {
                if (name === BAZAAR_QUANTITY_OPTION_NAME) return 0;
                if (name === BAZAAR_PAGE_OPTION_NAME) return page;
                return null;
            }),
            getString: vi.fn((name: string) => (name === BAZAAR_ITEM_OPTION_NAME ? itemValue : null)),
            getUser: vi.fn().mockReturnValue(null),
        },
        reply,
        user: { id: "owner-1" },
    } as unknown as ChatInputCommandInteraction;
    const upsertListing = vi
        .fn<TBazaarUseCases["upsertListing"]>()
        .mockResolvedValue({ kind: EBazaarResultKind.INVALID_ITEM });
    const deleteListing = vi
        .fn<TBazaarUseCases["deleteListing"]>()
        .mockResolvedValue({ kind: EBazaarResultKind.LISTING_NOT_FOUND });
    const listListings = vi
        .fn<TBazaarUseCases["listListings"]>()
        .mockResolvedValue({ kind: EBazaarResultKind.LISTINGS_LISTED, value: { listings: [] } });
    return {
        dependencies: { useCases: { bazaar: { deleteListing, listListings, upsertListing } } },
        interaction,
        listListings,
        reply,
        upsertListing,
    };
}

describe("Bazaar command handlers", () => {
    test("maps zero to a flexible term and leaves omitted terms unspecified", async () => {
        const fixture = createFixture();

        await upsertPurchaseListing(fixture.dependencies, fixture.interaction);

        expect(fixture.upsertListing).toHaveBeenCalledWith({
            guildId: "guild-1",
            ownerId: "owner-1",
            side: EListingSide.PURCHASE,
            item: { kind: "weapon", weaponId: "weapon-1", variant: "ATK" },
            quantity: null,
        });
        expect(fixture.reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(fixture.interaction.options.getInteger).toHaveBeenCalledWith(BAZAAR_PRICE_OPTION_NAME, false);
    });

    test.each([
        [false, [MessageFlags.Ephemeral]],
        [true, undefined],
    ] as const)("uses requested list visibility when show_response is %s", async (showResponse, flags) => {
        const fixture = createFixture({ itemValue: null, page: 1, showResponse });

        await listSaleListings(fixture.dependencies, fixture.interaction);

        expect(fixture.listListings).toHaveBeenCalledWith({ guildId: "guild-1", side: EListingSide.SALE });
        expect(fixture.interaction.options.getInteger).toHaveBeenCalledWith(BAZAAR_PAGE_OPTION_NAME, false);
        if (flags) {
            expect(fixture.reply).toHaveBeenCalledWith(expect.objectContaining({ flags }));
        } else {
            expect(fixture.reply).not.toHaveBeenCalledWith(
                expect.objectContaining({ flags: [MessageFlags.Ephemeral] }),
            );
        }
    });

    test("does not include page navigation in a public response", async () => {
        const fixture = createFixture({ itemValue: null, page: 1, showResponse: true });

        await listSaleListings(fixture.dependencies, fixture.interaction);

        expect(fixture.reply.mock.calls[0]?.[0]).not.toHaveProperty("components");
    });

    test("reports a page number that does not exist", async () => {
        const fixture = createFixture({ itemValue: null, page: 2 });

        await listSaleListings(fixture.dependencies, fixture.interaction);

        expect(fixture.reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
            }),
        );
    });
});
