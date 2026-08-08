import { getOwnedRoom } from "./getOwnedRoom.ts";
import { transferRoom } from "./transferRoom.ts";
import type { TFindLfgRoomByUser, TLfgFeature, TTransferLfgRoom } from "./types.ts";

export async function transferOwnedRoom(
    deps: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly transferRoom: TTransferLfgRoom;
    },
    { guildId, owner, target }: Parameters<TLfgFeature["transferOwnedRoom"]>[0],
) {
    const result = await getOwnedRoom(deps, { guildId, owner });
    if ("kind" in result) {
        return result;
    }
    return transferRoom(deps, { guildId, room: result, target });
}
