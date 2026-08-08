import type { ICommandRuntimeInfo } from "../commands/types.ts";
import { searchCommandCommandRegistrationData } from "../commandRegistrationData/search.ts";
import { DISCORD_BOT_NAME } from "../constants.ts";

export const searchCommandRuntimeInfo = {
    commandRegistrationData: searchCommandCommandRegistrationData,
    pingEquivalent: `@${DISCORD_BOT_NAME} <SEARCH_TERMS>`,
} as const satisfies ICommandRuntimeInfo<typeof searchCommandCommandRegistrationData>;
