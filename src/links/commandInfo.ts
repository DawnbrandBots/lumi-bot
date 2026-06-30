import type { TCommandData, TCommandInfo } from "../bot/commands/types.ts";
import { DISCORD_COMMAND_DEFAULTS } from "../bot/constants.ts";

export const linksCommandData = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "links",
    description: "Displays official Fire Emblem Shadows links.",
} as const satisfies TCommandData;

export const linksCommandInfo = {
    data: linksCommandData,
} as const satisfies TCommandInfo<typeof linksCommandData>;
