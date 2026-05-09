import { SlashCommandBuilder } from "discord.js";
import { CommandInfo, ICommandInfo } from "./base.js";


export const SEARCH_TERMS_OPTION_NAME = "terms";

export const searchCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return baseInfo
            .addStringOption(option => option.setName(SEARCH_TERMS_OPTION_NAME).setDescription("Name to search for.").setRequired(true))
    },
    name: "search",
    description: "Displays details about weapon, unique weapon skill, disciple or spell which name resembles search terms the most.",
})