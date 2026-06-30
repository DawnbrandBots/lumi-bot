import type { EntityManager } from "@mikro-orm/sqlite";
import { SEARCH_TERMS_OPTION_NAME } from "../bot/constants.ts";
import type { TCommandHandlers } from "../bot/types.ts";
import type { searchCommandData } from "./commandInfo.ts";
import { AUTOCOMPLETE_RESULTS_LIMIT } from "./constants.ts";
import searchFeature from "./feature.ts";
import mapSearchFeatureReturnToMessage from "./mapper.ts";
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
    return {
        run: async function (interaction) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME);
            if (!input) {
                throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`);
            }
            const result = await searchFeature({ em, searchEngine, handlers, input });
            const message = mapSearchFeatureReturnToMessage<Items>(result, handlers);
            return interaction.reply(message);
        },
        autocomplete: {
            [SEARCH_TERMS_OPTION_NAME]: (interaction) => {
                const input = interaction.options.getFocused();
                return searchEngine
                    .search(input, AUTOCOMPLETE_RESULTS_LIMIT)
                    .map((item) => ({ name: item.name, value: item.name }));
            },
        },
    } satisfies TCommandHandlers<typeof searchCommandData>;
}
