import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from "discord.js";

export const lumiSearchOptionName = "terms";

const searchCommand = new SlashCommandBuilder()
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .setName("search")
    .setDescription("Displays details about weapon, disciple or spell which name resembles search terms the most.")
    .addStringOption(option => option.setName(lumiSearchOptionName).setDescription("Name of weapon, disciple or spell to search for.").setRequired(true))
    .toJSON()

export default searchCommand