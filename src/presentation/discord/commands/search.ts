import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import mapSearchResultToMessages from "../mappers/search.ts";
import { SHOW_RESPONSE_OPTION_NAME } from "./constants.ts";
import { SEARCH_TERMS_OPTION_NAME } from "./search/constants.ts";
import type { TSearchCommandBase } from "./search/types.ts";

export const search: TSearchCommandBase<"useCases.search.resolveSearchInput"> = async function (
    arg,
    interaction: ChatInputCommandInteraction<CacheType>,
): Promise<void> {
    const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME, true);
    const showResponse = interaction.options.getBoolean(SHOW_RESPONSE_OPTION_NAME, false);
    const result = await arg.useCases.search.resolveSearchInput(input);
    let { reply, followUps }: { reply: InteractionReplyOptions; followUps?: InteractionReplyOptions[] } =
        mapSearchResultToMessages(result);
    if (!showResponse) {
        reply = { ...reply, flags: [reply.flags ?? [], MessageFlags.Ephemeral] };
        followUps = followUps?.map((message) => ({ ...message, flags: [reply.flags ?? [], MessageFlags.Ephemeral] }));
    }
    await interaction.reply(reply);
    for (const followUp of followUps ?? []) {
        await interaction.followUp(followUp);
    }
};
