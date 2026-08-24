import { ELfgResultKind } from "../types.ts";
import type { TLfgServiceBase } from "../types.ts";

export const getOwnedRoom: TLfgServiceBase<"getOwnedRoom", "persistence.findRoomByUser"> = async function (
    dependencies,
    { guildId, owner },
) {
    const room = await dependencies.persistence.findRoomByUser({ guildId, userId: owner.id });
    if (!room) {
        return { success: false, value: { kind: ELfgResultKind.NOT_IN_A_ROOM } };
    }
    if (room.ownerId !== owner.id) {
        return { success: false, value: { kind: ELfgResultKind.NOT_ROOM_OWNER } };
    }
    return { success: true, value: { room } };
};
