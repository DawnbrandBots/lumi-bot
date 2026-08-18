import type { TLfgPersistence } from "../../../../../application/lfg/types.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import { toLfgRoom } from "./toLfgRoom.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const findRoomByCode: TLfgPersistenceFunction<TLfgPersistence["findRoomByCode"]> = async (
    { em },
    { guildId, code },
) => {
    const room = await em.findOne(LfgRoom, { guildId, code }, { populate: ["players"] });
    return room ? toLfgRoom(room) : null;
};
