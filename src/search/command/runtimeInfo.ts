import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { DISCORD_BOT_NAME } from "../../bot/constants.ts";
import { searchCommandApiInfo } from "./apiInfo.ts";

export const searchCommandRuntimeInfo = {
    apiInfo: searchCommandApiInfo,
    pingEquivalent: `@${DISCORD_BOT_NAME} <SEARCH_TERMS>`,
} as const satisfies ICommandRuntimeInfo<typeof searchCommandApiInfo>;
