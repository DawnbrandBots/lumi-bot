import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const kickPlayerFromRoom: TLfgUseCaseBase<
    "kickPlayerFromRoom",
    "repositories.lfg.findRoomByCode" | "services.kickFromRoom"
> = async function (dependencies, { guildId, code, target }) {
    const room = await dependencies.repositories.lfg.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return dependencies.services.kickFromRoom({ guildId, room, target });
};
