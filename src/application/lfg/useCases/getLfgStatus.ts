import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const getLfgStatus: TLfgUseCaseBase<"getLfgStatus", "persistence.getGuildConfig" | "persistence.listRooms"> =
    async function (dependencies, { guildId }) {
        const [guildConfig, rooms] = await Promise.all([
            dependencies.persistence.getGuildConfig({ guildId }),
            dependencies.persistence.listRooms({ guildId }),
        ]);

        return {
            kind: ELfgResultKind.ROOMS_LISTED,
            value: { guildConfig, rooms },
        } as const;
    };
