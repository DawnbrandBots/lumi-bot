import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { linksCommandCommandRegistrationData } from "../../presentation/discord/commandRegistrationData/links.ts";

export const linksCommandRuntimeInfo = {
    commandRegistrationData: linksCommandCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof linksCommandCommandRegistrationData>;
