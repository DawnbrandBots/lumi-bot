import { randomUUID } from "node:crypto";
import type { TLfgPersistence } from "../../../application/lfg/persistence.types.ts";
import { mapToLfgRoomDomainModel } from "../../wrappers/orm/mikroOrm/mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoomPlayer } from "../../wrappers/orm/mikroOrm/models/lfg/roomPlayer.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const moveUserToRoom: TLfgPersistenceFunction<TLfgPersistence["moveUserToRoom"]> = async (
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
