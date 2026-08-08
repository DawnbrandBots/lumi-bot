import { randomUUID } from "node:crypto";
import type { TLfgPersistence } from "../../application/lfg/types.ts";
import { LfgRoomPlayer } from "../../lfg/models/roomPlayer.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import { removePlayerFromRoom } from "./removePlayerFromRoom.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const moveUserToRoom: TLfgPersistenceFunction<TLfgPersistence["moveUserToRoom"]> = async (
    { em },
    { guildId, userId, roomId },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    const currentPlayer = await em.findOne(LfgRoomPlayer, { userId, room: { guildId } }, { populate: ["room.players"] });
    const leftRoomCode = currentPlayer?.room.code;
    const removalResult = currentPlayer
        ? removePlayerFromRoom({ em }, { room: currentPlayer.room, player: currentPlayer })
        : undefined;
    const player = em.create(LfgRoomPlayer, {
        id: randomUUID(),
        userId,
        room,
    });
    room.players.add(player);
    await em.flush();
    return { room: toLfgRoom(room), leftRoomCode, removalResult };
};
