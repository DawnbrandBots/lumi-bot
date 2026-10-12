import type { TLfgUseCaseBase } from "../types.ts";
import { ELfgResultKind } from "../types.ts";

export const getRoomList: TLfgUseCaseBase<"getRoomList", "repositories.lfg.listRooms"> = async function (
    dependencies,
    { guildId, omitFullRooms },
) {
    const value = await dependencies.repositories.lfg.listRooms({ guildId, omitFullRooms });

    return { kind: ELfgResultKind.ROOM_LIST, value } as const;
};
