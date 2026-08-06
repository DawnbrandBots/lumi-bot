import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { lfgManageCommandApiInfo } from "./apiInfo.ts";

export const lfgManageCommandRuntimeInfo = {
    apiInfo: lfgManageCommandApiInfo,
} as const satisfies ICommandRuntimeInfo<typeof lfgManageCommandApiInfo>;
