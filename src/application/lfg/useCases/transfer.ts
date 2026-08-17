import { ELfgFeatureReturnKind } from "../types.ts";
import type { TFindLfgRoomByCode, TTransferLfgRoomArg, TTransferLfgRoom } from "../types.ts";

export async function transfer(
    deps: {
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly transferRoom: TTransferLfgRoom;
    },
    { guildId, code, target }: TTransferLfgRoomArg,
) {
    const room = await deps.findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return deps.transferRoom({ guildId, room, target });
}
