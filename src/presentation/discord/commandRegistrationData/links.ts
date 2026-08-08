import { DISCORD_COMMAND_DEFAULTS } from "../../../bot/commands/constants.ts";
import type { ICommandCommandRegistrationData } from "../../../bot/commands/types.ts";

export const linksCommandCommandRegistrationData = {
    ...DISCORD_COMMAND_DEFAULTS,
    name: "links",
    description: "Displays official Fire Emblem Shadows links.",
} as const satisfies ICommandCommandRegistrationData;
