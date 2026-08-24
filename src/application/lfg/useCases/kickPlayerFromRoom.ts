import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function kickPlayerFromRoom(
    dependencies: TLfgUseCaseDependencies,
    { guildId, code, target }: TLfgUseCaseArgs["kickPlayerFromRoom"],
) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return dependencies.services.kickFromRoom({ guildId, room, target });
}
