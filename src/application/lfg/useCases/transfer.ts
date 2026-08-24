import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function transfer(
    dependencies: TLfgUseCaseDependencies,
    { guildId, code, target }: TLfgUseCaseArgs["transfer"],
) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return dependencies.services.transferRoom({ guildId, room, target });
}
