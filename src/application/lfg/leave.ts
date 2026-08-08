import { ELfgFeatureReturnKind } from "../../lfg/types.ts";
import type { TFindLfgRoomByUser, TLeaveLfgRoom, TLfgFeature } from "./types.ts";

export async function leave(
    {
        findRoomByUser,
        leaveRoom,
    }: {
        readonly findRoomByUser: TFindLfgRoomByUser;
        readonly leaveRoom: TLeaveLfgRoom;
    },
    { guildId, user }: Parameters<TLfgFeature["leave"]>[0],
) {
    const room = await findRoomByUser({ guildId, userId: user.id });
    if (!room) {
        return { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } as const;
    }

    const leaveResult = await leaveRoom({ guildId, userId: user.id });
    return { kind: ELfgFeatureReturnKind.ROOM_LEFT, value: { ...leaveResult, userId: user.id } } as const;
}
