import type { TCommandHandlers } from "../../bot/commands/types.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../../bot/constants.ts";
import type { TGetEntityByKindAndId } from "../../game/infra.types.ts";
import { SEARCH_AUTOCOMPLETE_RESULTS_LIMIT } from "../constants.ts";
import type { TSearch, TSearchOne } from "../feature.types.ts";
import mapSearchFeatureReturnToMessages from "../mapper.ts";
import type { searchCommandApiInfo } from "./apiInfo.ts";

export function getSearchCommand(arg: {
    searchOne: TSearchOne;
    search: TSearch;
    getEntityByKindAndId: TGetEntityByKindAndId;
}) {
    return {
        run: async function (interaction) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME, true);
            const searchItem = await arg.searchOne(input);
            const entity = searchItem ? await arg.getEntityByKindAndId(searchItem) : null;
            const mapperInput: Parameters<typeof mapSearchFeatureReturnToMessages>[0] = searchItem
                ? { entity, searchItem }
                : { entity: null, searchItem: null };
            const { reply, followUps } = mapSearchFeatureReturnToMessages(mapperInput);
            await interaction.reply(reply);
            for (const followUp of followUps ?? []) {
                await interaction.followUp(followUp);
            }
        },
        autocomplete: {
            [SEARCH_TERMS_OPTION_NAME]: async (interaction) => {
                const input = interaction.options.getFocused();
                const results = await arg.search({ input, limit: SEARCH_AUTOCOMPLETE_RESULTS_LIMIT });
                return results.map((item) => ({ name: item.name, value: item.name }));
            },
        },
    } satisfies TCommandHandlers<typeof searchCommandApiInfo>;
}
