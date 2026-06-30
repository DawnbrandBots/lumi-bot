import { DISCORD_COMMAND_DEFAULTS } from "../bot/commands/constants.ts";
import type { TCommandData, TCommandInfo } from "../bot/commands/types.ts";
import { DISCORD_BOT_NAME } from "../bot/constants.ts";

export const helpCommandData = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "help",
    description: `Displays help for ${DISCORD_BOT_NAME} bot.`,
} as const satisfies TCommandData;

export const helpCommandInfo = {
    data: helpCommandData,
    pingEquivalent: `@${DISCORD_BOT_NAME}`,
} as const satisfies TCommandInfo<typeof helpCommandData>;
