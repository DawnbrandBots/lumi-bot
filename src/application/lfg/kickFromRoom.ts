import { ELfgPlayerRemovalKind } from "../../domain/lfg/models/playerRemoval.types.ts";
import type { IUser } from "../../domain/lfg/models/user.types.ts";
import { ELfgFeatureReturnKind } from "./types.ts";
import { removePlayerFromRoom } from "./removePlayerFromRoom.ts";
import type { TFindLfgRoomByUser, TLfgRoom, TRemoveLfgRoom, TRemoveLfgRoomPlayer, TSetLfgRoomOwner } from "./types.ts";

function applyPlayerRemoval(room: TLfgRoom, userId: string, removalResult: Awaited<ReturnType<typeof removePlayerFromRoom>>): TLfgRoom {
    return {
        ...room,
        ownerId:
            removalResult.kind === ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED ? removalResult.newOwnerId : room.ownerId,
        playerIds: room.playerIds.filter((playerId) => playerId !== userId),
    };
}

export async function kickFromRoom(
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
    { guildId, room, target }: { readonly guildId: string; readonly room: TLfgRoom; readonly target: IUser },
) {
    const targetRoom = await findRoomByUser({ guildId, userId: target.id });
    if (targetRoom?.id !== room.id) {
        return {
            kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: room.ownerId, targetId: target.id, code: room.code },
        } as const;
    }

    const removalResult = await removePlayerFromRoom(
        { removeRoom, removeRoomPlayer, setRoomOwner },
        { room, userId: target.id },
    );
    return {
        kind: ELfgFeatureReturnKind.PLAYER_KICKED,
        value: { userId: room.ownerId, targetId: target.id, room: applyPlayerRemoval(room, target.id, removalResult), removalResult },
    } as const;
}
