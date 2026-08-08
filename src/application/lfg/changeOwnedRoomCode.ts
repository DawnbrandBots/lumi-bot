import { changeRoomCodeInRoom } from "./changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "./getOwnedRoom.ts";
import type { TChangeLfgRoomCode, TFindLfgRoomByCode, TFindLfgRoomByUser, TLfgFeature } from "./types.ts";

export async function changeOwnedRoomCode(
    deps: {
        readonly changeRoomCode: TChangeLfgRoomCode;
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly findRoomByUser: TFindLfgRoomByUser;
    },
    { guildId, owner, newCode }: Parameters<TLfgFeature["changeOwnedRoomCode"]>[0],
) {
    const result = await getOwnedRoom(deps, { guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return changeRoomCodeInRoom(deps, { guildId, room: result.value.room, newCode });
}
