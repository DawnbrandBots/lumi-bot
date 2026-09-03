import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { LfgRoomPlayer } from "../../models/lfg/roomPlayer.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const removeRoomPlayer: TLfgRepositoryFunction<TLfgRepository["removeRoomPlayer"]> = async (
    { em },
    { roomId, userId },
) => {
    const player = await em.findOne(LfgRoomPlayer, { userId, room: { id: roomId } });
    if (!player) {
        throw new Error(`LFG room player not found: ${userId}`);
    }
    em.remove(player);
};
