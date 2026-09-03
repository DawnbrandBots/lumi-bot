import { isValidRoomCode } from "../../../domain/lfg/rules/room.ts";
import type { TLfgUseCaseBase } from "../types.ts";
import { ELfgResultKind } from "../types.ts";

export const createRoom: TLfgUseCaseBase<
    "createRoom",
    "repositories.lfg.findRoomByUser" | "repositories.lfg.findRoomByCode" | "repositories.lfg.createRoom"
> = async function (dependencies, { guildId, owner, code }) {
    if (!isValidRoomCode(code)) {
        return { kind: ELfgResultKind.INVALID_ROOM_CODE } as const;
    }

    const currentRoom = await dependencies.repositories.lfg.findRoomByUser({ guildId, userId: owner.id });
    if (currentRoom) {
        return { kind: ELfgResultKind.ALREADY_IN_A_ROOM, value: { userId: owner.id } } as const;
    }

    const existingRoom = await dependencies.repositories.lfg.findRoomByCode({ guildId, code });
    if (existingRoom) {
        return { kind: ELfgResultKind.ROOM_ALREADY_EXISTS, value: { code } } as const;
    }

    const room = await dependencies.repositories.lfg.createRoom({ guildId, ownerId: owner.id, code });
    return {
        kind: ELfgResultKind.ROOM_CREATED,
        value: { userId: owner.id, room },
    } as const;
};
