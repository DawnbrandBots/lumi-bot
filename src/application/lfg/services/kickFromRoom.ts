import { ELfgPlayerRemovalKind } from "../../../domain/lfg/models/playerRemoval.types.ts";
import { ELfgResultKind } from "../types.ts";
import type { TLfgRoom, TRemovePlayerFromLfgRoom, TLfgServiceBase } from "../types.ts";

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

export const kickFromRoom: TLfgServiceBase<
    "kickFromRoom",
    "repositories.lfg.findRoomByUser" | "services.removePlayerFromRoom"
> = async function (dependencies, { guildId, room, target }) {
    const targetRoom = await dependencies.repositories.lfg.findRoomByUser({ guildId, userId: target.id });
    if (targetRoom?.id !== room.id) {
        return {
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: room.ownerId, targetId: target.id, code: room.code },
        } as const;
    }

    const removalResult = await dependencies.services.removePlayerFromRoom({ room, userId: target.id });
    return {
        kind: ELfgResultKind.PLAYER_KICKED,
        value: {
            userId: room.ownerId,
            targetId: target.id,
            room: applyPlayerRemoval(room, target.id, removalResult),
            removalResult,
        },
    } as const;
};
