import type { TLfgPersistence } from "../../application/lfg/types.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const changeRoomCode: TLfgPersistenceFunction<TLfgPersistence["changeRoomCode"]> = async (
    { em },
    { roomId, newCode },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    const oldCode = room.code;
    room.code = newCode;
    await em.flush();
    return { oldCode, newCode };
};
