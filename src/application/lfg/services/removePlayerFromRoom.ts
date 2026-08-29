import type { TLfgPlayerRemovalResult } from "../../../domain/lfg/models/playerRemoval.types.ts";
import { ELfgPlayerRemovalKind } from "../../../domain/lfg/models/playerRemoval.types.ts";
import type { TLfgServiceBase } from "../types.ts";

export const removePlayerFromRoom: TLfgServiceBase<
    "removePlayerFromRoom",
    "persistence.lfg.removeRoom" | "persistence.lfg.removeRoomPlayer" | "persistence.lfg.setRoomOwner"
> = async function (dependencies, { room, userId }): Promise<TLfgPlayerRemovalResult> {
    const nextPlayerId = room.playerIds.find((playerId) => playerId !== userId);
    if (!nextPlayerId) {
        await dependencies.persistence.lfg.removeRoom({ roomId: room.id });
        return { kind: ELfgPlayerRemovalKind.ROOM_DELETED };
    }

    await dependencies.persistence.lfg.removeRoomPlayer({ roomId: room.id, userId });

    if (room.ownerId === userId) {
        await dependencies.persistence.lfg.setRoomOwner({ roomId: room.id, ownerId: nextPlayerId });
        return { kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED, newOwnerId: nextPlayerId };
    }

    return { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY };
};
