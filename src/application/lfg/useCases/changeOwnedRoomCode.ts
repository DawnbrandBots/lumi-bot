import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function changeOwnedRoomCode(
    dependencies: TLfgUseCaseDependencies,
    { guildId, owner, newCode }: TLfgUseCaseArgs["changeOwnedRoomCode"],
) {
    const result = await dependencies.services.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return dependencies.services.changeRoomCodeInRoom({ guildId, room: result.value.room, newCode });
}
