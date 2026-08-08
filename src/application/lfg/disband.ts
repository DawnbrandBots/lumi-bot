import { ELfgFeatureReturnKind } from "../../lfg/types.ts";
import type { TDisbandLfgRoom, TFindLfgRoomByCode, TLfgFeature } from "./types.ts";

export async function disband(
    {
        disbandRoom,
        findRoomByCode,
    }: {
        readonly disbandRoom: TDisbandLfgRoom;
        readonly findRoomByCode: TFindLfgRoomByCode;
    },
    { guildId, code }: Parameters<TLfgFeature["disband"]>[0],
) {
    const room = await findRoomByCode({ guildId, code });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
    }
    return { kind: ELfgFeatureReturnKind.ROOM_DISBANDED, value: await disbandRoom({ roomId: room.id }) } as const;
}
