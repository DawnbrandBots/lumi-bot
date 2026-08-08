import type { TLfgPersistence } from "../../application/lfg/types.ts";
import { LfgRoomPlayer } from "../../lfg/models/roomPlayer.ts";
import { removePlayerFromRoom } from "./removePlayerFromRoom.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const leaveRoom: TLfgPersistenceFunction<TLfgPersistence["leaveRoom"]> = async ({ em }, { guildId, userId }) => {
    const player = await em.findOne(LfgRoomPlayer, { userId, room: { guildId } }, { populate: ["room.players"] });
    if (!player) {
        throw new Error(`LFG room player not found: ${userId}`);
    }
    const code = player.room.code;
    const removalResult = removePlayerFromRoom({ em }, { room: player.room, player });
    await em.flush();
    return { ...removalResult, code };
};
