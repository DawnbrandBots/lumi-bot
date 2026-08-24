import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function disbandRoom(
    dependencies: TLfgUseCaseDependencies,
    { guildId, code }: TLfgUseCaseArgs["disbandRoom"],
) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    await dependencies.persistence.removeRoom({ roomId: room.id });
    return { kind: ELfgResultKind.ROOM_DISBANDED, value: { userId: room.ownerId, code: room.code } } as const;
}
