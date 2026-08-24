import type { TLfgPlayerRemovalResult } from "../../../domain/lfg/models/playerRemoval.types.ts";
import { ELfgPlayerRemovalKind } from "../../../domain/lfg/models/playerRemoval.types.ts";
import type { TLfgRoom, TLfgServiceBase } from "../types.ts";

export const removePlayerFromRoom: TLfgServiceBase<
    "removePlayerFromRoom",
    "persistence.removeRoom" | "persistence.removeRoomPlayer" | "persistence.setRoomOwner"
> = async function (dependencies, { room, userId }): Promise<TLfgPlayerRemovalResult> {
    const nextPlayerId = room.playerIds.find((playerId) => playerId !== userId);
    if (!nextPlayerId) {
        await dependencies.persistence.removeRoom({ roomId: room.id });
        return { kind: ELfgPlayerRemovalKind.ROOM_DELETED };
    }

    await dependencies.persistence.removeRoomPlayer({ roomId: room.id, userId });

    if (room.ownerId === userId) {
        await dependencies.persistence.setRoomOwner({ roomId: room.id, ownerId: nextPlayerId });
        return { kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED, newOwnerId: nextPlayerId };
    }

    return { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY };
};
