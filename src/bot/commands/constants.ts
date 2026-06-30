import { ApplicationIntegrationType, InteractionContextType } from "discord.js";
import type { ICommandApiInfo } from "./types.ts";

export const DISCORD_COMMAND_DEFAULTS = {
    integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
} as const satisfies Required<Pick<ICommandApiInfo, "integration_types" | "contexts">>;
