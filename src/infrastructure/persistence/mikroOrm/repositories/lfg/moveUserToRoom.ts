import { randomUUID } from "node:crypto";
import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { mapToLfgRoomDomainModel } from "../../mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoomPlayer } from "../../models/lfg/roomPlayer.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const moveUserToRoom: TLfgRepositoryFunction<TLfgRepository["moveUserToRoom"]> = async (
    { em },
    { roomId, userId },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    const player = em.create(LfgRoomPlayer, {
        id: randomUUID(),
        userId,
        room,
    });
    room.players.add(player);
    return mapToLfgRoomDomainModel(room);
};
