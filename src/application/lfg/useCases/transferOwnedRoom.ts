import type { TGetOwnedLfgRoom, TLfgFeature, TTransferLfgRoom } from "../types.ts";

export async function transferOwnedRoom(
    deps: {
        readonly getOwnedRoom: TGetOwnedLfgRoom;
        readonly transferRoom: TTransferLfgRoom;
    },
    { guildId, owner, target }: Parameters<TLfgFeature["transferOwnedRoom"]>[0],
) {
    const result = await deps.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    return deps.transferRoom({ guildId, room: result.value.room, target });
}
