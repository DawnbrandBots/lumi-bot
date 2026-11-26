import { bazaarManageCommandRegistrationData } from "../commandRegistrationData/bazaarManage.ts";
import type { ICommandRuntimeInfo } from "../commands/types.ts";

export const bazaarManageCommandRuntimeInfo = {
    commandRegistrationData: bazaarManageCommandRegistrationData,
} as const satisfies ICommandRuntimeInfo<typeof bazaarManageCommandRegistrationData>;
