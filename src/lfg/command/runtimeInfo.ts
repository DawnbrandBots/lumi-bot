import type { ICommandRuntimeInfo } from "../../bot/commands/types.ts";
import { lfgCommandApiInfo } from "../../presentation/discord/apiInfo/lfg.ts";

export const lfgCommandRuntimeInfo = {
    apiInfo: lfgCommandApiInfo,
} as const satisfies ICommandRuntimeInfo<typeof lfgCommandApiInfo>;
