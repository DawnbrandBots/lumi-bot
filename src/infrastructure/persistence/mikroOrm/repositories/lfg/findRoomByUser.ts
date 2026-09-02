import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { mapToLfgRoomDomainModel } from "../../mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoomPlayer } from "../../models/lfg/roomPlayer.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const findRoomByUser: TLfgRepositoryFunction<TLfgRepository["findRoomByUser"]> = async (
    { em },
    { guildId, userId },
) => {
    const player = await em.findOne(LfgRoomPlayer, { userId, room: { guildId } }, { populate: ["room.players"] });
    return player ? mapToLfgRoomDomainModel(player.room) : null;
};
