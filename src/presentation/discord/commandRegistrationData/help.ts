import { DISCORD_COMMAND_DEFAULTS } from "../commands/constants.ts";
import type { ICommandRegistrationData } from "../commands/types.ts";
import { DISCORD_BOT_NAME } from "../constants.ts";

export const helpCommandCommandRegistrationData = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "help",
    description: `Displays help for ${DISCORD_BOT_NAME} bot.`,
} as const satisfies ICommandRegistrationData;
