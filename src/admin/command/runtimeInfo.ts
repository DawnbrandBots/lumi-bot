import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { adminCommandApiInfo } from "../../presentation/discord/apiInfo/admin.ts";

export const adminCommandRuntimeInfo = {
    apiInfo: adminCommandApiInfo,
} as const satisfies ICommandRuntimeInfo<typeof adminCommandApiInfo>;
