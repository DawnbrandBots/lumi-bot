import { ELfgFeatureReturnKind } from "./types.ts";
import { getOwnedRoom } from "./getOwnedRoom.ts";
import type { TDisbandLfgRoom, TFindLfgRoomByUser, TLfgFeature } from "./types.ts";

export async function disbandOwnedRoom(
    deps: {
        readonly disbandRoom: TDisbandLfgRoom;
        readonly findRoomByUser: TFindLfgRoomByUser;
    },
    { guildId, owner }: Parameters<TLfgFeature["disbandOwnedRoom"]>[0],
) {
    const result = await getOwnedRoom(deps, { guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return {
        kind: ELfgFeatureReturnKind.ROOM_DISBANDED,
        value: await deps.disbandRoom({ roomId: result.value.room.id }),
    } as const;
}
