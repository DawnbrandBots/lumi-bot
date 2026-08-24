import { ELfgResultKind } from "../types.ts";
import { isInvalidRoomCode } from "../services/isInvalidRoomCode.ts";
import type { TLfgUseCaseArgs, TLfgUseCaseDependencies } from "../types.ts";

export async function create(
    dependencies: TLfgUseCaseDependencies,
    { guildId, owner, code }: TLfgUseCaseArgs["create"],
) {
    if (isInvalidRoomCode(code)) {
        return { kind: ELfgResultKind.INVALID_ROOM_CODE } as const;
    }

    const currentRoom = await dependencies.persistence.findRoomByUser({ guildId, userId: owner.id });
    if (currentRoom) {
        return { kind: ELfgResultKind.ALREADY_IN_A_ROOM, value: { userId: owner.id } } as const;
    }

    const existingRoom = await dependencies.persistence.findRoomByCode({ guildId, code });
    if (existingRoom) {
        return { kind: ELfgResultKind.ROOM_ALREADY_EXISTS, value: { code } } as const;
    }

    const room = await dependencies.persistence.createRoom({ guildId, ownerId: owner.id, code });
    return {
        kind: ELfgResultKind.ROOM_CREATED,
        value: { userId: owner.id, room },
    } as const;
}
