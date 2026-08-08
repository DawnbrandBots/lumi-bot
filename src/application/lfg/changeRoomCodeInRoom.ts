import { ELfgFeatureReturnKind } from "../../lfg/types.ts";
import { isInvalidRoomCode } from "./isInvalidRoomCode.ts";
import type { TChangeLfgRoomCode, TFindLfgRoomByCode, TLfgRoom } from "./types.ts";

export async function changeRoomCodeInRoom(
    {
        changeRoomCode,
        findRoomByCode,
    }: {
        readonly changeRoomCode: TChangeLfgRoomCode;
        readonly findRoomByCode: TFindLfgRoomByCode;
    },
    { guildId, room, newCode }: { readonly guildId: string; readonly room: TLfgRoom; readonly newCode: string },
) {
    if (isInvalidRoomCode(newCode)) {
        return { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE } as const;
    }

    const existingRoom = await findRoomByCode({ guildId, code: newCode });
    if (existingRoom) {
        return { kind: ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS, value: { code: newCode } } as const;
    }

    return {
        kind: ELfgFeatureReturnKind.ROOM_CODE_CHANGED,
        value: await changeRoomCode({ roomId: room.id, newCode }),
    } as const;
}
