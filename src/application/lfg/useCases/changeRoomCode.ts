import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function changeRoomCode(
    dependencies: TLfgUseCaseDependencies,
    { guildId, code, newCode }: TLfgUseCaseArgs["changeRoomCode"],
) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return dependencies.services.changeRoomCodeInRoom({ guildId, room, newCode });
}
