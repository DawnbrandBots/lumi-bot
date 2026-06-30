import { DISCORD_COMMAND_DEFAULTS } from "../bot/commands/constants.ts";
import type { ICommandApiInfo, ICommandInfo } from "../bot/commands/types.ts";
import { DISCORD_BOT_NAME } from "../bot/constants.ts";

export const helpCommandApiInfo = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "help",
    description: `Displays help for ${DISCORD_BOT_NAME} bot.`,
} as const satisfies ICommandApiInfo;

export const helpCommandInfo = {
    apiInfo: helpCommandApiInfo,
    pingEquivalent: `@${DISCORD_BOT_NAME}`,
} as const satisfies ICommandInfo<typeof helpCommandApiInfo>;
