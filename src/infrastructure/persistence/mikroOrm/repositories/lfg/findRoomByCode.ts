import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { toLfgRoom } from "../../mappers/toLfgRoom.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const findRoomByCode: TLfgRepositoryFunction<TLfgRepository["findRoomByCode"]> = async (
    { em },
    { guildId, code },
) => {
    const room = await em.findOne(LfgRoom, { guildId, code }, { populate: ["players"] });
    return room ? toLfgRoom(room) : null;
};
