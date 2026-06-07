import { Command } from "../bot/command.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../bot/constants.ts";
import { EBotRequestKind, getRequiredSearchInput } from "../bot/request.ts";
import { searchCommandInfo } from "./commandInfo.ts";
import { AUTOCOMPLETE_RESULTS_LIMIT } from "./constants.ts";
import type { ISearchableEntity, ISearchEngine, ISearchItem } from "./types.ts";

export function getSearchCommand<Items extends ISearchableEntity>({
    searchEngine,
}: {
    searchEngine: ISearchEngine<ISearchItem & { kind: Items["kind"] }>;
}) {
    return new Command({
        info: searchCommandInfo,
        request: function (interaction) {
            const input = getRequiredSearchInput(interaction.options.getString(SEARCH_TERMS_OPTION_NAME, true));
            return { kind: EBotRequestKind.SEARCH, input };
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
