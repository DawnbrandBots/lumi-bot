import { ELfgFeatureReturnKind } from "../types.ts";
import type { TFindLfgRoomByCode, TKickFromLfgRoom, TLfgFeature } from "../types.ts";

export async function kick(
    deps: {
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly kickFromRoom: TKickFromLfgRoom;
    },
    { guildId, code, target }: Parameters<TLfgFeature["kick"]>[0],
) {
    const room = await deps.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return deps.kickFromRoom({ guildId, room, target });
}
