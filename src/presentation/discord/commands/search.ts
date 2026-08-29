import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import type { searchCommandCommandRegistrationData } from "../commandRegistrationData/search.ts";
import type { TCommandRunHandlers } from "../commands/types.ts";
import mapSearchResultToMessages from "../mappers/search.ts";
import { SEARCH_TERMS_OPTION_NAME } from "./search/constants.ts";
import type { TSearchCommandArgs, TSearchCommandBase } from "./search/types.ts";

export const run: TSearchCommandBase<"useCases.search.resolveSearchInput"> = async function (
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

export function getSearchCommand(arg: TSearchCommandArgs) {
    return ((interaction) => run(arg, interaction)) satisfies TCommandRunHandlers<
        typeof searchCommandCommandRegistrationData
    >;
}
