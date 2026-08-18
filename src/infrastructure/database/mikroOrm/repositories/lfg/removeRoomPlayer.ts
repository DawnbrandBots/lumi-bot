import type { TLfgPersistence } from "../../../../../application/lfg/types.ts";
import { LfgRoomPlayer } from "../../models/lfg/roomPlayer.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const removeRoomPlayer: TLfgPersistenceFunction<TLfgPersistence["removeRoomPlayer"]> = async (
    { em },
    { roomId, userId },
) => {
    const player = await em.findOne(LfgRoomPlayer, { userId, room: { id: roomId } });
    if (!player) {
        throw new Error(`LFG room player not found: ${userId}`);
    }
    em.remove(player);
};
