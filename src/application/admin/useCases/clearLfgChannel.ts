import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const clearLfgChannel: TAdminUseCaseBase<"clearLfgChannel", "persistence.admin.clearLfgChannel"> =
    async function (dependencies, arg) {
        await dependencies.persistence.admin.clearLfgChannel(arg);
        return { kind: EAdminResultKind.LFG_CHANNEL_CLEARED };
    };
