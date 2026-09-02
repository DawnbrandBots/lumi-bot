import type { TLfgPersistence } from "../../../application/lfg/persistence.types.ts";
import { mapToLfgRoomDomainModel } from "../../wrappers/orm/mikroOrm/mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoom } from "../../wrappers/orm/mikroOrm/models/lfg/room.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const findRoomByCode: TLfgPersistenceFunction<TLfgPersistence["findRoomByCode"]> = async (
    { em },
    { guildId, code },
) => {
    const room = await em.findOne(LfgRoom, { guildId, code }, { populate: ["players"] });
    return room ? mapToLfgRoomDomainModel(room) : null;
};
