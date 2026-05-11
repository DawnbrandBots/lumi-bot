import { EntityManager } from "@mikro-orm/core";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { searchCommandInfo } from "../commandInfo/search.js";
import searchFeature, { ISearchItem, SearchHandlers } from "../features/search.ts";
import { SearchEngine } from "../loaders/searchEngine.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../models/discord/constants.ts";
import { Command } from "./base.js";

export function getSearchCommand<Items extends ISearchItem>({
    searchEngine,
    em,
    handlers,
}: {
    searchEngine: SearchEngine<Items>;
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
            const embed = await searchFeature({ em, searchEngine, handlers, input });
            return interaction.reply({
                embeds: [embed],
            });
        },
    });
}
