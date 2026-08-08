import type { ICommandRuntimeInfo } from "../../../bot/commands/types.ts";
import { lfgManageCommandCommandRegistrationData } from "../commandRegistrationData/lfgManage.ts";

export const lfgManageCommandRuntimeInfo = {
    commandRegistrationData: lfgManageCommandCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof lfgManageCommandCommandRegistrationData>;
