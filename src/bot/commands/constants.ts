import { ApplicationIntegrationType, InteractionContextType } from "discord.js";
import type { ICommandData } from "./types.ts";

export const DISCORD_COMMAND_DEFAULTS = {
    integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
} as const satisfies Required<Pick<ICommandData, "integration_types" | "contexts">>;
