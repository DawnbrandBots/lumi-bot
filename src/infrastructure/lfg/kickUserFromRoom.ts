import type { TLfgPersistence } from "../../application/lfg/types.ts";
import { LfgRoomPlayer } from "./models/roomPlayer.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import { removePlayerFromRoom } from "./removePlayerFromRoom.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const kickUserFromRoom: TLfgPersistenceFunction<TLfgPersistence["kickUserFromRoom"]> = async (
    { em },
    { roomId, targetId },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    const targetPlayer = await em.findOne(LfgRoomPlayer, { userId: targetId, room: { id: roomId } }, { populate: ["room.players"] });
    if (!targetPlayer) {
        throw new Error(`LFG room player not found: ${targetId}`);
    }
    const removalResult = removePlayerFromRoom({ em }, { room, player: targetPlayer });
    const roomSnapshot = toLfgRoom(room, targetId);
    await em.flush();
    return { room: roomSnapshot, removalResult };
};
