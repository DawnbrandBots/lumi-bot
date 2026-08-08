import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { DISCORD_BOT_NAME } from "../../bot/constants.ts";
import { searchCommandCommandRegistrationData } from "../../presentation/discord/commandRegistrationData/search.ts";

export const searchCommandRuntimeInfo = {
    commandRegistrationData: searchCommandCommandRegistrationData,
    pingEquivalent: `@${DISCORD_BOT_NAME} <SEARCH_TERMS>`,
} as const satisfies ICommandRuntimeInfo<typeof searchCommandCommandRegistrationData>;
