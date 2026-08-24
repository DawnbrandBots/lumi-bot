import { ELfgResultKind } from "../types.ts";
import type { TKickFromOwnedLfgRoomArg, TLfgUseCaseDependencies } from "../types.ts";

export async function kickFromOwnedRoom(
    dependencies: TLfgUseCaseDependencies,
    { guildId, owner, target }: TKickFromOwnedLfgRoomArg,
) {
    const result = await dependencies.services.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    if (owner.id === target.id) {
        return { kind: ELfgResultKind.CANNOT_KICK_YOURSELF } as const;
    }
    return dependencies.services.kickFromRoom({ guildId, room: result.value.room, target });
}
