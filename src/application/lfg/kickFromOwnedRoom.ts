import { ELfgFeatureReturnKind } from "./types.ts";
import { getOwnedRoom } from "./getOwnedRoom.ts";
import { kickFromRoom } from "./kickFromRoom.ts";
import type { TFindLfgRoomByUser, TKickUserFromLfgRoom, TLfgFeature } from "./types.ts";

export async function kickFromOwnedRoom(
    deps: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly kickUserFromRoom: TKickUserFromLfgRoom;
    },
    { guildId, owner, target }: Parameters<TLfgFeature["kickFromOwnedRoom"]>[0],
) {
    const result = await getOwnedRoom(deps, { guildId, owner });
    if (!result.success) {
        return result.value;
    }
    if (owner.id === target.id) {
        return { kind: ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF } as const;
    }
    return kickFromRoom(deps, { guildId, room: result.value.room, target });
}
