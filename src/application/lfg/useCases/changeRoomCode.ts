import { ELfgFeatureReturnKind } from "../types.ts";
import type { TChangeLfgRoomCodeInRoom, TFindLfgRoomByCode, TLfgFeature } from "../types.ts";

export async function changeRoomCode(
    deps: {
        readonly changeRoomCodeInRoom: TChangeLfgRoomCodeInRoom;
        readonly findRoomByCode: TFindLfgRoomByCode;
    },
    { guildId, code, newCode }: Parameters<TLfgFeature["changeRoomCode"]>[0],
) {
    const room = await deps.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return deps.changeRoomCodeInRoom({ guildId, room, newCode });
}
