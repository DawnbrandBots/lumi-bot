import type { TLfgRoom } from "../../application/lfg/types.ts";
import type { LfgRoom } from "../../lfg/models/room.ts";

export function toLfgRoom(room: LfgRoom, excludedPlayerId?: string): TLfgRoom {
    return {
        id: room.id,
        code: room.code,
        ownerId: room.ownerId,
        playerIds: room.players
            .toArray()
            .filter((player) => player.userId !== excludedPlayerId)
            .map((player) => player.userId),
    };
}
