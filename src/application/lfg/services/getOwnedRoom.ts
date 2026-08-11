import type { TLfgRoom, TFindLfgRoomByUser } from "../types.ts";
import type { IUser } from "../../../domain/lfg/models/user.types.ts";
import type { TLfgFeatureReturnOfKind } from "../types.ts";
import { ELfgFeatureReturnKind } from "../types.ts";

type TOwnedRoomFailure = TLfgFeatureReturnOfKind<
    ELfgFeatureReturnKind.NOT_IN_A_ROOM | ELfgFeatureReturnKind.NOT_ROOM_OWNER
>;

type TGetOwnedRoomResult =
    | {
          readonly success: true;
          readonly value: { readonly room: TLfgRoom };
      }
    | {
          readonly success: false;
          readonly value: TOwnedRoomFailure;
      };

export async function getOwnedRoom(
    { findRoomByUser }: { readonly findRoomByUser: TFindLfgRoomByUser },
    { guildId, owner }: { readonly guildId: string; readonly owner: IUser },
): Promise<TGetOwnedRoomResult> {
    const room = await findRoomByUser({ guildId, userId: owner.id });
    if (!room) {
        return { success: false, value: { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } };
    }
    if (room.ownerId !== owner.id) {
        return { success: false, value: { kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER } };
    }
    return { success: true, value: { room } };
}
