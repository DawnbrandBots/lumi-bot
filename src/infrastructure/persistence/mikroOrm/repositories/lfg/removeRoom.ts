import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const removeRoom: TLfgRepositoryFunction<TLfgRepository["removeRoom"]> = async ({ em }, { roomId }) => {
    const room = await getRoomEntityById({ em }, { roomId });
    em.remove(room.players);
    em.remove(room);
};
