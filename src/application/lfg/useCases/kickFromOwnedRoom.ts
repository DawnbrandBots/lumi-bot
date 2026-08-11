import { ELfgFeatureReturnKind } from "../types.ts";
import { getOwnedRoom } from "../services/getOwnedRoom.ts";
import { kickFromRoom } from "../services/kickFromRoom.ts";
import type {
    TFindLfgRoomByUser,
    TLfgFeature,
    TRemoveLfgRoom,
    TRemoveLfgRoomPlayer,
    TSetLfgRoomOwner,
} from "../types.ts";

export async function kickFromOwnedRoom(
    deps: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly removeRoom: TRemoveLfgRoom;
        readonly removeRoomPlayer: TRemoveLfgRoomPlayer;
        readonly setRoomOwner: TSetLfgRoomOwner;
    },
    { guildId, owner, target }: Parameters<TLfgFeature["kickFromOwnedRoom"]>[0],
) {
    const result = await getOwnedRoom(deps, { guildId, owner });
    if (!result.success) {
        return result.value;
    }
    if (owner.id === target.id) {
        return { kind: ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF } as const;
    }
    return kickFromRoom(deps, { guildId, room: result.value.room, target });
}
