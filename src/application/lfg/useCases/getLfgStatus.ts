import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const getLfgStatus: TLfgUseCaseBase<"getLfgStatus", "persistence.listRooms"> = async function (
    dependencies,
    { guildId },
) {
    return {
        kind: ELfgResultKind.ROOMS_LISTED,
        value: { rooms: await dependencies.persistence.listRooms({ guildId }) },
    } as const;
};
