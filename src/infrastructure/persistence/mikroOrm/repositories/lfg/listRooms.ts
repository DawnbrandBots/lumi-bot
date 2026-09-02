import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { mapToLfgRoomDomainModel } from "../../mappers/mapToLfgRoomDomainModel.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const listRooms: TLfgRepositoryFunction<TLfgRepository["listRooms"]> = async ({ em }, { guildId }) => {
    const rooms = await em.find(LfgRoom, { guildId }, { orderBy: { createdAt: "asc" }, populate: ["players"] });
    return rooms.map((room) => mapToLfgRoomDomainModel(room));
};
