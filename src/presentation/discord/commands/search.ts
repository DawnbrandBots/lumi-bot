import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import mapSearchResultToMessages from "../mappers/search.ts";
import { SEARCH_TERMS_OPTION_NAME } from "./search/constants.ts";
import type { TSearchCommandBase } from "./search/types.ts";

export const search: TSearchCommandBase<"useCases.search.resolveSearchInput"> = async function (
    arg,
    interaction: ChatInputCommandInteraction<CacheType>,
): Promise<void> {
    const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME, true);
    const result = await arg.useCases.search.resolveSearchInput(input);
    const { reply, followUps } = mapSearchResultToMessages(result);
    await interaction.reply(reply);
    for (const followUp of followUps ?? []) {
        await interaction.followUp(followUp);
    }
};
