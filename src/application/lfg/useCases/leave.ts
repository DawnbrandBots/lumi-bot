import { ELfgFeatureReturnKind } from "../types.ts";
import type { TFindLfgRoomByUser, TLeaveLfgRoomArg, TRemovePlayerFromLfgRoom } from "../types.ts";

export async function leave(
    {
        findRoomByUser,
        removePlayerFromRoom,
    }: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly removePlayerFromRoom: TRemovePlayerFromLfgRoom;
    },
    { guildId, user }: TLeaveLfgRoomArg,
) {
    const room = await findRoomByUser({ guildId, userId: user.id });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } as const;
    }

    const removalResult = await removePlayerFromRoom({ room, userId: user.id });
    return {
        kind: ELfgFeatureReturnKind.ROOM_LEFT,
        value: { ...removalResult, code: room.code, userId: user.id },
    } as const;
}
