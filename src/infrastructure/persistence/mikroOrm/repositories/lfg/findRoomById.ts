import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { toLfgRoom } from "../../mappers/toLfgRoom.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const findRoomById: TLfgRepositoryFunction<TLfgRepository["findRoomById"]> = async (
    { em },
    { guildId, roomId },
) => {
    const room = await em.findOne(LfgRoom, { id: roomId, guildId }, { populate: ["players"] });
    return room ? toLfgRoom(room) : null;
};
