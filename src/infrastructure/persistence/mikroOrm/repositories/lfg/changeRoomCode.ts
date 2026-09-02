import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const changeRoomCode: TLfgRepositoryFunction<TLfgRepository["changeRoomCode"]> = async (
    { em },
    { roomId, newCode },
) => {
    const room = await getRoomEntityById({ em }, { roomId });
    const oldCode = room.code;
    room.code = newCode;
    return { oldCode, newCode };
};
