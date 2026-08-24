import { ELfgResultKind } from "../types.ts";
import { isInvalidRoomCode } from "./isInvalidRoomCode.ts";
import type { TLfgServiceBase } from "../types.ts";

export const changeRoomCodeInRoom: TLfgServiceBase<
    "changeRoomCodeInRoom",
    "persistence.changeRoomCode" | "persistence.findRoomByCode"
> = async function (dependencies, { guildId, room, newCode }) {
    if (isInvalidRoomCode(newCode)) {
        return { kind: ELfgResultKind.INVALID_ROOM_CODE } as const;
    }

    const existingRoom = await dependencies.persistence.findRoomByCode({ guildId, code: newCode });
    if (existingRoom) {
        return { kind: ELfgResultKind.ROOM_ALREADY_EXISTS, value: { code: newCode } } as const;
    }

    return {
        kind: ELfgResultKind.ROOM_CODE_CHANGED,
        value: await dependencies.persistence.changeRoomCode({ roomId: room.id, newCode }),
    } as const;
};
