import { ELfgFeatureReturnKind } from "../types.ts";
import type { TFindLfgRoomByCode, TLfgFeature, TTransferLfgRoom } from "../types.ts";

export async function transfer(
    deps: {
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly transferRoom: TTransferLfgRoom;
    },
    { guildId, code, target }: Parameters<TLfgFeature["transfer"]>[0],
) {
    const room = await deps.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return deps.transferRoom({ guildId, room, target });
}
