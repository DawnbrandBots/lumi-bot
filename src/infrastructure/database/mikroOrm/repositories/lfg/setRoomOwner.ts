import type { TLfgPersistence } from "../../../../../application/lfg/types.ts";
import { mapToLfgRoomDomainModel } from "../../mappers/mapToLfgRoomDomainModel.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const setRoomOwner: TLfgPersistenceFunction<TLfgPersistence["setRoomOwner"]> = async (
    { em },
    { roomId, ownerId },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    room.ownerId = ownerId;
    return mapToLfgRoomDomainModel(room);
};
