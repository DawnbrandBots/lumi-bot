import type { TLfgPersistence } from "../../../../../application/lfg/persistence.types.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const removeRoom: TLfgPersistenceFunction<TLfgPersistence["removeRoom"]> = async ({ em }, { roomId }) => {
    const room = await getRoomEntityById({ em }, { roomId });
    em.remove(room.players);
    em.remove(room);
};
