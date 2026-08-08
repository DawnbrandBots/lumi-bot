import type { TLfgPersistence } from "../../application/lfg/types.ts";
import { getRoomEntityById } from "./getRoomEntityById.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const disbandRoom: TLfgPersistenceFunction<TLfgPersistence["disbandRoom"]> = async ({ em }, { roomId }) => {
    const room = await getRoomEntityById({ em }, { roomId });
    const result = { userId: room.ownerId, code: room.code };
    em.remove(room.players);
    em.remove(room);
    await em.flush();
    return result;
};
