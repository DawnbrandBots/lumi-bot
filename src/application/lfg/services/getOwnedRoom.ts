import type { TFindLfgRoomByUser, TGetOwnedLfgRoom } from "../types.ts";
import type { IUser } from "../../../domain/lfg/models/user.types.ts";
import { ELfgFeatureReturnKind } from "../types.ts";

export async function getOwnedRoom(
    { findRoomByUser }: { readonly findRoomByUser: TFindLfgRoomByUser },
    { guildId, owner }: { readonly guildId: string; readonly owner: IUser },
): Promise<Awaited<ReturnType<TGetOwnedLfgRoom>>> {
    const room = await findRoomByUser({ guildId, userId: owner.id });
    if (!room) {
        return { success: false, value: { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } };
    }
    if (room.ownerId !== owner.id) {
        return { success: false, value: { kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER } };
    }
    return { success: true, value: { room } };
}
