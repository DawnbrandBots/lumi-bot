import type { ICommandRuntimeInfo } from "../commands/types.ts";
import { lfgCommandCommandRegistrationData } from "../commandRegistrationData/lfg.ts";

export const lfgCommandRuntimeInfo = {
    commandRegistrationData: lfgCommandCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof lfgCommandCommandRegistrationData>;
