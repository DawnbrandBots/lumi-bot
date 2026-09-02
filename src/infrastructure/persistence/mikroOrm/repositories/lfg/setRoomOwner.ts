import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { toLfgRoom } from "../../mappers/toLfgRoom.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const setRoomOwner: TLfgRepositoryFunction<TLfgRepository["setRoomOwner"]> = async (
    { em },
    { roomId, ownerId },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    room.ownerId = ownerId;
    return toLfgRoom(room);
};
