import { ELfgFeatureReturnKind } from "../../lfg/types.ts";
import { kickFromRoom } from "./kickFromRoom.ts";
import type { TFindLfgRoomByCode, TFindLfgRoomByUser, TKickUserFromLfgRoom, TLfgFeature } from "./types.ts";

export async function kick(
    deps: {
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly kickUserFromRoom: TKickUserFromLfgRoom;
    },
    { guildId, code, target }: Parameters<TLfgFeature["kick"]>[0],
) {
    const room = await deps.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return kickFromRoom(deps, { guildId, room, target });
}
