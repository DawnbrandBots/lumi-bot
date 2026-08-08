import { ELfgFeatureReturnKind } from "../../lfg/types.ts";
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
    if ("kind" in result) {
        return result;
    }
    return { kind: ELfgFeatureReturnKind.ROOM_DISBANDED, value: await deps.disbandRoom({ roomId: result.id }) } as const;
}
