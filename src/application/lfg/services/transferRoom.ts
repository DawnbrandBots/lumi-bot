import { ELfgResultKind } from "../types.ts";
import type { TLfgServiceBase } from "../types.ts";

export const transferRoom: TLfgServiceBase<
    "transferRoom",
    "persistence.lfg.findRoomByUser" | "persistence.lfg.setRoomOwner"
> = async function (dependencies, { guildId, room, target }) {
    const previousOwnerId = room.ownerId;
    if (previousOwnerId === target.id) {
        return {
            kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
            value: { userId: previousOwnerId, code: room.code },
        } as const;
    }

    const targetRoom = await dependencies.persistence.lfg.findRoomByUser({ guildId, userId: target.id });
    if (targetRoom?.id !== room.id) {
        return {
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: previousOwnerId, targetId: target.id, code: room.code },
        } as const;
    }

    const updatedRoom = await dependencies.persistence.lfg.setRoomOwner({ roomId: room.id, ownerId: target.id });
    return {
        kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
        value: { userId: previousOwnerId, targetId: target.id, room: updatedRoom },
    } as const;
};
