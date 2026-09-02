import type { TLfgPersistence } from "../../../application/lfg/persistence.types.ts";
import { mapToLfgRoomDomainModel } from "../../wrappers/orm/mikroOrm/mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoomPlayer } from "../../wrappers/orm/mikroOrm/models/lfg/roomPlayer.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const findRoomByUser: TLfgPersistenceFunction<TLfgPersistence["findRoomByUser"]> = async (
    { em },
    { guildId, userId },
) => {
    const player = await em.findOne(LfgRoomPlayer, { userId, room: { guildId } }, { populate: ["room.players"] });
    return player ? mapToLfgRoomDomainModel(player.room) : null;
};
