import { ELfgFeatureReturnKind } from "../types.ts";
import type { TFindLfgRoomByCode, TDisbandLfgRoomArg, TRemoveLfgRoom } from "../types.ts";

export async function disband(
    {
        findRoomByCode,
        removeRoom,
    }: {
        readonly findRoomByCode: TFindLfgRoomByCode;
        readonly removeRoom: TRemoveLfgRoom;
    },
    { guildId, code }: TDisbandLfgRoomArg,
) {
    const room = await findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    await removeRoom({ roomId: room.id });
    return { kind: ELfgFeatureReturnKind.ROOM_DISBANDED, value: { userId: room.ownerId, code: room.code } } as const;
}
