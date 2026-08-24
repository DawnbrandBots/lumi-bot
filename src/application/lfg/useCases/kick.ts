import { ELfgResultKind } from "../types.ts";
import type { TKickFromLfgRoomByCodeArg, TLfgUseCaseDependencies } from "../types.ts";

export async function kick(
    dependencies: TLfgUseCaseDependencies,
    { guildId, code, target }: TKickFromLfgRoomByCodeArg,
) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return dependencies.services.kickFromRoom({ guildId, room, target });
}
