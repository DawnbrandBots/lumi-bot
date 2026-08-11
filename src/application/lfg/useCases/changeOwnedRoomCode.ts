import type { TChangeLfgRoomCodeInRoom, TGetOwnedLfgRoom, TLfgFeature } from "../types.ts";

export async function changeOwnedRoomCode(
    deps: {
        readonly changeRoomCodeInRoom: TChangeLfgRoomCodeInRoom;
        readonly getOwnedRoom: TGetOwnedLfgRoom;
    },
    { guildId, owner, newCode }: Parameters<TLfgFeature["changeOwnedRoomCode"]>[0],
) {
    const result = await deps.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return deps.changeRoomCodeInRoom({ guildId, room: result.value.room, newCode });
}
