import type { TLfgPersistence } from "../../../application/lfg/persistence.types.ts";
import { mapToLfgRoomDomainModel } from "../../wrappers/orm/mikroOrm/mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoom } from "../../wrappers/orm/mikroOrm/models/lfg/room.ts";
import type { TLfgPersistenceFunction } from "./types.ts";

export const listRooms: TLfgPersistenceFunction<TLfgPersistence["listRooms"]> = async ({ em }, { guildId }) => {
    const rooms = await em.find(LfgRoom, { guildId }, { orderBy: { createdAt: "asc" }, populate: ["players"] });
    return rooms.map((room) => mapToLfgRoomDomainModel(room));
};
