import { randomUUID } from "node:crypto";
import type { TLfgPersistence } from "../../../application/lfg/persistence.types.ts";
import { mapToLfgRoomDomainModel } from "../../wrappers/orm/mikroOrm/mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoom } from "../../wrappers/orm/mikroOrm/models/lfg/room.ts";
import { LfgRoomPlayer } from "../../wrappers/orm/mikroOrm/models/lfg/roomPlayer.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const createRoom: TLfgPersistenceFunction<TLfgPersistence["createRoom"]> = (
    { em },
    { guildId, ownerId, code },
) => {
    const room = em.create(LfgRoom, {
        id: randomUUID(),
        guildId,
        code,
        ownerId,
    });
    const player = em.create(LfgRoomPlayer, {
        id: randomUUID(),
        userId: ownerId,
        room,
    });
    room.players.add(player);
    return mapToLfgRoomDomainModel(room);
};
