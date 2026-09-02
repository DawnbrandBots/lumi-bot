import { AMOUNT_OF_PLAYERS_IN_A_BATTLE } from "../../../domain/game/constants.ts";
import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const movePlayerToRoom: TLfgUseCaseBase<
    "movePlayerToRoom",
    | "repositories.lfg.findRoomByCode"
    | "repositories.lfg.findRoomByUser"
    | "repositories.lfg.moveUserToRoom"
    | "services.removePlayerFromRoom"
> = async function (dependencies, { guildId, user, code }) {
    const room = await dependencies.repositories.lfg.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }

    const currentRoom = await dependencies.repositories.lfg.findRoomByUser({ guildId, userId: user.id });
    if (currentRoom?.id === room.id) {
        return {
            kind: ELfgResultKind.ALREADY_IN_TARGET_ROOM,
            value: { userId: user.id, room },
        } as const;
    }

    if (room.playerIds.length >= AMOUNT_OF_PLAYERS_IN_A_BATTLE) {
        return { kind: ELfgResultKind.ROOM_IS_FULL, value: { code } } as const;
    }

    const leftRoomCode = currentRoom?.code;
    const removalResult = currentRoom
        ? await dependencies.services.removePlayerFromRoom({ room: currentRoom, userId: user.id })
        : undefined;
    const updatedRoom = await dependencies.repositories.lfg.moveUserToRoom({ roomId: room.id, userId: user.id });

    return {
        kind: ELfgResultKind.ROOM_JOINED,
        value: { userId: user.id, room: updatedRoom, leftRoomCode, removalResult },
    } as const;
};
