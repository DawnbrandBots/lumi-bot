import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function leave(dependencies: TLfgUseCaseDependencies, { guildId, user }: TLfgUseCaseArgs["leave"]) {
    const room = await dependencies.persistence.findRoomByUser({ guildId, userId: user.id });
    if (!room) {
        return { kind: ELfgResultKind.NOT_IN_A_ROOM } as const;
    }

    const removalResult = await dependencies.services.removePlayerFromRoom({ room, userId: user.id });
    return {
        kind: ELfgResultKind.ROOM_LEFT,
        value: { ...removalResult, code: room.code, userId: user.id },
    } as const;
}
