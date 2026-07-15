import type { EntityManager } from "@mikro-orm/sqlite";
import type { TCommandHandlers } from "../../bot/commands/types.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../../bot/constants.ts";
import { SEARCH_AUTOCOMPLETE_RESULTS_LIMIT } from "../constants.ts";
import searchFeature from "../feature.ts";
import mapSearchFeatureReturnToMessages from "../mapper.ts";
import type { ISearchConfigs, ISearchEngine, TSearchItem } from "../types.ts";
import type { searchCommandApiInfo } from "./apiInfo.ts";

export function getSearchCommand({
    searchEngine,
    em,
    configs,
}: {
    searchEngine: ISearchEngine<TSearchItem>;
    em: EntityManager;
    configs: ISearchConfigs;
}) {
    return {
        run: async function (interaction) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME, true);
            const result = await searchFeature({ em, searchEngine, configs, input });
            const { reply, followUps } = mapSearchFeatureReturnToMessages(result);
            await interaction.reply(reply);
            for (const followUp of followUps ?? []) {
                await interaction.followUp(followUp);
            }
        },
        autocomplete: {
            [SEARCH_TERMS_OPTION_NAME]: (interaction) => {
                const input = interaction.options.getFocused();
                return searchEngine
                    .search(input, SEARCH_AUTOCOMPLETE_RESULTS_LIMIT)
                    .map((item) => ({ name: item.name, value: item.name }));
            },
        },
    } satisfies TCommandHandlers<typeof searchCommandApiInfo>;
}
