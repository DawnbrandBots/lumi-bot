import type { TLfgUseCaseBase } from "../types.ts";
import { ELfgResultKind } from "../types.ts";

export const movePlayerToRoomByCode: TLfgUseCaseBase<
    "movePlayerToRoomByCode",
    "repositories.lfg.findRoomByCode" | "services.movePlayerToExistingRoom"
> = async function (dependencies, { guildId, user, code }) {
    const room = await dependencies.repositories.lfg.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }

    return dependencies.services.movePlayerToExistingRoom({ guildId, user, room });
};
