import { ELfgResultKind } from "../types.ts";
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
        return { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    await removeRoom({ roomId: room.id });
    return { kind: ELfgResultKind.ROOM_DISBANDED, value: { userId: room.ownerId, code: room.code } } as const;
}
