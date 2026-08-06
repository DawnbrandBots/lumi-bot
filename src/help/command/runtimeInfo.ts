import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { DISCORD_BOT_NAME } from "../../bot/constants.ts";
import { helpCommandApiInfo } from "./apiInfo.ts";

export const helpCommandRuntimeInfo = {
    apiInfo: helpCommandApiInfo,
    pingEquivalent: `@${DISCORD_BOT_NAME}`,
} as const satisfies ICommandRuntimeInfo<typeof helpCommandApiInfo>;
