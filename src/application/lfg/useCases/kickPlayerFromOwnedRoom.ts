import { ELfgResultKind } from "../types.ts";
import type { TLfgUseCaseBase } from "../types.ts";

export const kickPlayerFromOwnedRoom: TLfgUseCaseBase<
    "kickPlayerFromOwnedRoom",
    "services.getOwnedRoom" | "services.kickFromRoom"
> = async function (dependencies, { guildId, owner, target }) {
    const result = await dependencies.services.getOwnedRoom({ guildId, owner });
    if (!result.success) {
        return result.value;
    }
    if (owner.id === target.id) {
        return { kind: ELfgResultKind.CANNOT_KICK_YOURSELF } as const;
    }
    return dependencies.services.kickFromRoom({ guildId, room: result.value.room, target });
};
