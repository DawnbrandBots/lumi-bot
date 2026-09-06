import type { TLfgUseCaseBase } from "../types.ts";
import { ELfgResultKind } from "../types.ts";

export const movePlayerToRoomById: TLfgUseCaseBase<
    "movePlayerToRoomById",
    "repositories.lfg.findRoomById" | "services.movePlayerToExistingRoom"
> = async function (dependencies, { guildId, user, roomId }) {
    const room = await dependencies.repositories.lfg.findRoomById({ guildId, roomId });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: {} } as const;
    }

    return dependencies.services.movePlayerToExistingRoom({ guildId, user, room });
};
