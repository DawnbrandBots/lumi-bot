import { ELfgFeatureReturnKind } from "./types.ts";
import { getOwnedRoom } from "./getOwnedRoom.ts";
import type { TFindLfgRoomByUser, TLfgFeature, TRemoveLfgRoom } from "./types.ts";

export async function disbandOwnedRoom(
    deps: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly removeRoom: TRemoveLfgRoom;
    },
    { guildId, owner }: Parameters<TLfgFeature["disbandOwnedRoom"]>[0],
) {
    const result = await getOwnedRoom(deps, { guildId, owner });
    if (!result.success) {
        return result.value;
    }
    await deps.removeRoom({ roomId: result.value.room.id });
    return {
        kind: ELfgFeatureReturnKind.ROOM_DISBANDED,
        value: { userId: result.value.room.ownerId, code: result.value.room.code },
    } as const;
}
