import type { TLfgUseCaseBase } from "../types.ts";
import { ELfgResultKind } from "../types.ts";

export const kickPlayerFromRoom: TLfgUseCaseBase<
    "kickPlayerFromRoom",
    "repositories.lfg.findRoomByUser" | "services.kickFromRoom"
> = async function (dependencies, arg) {
    const room = await dependencies.repositories.lfg.findRoomByUser({ guildId: arg.guildId, userId: arg.target.id });
    if (!room) {
        return { kind: ELfgResultKind.TARGET_USER_NOT_IN_ANY_ROOM, value: { targetId: arg.target.id } };
    }
    return dependencies.services.kickFromRoom({ ...arg, room });
};
