import type { TLfgRoom, TFindLfgRoomByUser } from "./types.ts";
import type { IUser, TLfgFeatureReturnOfKind } from "../../lfg/types.ts";
import { ELfgFeatureReturnKind } from "../../lfg/types.ts";

export async function getOwnedRoom(
    { findRoomByUser }: { readonly findRoomByUser: TFindLfgRoomByUser },
    { guildId, owner }: { readonly guildId: string; readonly owner: IUser },
): Promise<TLfgRoom | TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.NOT_IN_A_ROOM | ELfgFeatureReturnKind.NOT_ROOM_OWNER>> {
    const room = await findRoomByUser({ guildId, userId: owner.id });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM };
    }
    if (room.ownerId !== owner.id) {
        return { kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER };
    }
    return room;
}
