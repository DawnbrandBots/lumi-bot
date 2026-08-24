import { AMOUNT_OF_PLAYERS_IN_A_BATTLE } from "../../../domain/game/constants.ts";
import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function movePlayerToRoom(
    dependencies: TLfgUseCaseDependencies,
    { guildId, user, code }: TLfgUseCaseArgs["movePlayerToRoom"],
) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }

    const currentRoom = await dependencies.persistence.findRoomByUser({ guildId, userId: user.id });
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
    const updatedRoom = await dependencies.persistence.moveUserToRoom({ roomId: room.id, userId: user.id });

    return {
        kind: ELfgResultKind.ROOM_JOINED,
        value: { userId: user.id, room: updatedRoom, leftRoomCode, removalResult },
    } as const;
}
