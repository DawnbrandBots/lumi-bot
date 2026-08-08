import type { ICommandRuntimeInfo } from "../commands/types.ts";
import { linksCommandCommandRegistrationData } from "../commandRegistrationData/links.ts";

export const linksCommandRuntimeInfo = {
    commandRegistrationData: linksCommandCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof linksCommandCommandRegistrationData>;
