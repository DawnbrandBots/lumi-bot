import type { ICommandRuntimeInfo } from "../../../bot/commands/types.ts";
import { helpCommandCommandRegistrationData } from "../commandRegistrationData/help.ts";
import { DISCORD_BOT_NAME } from "../constants.ts";

export const helpCommandRuntimeInfo = {
    commandRegistrationData: helpCommandCommandRegistrationData,
    pingEquivalent: `@${DISCORD_BOT_NAME}`,
} as const satisfies ICommandRuntimeInfo<typeof helpCommandCommandRegistrationData>;
