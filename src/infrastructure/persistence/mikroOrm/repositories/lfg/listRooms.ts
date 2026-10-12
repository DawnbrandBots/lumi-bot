import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { AMOUNT_OF_PLAYERS_IN_A_BATTLE } from "../../../../../domain/game/constants.ts";
import { toLfgRoom } from "../../mappers/toLfgRoom.ts";
import { LfgRoom } from "../../models/lfg/room.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const listRooms: TLfgRepositoryFunction<TLfgRepository["listRooms"]> = async (
    { em },
    { guildId, omitFullRooms },
) => {
    const rooms = await em.find(
        LfgRoom,
        {
            $and: [{ guildId }, omitFullRooms && { players: { $size: { $lt: AMOUNT_OF_PLAYERS_IN_A_BATTLE } } }].filter(
                (a) => !!a,
            ),
        },
        { orderBy: { createdAt: "asc" }, populate: ["players"] },
    );
    return rooms.map((room) => toLfgRoom(room));
};
