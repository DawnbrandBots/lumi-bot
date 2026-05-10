import { EntityManager } from "@mikro-orm/sqlite";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import Fuse from "fuse.js";
import { searchCommandInfo } from "../commandInfo/search.js";
import searchFeature, { ISearchItem, SearchHandlers } from "../features/search.ts";
import { Command } from "./base.js";
import { SEARCH_TERMS_OPTION_NAME } from "../models/discord/constants.ts";

export function getSearchCommand<Items extends ISearchItem>({
    fuse,
    em,
    handlers,
}: {
    fuse: Fuse<Items>;
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
            const embed = await searchFeature({ em, fuse, handlers, input });
            return interaction.reply({
                embeds: [embed],
            });
        },
    });
}
