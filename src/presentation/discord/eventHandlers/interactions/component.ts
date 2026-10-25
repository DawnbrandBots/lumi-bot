import type { MessageComponentInteraction } from "discord.js";
import type { PickDeep } from "type-fest";
import type { TApplicationUseCases } from "../../../../application/useCases.types.ts";
import { LFG_JOIN_BUTTON_ID_PREFIX } from "../../commands/lfg/constants.ts";
import { parseBazaarListPageValue } from "../../commands/bazaar/listPageValue.ts";
import { mapBazaarListResultToMessage } from "../../mappers/bazaar.ts";
import { lfgResponder } from "../../responders/lfg.ts";

export type THandleComponentInteraction = (interaction: MessageComponentInteraction) => Promise<void>;

export async function handleComponentInteraction(arg: {
    interaction: MessageComponentInteraction;
    useCases: PickDeep<
        TApplicationUseCases,
        "lfg.movePlayerToRoomById" | "admin.getGuildConfig" | "bazaar.listListings"
    >;
}) {
    if (arg.interaction.isButton() && arg.interaction.inGuild()) {
        const page = parseBazaarListPageValue(arg.interaction.customId, arg.interaction.guildId);
        if (page) {
            const result = await arg.useCases.bazaar.listListings(page.filter);
            await arg.interaction.update(mapBazaarListResultToMessage(result.value.listings, page.filter, page.page));
            return;
        }
    }
    if (
        arg.interaction.isButton() &&
        arg.interaction.customId.startsWith(LFG_JOIN_BUTTON_ID_PREFIX) &&
        arg.interaction.inGuild()
    ) {
        const roomId = arg.interaction.customId.slice(LFG_JOIN_BUTTON_ID_PREFIX.length);
        const result = await arg.useCases.lfg.movePlayerToRoomById({
            guildId: arg.interaction.guildId,
            user: arg.interaction.user,
            roomId,
        });
        const { value: guildConfig } = await arg.useCases.admin.getGuildConfig({ guildId: arg.interaction.guildId });
        await lfgResponder({ guildConfig, interaction: arg.interaction, result });
        return;
    }
    // TODO: this should be reported in another PR
}
