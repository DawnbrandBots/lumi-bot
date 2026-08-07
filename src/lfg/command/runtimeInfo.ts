import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { lfgCommandApiInfo } from "./apiInfo.ts";

export const lfgCommandRuntimeInfo = {
    apiInfo: lfgCommandApiInfo,
} as const satisfies ICommandRuntimeInfo<typeof lfgCommandApiInfo>;
