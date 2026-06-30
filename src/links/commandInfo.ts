import { DISCORD_COMMAND_DEFAULTS } from "../bot/commands/constants.ts";
import type { ICommandData, ICommandInfo } from "../bot/commands/types.ts";

export const linksCommandData = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "links",
    description: "Displays official Fire Emblem Shadows links.",
} as const satisfies ICommandData;

export const linksCommandInfo = {
    data: linksCommandData,
} as const satisfies ICommandInfo<typeof linksCommandData>;
