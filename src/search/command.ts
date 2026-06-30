import type { EntityManager } from "@mikro-orm/sqlite";
import { SEARCH_TERMS_OPTION_NAME } from "../bot/constants.ts";
import type { TCommandHandlers } from "../bot/types.ts";
import type { searchCommandData } from "./commandInfo.ts";
import { SEARCH_AUTOCOMPLETE_RESULTS_LIMIT } from "./constants.ts";
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
    return {
        run: async function (interaction) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME);
            if (!input) {
                throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`);
            }
            const result = await searchFeature({ em, searchEngine, handlers, input });
            const { reply, followUps } = mapSearchFeatureReturnToMessages<Items>(result, handlers);
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
    } satisfies TCommandHandlers<typeof searchCommandData>;
}
