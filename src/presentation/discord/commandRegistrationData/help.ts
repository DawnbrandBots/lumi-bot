import { DISCORD_COMMAND_DEFAULTS } from "../../../bot/commands/constants.ts";
import type { ICommandCommandRegistrationData } from "../../../bot/commands/types.ts";
import { DISCORD_BOT_NAME } from "../constants.ts";

export const helpCommandCommandRegistrationData = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "help",
    description: `Displays help for ${DISCORD_BOT_NAME} bot.`,
} as const satisfies ICommandCommandRegistrationData;
