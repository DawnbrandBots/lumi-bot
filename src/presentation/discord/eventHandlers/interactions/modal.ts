import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import type { PickDeep } from "type-fest";
import type { TApplicationUseCases } from "../../../../application/useCases.types.ts";
import { BAZAAR_PAGE_INPUT_ID } from "../../commands/bazaar/constants.ts";
import { parseBazaarPageModalValue } from "../../commands/bazaar/listPageValue.ts";
import { isBazaarListPageInRange, mapBazaarListResultToMessage } from "../../mappers/bazaar.ts";

export type THandleModalSubmitInteraction = (interaction: ModalSubmitInteraction) => Promise<void>;

export async function handleModalSubmitInteraction(arg: {
    interaction: ModalSubmitInteraction;
    useCases: PickDeep<TApplicationUseCases, "bazaar.listListings">;
}): Promise<void> {
    if (!arg.interaction.inGuild()) {
        return;
    }
    const pageState = parseBazaarPageModalValue(arg.interaction.customId, arg.interaction.guildId);
    if (!pageState) {
        return;
    }
    const page = Number(arg.interaction.fields.getTextInputValue(BAZAAR_PAGE_INPUT_ID));
    const result = await arg.useCases.bazaar.listListings(pageState.filter);
    const message = mapBazaarListResultToMessage(result.value.listings, pageState.filter, page, false);
    if (!isBazaarListPageInRange(result.value.listings.length, page)) {
        await arg.interaction.reply({ ...message, flags: [MessageFlags.Ephemeral] });
        return;
    }
    if (arg.interaction.isFromMessage()) {
        await arg.interaction.update(message);
    } else {
        await arg.interaction.reply({ ...message, flags: [MessageFlags.Ephemeral] });
    }
}
