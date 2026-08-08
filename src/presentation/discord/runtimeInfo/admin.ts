import type { ICommandRuntimeInfo } from "../../../bot/commands/types.ts";
import { adminCommandCommandRegistrationData } from "../commandRegistrationData/admin.ts";

export const adminCommandRuntimeInfo = {
    commandRegistrationData: adminCommandCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof adminCommandCommandRegistrationData>;
