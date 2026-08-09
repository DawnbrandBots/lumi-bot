import type { IUser } from "../../domain/lfg/models/user.types.ts";
import { ELfgFeatureReturnKind } from "./types.ts";
import type { TFindLfgRoomByUser, TLfgRoom, TTransferLfgRoom } from "./types.ts";

export async function transferRoom(
    {
        findRoomByUser,
        transferRoom: transferRoomInPersistence,
    }: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly transferRoom: TTransferLfgRoom;
    },
    { guildId, room, target }: { readonly guildId: string; readonly room: TLfgRoom; readonly target: IUser },
) {
    const previousOwnerId = room.ownerId;
    if (previousOwnerId === target.id) {
        return {
            kind: ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF,
            value: { userId: previousOwnerId, code: room.code },
        } as const;
    }

    const targetRoom = await findRoomByUser({ guildId, userId: target.id });
    if (targetRoom?.id !== room.id) {
        return {
            kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: previousOwnerId, targetId: target.id, code: room.code },
        } as const;
    }

    const updatedRoom = await transferRoomInPersistence({ roomId: room.id, targetId: target.id });
    return {
        kind: ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED,
        value: { userId: previousOwnerId, targetId: target.id, room: updatedRoom },
    } as const;
}
