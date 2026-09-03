import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const clearLfgChannel: TAdminUseCaseBase<"clearLfgChannel", "repositories.admin.clearLfgChannel"> =
    async function (dependencies, arg) {
        await dependencies.repositories.admin.clearLfgChannel(arg);
        return { kind: EAdminResultKind.LFG_CHANNEL_CLEARED };
    };
