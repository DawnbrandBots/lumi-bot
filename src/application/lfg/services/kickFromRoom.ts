import { ELfgPlayerRemovalKind } from "../../../domain/lfg/models/playerRemoval.types.ts";
import type { IUser } from "../../../domain/lfg/models/user.types.ts";
import { ELfgResultKind } from "../types.ts";
import type { TFindLfgRoomByUser, TKickFromLfgRoom, TLfgRoom, TRemovePlayerFromLfgRoom } from "../types.ts";

function applyPlayerRemoval(
    room: TLfgRoom,
    userId: string,
    removalResult: Awaited<ReturnType<TRemovePlayerFromLfgRoom>>,
): TLfgRoom {
    return {
        ...room,
        ownerId:
            removalResult.kind === ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED
                ? removalResult.newOwnerId
                : room.ownerId,
        playerIds: room.playerIds.filter((playerId) => playerId !== userId),
    };
}

export async function kickFromRoom(
    {
        findRoomByUser,
        removePlayerFromRoom,
    }: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly removePlayerFromRoom: TRemovePlayerFromLfgRoom;
    },
    { guildId, room, target }: { readonly guildId: string; readonly room: TLfgRoom; readonly target: IUser },
): Promise<Awaited<ReturnType<TKickFromLfgRoom>>> {
    const targetRoom = await findRoomByUser({ guildId, userId: target.id });
    if (targetRoom?.id !== room.id) {
        return {
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: room.ownerId, targetId: target.id, code: room.code },
        } as const;
    }

    const removalResult = await removePlayerFromRoom({ room, userId: target.id });
    return {
        kind: ELfgResultKind.PLAYER_KICKED,
        value: {
            userId: room.ownerId,
            targetId: target.id,
            room: applyPlayerRemoval(room, target.id, removalResult),
            removalResult,
        },
    } as const;
}
