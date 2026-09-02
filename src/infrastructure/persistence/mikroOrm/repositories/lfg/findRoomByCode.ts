import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { mapToLfgRoomDomainModel } from "../../mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const findRoomByCode: TLfgRepositoryFunction<TLfgRepository["findRoomByCode"]> = async (
    { em },
    { guildId, code },
) => {
    const room = await em.findOne(LfgRoom, { guildId, code }, { populate: ["players"] });
    return room ? mapToLfgRoomDomainModel(room) : null;
};
