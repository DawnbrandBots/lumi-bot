import { randomUUID } from "node:crypto";
import type { TLfgPersistence } from "../../application/lfg/types.ts";
import { LfgRoom } from "./models/room.ts";
import { LfgRoomPlayer } from "./models/roomPlayer.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const createRoom: TLfgPersistenceFunction<TLfgPersistence["createRoom"]> = async (
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
    await em.flush();
    return toLfgRoom(room);
};
