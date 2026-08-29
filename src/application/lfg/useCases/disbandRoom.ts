import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const disbandRoom: TLfgUseCaseBase<
    "disbandRoom",
    "persistence.lfg.findRoomByCode" | "persistence.lfg.removeRoom"
> = async function (dependencies, { guildId, code }) {
    const room = await dependencies.persistence.lfg.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    await dependencies.persistence.lfg.removeRoom({ roomId: room.id });
    return { kind: ELfgResultKind.ROOM_DISBANDED, value: { userId: room.ownerId, code: room.code } } as const;
};
