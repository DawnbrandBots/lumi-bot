import { randomUUID } from "node:crypto";
import type { TLfgPersistence } from "../../../../../application/lfg/types.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import { LfgRoomPlayer } from "../../models/lfg/roomPlayer.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const createRoom: TLfgPersistenceFunction<TLfgPersistence["createRoom"]> = (
    { em },
    { guildId, ownerId, code },
) => {
    const room = em.create(LfgRoom, {
        id: randomUUID(),
        guildId,
        code,
        ownerId,
    });
    const player = em.create(LfgRoomPlayer, {
        id: randomUUID(),
        userId: ownerId,
        room,
    });
    room.players.add(player);
    return toLfgRoom(room);
};
