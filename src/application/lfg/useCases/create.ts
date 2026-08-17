import { ELfgResultKind } from "../types.ts";
import { isInvalidRoomCode } from "../services/isInvalidRoomCode.ts";
import type { TCreateLfgRoom, TFindLfgRoomByCode, TFindLfgRoomByUser, TCreateLfgRoomArg } from "../types.ts";

export async function create(
    {
        createRoom,
        findRoomByCode,
        findRoomByUser,
    }: {
        readonly createRoom: TCreateLfgRoom;
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly findRoomByUser: TFindLfgRoomByUser;
    },
    { guildId, owner, code }: TCreateLfgRoomArg,
) {
    if (isInvalidRoomCode(code)) {
        return { kind: ELfgResultKind.INVALID_ROOM_CODE } as const;
    }

    const currentRoom = await findRoomByUser({ guildId, userId: owner.id });
    if (currentRoom) {
        return { kind: ELfgResultKind.ALREADY_IN_A_ROOM, value: { userId: owner.id } } as const;
    }

    const existingRoom = await findRoomByCode({ guildId, code });
    if (existingRoom) {
        return { kind: ELfgResultKind.ROOM_ALREADY_EXISTS, value: { code } } as const;
    }

    const room = await createRoom({ guildId, ownerId: owner.id, code });
    return {
        kind: ELfgResultKind.ROOM_CREATED,
        value: { userId: owner.id, room },
    } as const;
}
