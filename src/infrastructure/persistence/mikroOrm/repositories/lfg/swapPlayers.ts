import { randomUUID } from "node:crypto";
import type { TLfgRepository } from "../../../../../application/lfg/repositories.types.ts";
import { LfgRoomPlayer } from "../../models/lfg/roomPlayer.ts";
import type { TLfgRepositoryFunction } from "./types.ts";

export const swapPlayers: TLfgRepositoryFunction<TLfgRepository["swapPlayers"]> = async (
    { em },
    { guildId, firstUserId, secondUserId },
) => {
    const firstPlayer = await em.findOne(
        LfgRoomPlayer,
        { userId: firstUserId, room: { guildId } },
        { populate: ["room"] },
    );
    const secondPlayer = await em.findOne(
        LfgRoomPlayer,
        { userId: secondUserId, room: { guildId } },
        { populate: ["room"] },
    );
    const firstRoom = firstPlayer?.room;
    const secondRoom = secondPlayer?.room;
    const firstOwnerLeaves = firstRoom?.ownerId === firstUserId;
    const secondOwnerLeaves = secondRoom?.ownerId === secondUserId;
    const firstNextOwner = firstOwnerLeaves
        ? await em.findOne(
              LfgRoomPlayer,
              { room: { id: firstRoom.id }, userId: { $ne: firstUserId } },
              { orderBy: { joinedAt: "asc" } },
          )
        : null;
    const secondNextOwner = secondOwnerLeaves
        ? await em.findOne(
              LfgRoomPlayer,
              { room: { id: secondRoom.id }, userId: { $ne: secondUserId } },
              { orderBy: { joinedAt: "asc" } },
          )
        : null;

    if (firstPlayer && secondRoom) firstPlayer.room = secondRoom;
    else if (firstPlayer) em.remove(firstPlayer);
    if (secondPlayer && firstRoom) secondPlayer.room = firstRoom;
    else if (secondPlayer) em.remove(secondPlayer);
    if (!firstPlayer && secondRoom) {
        em.create(LfgRoomPlayer, { id: randomUUID(), userId: firstUserId, room: secondRoom });
    }
    if (!secondPlayer && firstRoom) {
        em.create(LfgRoomPlayer, { id: randomUUID(), userId: secondUserId, room: firstRoom });
    }

    if (firstRoom && firstOwnerLeaves) {
        firstRoom.ownerId = firstNextOwner?.userId ?? secondUserId;
    }
    if (secondRoom && secondOwnerLeaves) {
        secondRoom.ownerId = secondNextOwner?.userId ?? firstUserId;
    }
    return [
        ...(firstRoom && firstOwnerLeaves ? [{ roomCode: firstRoom.code, newOwnerId: firstRoom.ownerId }] : []),
        ...(secondRoom && secondOwnerLeaves ? [{ roomCode: secondRoom.code, newOwnerId: secondRoom.ownerId }] : []),
    ];
};
