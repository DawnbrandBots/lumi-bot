import { LfgRoomPlayer } from "../../lfg/models/roomPlayer.ts";
import type { TLfgPersistence } from "../../application/lfg/types.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const findRoomByUser: TLfgPersistenceFunction<TLfgPersistence["findRoomByUser"]> = async (
    { em },
    { guildId, userId },
) => {
    const player = await em.findOne(LfgRoomPlayer, { userId, room: { guildId } }, { populate: ["room.players"] });
    return player ? toLfgRoom(player.room) : null;
};
