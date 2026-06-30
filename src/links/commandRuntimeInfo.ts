import { DISCORD_COMMAND_DEFAULTS } from "../bot/commands/constants.ts";
import type { ICommandApiInfo, ICommandRuntimeInfo } from "../bot/commands/types.ts";

export const linksCommandApiInfo = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "links",
    description: "Displays official Fire Emblem Shadows links.",
} as const satisfies ICommandApiInfo;

export const linksCommandRuntimeInfo = {
    apiInfo: linksCommandApiInfo,
} as const satisfies ICommandRuntimeInfo<typeof linksCommandApiInfo>;
