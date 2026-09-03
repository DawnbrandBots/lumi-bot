import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const setLfgChannel: TAdminUseCaseBase<"setLfgChannel", "repositories.admin.setLfgChannel"> = async function (
    dependencies,
    arg,
) {
    await dependencies.repositories.admin.setLfgChannel(arg);
    return {
        kind: EAdminResultKind.LFG_CHANNEL_SET,
        value: { channel: arg.channelId },
    };
};
