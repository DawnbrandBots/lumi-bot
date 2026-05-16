import type { EntityManager } from "@mikro-orm/sqlite";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../bot/command.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../bot/constants.ts";
import { searchCommandInfo } from "./commandInfo.ts";
import searchFeature from "./feature.ts";
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
        run: async function (interaction: ChatInputCommandInteraction<CacheType>) {
            const input = interaction.options.getString(SEARCH_TERMS_OPTION_NAME);
            if (!input) {
                throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`);
            }
            const response = await searchFeature({ em, searchEngine, handlers, input });
            return interaction.reply(response);
        },
    });
}
