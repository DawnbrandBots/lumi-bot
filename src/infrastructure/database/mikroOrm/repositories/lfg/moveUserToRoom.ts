import { randomUUID } from "node:crypto";
import type { TLfgPersistence } from "../../../../../application/lfg/types.ts";
import { LfgRoomPlayer } from "../../models/lfg/roomPlayer.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const moveUserToRoom: TLfgPersistenceFunction<TLfgPersistence["moveUserToRoom"]> = async (
    { em },
    { roomId, userId },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    const player = em.create(LfgRoomPlayer, {
        id: randomUUID(),
        userId,
        room,
    });
    room.players.add(player);
    return toLfgRoom(room);
};
