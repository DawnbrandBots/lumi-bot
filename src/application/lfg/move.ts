import { AMOUNT_OF_PLAYERS_IN_A_BATTLE } from "../../domain/game/constants.ts";
import { ELfgFeatureReturnKind } from "../../lfg/types.ts";
import type { TFindLfgRoomByCode, TFindLfgRoomByUser, TLfgFeature, TMoveUserToLfgRoom } from "./types.ts";

export async function move(
    {
        findRoomByCode,
        findRoomByUser,
        moveUserToRoom,
    }: {
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly moveUserToRoom: TMoveUserToLfgRoom;
    },
    { guildId, user, code }: Parameters<TLfgFeature["move"]>[0],
) {
    const room = await findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }

    const currentRoom = await findRoomByUser({ guildId, userId: user.id });
    if (currentRoom?.id === room.id) {
        return {
            kind: ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM,
            value: { userId: user.id, room },
        } as const;
    }

    if (room.playerIds.length >= AMOUNT_OF_PLAYERS_IN_A_BATTLE) {
        return { kind: ELfgFeatureReturnKind.ROOM_IS_FULL, value: { code } } as const;
    }

    const result = await moveUserToRoom({ guildId, userId: user.id, roomId: room.id });
    return {
        kind: ELfgFeatureReturnKind.ROOM_JOINED,
        value: { userId: user.id, ...result },
    } as const;
}
