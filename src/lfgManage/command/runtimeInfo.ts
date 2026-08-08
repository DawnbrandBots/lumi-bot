import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { lfgManageCommandApiInfo } from "../../presentation/discord/apiInfo/lfgManage.ts";

export const lfgManageCommandRuntimeInfo = {
    apiInfo: lfgManageCommandApiInfo,
} as const satisfies ICommandRuntimeInfo<typeof lfgManageCommandApiInfo>;
