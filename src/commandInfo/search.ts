import { SlashCommandBuilder } from "discord.js";
import { CommandInfo, ICommandInfo } from "./base.js";
import { SEARCH_TERMS_OPTION_NAME, SEARCH_MAX_INPUT_LENGTH } from "../models/discord/constants.ts";

export const searchCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return baseInfo
            .addStringOption(option => option.setName(SEARCH_TERMS_OPTION_NAME).setDescription("Name to search for.").setRequired(true).setMaxLength(SEARCH_MAX_INPUT_LENGTH))
    },
    name: "search",
    description: "Displays info about weapon, unique weapon skill, disciple or spell matching search terms the most.",
})