import type { EntityManager } from "@mikro-orm/sqlite";
import type { TLfgPlayerRemovalResult } from "../../domain/lfg/models/playerRemoval.types.ts";
import { ELfgPlayerRemovalKind } from "../../domain/lfg/models/playerRemoval.types.ts";
import type { LfgRoom } from "./models/room.ts";
import type { LfgRoomPlayer } from "./models/roomPlayer.ts";

export function removePlayerFromRoom(
    { em }: { readonly em: EntityManager },
    { room, player }: { readonly room: LfgRoom; readonly player: LfgRoomPlayer },
): TLfgPlayerRemovalResult {
    em.remove(player);
    const anotherPlayerInTheRoom = room.players.find((p) => p.userId !== player.userId);
    if (!anotherPlayerInTheRoom) {
        em.remove(room);
        return { kind: ELfgPlayerRemovalKind.ROOM_DELETED };
    }
    if (room.ownerId === player.userId) {
        room.ownerId = anotherPlayerInTheRoom.userId;
        return { kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED, newOwnerId: room.ownerId };
    }
    return { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY };
}
