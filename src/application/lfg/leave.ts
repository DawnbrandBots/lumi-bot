import { ELfgFeatureReturnKind } from "./types.ts";
import { removePlayerFromRoom } from "./removePlayerFromRoom.ts";
import type { TFindLfgRoomByUser, TLfgFeature, TRemoveLfgRoom, TRemoveLfgRoomPlayer, TSetLfgRoomOwner } from "./types.ts";

export async function leave(
    {
        findRoomByUser,
        removeRoom,
        removeRoomPlayer,
        setRoomOwner,
    }: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly removeRoom: TRemoveLfgRoom;
        readonly removeRoomPlayer: TRemoveLfgRoomPlayer;
        readonly setRoomOwner: TSetLfgRoomOwner;
    },
    { guildId, user }: Parameters<TLfgFeature["leave"]>[0],
) {
    const room = await findRoomByUser({ guildId, userId: user.id });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } as const;
    }

    const removalResult = await removePlayerFromRoom(
        { removeRoom, removeRoomPlayer, setRoomOwner },
        { room, userId: user.id },
    );
    return { kind: ELfgFeatureReturnKind.ROOM_LEFT, value: { ...removalResult, code: room.code, userId: user.id } } as const;
}
