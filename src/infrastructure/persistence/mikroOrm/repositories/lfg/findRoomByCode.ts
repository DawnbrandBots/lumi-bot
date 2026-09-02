import type { TLfgPersistence } from "../../../../../application/lfg/persistence.types.ts";
import { mapToLfgRoomDomainModel } from "../../mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const findRoomByCode: TLfgPersistenceFunction<TLfgPersistence["findRoomByCode"]> = async (
    { em },
    { guildId, code },
) => {
    const room = await em.findOne(LfgRoom, { guildId, code }, { populate: ["players"] });
    return room ? mapToLfgRoomDomainModel(room) : null;
};
