import { ELfgResultKind } from "../types.ts";
import type { TGetOwnedLfgRoom, TKickFromLfgRoom, TKickFromOwnedLfgRoomArg } from "../types.ts";

export async function kickFromOwnedRoom(
    deps: {
        readonly getOwnedRoom: TGetOwnedLfgRoom;
        readonly kickFromRoom: TKickFromLfgRoom;
    },
    { guildId, owner, target }: TKickFromOwnedLfgRoomArg,
) {
    const result = await deps.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    if (owner.id === target.id) {
        return { kind: ELfgResultKind.CANNOT_KICK_YOURSELF } as const;
    }
    return deps.kickFromRoom({ guildId, room: result.value.room, target });
}
