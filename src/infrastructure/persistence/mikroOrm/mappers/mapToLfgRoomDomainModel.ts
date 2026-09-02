import type { TLfgRoom } from "../../../../application/lfg/types.ts";
import type { LfgRoom } from "../models/lfg/room.ts";

export function mapToLfgRoomDomainModel(room: LfgRoom): TLfgRoom {
    return {
        id: room.id,
        code: room.code,
        ownerId: room.ownerId,
        playerIds: room.players.toArray().map((player) => player.userId),
    };
}
