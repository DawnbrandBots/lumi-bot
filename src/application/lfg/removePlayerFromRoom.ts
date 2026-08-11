import type { TLfgPlayerRemovalResult } from "../../domain/lfg/models/playerRemoval.types.ts";
import { ELfgPlayerRemovalKind } from "../../domain/lfg/models/playerRemoval.types.ts";
import type { TLfgRoom, TRemoveLfgRoom, TRemoveLfgRoomPlayer, TSetLfgRoomOwner } from "./types.ts";

export async function removePlayerFromRoom(
    {
        removeRoom,
        removeRoomPlayer,
        setRoomOwner,
    }: {
        readonly removeRoom: TRemoveLfgRoom;
        readonly removeRoomPlayer: TRemoveLfgRoomPlayer;
        readonly setRoomOwner: TSetLfgRoomOwner;
    },
    { room, userId }: { readonly room: TLfgRoom; readonly userId: string },
): Promise<TLfgPlayerRemovalResult> {
    const nextPlayerId = room.playerIds.find((playerId) => playerId !== userId);
    if (!nextPlayerId) {
        await removeRoom({ roomId: room.id });
        return { kind: ELfgPlayerRemovalKind.ROOM_DELETED };
    }

    await removeRoomPlayer({ roomId: room.id, userId });

    if (room.ownerId === userId) {
        await setRoomOwner({ roomId: room.id, ownerId: nextPlayerId });
        return { kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED, newOwnerId: nextPlayerId };
    }

    return { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY };
}
