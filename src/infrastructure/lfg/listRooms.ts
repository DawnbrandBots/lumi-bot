import { LfgRoom } from "../../lfg/models/room.ts";
import type { TLfgPersistence } from "../../application/lfg/types.ts";
import type { TLfgPersistenceFunction } from "./types.ts";
import { toLfgRoom } from "./toLfgRoom.ts";

export const listRooms: TLfgPersistenceFunction<TLfgPersistence["listRooms"]> = async ({ em }, { guildId }) => {
    const rooms = await em.find(LfgRoom, { guildId }, { orderBy: { createdAt: "asc" }, populate: ["players"] });
    return rooms.map((room) => toLfgRoom(room));
};
