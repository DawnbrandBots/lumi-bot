import type { TLfgPersistence } from "../../../../../application/lfg/types.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const setRoomOwner: TLfgPersistenceFunction<TLfgPersistence["setRoomOwner"]> = async (
    { em },
    { roomId, ownerId },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    room.ownerId = ownerId;
    return toLfgRoom(room);
};
