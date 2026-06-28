import type { EntityManager } from "@mikro-orm/sqlite";
import { Command } from "../bot/command.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../bot/constants.ts";
import { searchCommandInfo } from "./commandInfo.ts";
import { AUTOCOMPLETE_RESULTS_LIMIT } from "./constants.ts";
import searchFeature from "./feature.ts";
import mapSearchFeatureReturnToMessages from "./mapper.ts";
import type { ISearchableEntity, ISearchEngine, ISearchHandlers, ISearchItem } from "./types.ts";

export function getSearchCommand<Items extends ISearchableEntity>({
    searchEngine,
    em,
    handlers,
}: {
    searchEngine: ISearchEngine<ISearchItem & { kind: Items["kind"] }>;
    em: EntityManager;
    handlers: ISearchHandlers<Items>;
}) {
    return new Command({
        info: searchCommandInfo,
        run: async function (interaction) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME);
            if (!input) {
                throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`);
            }
            const result = await searchFeature({ em, searchEngine, handlers, input });
            const { reply, followUps } = mapSearchFeatureReturnToMessages<Items>(result, handlers);
            const initialResponse = await interaction.reply(reply);
            for (const followUp of followUps ?? []) {
                await interaction.followUp(followUp);
            }
            return initialResponse;
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
