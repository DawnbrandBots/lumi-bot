import type { SlashCommandBuilder } from "discord.js";
import { BOT_NAME, SEARCH_MAX_INPUT_LENGTH, SEARCH_TERMS_OPTION_NAME } from "../models/discord/constants.ts";
import type { ICommandInfo } from "./base.js";
import { CommandInfo } from "./base.js";

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
