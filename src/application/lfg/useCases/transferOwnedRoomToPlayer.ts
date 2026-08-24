import type { TLfgUseCaseBase } from "../types.ts";

export const transferOwnedRoomToPlayer: TLfgUseCaseBase<
    "transferOwnedRoomToPlayer",
    "services.getOwnedRoom" | "services.transferRoom"
> = async function (dependencies, { guildId, owner, target }) {
    const result = await dependencies.services.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return dependencies.services.transferRoom({ guildId, room: result.value.room, target });
};
