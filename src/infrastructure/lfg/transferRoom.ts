import type { TLfgPersistence } from "../../application/lfg/types.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const transferRoom: TLfgPersistenceFunction<TLfgPersistence["transferRoom"]> = async (
    { em },
    { roomId, targetId },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    room.ownerId = targetId;
    await em.flush();
    return toLfgRoom(room);
};
