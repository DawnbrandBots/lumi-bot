import type { ICommandRuntimeInfo } from "../../../bot/commands/types.ts";
import { lfgCommandCommandRegistrationData } from "../commandRegistrationData/lfg.ts";

export const lfgCommandRuntimeInfo = {
    commandRegistrationData: lfgCommandCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof lfgCommandCommandRegistrationData>;
