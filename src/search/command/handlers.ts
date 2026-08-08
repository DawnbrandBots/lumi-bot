import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import type { TCommandHandlers } from "../../bot/commands/types.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../../bot/constants.ts";
import type { MaybePromise } from "../../utils/types.ts";
import { SEARCH_AUTOCOMPLETE_RESULTS_LIMIT } from "../constants.ts";
import type { TSearch } from "../feature.types.ts";
import mapSearchFeatureReturnToMessages from "../mapper.ts";
import type { TSearchFeatureReturn } from "../types.ts";
import type { searchCommandApiInfo } from "./apiInfo.ts";

export async function run(
    arg: {
        searchAndGetBestMatchData: (input: string) => MaybePromise<TSearchFeatureReturn>;
    },
    interaction: ChatInputCommandInteraction<CacheType>,
) {
    const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME, true);
    const result = await arg.searchAndGetBestMatchData(input);
    const { reply, followUps } = mapSearchFeatureReturnToMessages(result);
    await interaction.reply(reply);
    for (const followUp of followUps ?? []) {
        await interaction.followUp(followUp);
    }
}

export function getSearchCommand(arg: {
    searchAndGetBestMatchData: (input: string) => MaybePromise<TSearchFeatureReturn>;
    search: TSearch;
}) {
    return {
        run: (interaction) => run(arg, interaction),
        autocomplete: {
            [SEARCH_TERMS_OPTION_NAME]: async (interaction) => {
                const input = interaction.options.getFocused();
                const results = await arg.search({ input, limit: SEARCH_AUTOCOMPLETE_RESULTS_LIMIT });
                return results.map((item) => ({ name: item.name, value: item.name }));
            },
        },
    } satisfies TCommandHandlers<typeof searchCommandApiInfo>;
}
