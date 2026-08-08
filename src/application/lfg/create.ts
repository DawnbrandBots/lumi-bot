import { ELfgFeatureReturnKind } from "../../lfg/types.ts";
import { isInvalidRoomCode } from "./isInvalidRoomCode.ts";
import type { TCreateLfgRoom, TFindLfgRoomByCode, TFindLfgRoomByUser, TLfgFeature } from "./types.ts";

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
    { guildId, owner, code }: Parameters<TLfgFeature["create"]>[0],
) {
    if (isInvalidRoomCode(code)) {
        return { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE } as const;
    }

    const currentRoom = await findRoomByUser({ guildId, userId: owner.id });
    if (currentRoom) {
        return { kind: ELfgFeatureReturnKind.ALREADY_IN_A_ROOM, value: { userId: owner.id } } as const;
    }

    const existingRoom = await findRoomByCode({ guildId, code });
    if (existingRoom) {
        return { kind: ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS, value: { code } } as const;
    }

    const room = await createRoom({ guildId, ownerId: owner.id, code });
    return {
        kind: ELfgFeatureReturnKind.ROOM_CREATED,
        value: { userId: owner.id, room },
    } as const;
}
