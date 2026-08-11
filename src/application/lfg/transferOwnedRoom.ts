import { getOwnedRoom } from "./getOwnedRoom.ts";
import { transferRoom } from "./transferRoom.ts";
import type { TFindLfgRoomByUser, TLfgFeature, TSetLfgRoomOwner } from "./types.ts";

export async function transferOwnedRoom(
    deps: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly setRoomOwner: TSetLfgRoomOwner;
    },
    { guildId, owner, target }: Parameters<TLfgFeature["transferOwnedRoom"]>[0],
) {
    const result = await getOwnedRoom(deps, { guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return transferRoom(deps, { guildId, room: result.value.room, target });
}
