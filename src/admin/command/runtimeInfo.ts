import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { adminCommandApiInfo } from "./apiInfo.ts";

export const adminCommandRuntimeInfo = {
    apiInfo: adminCommandApiInfo,
} as const satisfies ICommandRuntimeInfo<typeof adminCommandApiInfo>;
