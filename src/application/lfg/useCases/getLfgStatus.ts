import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const getLfgStatus: TLfgUseCaseBase<
    "getLfgStatus",
    "repositories.admin.getGuildConfig" | "repositories.lfg.listRooms"
> = async function (dependencies, { guildId }) {
    const [guildConfig, rooms] = await Promise.all([
        dependencies.repositories.admin.getGuildConfig({ guildId }),
        dependencies.repositories.lfg.listRooms({ guildId }),
    ]);

    return {
        kind: ELfgResultKind.ROOMS_LISTED,
        value: { guildConfig, rooms },
    } as const;
};
