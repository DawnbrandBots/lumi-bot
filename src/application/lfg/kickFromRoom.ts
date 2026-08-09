import type { IUser } from "../../domain/lfg/models/user.types.ts";
import { ELfgFeatureReturnKind } from "./types.ts";
import type { TFindLfgRoomByUser, TKickUserFromLfgRoom, TLfgRoom } from "./types.ts";

export async function kickFromRoom(
    {
        findRoomByUser,
        kickUserFromRoom,
    }: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly kickUserFromRoom: TKickUserFromLfgRoom;
    },
    { guildId, room, target }: { readonly guildId: string; readonly room: TLfgRoom; readonly target: IUser },
) {
    const targetRoom = await findRoomByUser({ guildId, userId: target.id });
    if (targetRoom?.id !== room.id) {
        return {
            kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: room.ownerId, targetId: target.id, code: room.code },
        } as const;
    }

    const { room: roomSnapshot, removalResult } = await kickUserFromRoom({ roomId: room.id, targetId: target.id });
    return {
        kind: ELfgFeatureReturnKind.PLAYER_KICKED,
        value: { userId: room.ownerId, targetId: target.id, room: roomSnapshot, removalResult },
    } as const;
}
