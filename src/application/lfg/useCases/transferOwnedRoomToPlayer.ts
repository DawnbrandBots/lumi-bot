import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function transferOwnedRoomToPlayer(
    dependencies: TLfgUseCaseDependencies,
    { guildId, owner, target }: TLfgUseCaseArgs["transferOwnedRoomToPlayer"],
) {
    const result = await dependencies.services.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return dependencies.services.transferRoom({ guildId, room: result.value.room, target });
}
