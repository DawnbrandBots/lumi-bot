import { AMOUNT_OF_PLAYERS_IN_A_BATTLE } from "../../../domain/game/constants.ts";
import { ELfgResultKind } from "../types.ts";
import type {
    TFindLfgRoomByCode,
    TFindLfgRoomByUser,
    TMoveLfgUserArg,
    TMoveUserToLfgRoom,
    TRemovePlayerFromLfgRoom,
} from "../types.ts";

export async function move(
    {
        findRoomByCode,
        findRoomByUser,
        moveUserToRoom,
        removePlayerFromRoom,
    }: {
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly moveUserToRoom: TMoveUserToLfgRoom;
        readonly removePlayerFromRoom: TRemovePlayerFromLfgRoom;
    },
    { guildId, user, code }: TMoveLfgUserArg,
) {
    const room = await findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }

    const currentRoom = await findRoomByUser({ guildId, userId: user.id });
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
    const removalResult = currentRoom ? await removePlayerFromRoom({ room: currentRoom, userId: user.id }) : undefined;
    const updatedRoom = await moveUserToRoom({ roomId: room.id, userId: user.id });

    return {
        kind: ELfgResultKind.ROOM_JOINED,
        value: { userId: user.id, room: updatedRoom, leftRoomCode, removalResult },
    } as const;
}
