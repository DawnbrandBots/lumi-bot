import { ELfgFeatureReturnKind } from "../types.ts";
import type { TGetOwnedLfgRoom, TDisbandOwnedLfgRoomArg, TRemoveLfgRoom } from "../types.ts";

export async function disbandOwnedRoom(
    deps: {
        readonly getOwnedRoom: TGetOwnedLfgRoom;
        readonly removeRoom: TRemoveLfgRoom;
    },
    { guildId, owner }: TDisbandOwnedLfgRoomArg,
) {
    const result = await deps.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    await deps.removeRoom({ roomId: result.value.room.id });
    return {
        kind: ELfgFeatureReturnKind.ROOM_DISBANDED,
        value: { userId: result.value.room.ownerId, code: result.value.room.code },
    } as const;
}
