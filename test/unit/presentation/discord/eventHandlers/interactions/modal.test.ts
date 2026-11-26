import type { ModalSubmitInteraction } from "discord.js";
import { MessageFlags } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { EBazaarResultKind } from "../../../../../../src/application/bazaar/types.ts";
import { EListingSide } from "../../../../../../src/domain/bazaar/models/listing.types.ts";
import { BAZAAR_PAGE_INPUT_ID } from "../../../../../../src/presentation/discord/commands/bazaar/constants.ts";
import { formatBazaarPageModalValue } from "../../../../../../src/presentation/discord/commands/bazaar/listPageValue.ts";
import { handleModalSubmitInteraction } from "../../../../../../src/presentation/discord/eventHandlers/interactions/modal.ts";
import { LISTING } from "../../../../application/bazaar/fixtures.ts";

const FILTER = { guildId: "guild-1", side: EListingSide.SALE } as const;

function createFixture(pageInput: string, listingCount = 0) {
    const reply = vi.fn();
    const update = vi.fn();
    const getTextInputValue = vi.fn().mockReturnValue(pageInput);
    const listListings = vi.fn().mockResolvedValue({
        kind: EBazaarResultKind.LISTINGS_LISTED,
        value: { listings: Array.from({ length: listingCount }, () => LISTING) },
    });
    const interaction = {
        customId: formatBazaarPageModalValue({ filter: FILTER, page: 1 }),
        fields: { getTextInputValue },
        guildId: FILTER.guildId,
        inGuild: vi.fn().mockReturnValue(true),
        isFromMessage: vi.fn().mockReturnValue(true),
        reply,
        update,
    } as unknown as ModalSubmitInteraction;
    return { getTextInputValue, interaction, listListings, reply, update, useCases: { bazaar: { listListings } } };
}

describe(handleModalSubmitInteraction.name, () => {
    test("updates the originating message for a valid page", async () => {
        const fixture = createFixture("2", 11);

        await handleModalSubmitInteraction({ interaction: fixture.interaction, useCases: fixture.useCases });

        expect(fixture.getTextInputValue).toHaveBeenCalledWith(BAZAAR_PAGE_INPUT_ID);
        expect(fixture.listListings).toHaveBeenCalledWith(FILTER);
        expect(fixture.update).toHaveBeenCalled();
        expect(fixture.reply).not.toHaveBeenCalled();
    });

    test("reports a page that does not exist", async () => {
        const fixture = createFixture("2");

        await handleModalSubmitInteraction({ interaction: fixture.interaction, useCases: fixture.useCases });

        expect(fixture.reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(fixture.update).not.toHaveBeenCalled();
    });
});
