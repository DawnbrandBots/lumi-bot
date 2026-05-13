import type { EntityManager } from "@mikro-orm/core";
import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { searchCommandInfo } from "../commandInfo/search.js";
import type { ISearchableEntity, ISearchItem, SearchHandlers } from "../features/search.ts";
import searchFeature from "../features/search.ts";
import type { ISearchEngine } from "../loaders/searchEngine.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../models/discord/constants.ts";
import { Command } from "./base.js";

export function getSearchCommand<Items extends ISearchableEntity>({
    searchEngine,
    em,
    handlers,
}: {
    searchEngine: ISearchEngine<ISearchItem & { kind: Items["kind"] }>;
    em: EntityManager;
    handlers: SearchHandlers<Items>;
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
