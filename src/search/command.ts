import type { EntityManager } from "@mikro-orm/sqlite";
import { Command } from "../bot/command.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../bot/constants.ts";
import { searchCommandInfo } from "./commandInfo.ts";
import { AUTOCOMPLETE_RESULTS_LIMIT } from "./constants.ts";
import searchFeature from "./feature.ts";
import mapSearchFeatureReturnToMessage from "./mapper.ts";
import type { ISearchConfigs, ISearchEngine, ISearchItem, TSearchableEntity } from "./types.ts";

export function getSearchCommand<Items extends TSearchableEntity>({
    searchEngine,
    em,
    configs,
}: {
    searchEngine: ISearchEngine<ISearchItem & { kind: Items["kind"] }>;
    em: EntityManager;
    configs: ISearchConfigs<Items>;
}) {
    return new Command({
        info: searchCommandInfo,
        run: async function (interaction) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME);
            if (!input) {
                throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`);
            }
            const result = await searchFeature({ em, searchEngine, configs, input });
            const message = mapSearchFeatureReturnToMessage<Items>(result);
            return interaction.reply(message);
        },
        autocomplete: (interaction) => {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name === SEARCH_TERMS_OPTION_NAME) {
                return searchEngine
                    .search(focusedOption.value, AUTOCOMPLETE_RESULTS_LIMIT)
                    .map((item) => ({ name: item.name, value: item.name }));
            }
            return null;
        },
    });
}
