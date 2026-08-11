import { ELfgFeatureReturnKind } from "../types.ts";
import { changeRoomCodeInRoom } from "../services/changeRoomCodeInRoom.ts";
import type { TChangeLfgRoomCode, TFindLfgRoomByCode, TLfgFeature } from "../types.ts";

export async function changeRoomCode(
    deps: {
        readonly changeRoomCode: TChangeLfgRoomCode;
        readonly findRoomByCode: TFindLfgRoomByCode;
    },
    { guildId, code, newCode }: Parameters<TLfgFeature["changeRoomCode"]>[0],
) {
    const room = await deps.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return changeRoomCodeInRoom(deps, { guildId, room, newCode });
}
