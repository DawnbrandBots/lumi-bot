import { DISCORD_COMMAND_DEFAULTS } from "../commands/constants.ts";
import type { ICommandRegistrationData } from "../commands/types.ts";

export const linksCommandCommandRegistrationData = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "links",
    description: "Displays official Fire Emblem Shadows links.",
} as const satisfies ICommandRegistrationData;
