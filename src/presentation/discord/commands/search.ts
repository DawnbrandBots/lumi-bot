import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import type { TSearchResult } from "../../../application/search/types.ts";
import type { MaybePromise } from "../../../utils/types.ts";
import type { searchCommandCommandRegistrationData } from "../commandRegistrationData/search.ts";
import type { TCommandRunHandlers } from "../commands/types.ts";
import mapSearchResultToMessages from "../mappers/search.ts";
import { SEARCH_TERMS_OPTION_NAME } from "./search/constants.ts";

export async function run(
    arg: {
        resolveSearchInput: (input: string) => MaybePromise<TSearchResult>;
    },
    interaction: ChatInputCommandInteraction<CacheType>,
) {
    const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME, true);
    const result = await arg.resolveSearchInput(input);
    const { reply, followUps } = mapSearchResultToMessages(result);
    await interaction.reply(reply);
    for (const followUp of followUps ?? []) {
        await interaction.followUp(followUp);
    }
}

export function getSearchCommand(arg: { resolveSearchInput: (input: string) => MaybePromise<TSearchResult> }) {
    return ((interaction) => run(arg, interaction)) satisfies TCommandRunHandlers<
        typeof searchCommandCommandRegistrationData
    >;
}
