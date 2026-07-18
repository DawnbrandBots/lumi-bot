import { ApplicationIntegrationType, InteractionContextType } from "discord.js";
import { CommandInfo } from "../bot/commandInfo.ts";
import type { ICommandInfo } from "../bot/types.ts";

export const linksCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: (baseInfo) => baseInfo,
    name: "links",
    description: "Displays official Fire Emblem Shadows links.",
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
    integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
});
