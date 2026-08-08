import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { adminCommandCommandRegistrationData } from "../../presentation/discord/commandRegistrationData/admin.ts";

export const adminCommandRuntimeInfo = {
    commandRegistrationData: adminCommandCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof adminCommandCommandRegistrationData>;
