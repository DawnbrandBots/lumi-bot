import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const getLfgStatus: TLfgUseCaseBase<
    "getLfgStatus",
    "persistence.admin.getGuildConfig" | "persistence.lfg.listRooms"
> = async function (dependencies, { guildId }) {
    const [guildConfig, rooms] = await Promise.all([
        dependencies.persistence.admin.getGuildConfig({ guildId }),
        dependencies.persistence.lfg.listRooms({ guildId }),
    ]);

    return {
        kind: ELfgResultKind.ROOMS_LISTED,
        value: { guildConfig, rooms },
    } as const;
};
