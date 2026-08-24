import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function disbandOwnedRoom(
    dependencies: TLfgUseCaseDependencies,
    { guildId, owner }: TLfgUseCaseArgs["disbandOwnedRoom"],
) {
    const result = await dependencies.services.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    await dependencies.persistence.removeRoom({ roomId: result.value.room.id });
    return {
        kind: ELfgResultKind.ROOM_DISBANDED,
        value: { userId: result.value.room.ownerId, code: result.value.room.code },
    } as const;
}
