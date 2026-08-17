import type { TGetOwnedLfgRoom, TTransferOwnedLfgRoomArg, TTransferLfgRoom } from "../types.ts";

export async function transferOwnedRoom(
    deps: {
        readonly getOwnedRoom: TGetOwnedLfgRoom;
        readonly transferRoom: TTransferLfgRoom;
    },
    { guildId, owner, target }: TTransferOwnedLfgRoomArg,
) {
    const result = await deps.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return deps.transferRoom({ guildId, room: result.value.room, target });
}
