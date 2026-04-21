import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } from "discord.js";

const help = new SlashCommandBuilder()
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .setName("help")
    .setDescription("Lorem ipsum dolor sit amet")
    .toJSON()

export default help