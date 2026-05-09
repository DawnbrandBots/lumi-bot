import { SlashCommandBuilder } from "discord.js";
import { SEARCH_MAX_INPUT_LENGTH, SEARCH_TERMS_OPTION_NAME } from "../constants.ts";
import { CommandInfo, ICommandInfo } from "./base.js";

export const searchCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return baseInfo
            .addStringOption(option => option.setName(SEARCH_TERMS_OPTION_NAME).setDescription("Name to search for.").setRequired(true).setMaxLength(SEARCH_MAX_INPUT_LENGTH))
    },
    name: "search",
    description: "Displays details about weapon, unique weapon skill, disciple or spell which name resembles search terms the most.",
})