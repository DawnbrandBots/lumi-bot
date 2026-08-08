import { LfgRoom } from "../../lfg/models/room.ts";
import type { TLfgPersistence } from "../../application/lfg/types.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const findRoomByCode: TLfgPersistenceFunction<TLfgPersistence["findRoomByCode"]> = async (
    { em },
    { guildId, code },
) => {
    const room = await em.findOne(LfgRoom, { guildId, code }, { populate: ["players"] });
    return room ? toLfgRoom(room) : null;
};
