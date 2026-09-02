import { randomUUID } from "node:crypto";
import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { mapToLfgRoomDomainModel } from "../../mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import { LfgRoomPlayer } from "../../models/lfg/roomPlayer.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const createRoom: TLfgRepositoryFunction<TLfgRepository["createRoom"]> = (
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
