import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from "discord.js";

export const searchCommandName = "search";
export const searchTermsOptionName = "terms";

const searchCommand = new SlashCommandBuilder()
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .setName(searchCommandName)
    .setDescription("Displays details about weapon, disciple or spell which name resembles search terms the most.")
    .addStringOption(option => option.setName(searchTermsOptionName).setDescription("Name of weapon, disciple or spell to search for.").setRequired(true))
    .toJSON()

export default searchCommand