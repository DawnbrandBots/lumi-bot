import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const changeRoomCode: TLfgUseCaseBase<
    "changeRoomCode",
    "persistence.findRoomByCode" | "services.changeRoomCodeInRoom"
> = async function (dependencies, { guildId, code, newCode }) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return dependencies.services.changeRoomCodeInRoom({ guildId, room, newCode });
};
