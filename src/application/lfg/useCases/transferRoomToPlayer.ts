import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const transferRoomToPlayer: TLfgUseCaseBase<
    "transferRoomToPlayer",
    "persistence.findRoomByCode" | "services.transferRoom"
> = async function (dependencies, { guildId, code, target }) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return dependencies.services.transferRoom({ guildId, room, target });
};
