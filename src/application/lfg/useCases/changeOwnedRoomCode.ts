import type { TLfgUseCaseBase } from "../types.ts";

export const changeOwnedRoomCode: TLfgUseCaseBase<
    "changeOwnedRoomCode",
    "services.getOwnedRoom" | "services.changeRoomCodeInRoom"
> = async function (dependencies, { guildId, owner, newCode }) {
    const result = await dependencies.services.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return dependencies.services.changeRoomCodeInRoom({ guildId, room: result.value.room, newCode });
};
