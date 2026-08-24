import { ELfgResultKind } from "../types.ts";
import type { TTransferLfgRoomArg, TLfgUseCaseDependencies } from "../types.ts";

export async function transfer(dependencies: TLfgUseCaseDependencies, { guildId, code, target }: TTransferLfgRoomArg) {
    const room = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return dependencies.services.transferRoom({ guildId, room, target });
}
