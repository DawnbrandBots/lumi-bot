import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { DISCORD_BOT_NAME } from "../../bot/constants.ts";
import { helpCommandCommandRegistrationData } from "../../presentation/discord/commandRegistrationData/help.ts";

export const helpCommandRuntimeInfo = {
    commandRegistrationData: helpCommandCommandRegistrationData,
    pingEquivalent: `@${DISCORD_BOT_NAME}`,
} as const satisfies ICommandRuntimeInfo<typeof helpCommandCommandRegistrationData>;
