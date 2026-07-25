import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { linksCommandApiInfo } from "./apiInfo.ts";

export const linksCommandRuntimeInfo = {
    apiInfo: linksCommandApiInfo,
} as const satisfies ICommandRuntimeInfo<typeof linksCommandApiInfo>;
