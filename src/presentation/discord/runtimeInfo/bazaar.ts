import { bazaarCommandRegistrationData } from "../commandRegistrationData/bazaar.ts";
import type { ICommandRuntimeInfo } from "../commands/types.ts";

export const bazaarCommandRuntimeInfo = {
    commandRegistrationData: bazaarCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof bazaarCommandRegistrationData>;
