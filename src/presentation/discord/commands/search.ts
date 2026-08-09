import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import type { TCommandRunHandlers } from "../commands/types.ts";
import type { TSearchFeatureReturn } from "../../../search/types.ts";
import type { MaybePromise } from "../../../utils/types.ts";
import { SEARCH_TERMS_OPTION_NAME } from "./search/constants.ts";
import type { searchCommandCommandRegistrationData } from "../commandRegistrationData/search.ts";
import mapSearchFeatureReturnToMessages from "../mappers/search.ts";

export async function run(
    arg: {
        resolveSearchInput: (input: string) => MaybePromise<TSearchFeatureReturn>;
    },
    interaction: ChatInputCommandInteraction<CacheType>,
) {
    const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME, true);
    const result = await arg.resolveSearchInput(input);
    const { reply, followUps } = mapSearchFeatureReturnToMessages(result);
    await interaction.reply(reply);
    for (const followUp of followUps ?? []) {
        await interaction.followUp(followUp);
    }
}

export function getSearchCommand(arg: { resolveSearchInput: (input: string) => MaybePromise<TSearchFeatureReturn> }) {
    return ((interaction) => run(arg, interaction)) satisfies TCommandRunHandlers<
        typeof searchCommandCommandRegistrationData
    >;
}
