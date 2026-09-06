import type { IRoom } from "../../../../domain/lfg/models/room.types.ts";
import type { LfgRoom } from "../models/lfg/room.ts";

export function toLfgRoom(room: LfgRoom): IRoom {
    return {
        id: room.id,
        code: room.code,
        ownerId: room.ownerId,
        playerIds: room.players.toArray().map((player) => player.userId),
    };
}
