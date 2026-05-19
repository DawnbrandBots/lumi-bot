import type { SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../bot/commandInfo.ts";
import { BOT_NAME, SEARCH_MAX_INPUT_LENGTH, SEARCH_TERMS_OPTION_NAME } from "../bot/constants.ts";
import type { ICommandInfo } from "../bot/types.ts";

export const searchCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return baseInfo.addStringOption((option) =>
            option
                .setName(SEARCH_TERMS_OPTION_NAME)
                .setDescription("Name to search for.")
                .setRequired(true)
                .setMaxLength(SEARCH_MAX_INPUT_LENGTH),
        );
    },
    name: "search",
    description: "Displays info about weapon, unique weapon skill, disciple or spell matching search terms the most.",
    pingEquivalent: `@${BOT_NAME} <SEARCH_TERMS>`,
});
